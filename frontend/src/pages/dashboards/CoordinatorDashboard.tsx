import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, FileText, UserCheck, Users } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDate } from '@/lib/utils';

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

export default function CoordinatorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'coordinator'],
    queryFn: () => dashboardApi.coordinator().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const summary = data?.summary ?? {};
  const participants = data?.participants ?? FALLBACK_PARTICIPANTS;
  const reConsent = data?.re_consent_pending ?? FALLBACK_RECONSENT;

  return (
    <div className="space-y-6 animate-fade-in">
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
          { label: 'Today\'s Visits', value: summary.today_visits ?? 3, icon: Clock, colour: 'bg-clinical-100 text-clinical-700' },
          { label: 'Re-consent Pending', value: summary.re_consent_pending ?? 8, icon: UserCheck, colour: 'bg-terracotta-100 text-terracotta-700', alert: true },
          { label: 'Open Queries', value: summary.open_queries ?? 7, icon: AlertCircle, colour: 'bg-ochre-100 text-ochre-700' },
          { label: 'AE Drafts', value: summary.open_ae_drafts ?? 1, icon: FileText, colour: 'bg-maroon-100 text-maroon-700', alert: true },
        ].map(({ label, value, icon: Icon, colour, alert }) => (
          <div key={label} className={`clinical-card p-4 flex items-center gap-3 ${alert && value > 0 ? 'border-l-4 border-l-terracotta-500' : ''}`}>
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
          {[
            { label: 'Add Participant', id: 'btn-add-participant', colour: 'bg-navy-600 text-white hover:bg-navy-700' },
            { label: 'Record Consent', id: 'btn-record-consent', colour: 'bg-teal-600 text-white hover:bg-teal-700' },
            { label: 'Start Screening', id: 'btn-start-screening', colour: 'bg-clinical-600 text-white hover:bg-clinical-700' },
            { label: 'Record Visit', id: 'btn-record-visit', colour: 'bg-ochre-600 text-white hover:bg-ochre-700' },
            { label: 'Report AE/ADR/SAE', id: 'btn-report-ae', colour: 'bg-terracotta-600 text-white hover:bg-terracotta-700' },
            { label: 'Upload Document', id: 'btn-upload-doc', colour: 'border border-slate-300 text-slate-700 hover:bg-slate-50' },
            { label: 'Respond to Query', id: 'btn-respond-query', colour: 'border border-slate-300 text-slate-700 hover:bg-slate-50' },
          ].map(({ label, id, colour }) => (
            <button key={id} id={id}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${colour}`}>
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
                      <button className="px-3 py-1 text-xs font-semibold text-white bg-terracotta-600 rounded-lg hover:bg-terracotta-700 transition-colors">
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
          <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Refresh">
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
                      {(p.status as string).replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-medium ${CONSENT_COLOURS[p.consent_status as string] ?? 'text-slate-500'}`}>
                      {(p.consent_status as string).replace(/_/g, ' ')}
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
                      ? <button className="text-xs text-terracotta-600 font-semibold hover:underline">Re-consent</button>
                      : <button className="text-xs text-clinical-600 font-medium hover:underline">View</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
