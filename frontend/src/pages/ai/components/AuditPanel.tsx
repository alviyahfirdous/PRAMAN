import React, { useState } from 'react';
import type { AuditEntry } from '@/lib/assist/types';
import { verifyAuditChain, type VerificationResult } from '@/lib/assist/audit';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Fingerprint, Lock } from 'lucide-react';

interface AuditPanelProps {
  entries: AuditEntry[];
  onTamperForTest?: () => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ entries, onTamperForTest }) => {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditChain(entries);
      setVerification(res);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header & Verification Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-navy-900 text-white rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold">Cryptographic Audit Trail &amp; Hash Chain</h3>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Append-only ledger secured by SHA-256 hash chaining (21 CFR Part 11 / GCP compliance proof)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || entries.length === 0}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>{isVerifying ? 'Recomputing Hashes...' : 'Verify Cryptographic Chain'}</span>
          </button>

          {onTamperForTest && (
            <button
              type="button"
              onClick={onTamperForTest}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-[10px] font-mono transition-colors"
              title="Simulates tampering with a stored audit entry to test cryptographic chain verification"
            >
              Simulate Tamper
            </button>
          )}
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border flex items-center gap-3 animate-fade-in ${
            verification.valid
              ? 'bg-teal-50 border-teal-300 text-teal-900'
              : 'bg-maroon-50 border-maroon-300 text-maroon-900'
          }`}
        >
          {verification.valid ? (
            <>
              <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-xs">
                  ✓ Cryptographic Chain Verified ({verification.totalEntries} entries intact)
                </div>
                <div className="text-[11px] text-teal-800">
                  Every entry matches its parent hash with zero tampering detected. Immutable source record intact.
                </div>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert size={20} className="text-maroon-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-xs">
                  ✗ Hash Chain Verification FAILED at Entry #{((verification.failedIndex || 0) + 1)}
                </div>
                <div className="text-[11px] text-maroon-800 font-mono">
                  {verification.reason}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Audit Entries List */}
      <div className="clinical-card overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-navy-900">
          <span>Ledger History ({entries.length} events)</span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Lock size={11} /> SHA-256 Chained
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic">No audit events generated yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry, index) => (
              <div key={entry.id} className="p-3.5 space-y-2 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] flex items-center justify-center font-bold">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-navy-900">{entry.action}</span>
                    <span className="badge-info text-[10px]">{entry.role}</span>
                    <span className="text-slate-600 font-medium text-[11px]">{entry.user}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{entry.timestamp}</span>
                </div>

                {entry.field && (
                  <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{entry.field}:</span>
                    {entry.oldValue && (
                      <span className="line-through text-slate-400 font-mono">{entry.oldValue}</span>
                    )}
                    <span className="text-purple-700 font-bold font-mono">→ {entry.newValue}</span>
                    {entry.reason && (
                      <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-sans">
                        Reason: {entry.reason}
                      </span>
                    )}
                  </div>
                )}

                {/* Cryptographic Link Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pt-1">
                  <div className="truncate" title={`prevHash: ${entry.prevHash}`}>
                    <span className="text-slate-400">prevHash: </span>
                    <span className="text-slate-600">{entry.prevHash.substring(0, 20)}...</span>
                  </div>
                  <div className="truncate" title={`hash: ${entry.hash}`}>
                    <span className="text-slate-400">entryHash: </span>
                    <span className="text-purple-700 font-bold">{entry.hash.substring(0, 20)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
