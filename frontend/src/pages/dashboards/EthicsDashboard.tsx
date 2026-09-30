import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, CheckCircle2, XCircle, HelpCircle, Shield } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

const DECISION_CONFIG = {
  PENDING: { label: 'Pending', className: 'badge-medium', icon: Clock },
  APPROVED: { label: 'Approved', className: 'badge-low', icon: CheckCircle2 },
  CLARIFICATION_REQUESTED: { label: 'Clarification Needed', className: 'badge-high', icon: HelpCircle },
  HELD: { label: 'Held', className: 'badge-high', icon: AlertCircle },
  REJECTED: { label: 'Rejected', className: 'badge-critical', icon: XCircle },
};

type ActionType = 'approve' | 'clarify' | 'hold' | null;

export default function EthicsDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', 'ethics'],
    queryFn: () => dashboardApi.ethics().then((r) => r.data),
  });

  const [modal, setModal] = useState<ActionType>(null);
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState('');
  const [localDecisions, setLocalDecisions] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleAction = (action: ActionType, item: Record<string, unknown>) => {
    setSelectedItem(item);
    setComments('');
    setModal(action);
  };

  const handleSubmitDecision = (action: ActionType) => {
    if (!selectedItem) return;
    const id = selectedItem.id as string;
    const newDecision = action === 'approve' ? 'APPROVED' : action === 'clarify' ? 'CLARIFICATION_REQUESTED' : 'HELD';
    setLocalDecisions(prev => ({ ...prev, [id]: newDecision }));
    setModal(null);
    setSelectedItem(null);
    const msgs = { approve: '✓ Submission approved successfully (demo)', clarify: '✓ Clarification requested (demo)', hold: '✓ Submission held pending committee review (demo)' };
    showToast(msgs[action!] || 'Action recorded');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const summary = data?.summary ?? {
    total_submissions: 12,
    pending_review: 3,
    approved: 8,
    clarification_requested: 1,
  };
  const queue = (data?.review_queue ?? FALLBACK_QUEUE).map((r: Record<string, unknown>) => ({
    ...r,
    decision: localDecisions[r.id as string] ?? r.decision,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-navy-900">Ethics Committee Workspace</h1>
        <p className="text-slate-500 text-sm mt-0.5">Protocol submissions, consents, renewals, and safety reports</p>
      </div>

      <div className="disclaimer-banner">
        <AlertCircle size={13} className="text-ochre-600 flex-shrink-0" />
        <span>Participant-level data is not shown to Ethics Committee members. Aggregate and protocol-level information only.</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: summary.total_submissions ?? 12, colour: 'bg-navy-100 text-navy-700' },
          { label: 'Pending Review', value: summary.pending_review ?? 3, colour: 'bg-ochre-100 text-ochre-700', alert: true },
          { label: 'Approved', value: summary.approved ?? 8, colour: 'bg-teal-100 text-teal-700' },
          { label: 'Clarification Needed', value: summary.clarification_requested ?? 1, colour: 'bg-terracotta-100 text-terracotta-700' },
        ].map(({ label, value, colour, alert }) => (
          <div key={label} className={`clinical-card p-4 flex items-center gap-3 ${alert && value > 0 ? 'border-l-4 border-l-terracotta-500' : ''}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colour}`}>
              <Shield size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-navy-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Queue */}
      <div className="clinical-card p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-4">Review Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Protocol ID', 'Study', 'Type', 'Version', 'Submitted', 'Due Date', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((r: Record<string, unknown>, i: number) => {
                const config = DECISION_CONFIG[r.decision as keyof typeof DECISION_CONFIG] ?? DECISION_CONFIG.PENDING;
                const Icon = config.icon;
                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">{r.protocol_id as string ?? 'AIIA-OA-2026-001'}</td>
                    <td className="py-3 px-3 font-medium text-navy-800">{r.study_title as string ?? 'AyurVeda OA-2026'}</td>
                    <td className="py-3 px-3">
                      <span className="badge-info">{String(r.submission_type || 'AMENDMENT').replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">{r.protocol_version as string ?? 'v2.0'}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{formatDate(r.submission_date as string)}</td>
                    <td className="py-3 px-3 text-xs">
                      <span className="countdown-warning font-semibold">{formatDate(r.due_date as string)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`${config.className} inline-flex items-center gap-1`}>
                        <Icon size={11} />
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {r.decision === 'PENDING' && (
                        <div className="flex gap-1">
                          <button
                            id={`approve-${i}`}
                            className="px-2 py-1 text-xs font-semibold text-white bg-teal-600 rounded hover:bg-teal-700 transition-colors"
                            onClick={() => handleAction('approve', r)}
                          >
                            Approve
                          </button>
                          <button
                            id={`clarify-${i}`}
                            className="px-2 py-1 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                            onClick={() => handleAction('clarify', r)}
                          >
                            Clarify
                          </button>
                          <button
                            id={`hold-${i}`}
                            className="px-2 py-1 text-xs font-medium text-terracotta-600 border border-terracotta-200 rounded hover:bg-terracotta-50 transition-colors"
                            onClick={() => handleAction('hold', r)}
                          >
                            Hold
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        open={modal === 'approve'}
        onClose={() => setModal(null)}
        title="Approve Submission"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSubmitDecision('approve')} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700">Approve</button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <div className="font-semibold text-navy-800">{selectedItem.study_title as string}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedItem.protocol_id as string}</div>
              <div className="text-xs text-slate-600 mt-1">Type: {String(selectedItem.submission_type || 'AMENDMENT').replace(/_/g, ' ')} | Version: {selectedItem.protocol_version as string}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Committee Comments (required for record)</label>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Enter approval rationale or any conditions…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="approve-confirm" className="rounded" />
              <label htmlFor="approve-confirm" className="text-sm text-slate-700">I confirm this approval after full committee review of all submitted documents.</label>
            </div>
          </div>
        )}
      </Modal>

      {/* Clarify Modal */}
      <Modal
        open={modal === 'clarify'}
        onClose={() => setModal(null)}
        title="Request Clarification"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSubmitDecision('clarify')} className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700">Send Request</button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <div className="font-semibold text-navy-800">{selectedItem.study_title as string}</div>
              <div className="text-xs text-slate-600 mt-0.5">Submission: {String(selectedItem.submission_type || 'AMENDMENT').replace(/_/g, ' ')}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clarification Required</label>
              <textarea
                rows={4}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Describe what clarification is needed from the sponsor/PI…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Response Deadline</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
                defaultValue={new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]} />
            </div>
          </div>
        )}
      </Modal>

      {/* Hold Modal */}
      <Modal
        open={modal === 'hold'}
        onClose={() => setModal(null)}
        title="Hold Submission"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSubmitDecision('hold')} className="px-4 py-2 text-sm font-semibold text-white bg-terracotta-600 rounded-lg hover:bg-terracotta-700">Place on Hold</button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-terracotta-50 border border-terracotta-200 rounded-lg px-3 py-2 text-sm text-terracotta-800">
              Placing this submission on hold will pause its review and notify the PI and Sponsor.
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm">
              <div className="font-semibold text-navy-800">{selectedItem.study_title as string}</div>
              <div className="text-xs text-slate-600 mt-0.5">Submission: {String(selectedItem.submission_type || 'AMENDMENT').replace(/_/g, ' ')}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Hold</label>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Reason for placing this submission on hold…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const FALLBACK_QUEUE = [
  { id: '1', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'CONTINUING_REVIEW', protocol_version: 'v2.0', submission_date: new Date(Date.now() - 5 * 86400000).toISOString(), due_date: new Date(Date.now() + 12 * 86400000).toISOString(), decision: 'PENDING' },
  { id: '2', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'SAE_REPORT', protocol_version: 'v2.0', submission_date: new Date(Date.now() - 1 * 86400000).toISOString(), due_date: new Date(Date.now() + 7 * 86400000).toISOString(), decision: 'PENDING' },
  { id: '3', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'AMENDMENT', protocol_version: 'v2.0', submission_date: new Date(Date.now() - 15 * 86400000).toISOString(), due_date: new Date(Date.now() - 5 * 86400000).toISOString(), decision: 'APPROVED' },
  { id: '4', protocol_id: 'AIIA-DM-2025-002', study_title: 'PramehaCare', submission_type: 'INITIAL_APPROVAL', protocol_version: 'v1.0', submission_date: new Date(Date.now() - 90 * 86400000).toISOString(), due_date: new Date(Date.now() - 60 * 86400000).toISOString(), decision: 'APPROVED' },
];
