import React from 'react';
import type { EvidenceQuote } from '@/lib/assist/types';

interface EvidenceHighlightProps {
  text: string;
  selectedEvidence: EvidenceQuote | null;
  conflictQuotes?: string[];
}

export const EvidenceHighlight: React.FC<EvidenceHighlightProps> = ({
  text,
  selectedEvidence,
  conflictQuotes,
}) => {
  if (!text) {
    return <span className="text-slate-400 italic">No text provided</span>;
  }

  // If there are conflict quotes to highlight
  if (conflictQuotes && conflictQuotes.length > 0) {
    // Collect all conflict spans
    const ranges: Array<{ start: number; end: number; type: 'conflict' }> = [];
    for (const q of conflictQuotes) {
      let idx = text.indexOf(q);
      while (idx !== -1) {
        ranges.push({ start: idx, end: idx + q.length, type: 'conflict' });
        idx = text.indexOf(q, idx + 1);
      }
    }
    ranges.sort((a, b) => a.start - b.start);

    // Build segments
    const elements: React.ReactNode[] = [];
    let last = 0;
    ranges.forEach((r, i) => {
      if (r.start > last) {
        elements.push(
          <span key={`text-${i}`}>{text.substring(last, r.start)}</span>
        );
      }
      elements.push(
        <mark
          key={`conflict-${i}`}
          className="bg-amber-200 text-amber-950 font-semibold px-1 py-0.5 rounded border border-amber-400 shadow-sm"
          title="Contradictory clinical statement in source text"
        >
          {text.substring(r.start, r.end)}
        </mark>
      );
      last = Math.max(last, r.end);
    });
    if (last < text.length) {
      elements.push(<span key="tail">{text.substring(last)}</span>);
    }
    return <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{elements}</div>;
  }

  // If a single evidence quote is selected
  if (
    selectedEvidence &&
    selectedEvidence.start >= 0 &&
    selectedEvidence.end <= text.length &&
    selectedEvidence.start < selectedEvidence.end
  ) {
    const before = text.substring(0, selectedEvidence.start);
    const highlighted = text.substring(selectedEvidence.start, selectedEvidence.end);
    const after = text.substring(selectedEvidence.end);

    return (
      <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
        <span>{before}</span>
        <mark
          className="bg-purple-200 text-purple-950 font-semibold px-1 py-0.5 rounded border border-purple-400 shadow-sm animate-pulse"
          title={`Verbatim source quote: "${highlighted}"`}
        >
          {highlighted}
        </mark>
        <span>{after}</span>
      </div>
    );
  }

  // Default: Plain safe text
  return <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800">{text}</div>;
};
