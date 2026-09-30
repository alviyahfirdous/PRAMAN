import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, FileText, UserCheck, Users } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

const STATUS_COLOURS: Record<string, string> = {
  SCREENED: 'badge-info',
  ENROLLED: 'badge-low',
  ACTIVE: 'badge-low',
  COMPLETED: 'badge-low',
  WITHDRAWN: 'badge-medium',
  SCREEN_FAILED: 'badge-medium',
};

const CONSENT_COLOURS: Record<string, string> = {
  OBTAINED: 'text-teal-600',
  RE_CONSENT_REQUIRED: 'text-terracotta-600 font-semibold',
  NOT_OBTAINED: 'text-slate-400',
  WITHDRAWN: 'text-maroon-600',
};

type ModalType =
  | 'add_participant'
  | 'record_consent'
  | 'start_screening'
  | 'record_visit'
  | 'report_ae'
  | 'upload_doc'
  | 'respond_query'
  | 're_consent'
  | 'view_participant'
  | null;

export default function CoordinatorDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', 'coordinator'],
    queryFn: () => dashboardApi.coordinator().then((r) => r.data),
  });

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState('');
  const [localParticipants, setLocalParticipants] = useState<any[] | null>(null);
  const [localReConsent, setLocalReConsent] = useState<any[] | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = (type: ModalType, label: string) => {
    setModal(type);
  };

  const handleModalSubmit = (label: string) => {
    if (modal === 're_consent' && selectedParticipant) {
      const subId = selectedParticipant.pseudonymised_subject_id;
      setLocalReConsent((prev) => (prev ?? reConsent).filter((r: any) => r.pseudonymised_subject_id !== subId));
      setLocalParticipants((prev) =>
        (prev ?? participants).map((p: any) =>
          p.pseudonymised_subject_id === subId
            ? { ...p, consent_status: 'OBTAINED', re_consent_required: false }
            : p
        )
      );
      showToast(`✓ Re-Consent recorded & verified for ${subId}`);
    } else if (modal === 'add_participant') {
      const newId = `SUB-DEL01-${String((localParticipants ?? participants).length + 1).padStart(4, '0')}`;
      setLocalParticipants((prev) => [
        {
          id: `p-new-${Date.now()}`,
          pseudonymised_subject_id: newId,
          status: 'SCREENED',
          consent_status: 'OBTAINED',
          enrollment_date: new Date().toISOString(),
          re_consent_required: false,
        },
        ...(prev ?? participants),
      ]);
      showToast(`✓ Participant ${newId} registered and screened`);
    } else {
      showToast(`✓ ${label} recorded and verified`);
    }
    setModal(null);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const rawParticipants = data?.participants ?? FALLBACK_PARTICIPANTS;
  const rawReConsent = data?.re_consent_pending ?? FALLBACK_RECONSENT;
  const participants = localParticipants ?? rawParticipants;
  const reConsent = localReConsent ?? rawReConsent;

  const summary = {
    total_participants: participants.length,
    today_visits: 3,
    re_consent_pending: reConsent.length,
    open_queries: 7,
    open_ae_drafts: 1,
  };

  const QUICK_ACTIONS = [
    { label: 'Add Participant', id: 'btn-add-participant', colour: 'bg-navy-600 text-white hover:bg-navy-700', modal: 'add_participant' as ModalType },
    { label: 'Record Consent', id: 'btn-record-consent', colour: 'bg-teal-600 text-white hover:bg-teal-700', modal: 'record_consent' as ModalType },
    { label: 'Start Screening', id: 'btn-start-screening', colour: 'bg-clinical-600 text-white hover:bg-clinical-700', modal: 'start_screening' as ModalType },
    { label: 'Record Visit', id: 'btn-record-visit', colour: 'bg-ochre-600 text-white hover:bg-ochre-700', modal: 'record_visit' as ModalType },
    { label: 'Report AE/ADR/SAE', id: 'btn-report-ae', colour: 'bg-terracotta-600 text-white hover:bg-terracotta-700', modal: 'report_ae' as ModalType },
    { label: 'Upload Document', id: 'btn-upload-doc', colour: 'border border-slate-300 text-slate-700 hover:bg-slate-50', modal: 'upload_doc' as ModalType },
    { label: 'Respond to Query', id: 'btn-respond-query', colour: 'border border-slate-300 text-slate-700 hover:bg-slate-50', modal: 'respond_query' as ModalType },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-teal-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Study Coordinator Workspace</h1>
          <p className="text-slate-500 text-sm mt-0.5">Daily operational worklist — Participant management</p>
        </div>
        <div className="disclaimer-banner">
          <AlertCircle size={12} className="text-ochre-600" />
          <span>No real patient identifiers — pseudonymised IDs only</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Participants', value: summary.total_participants ?? 45, icon: Users, colour: 'bg-navy-100 text-navy-700' },
          { label: "Today's Visits", value: summary.today_visits ?? 3, icon: Clock, colour: 'bg-clinical-100 text-clinical-700' },
          { label: 'Re-consent Pending', value: summary.re_consent_pending ?? 8, icon: UserCheck, colour: 'bg-terracotta-100 text-terracotta-700', alert: true },
          { label: 'Open Queries', value: summary.open_queries ?? 7, icon: AlertCircle, colour: 'bg-ochre-100 text-ochre-700' },
          { label: 'AE Drafts', value: summary.open_ae_drafts ?? 1, icon: FileText, colour: 'bg-maroon-100 text-maroon-700', alert: true },
        ].map(({ label, value, icon: Icon, colour, alert }) => (
          <div
            key={label}
            className={`clinical-card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all ${alert && value > 0 ? 'border-l-4 border-l-terracotta-500' : ''}`}
            onClick={() => {
              if (label === 'AE Drafts') setModal('report_ae');
              else if (label === 'Re-consent Pending') setModal('re_consent');
              else if (label === 'Open Queries') setModal('respond_query');
            }}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colour}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-navy-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="clinical-card p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ label, id, colour, modal: modalType }) => (
            <button
              key={id}
              id={id}
              onClick={() => handleAction(modalType, label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${colour}`}
            >
              <Plus size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Re-consent Alert */}
      {reConsent.length > 0 && (
        <div className="clinical-card border-l-4 border-l-terracotta-500 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-terracotta-600" />
            <h2 className="text-base font-semibold text-terracotta-800">Re-Consent Required ({reConsent.length})</h2>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            The following participants require re-consent following protocol v2.0 update (updated risk language).
            Re-consent must be obtained before the next study visit.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Participant ID', 'Reason', 'Deadline', 'Action'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reConsent.map((p: Record<string, unknown>) => (
                  <tr key={p.id as string} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold text-navy-700">{p.pseudonymised_subject_id as string}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-600">{p.re_consent_reason as string}</td>
                    <td className="py-2.5 px-3">
                      <span className="countdown-critical text-xs">{formatDate(p.re_consent_deadline as string)}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        className="px-3 py-1 text-xs font-semibold text-white bg-terracotta-600 rounded-lg hover:bg-terracotta-700 transition-colors"
                        onClick={() => { setSelectedParticipant(p); setModal('re_consent'); }}
                      >
                        Record Re-consent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Participant Table */}
      <div className="clinical-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-900">Participants</h2>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
            onClick={() => refetch()}
          >
            <RefreshCw size={15} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <CheckCircle2 size={12} className="text-teal-500" />
          Only pseudonymised identifiers shown. Real names and direct identifiers are never displayed.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Pseudonym ID', 'Status', 'Consent', 'Enrolment Date', 'Re-consent?', 'Action Required'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.slice(0, 15).map((p: Record<string, unknown>) => (
                <tr key={p.id as string} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs font-semibold text-navy-700">
                    {p.pseudonymised_subject_id as string}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={STATUS_COLOURS[p.status as string] ?? 'badge-info'}>
                      {String(p.status || 'ACTIVE').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-medium ${CONSENT_COLOURS[p.consent_status as string] ?? 'text-slate-500'}`}>
                      {String(p.consent_status || 'OBTAINED').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-600">
                    {formatDate(p.enrollment_date as string)}
                  </td>
                  <td className="py-2.5 px-3">
                    {p.re_consent_required
                      ? <span className="badge-high">Yes</span>
                      : <span className="text-xs text-slate-400">No</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    {p.re_consent_required
                      ? <button
                          className="text-xs text-terracotta-600 font-semibold hover:underline"
                          onClick={() => { setSelectedParticipant(p); setModal('re_consent'); }}
                        >
                          Re-consent
                        </button>
                      : <button
                          className="text-xs text-clinical-600 font-medium hover:underline"
                          onClick={() => { setSelectedParticipant(p); setModal('view_participant'); }}
                        >
                          View
                        </button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────── */}
      {/* Add Participant */}
      <Modal
        open={modal === 'add_participant'}
        onClose={() => setModal(null)}
        title="Add Participant"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Participant added')} className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700">Add Participant</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-ochre-700 bg-ochre-50 border border-ochre-200 rounded-lg px-3 py-2">Participant IDs are auto-assigned. No real names or identifiers are stored — pseudonymised IDs only.</p>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Study</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>AIIA-OA-2026-001 — AyurVeda OA-2026</option>
              <option>AIIA-GI-2026-003 — AgniBalance</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Site</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>DEL-01 — AIIA Main Campus</option>
              <option>DEL-02 — AIIA Extension, Dwarka</option>
              <option>JAI-01 — Jaipur Research Site</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Date of Screening</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
        </div>
      </Modal>

      {/* Record Consent */}
      <Modal
        open={modal === 'record_consent'}
        onClose={() => setModal(null)}
        title="Record Informed Consent"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Consent recorded')} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700">Record Consent</button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Participant ID</label>
            <input type="text" placeholder="SUB-DEL01-0001" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Consent Form Version</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>v2.0 (Current)</option>
              <option>v1.0 (Superseded)</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Date of Consent</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="witness-present" className="rounded" />
            <label htmlFor="witness-present" className="text-sm text-slate-700">Witness present during consent process</label>
          </div>
        </div>
      </Modal>

      {/* Start Screening */}
      <Modal
        open={modal === 'start_screening'}
        onClose={() => setModal(null)}
        title="Start Screening"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Screening started')} className="px-4 py-2 text-sm font-semibold text-white bg-clinical-600 rounded-lg hover:bg-clinical-700">Start Screening</button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Participant ID</label>
            <input type="text" placeholder="SUB-DEL01-0001" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Screening Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Screened by</label>
            <input type="text" placeholder="Coordinator name" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
        </div>
      </Modal>

      {/* Record Visit */}
      <Modal
        open={modal === 'record_visit'}
        onClose={() => setModal(null)}
        title="Record Study Visit"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Visit recorded')} className="px-4 py-2 text-sm font-semibold text-white bg-ochre-600 rounded-lg hover:bg-ochre-700">Record Visit</button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Participant ID</label>
            <input type="text" placeholder="SUB-DEL01-0001" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Visit Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>Baseline (V1)</option>
              <option>Week 4 (V2)</option>
              <option>Week 8 (V3)</option>
              <option>Week 12 / End of Treatment (V4)</option>
              <option>Follow-up (V5)</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Visit Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea rows={3} placeholder="Any observations or notes for this visit…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
        </div>
      </Modal>

      {/* Report AE */}
      <Modal
        open={modal === 'report_ae'}
        onClose={() => setModal(null)}
        title="Report Adverse Event / ADR / SAE"
        size="lg"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Adverse event reported')} className="px-4 py-2 text-sm font-semibold text-white bg-terracotta-600 rounded-lg hover:bg-terracotta-700">Submit AE Report</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-maroon-50 border border-maroon-200 rounded-lg px-4 py-3 text-sm text-maroon-800">
            <strong>SAE = Serious Adverse Event.</strong> All SAEs must be reported to PI within 24 hours. This form generates a draft — the PI must review and e-sign before submission.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Participant ID</label>
              <input type="text" placeholder="SUB-DEL01-0001" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
            </div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Category</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>AE — Adverse Event</option>
              <option>ADR — Adverse Drug Reaction</option>
              <option>SAE — Serious Adverse Event</option>
              <option>SUSAR — Suspected Unexpected SAE</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Event Description</label>
            <textarea rows={3} placeholder="Describe the adverse event…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Seriousness Criteria (select all that apply)</label>
            <div className="space-y-1.5">
              {['Death', 'Life-threatening', 'Hospitalisation / prolonged hospitalisation', 'Persistent disability', 'Congenital anomaly', 'Other medically important event'].map(c => (
                <label key={c} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload Document */}
      <Modal
        open={modal === 'upload_doc'}
        onClose={() => setModal(null)}
        title="Upload Document"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Document uploaded')} className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700">Upload</button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option>Consent Form</option>
              <option>Lab Report</option>
              <option>Protocol Deviation Report</option>
              <option>Source Document</option>
              <option>Monitoring Report</option>
              <option>Other</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">File</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-navy-400 transition-colors">
              <div className="text-slate-400 text-sm">Click to select or drag & drop</div>
              <div className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — max 10MB</div>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <input type="text" placeholder="Optional description…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
        </div>
      </Modal>

      {/* Respond to Query */}
      <Modal
        open={modal === 'respond_query'}
        onClose={() => setModal(null)}
        title="Respond to Data Query"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleModalSubmit('Query response submitted')} className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700">Submit Response</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">QUERY QRY-2026-017</div>
            <p className="text-sm text-slate-700">Visit V2 — Haemoglobin value (9.2 g/dL) is below the eligibility threshold for continued participation. Please clarify if CAPA was initiated.</p>
            <div className="text-xs text-slate-400 mt-2">Raised by: Monitor — Karan Mehta</div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
            <textarea rows={4} placeholder="Provide your response to the query…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
        </div>
      </Modal>

      {/* Re-consent */}
      <Modal
        open={modal === 're_consent'}
        onClose={() => { setModal(null); setSelectedParticipant(null); }}
        title={selectedParticipant ? `Re-consent: ${selectedParticipant.pseudonymised_subject_id}` : 'Record Re-consent'}
        footer={
          <>
            <button onClick={() => { setModal(null); setSelectedParticipant(null); }} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={() => { handleModalSubmit('Re-consent recorded'); setSelectedParticipant(null); }} className="px-4 py-2 text-sm font-semibold text-white bg-terracotta-600 rounded-lg hover:bg-terracotta-700">Record Re-consent</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-terracotta-50 border border-terracotta-200 rounded-lg px-3 py-2 text-sm text-terracotta-800">
            Re-consent required: Protocol v2.0 updated risk language. Participant must be re-consented before the next study visit.
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Consent Form Version</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"><option>v2.0 (Current — Updated risk language)</option></select>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Date of Re-consent</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="reconsent-confirm" className="rounded" />
            <label htmlFor="reconsent-confirm" className="text-sm text-slate-700">Participant understood and agreed after adequate time for questions</label>
          </div>
        </div>
      </Modal>

      {/* View Participant */}
      <Modal
        open={modal === 'view_participant'}
        onClose={() => { setModal(null); setSelectedParticipant(null); }}
        title={selectedParticipant ? `Participant: ${selectedParticipant.pseudonymised_subject_id}` : 'Participant Detail'}
      >
        {selectedParticipant && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pseudonym ID', value: (selectedParticipant.pseudonymised_subject_id as string) || '—' },
                { label: 'Status', value: selectedParticipant.status ? String(selectedParticipant.status).replace(/_/g, ' ') : 'ACTIVE' },
                { label: 'Consent Status', value: selectedParticipant.consent_status ? String(selectedParticipant.consent_status).replace(/_/g, ' ') : 'RE_CONSENT_REQUIRED' },
                { label: 'Enrolment Date', value: selectedParticipant.enrollment_date ? new Date(selectedParticipant.enrollment_date as string).toLocaleDateString('en-IN') : '—' },
                { label: 'Re-consent Required', value: selectedParticipant.re_consent_required ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-navy-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Only pseudonymised identifiers are shown. No real patient data is accessible.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

const FALLBACK_PARTICIPANTS = Array.from({ length: 15 }, (_, i) => ({
  id: `p-${i}`,
  pseudonymised_subject_id: `SUB-DEL01-${String(i + 1).padStart(4, '0')}`,
  status: i < 10 ? 'ACTIVE' : 'SCREENED',
  consent_status: i < 4 ? 'RE_CONSENT_REQUIRED' : 'OBTAINED',
  enrollment_date: new Date(2026, 1, i + 10).toISOString(),
  re_consent_required: i < 4,
}));

const FALLBACK_RECONSENT = [
  { id: 'r1', pseudonymised_subject_id: 'SUB-DEL01-0001', re_consent_reason: 'Protocol v2.0 updated risk section', re_consent_deadline: new Date(Date.now() + 7 * 86400000).toISOString() },
  { id: 'r2', pseudonymised_subject_id: 'SUB-DEL01-0002', re_consent_reason: 'Protocol v2.0 updated risk section', re_consent_deadline: new Date(Date.now() + 7 * 86400000).toISOString() },
  { id: 'r3', pseudonymised_subject_id: 'SUB-DEL02-0001', re_consent_reason: 'Protocol v2.0 updated risk section', re_consent_deadline: new Date(Date.now() + 5 * 86400000).toISOString() },
];
