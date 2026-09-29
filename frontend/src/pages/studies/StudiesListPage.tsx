import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studiesApi } from '@/api/client';
import { getRiskBadgeClass, getEnrolmentPct, formatDate, getDeadlineClass } from '@/lib/utils';
import { Search, Filter, BookOpen, AlertCircle } from 'lucide-react';
import type { Study, RiskLevel } from '@/types';

export default function StudiesListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['studies'],
    queryFn: () => studiesApi.list().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const studies: Study[] = data?.studies ?? FALLBACK_STUDIES;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Studies</h1>
          <p className="text-slate-500 text-sm mt-0.5">{studies.length} studies in portfolio</p>
        </div>
        <div className="disclaimer-banner">
          <AlertCircle size={12} className="text-ochre-600" />
          <span>CDISC-aligned mapping | FHIR R4-ready demo export | Synthetic demo data</span>
        </div>
      </div>

      {/* Search/filter bar */}
      <div className="clinical-card p-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Search studies by title, protocol ID, intervention…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-colors" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* Studies table */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Protocol ID', 'Study Title', 'Phase', 'Status', 'Risk', 'Enrolment', 'Compliance', 'IEC Renewal', 'CTRI Update'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studies.map((s) => {
                const pct = getEnrolmentPct(s.actual_enrolment, s.target_enrolment);
                const iecDays = s.iec_renewal_due
                  ? Math.round((new Date(s.iec_renewal_due).getTime() - Date.now()) / 86400000) : null;
                const ctriDays = s.ctri_update_due
                  ? Math.round((new Date(s.ctri_update_due).getTime() - Date.now()) / 86400000) : null;
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">{s.protocol_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-navy-900 text-sm">{s.short_title ?? s.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-64">{s.therapeutic_area}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-medium">{s.phase.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`badge-info ${s.status === 'COMPLETED' ? '!bg-teal-50 !text-teal-700 !border-teal-200' : ''}`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={getRiskBadgeClass(s.risk_level as RiskLevel)}>{s.risk_level}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs tabular-nums text-slate-700">{s.actual_enrolment}/{s.target_enrolment}</span>
                        <div className="w-16 progress-bar">
                          <div className="progress-fill" style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct >= 80 ? '#00afa7' : pct >= 60 ? '#f0c600' : '#e46d3e'
                          }} />
                        </div>
                        <span className="text-xs text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        (s.compliance_score ?? 100) >= 85 ? 'text-teal-600' :
                        (s.compliance_score ?? 100) >= 70 ? 'text-ochre-600' : 'text-terracotta-600'
                      }`}>{s.compliance_score?.toFixed(0) ?? '—'}%</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {iecDays !== null
                        ? <span className={`text-xs font-semibold ${getDeadlineClass(iecDays)}`}>
                            {iecDays < 0 ? `${Math.abs(iecDays)}d overdue` : `${iecDays}d`}
                          </span>
                        : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ctriDays !== null
                        ? <span className={`text-xs font-semibold ${getDeadlineClass(ctriDays)}`}>
                            {ctriDays < 0 ? `${Math.abs(ctriDays)}d overdue` : `${ctriDays}d`}
                          </span>
                        : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_STUDIES: Study[] = [
  { id: '1', protocol_id: 'AIIA-OA-2026-001', title: 'Efficacy and Safety of Ayurvedic Formulation in Osteoarthritis', short_title: 'AyurVeda OA-2026', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'HIGH', target_enrolment: 150, actual_enrolment: 82, screen_failure_count: 18, therapeutic_area: 'Musculoskeletal', iec_renewal_due: new Date(Date.now() + 12 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 5 * 86400000).toISOString(), compliance_score: 71, data_quality_score: 78 },
  { id: '2', protocol_id: 'AIIA-DM-2025-002', title: 'PramehaCare: Integrated Ayurvedic Management of Type 2 Diabetes', short_title: 'PramehaCare', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'LOW', target_enrolment: 500, actual_enrolment: 410, screen_failure_count: 45, therapeutic_area: 'Endocrinology', iec_renewal_due: new Date(Date.now() + 90 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 60 * 86400000).toISOString(), compliance_score: 94, data_quality_score: 92 },
  { id: '3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance: Ayurvedic Formulation for Functional GI Disorders', short_title: 'AgniBalance', phase: 'PHASE_2', status: 'ACTIVE', risk_level: 'HIGH', target_enrolment: 120, actual_enrolment: 43, screen_failure_count: 12, therapeutic_area: 'Gastroenterology', iec_renewal_due: new Date(Date.now() + 45 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 20 * 86400000).toISOString(), compliance_score: 76, data_quality_score: 81 },
  { id: '4', protocol_id: 'AIIA-INS-2025-004', title: 'NidraShanti: Ashwagandha-based Formulation for Insomnia', short_title: 'NidraShanti', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'MEDIUM', target_enrolment: 200, actual_enrolment: 134, screen_failure_count: 22, therapeutic_area: 'Neurology', iec_renewal_due: new Date(Date.now() + 55 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 35 * 86400000).toISOString(), compliance_score: 85, data_quality_score: 88 },
  { id: '5', protocol_id: 'AIIA-RESP-2024-005', title: 'Respiratory Wellness: Herbal Formulation in COPD', short_title: 'Respiratory Wellness', phase: 'PHASE_3', status: 'COMPLETED', risk_level: 'LOW', target_enrolment: 180, actual_enrolment: 178, screen_failure_count: 8, therapeutic_area: 'Respiratory', compliance_score: 97, data_quality_score: 96 },
  { id: '6', protocol_id: 'AIIA-SR-2026-006', title: 'PainRelief Safety Registry', short_title: 'PainRelief Safety Registry', phase: 'REGISTRY', status: 'ACTIVE', risk_level: 'LOW', target_enrolment: 1000, actual_enrolment: 437, screen_failure_count: 0, therapeutic_area: 'Pain Management', iec_renewal_due: new Date(Date.now() + 120 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 75 * 86400000).toISOString(), compliance_score: 90, data_quality_score: 91 },
];
