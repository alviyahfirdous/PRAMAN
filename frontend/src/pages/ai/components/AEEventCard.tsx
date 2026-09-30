import React, { useState } from 'react';
import type { AEEvent, DraftField, EvidenceQuote } from '@/lib/assist/types';
import type { UserRole } from '@/types';
import { StatusChip } from './StatusChip';
import { ConflictBanner } from './ConflictBanner';
import { AlertCircle, Shield, FileSearch, CheckCircle2 } from 'lucide-react';

interface AEEventCardProps {
  event: AEEvent;
  eventIndex: number;
  userRole: UserRole;
  onUpdateField: (fieldKey: string, newValue: string, reason: string) => void;
  onSelectField: (evidence: EvidenceQuote | null, conflictQuotes?: string[]) => void;
  selectedKey: string | null;
  readOnly?: boolean;
}

export const AEEventCard: React.FC<AEEventCardProps> = ({
  event,
  eventIndex,
  userRole,
  onUpdateField,
  onSelectField,
  selectedKey,
  readOnly = false,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [reason, setReason] = useState('Corrected');

  const canAssessSafety =
    userRole === 'PRINCIPAL_INVESTIGATOR' || userRole === 'PHARMACOVIGILANCE_OFFICER';

  const canEditGeneral =
    !readOnly &&
    (userRole === 'STUDY_COORDINATOR' ||
      userRole === 'PRINCIPAL_INVESTIGATOR' ||
      userRole === 'PHARMACOVIGILANCE_OFFICER');

  const findField = (key: string): DraftField | undefined =>
    event.fields.find((f) => f.key === key);

  const startEdit = (field: DraftField) => {
    setEditingKey(field.key);
    setTempValue(field.value || '');
    setReason('Corrected');
  };

  const saveEdit = (fieldKey: string) => {
    if (tempValue.trim().length > 0) {
      onUpdateField(fieldKey, tempValue.trim(), reason);
    }
    setEditingKey(null);
  };

  const severityField = findField('ae_severity');
  const seriousnessField = findField('ae_seriousness');
  const causalityField = findField('ae_causality');
  const expectednessField = findField('ae_expectedness');
  const termField = findField('ae_term');
  const onsetField = findField('ae_onset');
  const actionField = findField('ae_action_taken');
  const codingField = findField('ae_suggested_coding');

  return (
    <div className="border border-terracotta-200 bg-white rounded-xl shadow-xs overflow-hidden">
      {/* Event Header */}
      <div className="bg-terracotta-50/80 px-4 py-3 border-b border-terracotta-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta-600 animate-pulse" />
          <h3 className="text-xs font-bold text-terracotta-900 uppercase tracking-wide">
            Adverse Event #{eventIndex + 1}: {termField?.value || 'Detected Event'}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded font-semibold">
          AE Event Record
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Severity Conflict Banner if Uncertain */}
        {severityField?.status === 'Uncertain' && severityField.conflict && (
          <ConflictBanner
            quotes={severityField.conflict.quotes}
            fieldLabel="Adverse Event Severity"
            onResolve={() => {
              if (canEditGeneral) startEdit(severityField);
            }}
          />
        )}

        {/* Primary AE Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Term */}
          <div
            onClick={() => {
              if (termField) onSelectField(termField.evidence);
            }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedKey === 'ae_term'
                ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-500 text-[11px]">Reported Term (Narrative)</span>
              {termField && <StatusChip status={termField.status} size="sm" />}
            </div>
            <div className="font-bold text-navy-900 text-xs">{termField?.value || '—'}</div>
            {termField?.evidence && (
              <div className="text-[10px] text-purple-700 mt-1 font-mono truncate">
                Quote: &ldquo;{termField.evidence.quote}&rdquo;
              </div>
            )}
          </div>

          {/* Onset */}
          <div
            onClick={() => {
              if (onsetField) onSelectField(onsetField.evidence);
            }}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedKey === 'ae_onset'
                ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-500 text-[11px]">Onset Date / Time</span>
              {onsetField && <StatusChip status={onsetField.status} size="sm" />}
            </div>
            <div className="font-bold text-navy-900 text-xs">{onsetField?.value || '—'}</div>
            {onsetField?.evidence && (
              <div className="text-[10px] text-purple-700 mt-1 font-mono truncate">
                Quote: &ldquo;{onsetField.evidence.quote}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Severity, Seriousness & Causality Gated Section */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <Shield size={14} className="text-terracotta-600" />
              Safety Assessment Determinations
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              {canAssessSafety ? '✓ PI / PV Authorized' : 'Gated: Human Assessment Required'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Severity */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Severity</span>
                {severityField && <StatusChip status={severityField.status} size="sm" />}
              </div>

              {editingKey === 'ae_severity' ? (
                <div className="space-y-2 mt-1">
                  <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    aria-label="AE Severity Grade"
                    className="w-full text-xs p-1.5 border border-purple-300 rounded font-semibold bg-white"
                  >
                    <option value="">Select Severity...</option>
                    <option value="MILD">MILD</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="SEVERE">SEVERE</option>
                  </select>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    aria-label="Reason for change"
                    className="w-full text-[10px] p-1 border rounded bg-slate-50"
                  >
                    <option value="Corrected">Reason: Corrected contradiction</option>
                    <option value="Clarified">Reason: Clarified narrative</option>
                    <option value="Clinical Assessment">Reason: Clinical Assessment</option>
                  </select>
                  <div className="flex gap-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit('ae_severity')}
                      className="px-2 py-0.5 text-[10px] bg-purple-600 text-white rounded font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1">
                  <div className="text-xs font-bold text-navy-900">{severityField?.value || 'Unspecified'}</div>
                  {canEditGeneral && (
                    <button
                      type="button"
                      onClick={() => {
                        if (severityField) startEdit(severityField);
                      }}
                      className="text-[10px] text-purple-700 hover:text-purple-900 underline mt-1 font-medium cursor-pointer"
                    >
                      {severityField?.status === 'Uncertain' ? 'Resolve contradiction' : 'Change severity'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Seriousness */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Seriousness</span>
                {seriousnessField && <StatusChip status={seriousnessField.status} size="sm" />}
              </div>

              {seriousnessField?.cue && (
                <div className="text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 mb-1.5 font-medium">
                  {seriousnessField.cue}
                </div>
              )}

              {canAssessSafety ? (
                editingKey === 'ae_seriousness' ? (
                  <div className="space-y-2 mt-1">
                    <select
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      aria-label="Seriousness determination"
                      className="w-full text-xs p-1.5 border border-purple-300 rounded font-semibold bg-white"
                    >
                      <option value="">Select assessment...</option>
                      <option value="Non-serious">Non-serious (AE)</option>
                      <option value="Serious - Hospitalization">Serious - Hospitalization</option>
                      <option value="Serious - Life threatening">Serious - Life threatening</option>
                      <option value="Serious - Disability">Serious - Disability / Incapacity</option>
                      <option value="Serious - Death">Serious - Death</option>
                    </select>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      aria-label="Assessment rationale"
                      className="w-full text-[10px] p-1 border rounded bg-slate-50"
                    >
                      <option value="Clinical Assessment">Reason: Clinical Assessment</option>
                      <option value="Protocol Criteria">Reason: Protocol Criteria</option>
                      <option value="Source Error">Reason: Source Error</option>
                    </select>
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit('ae_seriousness')}
                        className="px-2 py-0.5 text-[10px] bg-terracotta-600 text-white rounded font-semibold"
                      >
                        Record
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="text-xs font-bold text-navy-900">
                      {seriousnessField?.value ? (
                        <span className="text-teal-700 flex items-center gap-1">
                          <CheckCircle2 size={12} /> {seriousnessField.value}
                        </span>
                      ) : (
                        <span className="text-terracotta-700 font-semibold italic">Pending Human Determination</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (seriousnessField) startEdit(seriousnessField);
                      }}
                      className="text-[10px] text-terracotta-700 hover:text-terracotta-900 underline mt-1 font-semibold cursor-pointer block"
                    >
                      {seriousnessField?.value ? 'Modify assessment' : 'Record PI determination →'}
                    </button>
                  </div>
                )
              ) : (
                <div className="text-[10px] text-slate-500 italic mt-1">
                  {seriousnessField?.value || 'Only Principal Investigator or PV Officer can determine seriousness.'}
                </div>
              )}
            </div>

            {/* Causality */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600">Causality</span>
                {causalityField && <StatusChip status={causalityField.status} size="sm" />}
              </div>

              {causalityField?.cue && (
                <div className="text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 mb-1.5 font-medium">
                  {causalityField.cue}
                </div>
              )}

              {canAssessSafety ? (
                editingKey === 'ae_causality' ? (
                  <div className="space-y-2 mt-1">
                    <select
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      aria-label="Causality determination"
                      className="w-full text-xs p-1.5 border border-purple-300 rounded font-semibold bg-white"
                    >
                      <option value="">Select relationship...</option>
                      <option value="Not related">Not related</option>
                      <option value="Unlikely">Unlikely related</option>
                      <option value="Possible">Possible</option>
                      <option value="Probable">Probable</option>
                      <option value="Definite">Definite</option>
                    </select>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      aria-label="Causality rationale"
                      className="w-full text-[10px] p-1 border rounded bg-slate-50"
                    >
                      <option value="Clinical Assessment">Reason: Clinical Assessment</option>
                      <option value="De-challenge observation">Reason: De-challenge</option>
                      <option value="Temporal association">Reason: Temporal association</option>
                    </select>
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit('ae_causality')}
                        className="px-2 py-0.5 text-[10px] bg-terracotta-600 text-white rounded font-semibold"
                      >
                        Record
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="text-xs font-bold text-navy-900">
                      {causalityField?.value ? (
                        <span className="text-teal-700 flex items-center gap-1">
                          <CheckCircle2 size={12} /> {causalityField.value}
                        </span>
                      ) : (
                        <span className="text-terracotta-700 font-semibold italic">Pending Human Assessment</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (causalityField) startEdit(causalityField);
                      }}
                      className="text-[10px] text-terracotta-700 hover:text-terracotta-900 underline mt-1 font-semibold cursor-pointer block"
                    >
                      {causalityField?.value ? 'Modify assessment' : 'Record causality assessment →'}
                    </button>
                  </div>
                )
              ) : (
                <div className="text-[10px] text-slate-500 italic mt-1">
                  {causalityField?.value || 'Only Principal Investigator or PV Officer can determine causality.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Taken */}
        <div
          onClick={() => {
            if (actionField) onSelectField(actionField.evidence);
          }}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            selectedKey === 'ae_action_taken'
              ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-500 text-[11px]">Action Taken with Study Drug</span>
            {actionField && <StatusChip status={actionField.status} size="sm" />}
          </div>
          <div className="text-xs font-medium text-slate-800">{actionField?.value || 'Not reported'}</div>
          {actionField?.evidence && (
            <div className="text-[10px] text-purple-700 mt-1 font-mono truncate">
              Quote: &ldquo;{actionField.evidence.quote}&rdquo;
            </div>
          )}
        </div>

        {/* MedDRA Local Demo Candidates (Governed Disclaimer) */}
        <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-950 flex items-center gap-1 text-[11px]">
              <FileSearch size={13} className="text-purple-600" />
              Suggested Term Candidates (Local Demo Dictionary)
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
              Coding requires licensed MedDRA
            </span>
          </div>
          <p className="text-[11px] text-slate-700 font-mono pt-1">
            {codingField?.value || 'No local dictionary suggestion matched'}
          </p>
          <div className="text-[10px] text-slate-500 italic">
            Note: Governed clinical workflow requires official MedDRA licensing for final regulatory submission.
          </div>
        </div>
      </div>
    </div>
  );
};
