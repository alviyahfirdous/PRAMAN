import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, Shield, CheckCircle2, Clock,
  TrendingUp, TrendingDown, AlertCircle, ArrowRight,
  Building2, Users, FileWarning, Zap, BarChart3
} from 'lucide-react';
import { dashboardApi } from '@/api/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { getRiskBadgeClass, formatDate, getDeadlineClass, getEnrolmentPct, cn } from '@/lib/utils';
import type { LeadershipDashboard, RiskLevel } from '@/types';

// Synthetic recruitment trend data
const RECRUITMENT_TREND = [
  { month: 'Jan', target: 200, actual: 150 },
  { month: 'Feb', target: 350, actual: 290 },
  { month: 'Mar', target: 500, actual: 430 },
  { month: 'Apr', target: 680, actual: 590 },
  { month: 'May', target: 850, actual: 760 },
  { month: 'Jun', target: 1000, actual: 890 },
  { month: 'Jul', target: 1150, actual: 1020 },
  { month: 'Aug', target: 1300, actual: 1150 },
  { month: 'Sep', target: 1450, actual: 1284 },
];

const RISK_COLOURS: Record<RiskLevel, string> = {
  LOW: '#00afa7',
  MEDIUM: '#f0c600',
  HIGH: '#e46d3e',
  CRITICAL: '#8b1b37',
};

function KPICard({
  label, value, sub, icon: Icon, accent, alert
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; alert?: boolean
}) {
  return (
    <div className={cn(
      "clinical-card p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:shadow-md",
      alert && "border-l-4 border-l-maroon-500"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", accent)}>
          <Icon size={20} className="text-white" strokeWidth={1.8} />
        </div>
        {alert && (
          <span className="badge-critical">Urgent</span>
        )}
      </div>
      <div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-label mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={getRiskBadgeClass(level)}>{level.replace('_', ' ')}</span>;
}

function StudyHealthCard({ card }: {
  card: LeadershipDashboard['study_cards'][number]
}) {
  const pct = getEnrolmentPct(card.enrolled, card.target);
  const isAtRisk = card.risk_level === 'HIGH' || card.risk_level === 'CRITICAL';

  return (
    <div className={cn(
      "clinical-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer",
      isAtRisk && "border-l-4 border-l-terracotta-500"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-sm text-navy-900 leading-tight">{card.title}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">{card.protocol_id}</div>
        </div>
        <RiskBadge level={card.risk_level as RiskLevel} />
      </div>

      {/* Enrolment bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Enrolment</span>
          <span className="font-semibold text-slate-700">{card.enrolled} / {card.target} ({pct}%)</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: pct >= 80 ? '#00afa7' : pct >= 60 ? '#f0c600' : '#e46d3e'
            }}
          />
        </div>
      </div>

      {/* Key dates */}
      <div className="flex gap-3 text-xs mt-2">
        {card.iec_renewal_due && (
          <div className="flex items-center gap-1">
            <Shield size={11} className="text-slate-400" />
            <span className="text-slate-500">IEC:</span>
            <span className={getDeadlineClass(
              Math.round((new Date(card.iec_renewal_due).getTime() - Date.now()) / 86400000)
            )}>{formatDate(card.iec_renewal_due)}</span>
          </div>
        )}
        {card.ctri_update_due && (
          <div className="flex items-center gap-1">
            <FileWarning size={11} className="text-slate-400" />
            <span className="text-slate-500">CTRI:</span>
            <span className={getDeadlineClass(
              Math.round((new Date(card.ctri_update_due).getTime() - Date.now()) / 86400000)
            )}>{formatDate(card.ctri_update_due)}</span>
          </div>
        )}
      </div>

      {/* Compliance score */}
      {card.compliance_score !== undefined && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">Compliance</span>
          <span className={cn(
            "text-xs font-bold",
            card.compliance_score >= 85 ? "text-teal-600" :
            card.compliance_score >= 70 ? "text-ochre-600" : "text-terracotta-600"
          )}>{card.compliance_score?.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}

function CriticalActionItem({ action }: {
  action: LeadershipDashboard['critical_actions'][number]
}) {
  const isCritical = action.severity === 'CRITICAL';
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-all duration-150 hover:shadow-sm",
      isCritical
        ? "bg-maroon-50 border-maroon-200"
        : "bg-terracotta-50 border-terracotta-200"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isCritical ? "bg-maroon-100" : "bg-terracotta-100"
      )}>
        <AlertCircle size={16} className={isCritical ? "text-maroon-600" : "text-terracotta-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {action.case_id && (
            <span className="font-bold text-sm text-navy-800 font-mono">{action.case_id}</span>
          )}
          {action.study && (
            <span className="text-sm font-semibold text-navy-800">{action.study}</span>
          )}
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isCritical ? "bg-maroon-100 text-maroon-700" : "bg-terracotta-100 text-terracotta-700"
          )}>
            {action.type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
          <Clock size={11} />
          {action.hours_remaining !== undefined && action.hours_remaining !== null
            ? <span className="countdown-critical">{action.hours_remaining}h remaining</span>
            : action.days_remaining !== undefined && action.days_remaining !== null
            ? <span className={getDeadlineClass(action.days_remaining)}>
                {action.days_remaining < 0
                  ? `${Math.abs(action.days_remaining)} days overdue`
                  : `${action.days_remaining} days remaining`}
              </span>
            : null
          }
        </div>
      </div>
      <button className="flex-shrink-0 p-1.5 rounded-md hover:bg-white/70 text-slate-500 transition-colors">
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function LeadershipDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'leadership'],
    queryFn: () => dashboardApi.leadership().then((r) => r.data as LeadershipDashboard),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading command centre…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={32} className="text-maroon-500 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">Failed to load dashboard. Ensure the backend is running.</p>
          <code className="text-xs text-slate-400">GET /api/v1/dashboards/leadership</code>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Clinical Research Command Centre</h1>
          <p className="text-slate-500 text-sm mt-0.5">Portfolio oversight, compliance health and safety visibility</p>
        </div>
        <div className="disclaimer-banner hidden sm:flex">
          <AlertCircle size={13} className="text-ochre-600 flex-shrink-0" />
          <span>Aggregate view only — Synthetic demo data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Active Studies" value={kpis?.active_studies ?? 18}
          sub={`of ${kpis?.total_studies ?? 6} total`}
          icon={BookChart} accent="bg-navy-600" />
        <KPICard label="Total Enrolment" value={`${kpis?.total_enrolled ?? 1284}`}
          sub={`target ${kpis?.total_target ?? 2100}`}
          icon={Users2} accent="bg-clinical-600" />
        <KPICard label="Studies at Risk" value={kpis?.studies_at_risk ?? 4}
          icon={AlertTriangle} accent="bg-terracotta-600" alert={(kpis?.studies_at_risk ?? 0) > 0} />
        <KPICard label="Overdue Items" value={kpis?.overdue_compliance_items ?? 7}
          icon={Clock} accent="bg-ochre-600" alert={(kpis?.overdue_compliance_items ?? 0) > 0} />
        <KPICard label="Urgent Safety" value={kpis?.urgent_safety_cases ?? 2}
          icon={Shield} accent="bg-maroon-700" alert={(kpis?.urgent_safety_cases ?? 0) > 0} />
        <KPICard label="Avg Data Quality" value={`${kpis?.average_data_quality_score ?? 86}%`}
          icon={BarChart3} accent="bg-teal-600" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Study Portfolio */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">Portfolio Health Map</h2>
            <button className="text-xs text-clinical-600 hover:text-clinical-800 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data?.study_cards ?? FALLBACK_STUDY_CARDS).map((card) => (
              <StudyHealthCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Critical Action Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">Critical Action Queue</h2>
            <span className="text-xs bg-maroon-100 text-maroon-700 px-2 py-0.5 rounded-full font-semibold">
              {(data?.critical_actions ?? FALLBACK_ACTIONS).length} items
            </span>
          </div>
          <div className="space-y-2">
            {(data?.critical_actions ?? FALLBACK_ACTIONS).map((action, i) => (
              <CriticalActionItem key={i} action={action} />
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Trend */}
        <div className="clinical-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">Recruitment Trend</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-navy-600 inline-block" /> Target</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-teal-500 inline-block" /> Actual</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={RECRUITMENT_TREND} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                labelStyle={{ fontWeight: 600, color: '#1e2a3b' }}
              />
              <Line type="monotone" dataKey="target" stroke="#1e4e8c" strokeWidth={2} strokeDasharray="4 2" dot={false} name="Target" />
              <Line type="monotone" dataKey="actual" stroke="#00afa7" strokeWidth={2.5} dot={false} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Site Performance */}
        <div className="clinical-card p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">Site Performance</h2>
          <div className="space-y-3">
            {(data?.site_performance ?? FALLBACK_SITES).map((site) => (
              <div key={site.id} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-slate-700 truncate flex-shrink-0">{site.site_code}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="truncate">{site.site_name}</span>
                    <span className="font-semibold text-slate-700 ml-2">{site.enrolled}/{site.target}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(getEnrolmentPct(site.enrolled, site.target), 100)}%`,
                      background: RISK_COLOURS[site.risk_level as RiskLevel] ?? '#94a3b8'
                    }} />
                  </div>
                </div>
                <span className={getRiskBadgeClass(site.risk_level as RiskLevel)}>
                  {site.risk_level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Radar */}
      <div className="clinical-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-terracotta-100 flex items-center justify-center">
            <Zap size={20} className="text-terracotta-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-navy-900">PRAMAN Risk Radar</h2>
            <p className="text-xs text-slate-500">Transparent rule-based risk scoring — decision support only, not a clinical conclusion</p>
          </div>
          <span className="ml-auto text-xs bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-3 py-1 rounded-full font-semibold">
            Decision support only
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall score */}
          <div className="flex flex-col items-center justify-center p-4 bg-terracotta-50 rounded-xl border border-terracotta-200">
            <div className="text-4xl font-bold text-terracotta-700 tabular-nums">78</div>
            <div className="text-sm font-semibold text-terracotta-600 mt-1">HIGH RISK</div>
            <div className="text-xs text-terracotta-500 mt-0.5">Overall Score</div>
          </div>

          {/* Component scores */}
          <div className="md:col-span-3 space-y-3">
            {[
              { label: 'Recruitment Risk', score: 82, weight: '30%', colour: '#e46d3e' },
              { label: 'Compliance Risk', score: 74, weight: '30%', colour: '#f0c600' },
              { label: 'Safety Risk', score: 70, weight: '20%', colour: '#de415d' },
              { label: 'Data Quality Risk', score: 22, weight: '20%', colour: '#00afa7' },
            ].map(({ label, score, weight, colour }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{label} <span className="text-slate-400">({weight})</span></span>
                  <span className="font-bold tabular-nums" style={{ color: colour }}>{score}/100</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${score}%`, background: colour }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reasons */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Reasons</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {[
                'DEL-02 is 36% below expected recruitment pace',
                'IEC renewal due in 12 days',
                'Monitoring visit overdue by 9 days at DEL-02',
                'SAE-2026-041 requires PI signature',
              ].map((r) => (
                <li key={r} className="flex items-start gap-1.5">
                  <AlertCircle size={11} className="text-terracotta-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Recommended Actions</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {[
                'Review SAE-2026-041 immediately',
                'Initiate IEC renewal for AyurVeda OA-2026',
                'Schedule DEL-02 monitoring visit',
                'Assign recruitment follow-up team to DEL-02',
              ].map((a) => (
                <li key={a} className="flex items-start gap-1.5">
                  <CheckCircle2 size={11} className="text-teal-500 mt-0.5 flex-shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-100 pt-2">
          Formula: 0.30 × Recruitment Risk + 0.30 × Compliance Risk + 0.20 × Safety Risk + 0.20 × Data Quality Risk |
          Calculation version: 1.0.0 | Data freshness: &lt;1 min
        </div>
      </div>
    </div>
  );
}

// Lucide icons not in standard import
function BookChart(props: React.ComponentProps<typeof Activity>) { return <Activity {...props} />; }
function Users2(props: React.ComponentProps<typeof Users>) { return <Users {...props} />; }

// Fallback data for when API is unavailable
const FALLBACK_STUDY_CARDS: LeadershipDashboard['study_cards'] = [
  { id: '1', protocol_id: 'AIIA-OA-2026-001', title: 'AyurVeda OA-2026', status: 'ACTIVE', risk_level: 'HIGH', enrolled: 82, target: 150, compliance_score: 71, data_quality_score: 78, iec_renewal_due: new Date(Date.now() + 12 * 86400000).toISOString(), ctri_update_due: new Date(Date.now() + 5 * 86400000).toISOString() },
  { id: '2', protocol_id: 'AIIA-DM-2025-002', title: 'PramehaCare', status: 'ACTIVE', risk_level: 'LOW', enrolled: 410, target: 500, compliance_score: 94, data_quality_score: 92 },
  { id: '3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance', status: 'ACTIVE', risk_level: 'HIGH', enrolled: 43, target: 120, compliance_score: 76, data_quality_score: 81 },
  { id: '4', protocol_id: 'AIIA-INS-2025-004', title: 'NidraShanti', status: 'ACTIVE', risk_level: 'MEDIUM', enrolled: 134, target: 200, compliance_score: 85, data_quality_score: 88 },
  { id: '5', protocol_id: 'AIIA-RESP-2024-005', title: 'Respiratory Wellness', status: 'COMPLETED', risk_level: 'LOW', enrolled: 178, target: 180, compliance_score: 97, data_quality_score: 96 },
  { id: '6', protocol_id: 'AIIA-SR-2026-006', title: 'PainRelief Safety Registry', status: 'ACTIVE', risk_level: 'LOW', enrolled: 437, target: 1000, compliance_score: 90, data_quality_score: 91 },
];

const FALLBACK_ACTIONS: LeadershipDashboard['critical_actions'] = [
  { type: 'SAE_PENDING_REVIEW', case_id: 'SAE-2026-041', hours_remaining: 3, severity: 'CRITICAL', status: 'MEDICAL_REVIEW' },
  { type: 'IEC_RENEWAL', study: 'AyurVeda OA-2026', days_remaining: 12, severity: 'WARNING' },
  { type: 'CTRI_UPDATE', study: 'AyurVeda OA-2026', days_remaining: 5, severity: 'CRITICAL' },
  { type: 'RECRUITMENT_BELOW_TARGET', study: 'DEL-02', days_remaining: -9, severity: 'WARNING' },
  { type: 'MONITORING_OVERDUE', study: 'DEL-02', days_remaining: -9, severity: 'CRITICAL' },
];

const FALLBACK_SITES: LeadershipDashboard['site_performance'] = [
  { id: '1', site_code: 'DEL-01', site_name: 'AIIA Main Campus', target: 50, enrolled: 38, risk_level: 'LOW', monitoring_overdue_days: 0 },
  { id: '2', site_code: 'DEL-02', site_name: 'AIIA Extension, Dwarka', target: 50, enrolled: 19, risk_level: 'HIGH', monitoring_overdue_days: 9 },
  { id: '3', site_code: 'JAI-01', site_name: 'Jaipur Research Site', target: 50, enrolled: 25, risk_level: 'MEDIUM', monitoring_overdue_days: 0 },
  { id: '4', site_code: 'MUM-01', site_name: 'Mumbai Clinical Centre', target: 250, enrolled: 215, risk_level: 'LOW', monitoring_overdue_days: 0 },
  { id: '5', site_code: 'PUN-01', site_name: 'Pune Diabetes Clinic', target: 250, enrolled: 195, risk_level: 'LOW', monitoring_overdue_days: 0 },
];
