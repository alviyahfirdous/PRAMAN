import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studiesApi } from '@/api/client';
import { getRiskBadgeClass, getEnrolmentPct, formatDate, getDeadlineClass } from '@/lib/utils';
import { Search, Filter, AlertCircle, X, ChevronDown } from 'lucide-react';
import type { Study, RiskLevel } from '@/types';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'TERMINATED'];
const RISK_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function StudiesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['studies'],
    queryFn: () => studiesApi.list().then((r) => r.data),
  });

  const [query, setQuery] = useState(initialQ);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortKey, setSortKey] = useState<'protocol_id' | 'title' | 'compliance_score' | 'actual_enrolment'>('protocol_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sync URL search param
  useEffect(() => {
    if (initialQ) setQuery(initialQ);
  }, [initialQ]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
    </div>
  );

  const allStudies: Study[] = data?.studies ?? FALLBACK_STUDIES;

  // Filter
  const filtered = allStudies.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = !q || s.title.toLowerCase().includes(q)
      || s.protocol_id.toLowerCase().includes(q)
      || (s.short_title ?? '').toLowerCase().includes(q)
      || (s.therapeutic_area ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchRisk = riskFilter === 'ALL' || s.risk_level === riskFilter;
    return matchQ && matchStatus && matchRisk;
  });

  // Sort
  const studies = [...filtered].sort((a, b) => {
    let av: string | number = 0, bv: string | number = 0;
    if (sortKey === 'protocol_id') { av = a.protocol_id; bv = b.protocol_id; }
    if (sortKey === 'title') { av = a.short_title ?? a.title; bv = b.short_title ?? b.title; }
    if (sortKey === 'compliance_score') { av = a.compliance_score ?? 0; bv = b.compliance_score ?? 0; }
    if (sortKey === 'actual_enrolment') { av = a.actual_enrolment; bv = b.actual_enrolment; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) => (
    sortKey === col
      ? <ChevronDown size={12} className={sortDir === 'desc' ? 'rotate-180 inline ml-0.5' : 'inline ml-0.5'} />
      : null
  );

  const clearFilters = () => { setQuery(''); setStatusFilter('ALL'); setRiskFilter('ALL'); };
  const hasFilters = query || statusFilter !== 'ALL' || riskFilter !== 'ALL';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Studies</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {studies.length} of {allStudies.length} studies{hasFilters ? ' (filtered)' : ' in portfolio'}
          </p>
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
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search studies by title, protocol ID, therapeutic area…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 text-slate-700 bg-white"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        {/* Risk filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 text-slate-700 bg-white"
        >
          {RISK_OPTIONS.map(r => (
            <option key={r} value={r}>{r === 'ALL' ? 'All Risk Levels' : r}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-terracotta-600 border border-terracotta-200 rounded-lg hover:bg-terracotta-50 transition-colors"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Studies table */}
      <div className="clinical-card overflow-hidden">
        {studies.length === 0 ? (
          <div className="py-16 text-center">
            <Search size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">No studies match your search criteria.</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-clinical-600 hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-navy-700 select-none"
                    onClick={() => handleSort('protocol_id')}
                  >
                    Protocol ID <SortIcon col="protocol_id" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-navy-700 select-none"
                    onClick={() => handleSort('title')}
                  >
                    Study Title <SortIcon col="title" />
                  </th>
                  {['Phase', 'Status', 'Risk'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-navy-700 select-none"
                    onClick={() => handleSort('actual_enrolment')}
                  >
                    Enrolment <SortIcon col="actual_enrolment" />
                  </th>
                  <th
                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-navy-700 select-none"
                    onClick={() => handleSort('compliance_score')}
                  >
                    Compliance <SortIcon col="compliance_score" />
                  </th>
                  {['IEC Renewal', 'CTRI Update'].map((h) => (
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
                    <tr
                      key={s.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/studies/${s.id}`)}
                      title={`View ${s.short_title ?? s.title} details`}
                    >
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
        )}
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
