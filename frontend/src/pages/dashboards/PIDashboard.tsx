import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, FileText, Shield, Users, ClipboardCheck } from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatDate, getEnrolmentPct, getRiskBadgeClass } from '@/lib/utils';

export default function PIDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'pi'],
    queryFn: () => dashboardApi.pi().then((r) => r.data),
  });

  if (isLoading) return <LoadingState />;

  const studies = data?.assigned_studies ?? [];
  const approvals = data?.approval_queue ?? [];
  const pending = data?.pending_approvals ?? {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Principal Investigator Workspace</h1>
        <p className="text-slate-500 text-sm mt-0.5">Assigned studies, approvals, and compliance oversight</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'SAE Reviews', value: pending.sae_reviews ?? 0, icon: Shield, alert: true },
          { label: 'Protocol Deviations', value: pending.protocol_deviations ?? 0, icon: FileText, alert: false },
          { label: 'IEC Renewals', value: pending.iec_renewals ?? 0, icon: CheckCircle2, alert: false },
          { label: 'Consent Amendments', value: pending.consent_amendments ?? 0, icon: ClipboardCheck, alert: false },
          { label: 'CAPA Approvals', value: pending.capa_approvals ?? 0, icon: Clock, alert: false },
        ].map(({ label, value, icon: Icon, alert }) => (
          <div key={label} className={`clinical-card p-4 flex items-center gap-3 ${alert && value > 0 ? 'border-l-4 border-l-maroon-500' : ''}`}>
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
                <tr key={s.id as string} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-slate-600">{s.protocol_id as string}</td>
                  <td className="py-2.5 px-3 font-medium text-navy-800">{s.title as string}</td>
                  <td className="py-2.5 px-3">
                    <span className="badge-info">{(s.status as string).replace(/_/g, ' ')}</span>
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
          {(approvals.length ? approvals : FALLBACK_APPROVALS).map((item: Record<string, unknown>, i: number) => (
            <div key={i} className={`p-4 rounded-xl border ${(item.requires_signature as boolean) ? 'border-maroon-200 bg-maroon-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(item.requires_signature as boolean) ? 'bg-maroon-100 text-maroon-700' : 'bg-clinical-100 text-clinical-700'}`}>
                      {(item.type as string).replace(/_/g, ' ')}
                    </span>
                    {item.case_id && <span className="font-mono text-xs text-slate-600">{item.case_id as string}</span>}
                    {item.hours_remaining !== null && item.hours_remaining !== undefined && (
                      <span className="countdown-critical text-xs">{item.hours_remaining as number}h remaining</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{item.description as string}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Created: {formatDate(item.created_at as string)}</span>
                    <span>Status: {item.status as string}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    Review
                  </button>
                  {item.requires_signature && (
                    <button id={`esign-btn-${i}`} className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #163a6b 0%, #0d82c8 100%)' }}>
                      E-Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  { id: '2', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance', status: 'ACTIVE', risk_level: 'HIGH', actual_enrolment: 43, target_enrolment: 120, compliance_score: 76 },
];

const FALLBACK_APPROVALS = [
  { type: 'SAE_REVIEW', case_id: 'SAE-2026-041', description: 'SAE review and e-signature required: Severe Hepatotoxicity (SUB-DEL01-0001). Hospitalisation case.', status: 'MEDICAL_REVIEW', created_at: new Date().toISOString(), hours_remaining: 3, requires_signature: true },
  { type: 'PROTOCOL_DEVIATION_REVIEW', description: 'DEV-2026-002: Eligibility deviation — review CAPA requirement', status: 'UNDER_REVIEW', created_at: new Date().toISOString(), hours_remaining: null, requires_signature: false },
  { type: 'IEC_RENEWAL_PACKAGE', description: 'Annual IEC renewal for AyurVeda OA-2026 — submission package review required', status: 'PENDING', created_at: new Date().toISOString(), hours_remaining: null, requires_signature: true },
];
