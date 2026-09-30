import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, AlertTriangle, X } from 'lucide-react';

interface ReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (password: string) => void;
  approverName: string;
  approverRole: string;
  approverId: string;
  submitterId?: string;
  submitterName?: string;
}

export const ReauthModal: React.FC<ReauthModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  approverName,
  approverRole,
  approverId,
  submitterId,
  submitterName,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Separation of duties check
  const isSelfApproval = Boolean(submitterId && approverId && submitterId === approverId);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      return;
    }

    // Auto focus password input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelfApproval) {
      setError('Separation of duties violation: Submitter cannot approve their own submission.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required for electronic signature.');
      return;
    }

    onApprove(password);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        ref={modalRef}
        className="clinical-card max-w-lg w-full p-6 space-y-4 bg-white rounded-2xl shadow-2xl border border-slate-200 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Lock size={20} />
          </div>
          <div>
            <h2 id="modal-title" className="text-base font-bold text-navy-900">
              Electronic Signature &amp; Authorised Approval
            </h2>
            <p className="text-xs text-slate-500">21 CFR Part 11 / GCP Electronic Record Mandate</p>
          </div>
        </div>

        {/* Separation of Duties Violation Notice */}
        {isSelfApproval && (
          <div
            role="alert"
            className="p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-xs space-y-1 text-maroon-900"
          >
            <div className="flex items-center gap-1.5 font-bold text-maroon-800">
              <AlertTriangle size={15} />
              <span>Separation of Duties Conflict</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This draft was submitted by <strong>{submitterName || 'you'}</strong>. Regulatory controls require approval by an independent investigator. You cannot approve your own submission.
            </p>
          </div>
        )}

        {/* Approver Identity */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Approving User:</span>
            <span className="font-bold text-navy-900">{approverName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Authorised Role:</span>
            <span className="badge-info text-[10px]">{approverRole}</span>
          </div>
          {submitterName && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <span>Submitted by:</span>
              <span className="font-medium text-slate-700">{submitterName}</span>
            </div>
          )}
        </div>

        {/* Signing Intent Text */}
        <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-1 text-xs text-purple-950">
          <div className="font-bold text-[11px] uppercase tracking-wider text-purple-900">
            Signing Intent Certification:
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700">
            &ldquo;I confirm that I have reviewed all extracted clinical trial values and safety determinations against primary source records. I certify this structured draft as an accurate, complete, and authorized representation of the participant encounter under GCP and trial protocol requirements.&rdquo;
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label htmlFor="reauth-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Re-enter Password to Authorize Signature:
            </label>
            <input
              id="reauth-password"
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSelfApproval}
              placeholder="Enter your login password (demo: any non-empty password)..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono disabled:bg-slate-100"
            />
          </div>

          {error && <div className="text-xs font-semibold text-maroon-600">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSelfApproval || !password.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Sign &amp; Authorize Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
