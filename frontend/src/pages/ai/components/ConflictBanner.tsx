import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ConflictBannerProps {
  quotes: string[];
  fieldLabel?: string;
  onResolve?: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  quotes,
  fieldLabel = 'AE Severity Grade',
  onResolve,
}) => {
  return (
    <div
      role="alert"
      className="p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-2 text-amber-900 shadow-sm"
    >
      <div className="flex items-center gap-2 font-bold text-amber-800">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
        <span>Clinical Contradiction Detected in Source Note</span>
      </div>

      <p className="text-[11px] text-amber-800 leading-relaxed">
        The source document contains conflicting statements for <strong>{fieldLabel}</strong>.
        The AI engine marked this field as <strong className="text-amber-900">Uncertain</strong> and requires human clinical determination.
      </p>

      <div className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-1.5 font-mono text-[11px]">
        <div className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
          <HelpCircle size={11} /> Conflicting verbatim source quotes:
        </div>
        {quotes.map((q, idx) => (
          <div key={idx} className="flex items-start gap-2 text-amber-950">
            <span className="font-bold text-amber-600">Quote {idx + 1}:</span>
            <span className="bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
              &ldquo;{q}&rdquo;
            </span>
          </div>
        ))}
      </div>

      {onResolve && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onResolve}
            className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            Resolve contradiction →
          </button>
        </div>
      )}
    </div>
  );
};
