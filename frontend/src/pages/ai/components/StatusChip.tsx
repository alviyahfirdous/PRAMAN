import React from 'react';
import type { FieldStatus } from '@/lib/assist/types';
import { CheckCircle2, Sparkles, AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react';

interface StatusChipProps {
  status: FieldStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  const iconSize = isSm ? 10 : 12;

  switch (status) {
    case 'Extracted':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200 ${padding}`}
          title="Extracted from source note with verbatim evidence"
        >
          <CheckCircle2 size={iconSize} className="text-teal-600" />
          <span>Extracted</span>
        </span>
      );

    case 'Suggested':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${padding}`}
          title="Suggested candidate term requiring clinician confirmation"
        >
          <Sparkles size={iconSize} className="text-purple-600" />
          <span>Suggested</span>
        </span>
      );

    case 'Uncertain':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-300 ${padding}`}
          title="Contradiction or uncertainty detected in clinical note"
        >
          <AlertTriangle size={iconSize} className="text-amber-600" />
          <span>Uncertain</span>
        </span>
      );

    case 'Missing':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-300 ${padding}`}
          title="Not found in source note"
        >
          <HelpCircle size={iconSize} className="text-slate-500" />
          <span>Missing</span>
        </span>
      );

    case 'HumanAssessmentRequired':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-300 ${padding}`}
          title="Non-negotiable: Seriousness, causality, and expectedness require authorised human assessment"
        >
          <ShieldAlert size={iconSize} className="text-terracotta-600" />
          <span>Human Assessment Required</span>
        </span>
      );

    default:
      return null;
  }
};
