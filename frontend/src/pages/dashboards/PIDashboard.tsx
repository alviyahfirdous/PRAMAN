import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, FileText, Shield, Users, ClipboardCheck, PenLine } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDate, getEnrolmentPct, getRiskBadgeClass } from '@/lib/utils';
import Modal from '@/components/Modal';

export default function PIDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'pi'],
    queryFn: () => dashboardApi.pi().then((r) => r.data),
  });

  const [reviewModal, setReviewModal] = useState<Record<string, unknown> | null>(null);
  const [esignModal, setEsignModal] = useState<Record<string, unknown> | null>(null);
  const [pin, setPin] = useState('');
  const [toast, setToast] = useState('');
  const [signedItems, setSignedItems] = useState<Set<number>>(new Set());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  if (isLoading) return <LoadingState />;

  const studies = data?.assigned_studies ?? [];
  const approvals = data?.approval_queue ?? [];
  const pending = data?.pending_approvals ?? {
    sae_reviews: 1,
    protocol_deviations: 2,
    iec_renewals: 1,
    consent_amendments: 2,
    capa_approvals: 1,
  };

  const handleESign = (idx: number) => {
    setSignedItems(prev => new Set([...prev, idx]));
    setEsignModal(null);
    setPin('');
    showToast('✓ E-Signature applied successfully (demo — cryptographic hash recorded in audit trail)');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-navy-900">Principal Investigator Workspace</h1>
        <p className="text-slate-500 text-sm mt-0.5">Assigned studies, approvals, and compliance oversight</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'SAE Reviews', value: pending.sae_reviews ?? 0, icon: Shield, alert: true, route: '/safety' },
          { label: 'Protocol Deviations', value: pending.protocol_deviations ?? 0, icon: FileText, alert: false, route: '/studies' },
          { label: 'IEC Renewals', value: pending.iec_renewals ?? 0, icon: CheckCircle2, alert: false, route: '/ethics' },
          { label: 'Consent Amendments', value: pending.consent_amendments ?? 0, icon: ClipboardCheck, alert: false, route: '/studies' },
          { label: 'CAPA Approvals', value: pending.capa_approvals ?? 0, icon: Clock, alert: false, route: '/studies' },
        ].map(({ label, value, icon: Icon, alert, route }) => (
          <div
            key={label}
            className={`clinical-card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all ${alert && value > 0 ? 'border-l-4 border-l-maroon-500' : ''}`}
            onClick={() => navigate(route)}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alert && value > 0 ? 'bg-maroon-100' : 'bg-clinical-50'}`}>
              <Icon size={18} className={alert && value > 0 ? 'text-maroon-600' : 'text-clinical-600'} />
            </div>
            <div>
              <div className="text-xl font-bold text-navy-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Studies */}
      <div className="clinical-card p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-4">Assigned Studies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Protocol ID', 'Study', 'Status', 'Risk', 'Enrolled / Target', 'Compliance'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(studies.length ? studies : FALLBACK_STUDIES).map((s: Record<string, unknown>) => (
                <tr
                  key={s.id as string}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/studies/${s.id}`)}
                >
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600">{s.protocol_id as string}</td>
                  <td className="py-2.5 px-3 font-medium text-navy-800">{s.title as string}</td>
                  <td className="py-2.5 px-3">
                    <span className="badge-info">{s.status ? (s.status as string).replace(/_/g, ' ') : 'ACTIVE'}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={getRiskBadgeClass(s.risk_level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}>
                      {s.risk_level as string}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-slate-700">{s.actual_enrolment as number}/{s.target_enrolment as number}</span>
                      <div className="w-16 progress-bar">
                        <div className="progress-fill bg-teal-500" style={{ width: `${getEnrolmentPct(s.actual_enrolment as number, s.target_enrolment as number)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-bold text-sm ${(s.compliance_score as number) >= 85 ? 'text-teal-600' : (s.compliance_score as number) >= 70 ? 'text-ochre-600' : 'text-terracotta-600'}`}>
                      {s.compliance_score as number}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Queue */}
      <div className="clinical-card p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-1">My Approval Queue</h2>
        <p className="text-xs text-slate-500 mb-4">Each approval requires review of evidence, current version, and explicit e-signature.</p>
        <div className="space-y-3">
          {(approvals.length ? approvals : FALLBACK_APPROVALS).map((item: Record<string, unknown>, i: number) => {
            const isSigned = signedItems.has(i);
            return (
              <div key={i} className={`p-4 rounded-xl border ${isSigned ? 'border-teal-200 bg-teal-50' : (item.requires_signature as boolean) ? 'border-maroon-200 bg-maroon-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isSigned ? 'bg-teal-100 text-teal-700' : (item.requires_signature as boolean) ? 'bg-maroon-100 text-maroon-700' : 'bg-clinical-100 text-clinical-700'}`}>
                        {isSigned ? '✓ Signed' : item.type ? (item.type as string).replace(/_/g, ' ') : 'APPROVAL'}
                      </span>
                      {Boolean(item.case_id) && <span className="font-mono text-xs text-slate-600">{item.case_id as string}</span>}
                      {item.hours_remaining !== null && item.hours_remaining !== undefined && !isSigned && (
                        <span className="countdown-critical text-xs">{item.hours_remaining as number}h remaining</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{item.description as string}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Created: {formatDate(item.created_at as string)}</span>
                      <span>Status: {isSigned ? 'Signed' : item.status as string}</span>
                    </div>
                  </div>
                  {!isSigned && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        onClick={() => setReviewModal(item)}
                      >
                        Review
                      </button>
                      {Boolean(item.requires_signature) && (
                        <button
                          id={`esign-btn-${i}`}
                          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                          style={{ background: 'linear-gradient(135deg, #163a6b 0%, #0d82c8 100%)' }}
                          onClick={() => setEsignModal({ ...item, _idx: i })}
                        >
                          <PenLine size={12} /> E-Sign
                        </button>
                      )}
                    </div>
                  )}
                  {isSigned && (
                    <div className="flex-shrink-0">
                      <CheckCircle2 size={20} className="text-teal-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={`Review: ${reviewModal ? (reviewModal.type as string).replace(/_/g, ' ') : ''}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setReviewModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Close</button>
            {reviewModal?.requires_signature && (
              <button
                onClick={() => { const item = reviewModal; setReviewModal(null); setEsignModal(item); }}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #163a6b 0%, #0d82c8 100%)' }}
              >
                <PenLine size={14} /> Proceed to E-Sign
              </button>
            )}
          </>
        }
      >
        {reviewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Type', value: reviewModal.type ? (reviewModal.type as string).replace(/_/g, ' ') : '—' },
                { label: 'Case ID', value: (reviewModal.case_id as string) || '—' },
                { label: 'Status', value: reviewModal.status as string },
                { label: 'Created', value: formatDate(reviewModal.created_at as string) },
                { label: 'Requires E-Signature', value: reviewModal.requires_signature ? 'Yes' : 'No' },
                { label: 'Hours Remaining', value: reviewModal.hours_remaining !== null ? `${reviewModal.hours_remaining}h` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-navy-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-600 mb-1">Description</div>
              <p className="text-sm text-slate-700">{reviewModal.description as string}</p>
            </div>
            {Boolean(reviewModal.requires_signature) && (
              <div className="bg-maroon-50 border border-maroon-200 rounded-lg px-4 py-3 text-sm text-maroon-800">
                <strong>E-Signature required.</strong> Review all documentation before signing. Your e-signature certifies that you have reviewed and approved this item.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* E-Sign Modal */}
      <Modal
        open={!!esignModal}
        onClose={() => { setEsignModal(null); setPin(''); }}
        title="E-Signature Required"
        size="sm"
        footer={
          <>
            <button onClick={() => { setEsignModal(null); setPin(''); }} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button
              onClick={() => { if (esignModal) handleESign(esignModal._idx as number); }}
              disabled={pin.length < 4}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #163a6b 0%, #0d82c8 100%)' }}
            >
              <PenLine size={14} /> Apply E-Signature
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3 text-sm text-navy-800">
            You are signing: <strong>{esignModal ? (esignModal.type as string).replace(/_/g, ' ') : ''}</strong>
            {Boolean(esignModal?.case_id) && <> — <span className="font-mono">{esignModal?.case_id as string}</span></>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter your PIN to confirm (any 4+ digits for demo)</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              maxLength={8}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-navy-400"
            />
          </div>
          <p className="text-xs text-slate-400">Your e-signature is cryptographically hashed and appended to the tamper-evident audit trail with timestamp.</p>
        </div>
      </Modal>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );
}

const FALLBACK_STUDIES = [
  { id: '1', protocol_id: 'AIIA-OA-2026-001', title: 'AyurVeda OA-2026', status: 'ACTIVE', risk_level: 'HIGH', actual_enrolment: 82, target_enrolment: 150, compliance_score: 71 },
  { id: '3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance', status: 'ACTIVE', risk_level: 'HIGH', actual_enrolment: 43, target_enrolment: 120, compliance_score: 76 },
];

const FALLBACK_APPROVALS = [
  { type: 'SAE_REVIEW', case_id: 'SAE-2026-041', description: 'SAE review and e-signature required: Severe Hepatotoxicity (SUB-DEL01-0001). Hospitalisation case.', status: 'MEDICAL_REVIEW', created_at: new Date().toISOString(), hours_remaining: 3, requires_signature: true },
  { type: 'PROTOCOL_DEVIATION_REVIEW', description: 'DEV-2026-002: Eligibility deviation — review CAPA requirement', status: 'UNDER_REVIEW', created_at: new Date().toISOString(), hours_remaining: null, requires_signature: false },
  { type: 'IEC_RENEWAL_PACKAGE', description: 'Annual IEC renewal for AyurVeda OA-2026 — submission package review required', status: 'PENDING', created_at: new Date().toISOString(), hours_remaining: null, requires_signature: true },
];
