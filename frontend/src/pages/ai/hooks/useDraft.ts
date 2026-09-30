import { useState, useCallback } from 'react';
import type { Draft, AuditEntry, EvidenceQuote } from '@/lib/assist/types';
import type { UserRole } from '@/types';
import { getLLMProvider } from '@/lib/assist/provider';
import { createAuditEntry, computeSHA256 } from '@/lib/assist/audit';

export function useDraft() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceQuote | null>(null);
  const [conflictQuotes, setConflictQuotes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'processing' | 'results' | 'review' | 'approval'>('processing');

  // Compute count of unresolved fields.
  // HumanAssessmentRequired is a governance-acknowledged placeholder (seriousness, causality,
  // expectedness). It does NOT block submission — only Missing data or Uncertain conflicts do.
  let unresolvedCount = 0;
  if (draft) {
    Object.values(draft.groups).forEach((fields) => {
      fields.forEach((f) => {
        if (f.status === 'Uncertain' || f.status === 'Missing') {
          unresolvedCount++;
        }
      });
    });

    draft.aeEvents.forEach((ev) => {
      ev.fields.forEach((f) => {
        if (f.status === 'Uncertain' || f.status === 'Missing') {
          unresolvedCount++;
        }
      });
    });
  }

  // Structure note
  const structureNote = useCallback(
    async (noteText: string, user: { fullName: string; role: UserRole }) => {
      setIsProcessing(true);
      setSelectedEvidence(null);
      setConflictQuotes([]);

      try {
        const provider = getLLMProvider();
        const newDraft = await provider.structure(noteText);
        setDraft(newDraft);

        // Check if there are conflict quotes in the draft to highlight
        const conflicts: string[] = [];
        newDraft.aeEvents.forEach((ev) => {
          ev.fields.forEach((f) => {
            if (f.conflict?.quotes) {
              conflicts.push(...f.conflict.quotes);
            }
          });
        });
        if (conflicts.length > 0) {
          setConflictQuotes(conflicts);
        }

        // Create initial Audit Record
        const noteHash = await computeSHA256(noteText);
        const auditRecord = await createAuditEntry({
          user: user.fullName,
          role: user.role,
          action: 'Generated',
          modelVersion: newDraft.modelVersion,
          promptVersion: newDraft.promptVersion,
          inputHash: noteHash,
          reason: 'Initial AI extraction and deterministic validation',
        });

        setAuditEntries([auditRecord]);
        setActiveTab('processing');
        return newDraft;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Update field value
  const updateField = useCallback(
    async (
      group: string,
      key: string,
      newValue: string,
      reason: string,
      user: { fullName: string; role: UserRole }
    ) => {
      if (!draft) return;

      let oldValue: string | null = null;
      let fieldLabel = key;

      const updatedDraft: Draft = { ...draft };

      if (group === 'Adverse Events') {
        updatedDraft.aeEvents = updatedDraft.aeEvents.map((ev) => {
          const updatedFields = ev.fields.map((f) => {
            if (f.key === key) {
              oldValue = f.value;
              fieldLabel = f.label;
              return {
                ...f,
                value: newValue,
                status: 'Extracted' as const,
                conflict: undefined, // Resolved
              };
            }
            return f;
          });
          return { ...ev, fields: updatedFields };
        });
      } else if (updatedDraft.groups[group]) {
        updatedDraft.groups[group] = updatedDraft.groups[group].map((f) => {
          if (f.key === key) {
            oldValue = f.value;
            fieldLabel = f.label;
            return {
              ...f,
              value: newValue,
              status: 'Extracted' as const,
              conflict: undefined,
            };
          }
          return f;
        });
      }

      setDraft(updatedDraft);

      // Append to audit trail
      const prevEntry = auditEntries[auditEntries.length - 1] || null;
      const newAudit = await createAuditEntry(
        {
          user: user.fullName,
          role: user.role,
          action: 'Edited',
          field: `${group} -> ${fieldLabel}`,
          oldValue,
          newValue,
          reason,
          modelVersion: draft.modelVersion,
          promptVersion: draft.promptVersion,
          inputHash: draft.noteHash,
        },
        prevEntry
      );

      setAuditEntries((prev) => [...prev, newAudit]);
    },
    [draft, auditEntries]
  );

  // Confirm missing field as "Not reported"
  const confirmNotReported = useCallback(
    async (
      group: string,
      key: string,
      user: { fullName: string; role: UserRole }
    ) => {
      await updateField(group, key, 'Not reported', 'Confirmed not reported in source note', user);
    },
    [updateField]
  );

  // Submit draft for review
  const submitForReview = useCallback(
    async (user: { id: string; fullName: string; role: UserRole }) => {
      if (!draft || unresolvedCount > 0) return;

      const updatedDraft: Draft = {
        ...draft,
        state: 'InReview',
        submittedBy: {
          id: user.id,
          name: user.fullName,
          role: user.role,
          timestamp: new Date().toISOString(),
        },
      };

      setDraft(updatedDraft);

      const prevEntry = auditEntries[auditEntries.length - 1] || null;
      const newAudit = await createAuditEntry(
        {
          user: user.fullName,
          role: user.role,
          action: 'Submitted',
          reason: 'All entities verified. Submitted for authorised clinical review.',
          modelVersion: draft.modelVersion,
          promptVersion: draft.promptVersion,
          inputHash: draft.noteHash,
        },
        prevEntry
      );

      setAuditEntries((prev) => [...prev, newAudit]);
    },
    [draft, unresolvedCount, auditEntries]
  );

  // Authorise Approval
  const approveDraft = useCallback(
    async (user: { id: string; fullName: string; role: UserRole }) => {
      if (!draft || draft.state !== 'InReview') return;

      const updatedDraft: Draft = {
        ...draft,
        state: 'Approved',
        approvedBy: {
          id: user.id,
          name: user.fullName,
          role: user.role,
          timestamp: new Date().toISOString(),
        },
      };

      setDraft(updatedDraft);

      const prevEntry = auditEntries[auditEntries.length - 1] || null;
      const newAudit = await createAuditEntry(
        {
          user: user.fullName,
          role: user.role,
          action: 'Approved',
          reason: 'Electronic signature authenticated. Formally approved for regulatory export.',
          modelVersion: draft.modelVersion,
          promptVersion: draft.promptVersion,
          inputHash: draft.noteHash,
        },
        prevEntry
      );

      setAuditEntries((prev) => [...prev, newAudit]);
    },
    [draft, auditEntries]
  );

  // Tamper with audit entry for testing / demonstration of cryptographic chain integrity
  const tamperAuditEntry = useCallback(() => {
    setAuditEntries((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      // Tamper with newValue of first entry
      copy[0] = {
        ...copy[0],
        newValue: 'TAMPERED_IN_DEV_TOOLS',
      };
      return copy;
    });
  }, []);

  return {
    draft,
    setDraft,
    auditEntries,
    setAuditEntries,
    isProcessing,
    selectedEvidence,
    setSelectedEvidence,
    conflictQuotes,
    setConflictQuotes,
    activeTab,
    setActiveTab,
    unresolvedCount,
    structureNote,
    updateField,
    confirmNotReported,
    submitForReview,
    approveDraft,
    tamperAuditEntry,
  };
}
