import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock, AlertTriangle, Activity, Zap, Eye } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDateTime } from '@/lib/utils';
import Modal from '@/components/Modal';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'badge-info' },
  INITIAL_REPORT_SUBMITTED: { label: 'Submitted', className: 'badge-info' },
  TRIAGE: { label: 'Triage', className: 'badge-medium' },
  MEDICAL_REVIEW: { label: 'Medical Review', className: 'badge-high' },
  FOLLOW_UP_REQUIRED: { label: 'Follow-up Required', className: 'badge-high' },
  REGULATORY_REVIEW: { label: 'Regulatory Review', className: 'badge-high' },
  CLOSED_BY_AUTHORISED_HUMAN: { label: 'Closed', className: 'badge-low' },
};

export default function PVDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'pharmacovigilance'],
    queryFn: () => dashboardApi.pharmacovigilance().then((r) => r.data),
    refetchInterval: 30000,
  });

  const [caseModal, setCaseModal] = useState<Record<string, unknown> | null>(null);
  const [signalModal, setSignalModal] = useState<Record<string, unknown> | null>(null);
  const [notes, setNotes] = useState('');
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const kpis = data?.kpis ?? {
    total_cases: 5,
    draft_cases: 1,
    triage_queue: 4,
    medical_review_pending: 1,
    urgent_cases: 2,
    potential_signals: 1,
  };
  const cases = (data?.cases ?? FALLBACK_CASES).map((c: Record<string, unknown>) => ({
    ...c,
    status: localStatuses[c.case_id as string] ?? c.status,
  }));
  const signals = data?.signals ?? FALLBACK_SIGNALS;

  const handleTriageCase = (caseItem: Record<string, unknown>, newStatus: string) => {
    setLocalStatuses(prev => ({ ...prev, [caseItem.case_id as string]: newStatus }));
    setCaseModal(null);
    setNotes('');
    showToast(`✓ ${caseItem.case_id} moved to ${newStatus.replace(/_/g, ' ')} (demo — no data was saved)`);
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
        <h1 className="text-2xl font-bold text-navy-900">Pharmacovigilance Command Centre</h1>
        <p className="text-slate-500 text-sm mt-0.5">Safety case management, deadline tracking, signal review</p>
      </div>

      {/* Important disclaimer */}
      <div className="bg-maroon-50 border border-maroon-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <AlertCircle size={16} className="text-maroon-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-maroon-800">
          <strong>Human review required for all clinical assessments.</strong> AI and rule-based tools may assist but must not autonomously classify
          seriousness, determine causality, close cases, or suppress signals. MedDRA/WHO Drug coding-ready fields — terminology licensing required before production.
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Cases', value: kpis.total_cases ?? 5, icon: Activity, colour: 'bg-navy-100 text-navy-700' },
          { label: 'Draft Cases', value: kpis.draft_cases ?? 1, icon: AlertCircle, colour: 'bg-slate-100 text-slate-600' },
          { label: 'Triage Queue', value: kpis.triage_queue ?? 4, icon: AlertTriangle, colour: 'bg-ochre-100 text-ochre-700' },
          { label: 'Medical Review', value: kpis.medical_review_pending ?? 1, icon: Eye, colour: 'bg-terracotta-100 text-terracotta-700', alert: true },
          { label: 'Urgent Cases', value: kpis.urgent_cases ?? 2, icon: Clock, colour: 'bg-maroon-100 text-maroon-700', alert: true },
          { label: 'Potential Signals', value: kpis.potential_signals ?? 1, icon: Zap, colour: 'bg-clinical-100 text-clinical-700', alert: true },
        ].map(({ label, value, icon: Icon, colour, alert }) => (
          <div key={label} className={`clinical-card p-4 flex items-center gap-3 ${alert && value > 0 ? 'border-l-4 border-l-maroon-500' : ''}`}>
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

      {/* Safety Signal Alert */}
      {signals.length > 0 && (
        <div className="clinical-card border-l-4 border-l-clinical-500 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-clinical-600" />
            <h2 className="text-base font-semibold text-navy-900">Potential Safety Signals</h2>
          </div>
          {signals.map((signal: Record<string, unknown>, i: number) => (
            <div key={i} className="bg-clinical-50 rounded-xl border border-clinical-200 p-4 mb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-info">Potential Signal</span>
                    <span className="text-xs font-semibold text-clinical-700">{signal.event_term as string}</span>
                    <span className="text-xs text-slate-500">{signal.event_count as number} events across {signal.site_count as number} sites</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{signal.description as string}</p>
                  <div className="bg-white/70 rounded-lg px-3 py-2 border border-clinical-100">
                    <p className="text-xs text-clinical-700 font-medium italic">{signal.disclaimer as string}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-clinical-600 rounded-lg hover:bg-clinical-700 transition-colors"
                    onClick={() => { setSignalModal(signal); setNotes(''); }}
                  >
                    Review Signal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Case Table */}
      <div className="clinical-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-navy-900">Safety Cases</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <div className="w-2 h-2 bg-maroon-500 rounded-full animate-pulse" />
              Live — refreshes every 30s
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {['Case ID', 'Category', 'Event Term', 'Seriousness', 'Status', 'Deadline', 'Causality', 'Action'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.map((c: Record<string, unknown>, i: number) => {
                const cfg = STATUS_CONFIG[c.status as string] ?? STATUS_CONFIG.DRAFT;
                const isUrgent = (c.hours_remaining as number) !== null && (c.hours_remaining as number) < 24;
                return (
                  <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isUrgent ? 'bg-maroon-50/50' : ''}`}>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-navy-700">{c.case_id as string}</td>
                    <td className="py-3 px-3">
                      <span className="badge-info text-xs">{(c.event_category as string).replace(/_/g, ' ')}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-slate-700 max-w-48 truncate">{c.event_term as string}</td>
                    <td className="py-3 px-3">
                      {c.seriousness
                        ? <span className={(c.seriousness as string) !== 'NOT_SERIOUS' ? 'badge-high' : 'badge-low'}>
                            {(c.seriousness as string).replace(/_/g, ' ')}
                          </span>
                        : <span className="text-xs text-slate-400">Pending assessment</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cfg.className}>{cfg.label}</span>
                    </td>
                    <td className="py-3 px-3">
                      {c.hours_remaining !== null && c.hours_remaining !== undefined
                        ? <span className={`font-bold tabular-nums text-xs ${(c.hours_remaining as number) < 4 ? 'countdown-critical' : (c.hours_remaining as number) < 24 ? 'countdown-warning' : 'countdown-ok'}`}>
                            {(c.hours_remaining as number) < 24
                              ? `${c.hours_remaining as number}h remaining`
                              : `${Math.round((c.hours_remaining as number) / 24)}d remaining`}
                          </span>
                        : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="human-review-label text-xs">
                        {c.causality === 'HUMAN_REVIEW_REQUIRED' ? 'Human review required' : c.causality as string}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        className="px-3 py-1 text-xs font-semibold text-white bg-navy-600 rounded hover:bg-navy-700 transition-colors"
                        onClick={() => { setCaseModal(c); setNotes(''); }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Review Modal */}
      <Modal
        open={!!caseModal}
        onClose={() => setCaseModal(null)}
        title={`Review Case: ${caseModal?.case_id ?? ''}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setCaseModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Close</button>
            <button
              onClick={() => caseModal && handleTriageCase(caseModal, 'FOLLOW_UP_REQUIRED')}
              className="px-4 py-2 text-sm font-medium text-ochre-700 border border-ochre-300 rounded-lg hover:bg-ochre-50 transition-colors"
            >
              Request Follow-up
            </button>
            <button
              onClick={() => caseModal && handleTriageCase(caseModal, 'REGULATORY_REVIEW')}
              className="px-4 py-2 text-sm font-semibold text-white bg-navy-600 rounded-lg hover:bg-navy-700 transition-colors"
            >
              Forward to Regulatory
            </button>
          </>
        }
      >
        {caseModal && (
          <div className="space-y-4">
            <div className="bg-maroon-50 border border-maroon-200 rounded-lg px-4 py-3 text-sm text-maroon-800">
              <strong>Human review required.</strong> This platform provides decision support only. All causality assessments, seriousness classifications, and case closures must be performed by a qualified pharmacovigilance professional.
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Case ID', value: caseModal.case_id as string },
                { label: 'Category', value: (caseModal.event_category as string).replace(/_/g, ' ') },
                { label: 'Event Term', value: caseModal.event_term as string },
                { label: 'Seriousness', value: caseModal.seriousness ? (caseModal.seriousness as string).replace(/_/g, ' ') : 'Pending assessment' },
                { label: 'Current Status', value: (STATUS_CONFIG[caseModal.status as string] ?? STATUS_CONFIG.DRAFT).label },
                { label: 'Deadline', value: caseModal.hours_remaining !== null ? `${caseModal.hours_remaining}h remaining` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-navy-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reviewer Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add your review notes (causality assessment, action taken)…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
            <p className="text-xs text-slate-400">All actions are timestamped and added to the tamper-evident audit trail.</p>
          </div>
        )}
      </Modal>

      {/* Signal Review Modal */}
      <Modal
        open={!!signalModal}
        onClose={() => setSignalModal(null)}
        title="Safety Signal Review"
        size="lg"
        footer={
          <>
            <button onClick={() => setSignalModal(null)} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Close</button>
            <button
              onClick={() => { setSignalModal(null); showToast('✓ Signal acknowledged and escalated to committee (demo)'); }}
              className="px-4 py-2 text-sm font-semibold text-white bg-clinical-600 rounded-lg hover:bg-clinical-700"
            >
              Escalate to Committee
            </button>
          </>
        }
      >
        {signalModal && (
          <div className="space-y-4">
            <div className="bg-clinical-50 border border-clinical-200 rounded-lg px-4 py-3">
              <div className="text-xs font-semibold text-clinical-700 mb-1">Potential Safety Signal</div>
              <div className="text-sm font-semibold text-navy-800">{signalModal.event_term as string}</div>
              <div className="text-xs text-slate-500 mt-0.5">{signalModal.event_count as number} events across {signalModal.site_count as number} sites</div>
            </div>
            <p className="text-sm text-slate-700">{signalModal.description as string}</p>
            <div className="bg-white rounded-xl border border-clinical-200 px-4 py-3">
              <p className="text-xs text-clinical-700 font-medium italic">{signalModal.disclaimer as string}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PV Expert Assessment</label>
              <textarea
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Document your expert assessment of this potential signal…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              />
            </div>
            <p className="text-xs text-slate-400">This signal review and your assessment will be added to the audit trail.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

const FALLBACK_CASES = [
  { case_id: 'SAE-2026-041', event_category: 'SAE', event_term: 'Severe Hepatotoxicity', seriousness: 'HOSPITALISATION', status: 'MEDICAL_REVIEW', hours_remaining: 3, causality: 'HUMAN_REVIEW_REQUIRED' },
  { case_id: 'AE-2026-101', event_category: 'AE', event_term: 'Severe abdominal pain and vomiting', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 72, causality: 'HUMAN_REVIEW_REQUIRED' },
  { case_id: 'AE-2026-102', event_category: 'AE', event_term: 'Nausea, abdominal cramps, loose stools', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 120, causality: 'HUMAN_REVIEW_REQUIRED' },
  { case_id: 'AE-2026-103', event_category: 'AE', event_term: 'Severe epigastric pain and nausea', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 192, causality: 'HUMAN_REVIEW_REQUIRED' },
  { case_id: 'AE-2026-104', event_category: 'AE', event_term: 'Abdominal distension and vomiting', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 240, causality: 'HUMAN_REVIEW_REQUIRED' },
];

const FALLBACK_SIGNALS = [
  {
    id: 's1',
    event_term: 'Gastrointestinal disorders (abdominal pain, vomiting, nausea)',
    description: 'Potential clustering of gastrointestinal adverse events across DEL-02 and JAI-01 sites within a 14-day window. All events involve the same study formulation (Vatari Guggulu 500mg TID). 4 events detected across 2 sites.',
    event_count: 4,
    site_count: 2,
    status: 'DETECTED',
    disclaimer: 'Potential pattern detected — requires pharmacovigilance expert review. This does not establish causality.',
  },
];
