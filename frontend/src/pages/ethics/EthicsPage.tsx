import React, { useState } from 'react';
import {
  FileCheck, Calendar, Clock, CheckCircle2, AlertTriangle,
  FileText, ExternalLink, Plus, Search, ShieldCheck
} from 'lucide-react';
import Modal from '@/components/Modal';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/authStore';
import type { UserRole } from '@/types';

export default function EthicsPage() {
  const [activeTab, setActiveTab] = useState<'queue' | 'meetings' | 'ctri'>('queue');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'CLARIFY' | 'HOLD' | null>(null);
  const [toast, setToast] = useState('');

  const { user } = useAuthStore();
  const role = user?.role as UserRole;
  const can = (roles: UserRole[]) => roles.includes(role);

  const [reviews, setReviews] = useState([
    { id: 'e1', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'CONTINUING_REVIEW', protocol_version: 'v2.0', submission_date: '2026-03-25', due_date: '2026-04-12', decision: 'PENDING', pi: 'Dr. Arjun Sharma' },
    { id: 'e2', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'SAE_NOTIFICATION', protocol_version: 'v2.0', submission_date: '2026-03-29', due_date: '2026-04-05', decision: 'EXPEDITED_REVIEW', pi: 'Dr. Arjun Sharma' },
    { id: 'e3', protocol_id: 'AIIA-GI-2026-003', study_title: 'AgniBalance', submission_type: 'PROTOCOL_AMENDMENT', protocol_version: 'v1.1', submission_date: '2026-03-27', due_date: '2026-04-14', decision: 'PENDING', pi: 'Dr. Meena Iyer' },
    { id: 'e4', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'AMENDMENT_V2', protocol_version: 'v2.0', submission_date: '2026-03-10', due_date: '2026-03-20', decision: 'APPROVED', pi: 'Dr. Arjun Sharma' },
    { id: 'e5', protocol_id: 'AIIA-DM-2025-002', study_title: 'PramehaCare', submission_type: 'ANNUAL_REPORT', protocol_version: 'v1.0', submission_date: '2026-01-05', due_date: '2026-01-20', decision: 'APPROVED', pi: 'Dr. Anand Joshi' },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleDecisionSubmit = () => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReview.id
          ? { ...r, decision: actionType === 'APPROVE' ? 'APPROVED' : actionType === 'CLARIFY' ? 'CLARIFICATION_REQUESTED' : 'ON_HOLD' }
          : r
      )
    );
    setSelectedReview(null);
    setActionType(null);
    showToast(`✓ IEC Decision '${actionType}' issued with digital signature stamp`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Institutional Ethics Committee (IEC) Oversight</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ethical review dossiers, meeting agendas, and Clinical Trials Registry of India (CTRI) alignment</p>
        </div>
        {can(['ETHICS_COMMITTEE', 'LEADERSHIP', 'ADMIN']) && (
          <button
            onClick={() => showToast('Generating IEC meeting agenda pack...')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors flex items-center gap-2 self-start"
          >
            <Calendar size={16} /> Schedule Next Board Meeting
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Pending Ethical Submissions</div>
          <div className="text-2xl font-bold text-ochre-700 mt-1">
            {reviews.filter((r) => r.decision === 'PENDING' || r.decision === 'EXPEDITED_REVIEW').length} Reviews
          </div>
          <p className="text-xs text-slate-400 mt-1">Average turnaround: 8.4 days</p>
        </div>

        <div className="clinical-card p-4 border-l-4 border-l-maroon-500">
          <div className="text-xs text-slate-500 font-medium">SAE Expedited Notifications</div>
          <div className="text-2xl font-bold text-maroon-700 mt-1">1 Case</div>
          <p className="text-xs text-maroon-600 font-medium mt-1">Due within 7 calendar days</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Approved Protocols</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">8 Active</div>
          <p className="text-xs text-slate-400 mt-1">All verified under ICMR 2017</p>
        </div>

        <div className="clinical-card p-4">
          <div className="text-xs text-slate-500 font-medium">Next Board Meeting</div>
          <div className="text-2xl font-bold text-navy-900 mt-1">April 14</div>
          <p className="text-xs text-clinical-600 font-medium mt-1">Full Committee Quorum</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'queue'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Review Queue & Submissions
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'meetings'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            IEC Meetings & Minutes
          </button>
          <button
            onClick={() => setActiveTab('ctri')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === 'ctri'
                ? 'border-clinical-600 text-clinical-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            CTRI Regulatory Synchronization
          </button>
        </div>
      </div>

      {/* Queue Tab */}
      {activeTab === 'queue' && (
        <div className="clinical-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Protocol ID</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Study Title</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Submission Type</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Version</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Due Date</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th className="py-3 px-4 text-right font-semibold text-slate-500 text-xs uppercase">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-navy-800">{r.protocol_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 text-xs max-w-xs">{r.study_title}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700 text-xs">{r.submission_type.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-xs">{r.protocol_version}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{formatDate(r.due_date)}</td>
                  <td className="py-3 px-4">
                    <span className={r.decision === 'APPROVED' ? 'badge-low' : r.decision === 'EXPEDITED_REVIEW' ? 'badge-high' : 'badge-medium'}>
                      {r.decision.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.decision !== 'APPROVED' ? (
                      can(['ETHICS_COMMITTEE', 'LEADERSHIP', 'ADMIN']) ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedReview(r); setActionType('APPROVE'); }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedReview(r); setActionType('CLARIFY'); }}
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            Clarify
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Under Review</span>
                      )
                    ) : (
                      <span className="text-xs text-teal-600 font-bold">Approved ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="clinical-card p-5 border-l-4 border-l-clinical-600">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge-info">UPCOMING FULL BOARD MEETING</span>
                <h3 className="font-bold text-navy-900 text-base mt-1">IEC Ordinary Session — April 2026</h3>
                <p className="text-xs text-slate-500 mt-0.5">Date: <strong>April 14, 2026, 14:00 - 17:00 IST</strong> • Location: Board Room A, AIIA Main Campus</p>
                <div className="mt-3 text-xs text-slate-700 space-y-1">
                  <div>1. Annual review of AyurVeda OA-2026 (Protocol v2.0)</div>
                  <div>2. Review of SAE-2026-041 (Severe Hepatotoxicity) expedited causality report</div>
                  <div>3. Protocol Amendment v1.1 for AgniBalance</div>
                </div>
              </div>
              <button
                onClick={() => showToast('Exporting meeting agenda dossier pack...')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded bg-navy-600 text-white hover:bg-navy-700"
              >
                Export Agenda Pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTRI Tab */}
      {activeTab === 'ctri' && (
        <div className="clinical-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy-900 text-base">Clinical Trials Registry of India (CTRI) Synchronization</h3>
              <p className="text-xs text-slate-500 mt-0.5">Mandatory 6-month status updates and recruitment disclosures per Indian GCP</p>
            </div>
            {can(['ETHICS_COMMITTEE', 'LEADERSHIP', 'REGULATOR', 'ADMIN']) && (
              <button
                onClick={() => showToast('Triggered automated sync check with CTRI portal')}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700"
              >
                Sync with CTRI Gateway
              </button>
            )}
          </div>

          <div className="space-y-3 text-sm pt-2">
            <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-navy-800">AyurVeda OA-2026 (CTRI/2026/01/000001)</div>
                <div className="text-xs text-slate-500 mt-0.5">Status: Active • Enrolled: 82 / 150 • Next mandatory report: <strong className="text-ochre-700">Due in 5 days</strong></div>
              </div>
              <span className="badge-high">Update Due</span>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-navy-800">PramehaCare (CTRI/2025/06/000042)</div>
                <div className="text-xs text-slate-500 mt-0.5">Status: Active • Enrolled: 410 / 500 • Last verified: 2026-01-10</div>
              </div>
              <span className="badge-low">Synchronized ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {selectedReview && (
        <Modal
          title={`Ethics Committee Decision: ${selectedReview.protocol_id}`}
          onClose={() => setSelectedReview(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecisionSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Confirm & Issue Digital Clearance
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>Protocol: <strong className="font-mono text-navy-900">{selectedReview.protocol_id}</strong></div>
              <div>Study: <strong>{selectedReview.study_title}</strong></div>
              <div>Submission Type: <strong>{selectedReview.submission_type.replace(/_/g, ' ')}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Committee Decision</label>
              <select
                value={actionType || 'APPROVE'}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="APPROVE">Approved (Full Ethical Clearance Issued)</option>
                <option value="CLARIFY">Clarification Requested (Response needed within 14 days)</option>
                <option value="HOLD">Placed on Hold (Additional safety data required)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Formal Reviewer Comments</label>
              <textarea
                rows={3}
                defaultValue="The committee has reviewed the revised informed consent document v2.0. Participant safety safeguards meet ICMR 2017 guidelines. Approved for continued active clinical enrolment."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>

            <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800">
              <ShieldCheck size={16} />
              <span>Digital approval certificate will be cryptographically hashed and published to trial registry.</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
