import React, { useState } from 'react';
import type { Draft, DraftField, EvidenceQuote } from '@/lib/assist/types';
import type { UserRole } from '@/types';
import { StatusChip } from './StatusChip';
import { AEEventCard } from './AEEventCard';
import { Edit3, Check, X, AlertCircle, Quote, Sparkles } from 'lucide-react';

interface FieldReviewTableProps {
  draft: Draft;
  userRole: UserRole;
  onUpdateField: (group: string, key: string, newValue: string, reason: string) => void;
  onConfirmNotReported: (group: string, key: string) => void;
  onSelectField: (evidence: EvidenceQuote | null, conflictQuotes?: string[]) => void;
  selectedKey: string | null;
  readOnly?: boolean;
}

export const FieldReviewTable: React.FC<FieldReviewTableProps> = ({
  draft,
  userRole,
  onUpdateField,
  onConfirmNotReported,
  onSelectField,
  selectedKey,
  readOnly = false,
}) => {
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [editReason, setEditReason] = useState('Corrected');

  const canEdit =
    !readOnly &&
    (userRole === 'STUDY_COORDINATOR' ||
      userRole === 'PRINCIPAL_INVESTIGATOR' ||
      userRole === 'PHARMACOVIGILANCE_OFFICER');

  // Compute unresolved fields across all groups and AE events
  const unresolvedItems: Array<{ group: string; label: string; key: string; status: string }> = [];

  Object.entries(draft.groups).forEach(([groupName, fields]) => {
    fields.forEach((f) => {
      if (f.status === 'Uncertain' || f.status === 'Missing' || f.status === 'HumanAssessmentRequired') {
        unresolvedItems.push({ group: groupName, label: f.label, key: f.key, status: f.status });
      }
    });
  });

  draft.aeEvents.forEach((ev, idx) => {
    ev.fields.forEach((f) => {
      if (f.status === 'Uncertain' || f.status === 'Missing' || f.status === 'HumanAssessmentRequired') {
        unresolvedItems.push({
          group: `Adverse Event #${idx + 1}`,
          label: f.label,
          key: f.key,
          status: f.status,
        });
      }
    });
  });

  const startEditField = (group: string, field: DraftField) => {
    setEditingGroupKey(`${group}:${field.key}`);
    setEditVal(field.value || '');
    setEditReason('Corrected');
  };

  const cancelEdit = () => {
    setEditingGroupKey(null);
  };

  const saveEditField = (group: string, key: string) => {
    if (editVal.trim().length > 0) {
      onUpdateField(group, key, editVal.trim(), editReason);
    }
    setEditingGroupKey(null);
  };

  return (
    <div className="space-y-6">
      {/* Unresolved Fields Banner / Counter */}
      {unresolvedItems.length > 0 ? (
        <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
              <AlertCircle size={15} className="text-amber-600" />
              {unresolvedItems.length} field{unresolvedItems.length === 1 ? '' : 's'} require human review before submission
            </span>
            <span className="badge-medium text-[11px]">Action Required</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {unresolvedItems.slice(0, 8).map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-medium"
              >
                {item.group}: <strong>{item.label}</strong> ({item.status})
              </span>
            ))}
            {unresolvedItems.length > 8 && (
              <span className="text-[10px] text-amber-700 self-center">
                +{unresolvedItems.length - 8} more
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-800">
          <span className="font-bold flex items-center gap-1.5">
            <Sparkles size={14} className="text-teal-600" />
            All fields resolved and verified. Ready for review submission.
          </span>
          <span className="badge-low text-[10px]">Zero unresolved fields</span>
        </div>
      )}

      {/* Main Groups */}
      {Object.entries(draft.groups).map(([groupName, fields]) => (
        <div key={groupName} className="clinical-card overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">{groupName}</h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {fields.filter((f) => f.status === 'Extracted').length}/{fields.length} extracted
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {fields.map((field) => {
              const rowKey = `${groupName}:${field.key}`;
              const isEditing = editingGroupKey === rowKey;
              const isSelected = selectedKey === field.key;

              return (
                <div
                  key={field.key}
                  className={`p-3.5 transition-colors text-xs ${
                    isSelected ? 'bg-purple-50/50' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Label & Status */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="font-semibold text-slate-700 text-xs">{field.label}</span>
                      <StatusChip status={field.status} size="sm" />
                    </div>

                    {/* Value / Editor */}
                    <div className="flex-1 max-w-md">
                      {isEditing ? (
                        <div className="space-y-2 bg-white p-2 border border-purple-300 rounded-lg shadow-xs">
                          <input
                            type="text"
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            aria-label={`Edit ${field.label}`}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-purple-400"
                            placeholder="Enter corrected value..."
                          />
                          <div className="flex items-center justify-between gap-2">
                            <select
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              aria-label="Reason for change"
                              className="text-[10px] p-1 border rounded bg-slate-50 text-slate-700"
                            >
                              <option value="Corrected">Reason: Corrected</option>
                              <option value="Clarified">Reason: Clarified</option>
                              <option value="Source Error">Reason: Source Error</option>
                              <option value="Clinical Assessment">Reason: Clinical Assessment</option>
                            </select>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="p-1 text-slate-500 hover:text-slate-800 rounded"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => saveEditField(groupName, field.key)}
                                className="px-2 py-0.5 bg-purple-600 text-white text-[11px] font-semibold rounded flex items-center gap-1"
                              >
                                <Check size={12} /> Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-medium ${
                              field.value ? 'text-navy-900 font-semibold' : 'text-slate-400 italic'
                            }`}
                          >
                            {field.value || 'Not reported'}
                          </span>

                          <div className="flex items-center gap-1">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => startEditField(groupName, field)}
                                className="p-1 text-slate-400 hover:text-purple-700 rounded transition-colors"
                                title="Edit field value"
                              >
                                <Edit3 size={13} />
                              </button>
                            )}

                            {field.status === 'Missing' && canEdit && (
                              <button
                                type="button"
                                onClick={() => onConfirmNotReported(groupName, field.key)}
                                className="px-2 py-0.5 text-[10px] font-medium rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                              >
                                Confirm Not Reported
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Quote Link */}
                  {field.evidence ? (
                    <div
                      onClick={() => onSelectField(field.evidence)}
                      className="mt-1.5 flex items-center gap-1.5 text-[11px] text-purple-700 hover:text-purple-900 cursor-pointer font-mono bg-purple-50/60 hover:bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200 w-fit"
                      title="Click to highlight in source note"
                    >
                      <Quote size={11} className="flex-shrink-0" />
                      <span className="truncate max-w-sm">&ldquo;{field.evidence.quote}&rdquo;</span>
                      <span className="text-[10px] text-purple-500">
                        [{field.evidence.start}..{field.evidence.end}]
                      </span>
                    </div>
                  ) : (
                    field.cue && (
                      <div className="mt-1 text-[11px] text-amber-800 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                        {field.cue}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Adverse Events Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <span>Adverse Events ({draft.aeEvents.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">One card per distinct event</span>
        </div>

        {draft.aeEvents.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-1">
            <div className="font-semibold text-xs text-navy-800">No adverse event mentioned in this note</div>
            <p className="text-[11px] text-slate-400">
              Deterministic rule scan confirmed zero adverse symptoms or protocol safety triggers.
            </p>
          </div>
        ) : (
          draft.aeEvents.map((ev, idx) => (
            <AEEventCard
              key={ev.id}
              event={ev}
              eventIndex={idx}
              userRole={userRole}
              onUpdateField={(fieldKey, newValue, reason) =>
                onUpdateField('Adverse Events', fieldKey, newValue, reason)
              }
              onSelectField={onSelectField}
              selectedKey={selectedKey}
              readOnly={readOnly}
            />
          ))
        )}
      </div>
    </div>
  );
};
