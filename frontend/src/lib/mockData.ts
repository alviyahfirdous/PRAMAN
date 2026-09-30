/**
 * PRAMAN Mock API
 * ===============
 * Full synthetic demo data that mirrors the real backend API responses.
 * Used when the backend is not running.
 * All data is synthetic — not submission-ready.
 */

import type {
  LeadershipDashboard,
  PIDashboardData,
  CoordinatorDashboardData,
  EthicsDashboardData,
  PVDashboardData,
  MonitorDashboardData,
  Study,
  User,
  TokenResponse,
} from '@/types';

// ─── DEMO USERS ────────────────────────────────────────────
export const DEMO_USERS: Record<string, { user: User; password: string }> = {
  'leadership@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-leadership', email: 'leadership@praman.demo', username: 'leadership', full_name: 'Dr. Meena Iyer', role: 'LEADERSHIP', designation: 'Director of Research', department: 'Leadership', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'pi@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-pi', email: 'pi@praman.demo', username: 'pi', full_name: 'Dr. Arjun Sharma', role: 'PRINCIPAL_INVESTIGATOR', designation: 'Principal Investigator', department: 'Clinical Research', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'coordinator@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-coord', email: 'coordinator@praman.demo', username: 'coordinator', full_name: 'Priya Nair', role: 'STUDY_COORDINATOR', designation: 'Study Coordinator', department: 'Research Operations', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'monitor@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-monitor', email: 'monitor@praman.demo', username: 'monitor', full_name: 'Karan Mehta', role: 'MONITOR', designation: 'Clinical Research Associate', department: 'Monitoring', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'ethics@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-ethics', email: 'ethics@praman.demo', username: 'ethics', full_name: 'Dr. Sunita Rao', role: 'ETHICS_COMMITTEE', designation: 'Ethics Committee Member', department: 'IEC', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'pv@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-pv', email: 'pv@praman.demo', username: 'pv', full_name: 'Dr. Vikram Singh', role: 'PHARMACOVIGILANCE_OFFICER', designation: 'Pharmacovigilance Officer', department: 'Drug Safety', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'regulator@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-reg', email: 'regulator@praman.demo', username: 'regulator', full_name: 'Ravi Kumar', role: 'REGULATOR', designation: 'Regulatory Observer', department: 'External', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
  'admin@praman.demo': {
    password: 'Demo@123',
    user: { id: 'u-admin', email: 'admin@praman.demo', username: 'admin', full_name: 'Admin User', role: 'ADMIN', designation: 'System Administrator', department: 'IT', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z' },
  },
};

// Also support username login
const USERNAME_MAP: Record<string, string> = {
  leadership: 'leadership@praman.demo',
  pi: 'pi@praman.demo',
  coordinator: 'coordinator@praman.demo',
  monitor: 'monitor@praman.demo',
  ethics: 'ethics@praman.demo',
  pv: 'pv@praman.demo',
  regulator: 'regulator@praman.demo',
  admin: 'admin@praman.demo',
};

export function mockLogin(username: string, password: string): TokenResponse {
  const email = USERNAME_MAP[username] ?? username;
  const entry = DEMO_USERS[email];
  if (!entry || entry.password !== password) {
    throw new Error('Invalid credentials');
  }
  return {
    access_token: `mock-token-${entry.user.role}-${Date.now()}`,
    refresh_token: `mock-refresh-${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600,
    user: entry.user,
  };
}

// ─── MOCK DASHBOARD DATA ───────────────────────────────────

const TODAY = new Date();
const d = (days: number) => new Date(TODAY.getTime() + days * 86400000).toISOString().split('T')[0];

export const MOCK_LEADERSHIP_DASHBOARD: LeadershipDashboard = {
  disclaimer: 'Aggregate view only. No direct participant identifiers shown. Synthetic demo data.',
  kpis: {
    active_studies: 5,
    total_studies: 6,
    total_enrolled: 1284,
    total_target: 2100,
    studies_at_risk: 4,
    urgent_safety_cases: 2,
    average_data_quality_score: 86,
    overdue_compliance_items: 7,
  },
  study_cards: [
    { id: 's1', protocol_id: 'AIIA-OA-2026-001', title: 'AyurVeda OA-2026', status: 'ACTIVE', risk_level: 'HIGH', enrolled: 82, target: 150, compliance_score: 71, data_quality_score: 78, iec_renewal_due: d(12), ctri_update_due: d(5), risk_score: 78 },
    { id: 's2', protocol_id: 'AIIA-DM-2025-002', title: 'PramehaCare', status: 'ACTIVE', risk_level: 'LOW', enrolled: 410, target: 500, compliance_score: 94, data_quality_score: 92, iec_renewal_due: d(90), ctri_update_due: d(60), risk_score: 22 },
    { id: 's3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance', status: 'ACTIVE', risk_level: 'HIGH', enrolled: 43, target: 120, compliance_score: 76, data_quality_score: 81, iec_renewal_due: d(45), ctri_update_due: d(20), risk_score: 71 },
    { id: 's4', protocol_id: 'AIIA-INS-2025-004', title: 'NidraShanti', status: 'ACTIVE', risk_level: 'MEDIUM', enrolled: 134, target: 200, compliance_score: 85, data_quality_score: 88, iec_renewal_due: d(55), ctri_update_due: d(35), risk_score: 42 },
    { id: 's5', protocol_id: 'AIIA-RESP-2024-005', title: 'Respiratory Wellness', status: 'COMPLETED', risk_level: 'LOW', enrolled: 178, target: 180, compliance_score: 97, data_quality_score: 96, risk_score: 8 },
    { id: 's6', protocol_id: 'AIIA-SR-2026-006', title: 'PainRelief Safety Registry', status: 'ACTIVE', risk_level: 'LOW', enrolled: 437, target: 1000, compliance_score: 90, data_quality_score: 91, iec_renewal_due: d(120), ctri_update_due: d(75), risk_score: 18 },
  ],
  critical_actions: [
    { type: 'SAE_PENDING_REVIEW', case_id: 'SAE-2026-041', hours_remaining: 3, severity: 'CRITICAL', status: 'MEDICAL_REVIEW' },
    { type: 'IEC_RENEWAL', study: 'AyurVeda OA-2026', days_remaining: 12, severity: 'WARNING' },
    { type: 'CTRI_UPDATE', study: 'AyurVeda OA-2026', days_remaining: 5, severity: 'CRITICAL' },
    { type: 'MONITORING_OVERDUE', study: 'DEL-02', days_remaining: -9, severity: 'CRITICAL' },
    { type: 'RECRUITMENT_BELOW_TARGET', study: 'AgniBalance', days_remaining: -5, severity: 'WARNING' },
  ],
  site_performance: [
    { id: 'st1', site_code: 'DEL-01', site_name: 'AIIA Main Campus', target: 50, enrolled: 38, risk_level: 'LOW', monitoring_overdue_days: 0 },
    { id: 'st2', site_code: 'DEL-02', site_name: 'AIIA Extension, Dwarka', target: 50, enrolled: 19, risk_level: 'HIGH', monitoring_overdue_days: 9 },
    { id: 'st3', site_code: 'JAI-01', site_name: 'Jaipur Research Site', target: 50, enrolled: 25, risk_level: 'MEDIUM', monitoring_overdue_days: 0 },
    { id: 'st4', site_code: 'MUM-01', site_name: 'Mumbai Clinical Centre', target: 250, enrolled: 215, risk_level: 'LOW', monitoring_overdue_days: 0 },
    { id: 'st5', site_code: 'PUN-01', site_name: 'Pune Diabetes Clinic', target: 250, enrolled: 195, risk_level: 'LOW', monitoring_overdue_days: 0 },
    { id: 'st6', site_code: 'DEL-03', site_name: 'AIIA GI Research Unit', target: 60, enrolled: 24, risk_level: 'HIGH', monitoring_overdue_days: 5 },
  ],
  notifications: [
    { id: 'n1', title: 'SAE Requires Urgent Review', message: 'SAE-2026-041 requires e-signature. 3 hours remaining.', severity: 'CRITICAL' },
    { id: 'n2', title: 'IEC Renewal Due', message: 'IEC renewal for AyurVeda OA-2026 due in 12 days.', severity: 'WARNING' },
    { id: 'n3', title: 'Safety Signal Detected', message: 'GI event clustering detected across DEL-02 and JAI-01.', severity: 'CRITICAL' },
  ],
};

export const MOCK_PI_DASHBOARD: PIDashboardData = {
  assigned_studies: [
    { id: 's1', protocol_id: 'AIIA-OA-2026-001', title: 'AyurVeda OA-2026', status: 'ACTIVE', risk_level: 'HIGH', actual_enrolment: 82, target_enrolment: 150, compliance_score: 71 },
    { id: 's3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance', status: 'ACTIVE', risk_level: 'HIGH', actual_enrolment: 43, target_enrolment: 120, compliance_score: 76 },
  ],
  pending_approvals: { sae_reviews: 1, protocol_deviations: 2, iec_renewals: 1, consent_amendments: 2, capa_approvals: 1 },
  approval_queue: [
    { type: 'SAE_REVIEW', case_id: 'SAE-2026-041', description: 'SAE review and e-signature: Severe Hepatotoxicity (SUB-DEL01-0001). Hospitalisation. 3 hours remaining to regulatory deadline.', status: 'MEDICAL_REVIEW', created_at: new Date().toISOString(), hours_remaining: 3, requires_signature: true },
    { type: 'PROTOCOL_DEVIATION_REVIEW', description: 'DEV-2026-002: Eligibility deviation at DEL-01 — CAPA determination required.', status: 'UNDER_REVIEW', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), hours_remaining: null, requires_signature: false },
    { type: 'IEC_RENEWAL_PACKAGE', description: 'Annual continuing review submission for AyurVeda OA-2026 — due in 12 days.', status: 'PENDING', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), hours_remaining: null, requires_signature: true },
  ],
};

export const MOCK_COORDINATOR_DASHBOARD: CoordinatorDashboardData = {
  summary: { total_participants: 45, today_visits: 3, re_consent_pending: 8, open_queries: 7, open_ae_drafts: 1 },
  participants: Array.from({ length: 20 }, (_, i) => ({
    id: `p-${i}`,
    pseudonymised_subject_id: i < 11 ? `SUB-DEL01-${String(i + 1).padStart(4, '0')}` : `SUB-DEL02-${String(i - 10).padStart(4, '0')}`,
    status: i < 15 ? 'ACTIVE' : 'SCREENED',
    consent_status: i < 4 ? 'RE_CONSENT_REQUIRED' : i < 15 ? 'OBTAINED' : 'NOT_OBTAINED',
    enrollment_date: i < 15 ? new Date(2026, 1, i + 10).toISOString() : null,
    re_consent_required: i < 4,
  })),
  re_consent_pending: [
    { id: 'r1', pseudonymised_subject_id: 'SUB-DEL01-0001', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(7) },
    { id: 'r2', pseudonymised_subject_id: 'SUB-DEL01-0002', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(7) },
    { id: 'r3', pseudonymised_subject_id: 'SUB-DEL01-0003', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(7) },
    { id: 'r4', pseudonymised_subject_id: 'SUB-DEL01-0004', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(7) },
    { id: 'r5', pseudonymised_subject_id: 'SUB-DEL02-0001', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(5) },
    { id: 'r6', pseudonymised_subject_id: 'SUB-DEL02-0002', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(5) },
    { id: 'r7', pseudonymised_subject_id: 'SUB-DEL02-0003', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(5) },
    { id: 'r8', pseudonymised_subject_id: 'SUB-JAI01-0001', re_consent_reason: 'Protocol v2.0: Updated risk section (GI AEs)', re_consent_deadline: d(5) },
  ],
  ae_drafts: [
    { case_id: 'AE-DRAFT-001', event_term: 'Abdominal pain post-dose', created_at: new Date().toISOString() },
  ],
};

export const MOCK_ETHICS_DASHBOARD: EthicsDashboardData = {
  summary: { total_submissions: 12, pending_review: 3, approved: 8, clarification_requested: 1 },
  review_queue: [
    { id: 'e1', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'CONTINUING_REVIEW', protocol_version: 'v2.0', submission_date: d(-5), due_date: d(12), decision: 'PENDING' },
    { id: 'e2', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'SAE_REPORT', protocol_version: 'v2.0', submission_date: d(-1), due_date: d(7), decision: 'PENDING' },
    { id: 'e3', protocol_id: 'AIIA-GI-2026-003', study_title: 'AgniBalance', submission_type: 'DEVIATION_REPORT', protocol_version: 'v1.0', submission_date: d(-3), due_date: d(14), decision: 'PENDING' },
    { id: 'e4', protocol_id: 'AIIA-OA-2026-001', study_title: 'AyurVeda OA-2026', submission_type: 'AMENDMENT', protocol_version: 'v2.0', submission_date: d(-15), due_date: d(-5), decision: 'APPROVED' },
    { id: 'e5', protocol_id: 'AIIA-DM-2025-002', study_title: 'PramehaCare', submission_type: 'INITIAL_APPROVAL', protocol_version: 'v1.0', submission_date: d(-90), due_date: d(-60), decision: 'APPROVED' },
  ],
};

export const MOCK_PV_DASHBOARD: PVDashboardData = {
  disclaimer: 'MedDRA/WHO Drug coding-ready fields. Terminology licensing required before production use.',
  kpis: { total_cases: 5, draft_cases: 1, triage_queue: 4, medical_review_pending: 1, urgent_cases: 2, potential_signals: 1 },
  cases: [
    { case_id: 'SAE-2026-041', event_category: 'SAE', event_term: 'Severe Hepatotoxicity', seriousness: 'HOSPITALISATION', status: 'MEDICAL_REVIEW', hours_remaining: 3, causality: 'HUMAN_REVIEW_REQUIRED', severity: 'SEVERE' },
    { case_id: 'AE-2026-101', event_category: 'AE', event_term: 'Severe abdominal pain and vomiting', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 72, causality: 'HUMAN_REVIEW_REQUIRED', severity: 'MODERATE' },
    { case_id: 'AE-2026-102', event_category: 'AE', event_term: 'Nausea, abdominal cramps, loose stools', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 120, causality: 'HUMAN_REVIEW_REQUIRED', severity: 'MODERATE' },
    { case_id: 'AE-2026-103', event_category: 'AE', event_term: 'Severe epigastric pain and nausea', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 192, causality: 'HUMAN_REVIEW_REQUIRED', severity: 'MODERATE' },
    { case_id: 'AE-2026-104', event_category: 'AE', event_term: 'Abdominal distension and vomiting', seriousness: 'NOT_SERIOUS', status: 'TRIAGE', hours_remaining: 240, causality: 'HUMAN_REVIEW_REQUIRED', severity: 'MODERATE' },
  ],
  signals: [{
    id: 'sig1',
    event_term: 'Gastrointestinal disorders (abdominal pain, vomiting, nausea)',
    description: 'Potential clustering of gastrointestinal adverse events across DEL-02 and JAI-01 sites within a 14-day window. All events involve the same study formulation (Vatari Guggulu 500mg TID). 4 events detected across 2 sites.',
    event_count: 4,
    site_count: 2,
    status: 'DETECTED',
    disclaimer: 'Potential pattern detected — requires pharmacovigilance expert review. This does not establish causality.',
  }],
};

export const MOCK_MONITOR_DASHBOARD: MonitorDashboardData = {
  monitoring_visits: [
    { id: 'mv1', visit_id: 'MON-DEL01-001', visit_type: 'ROUTINE', planned_date: d(-30), actual_date: d(-28), status: 'COMPLETED', open_findings_count: 1, sdv_percentage: 87.5 },
    { id: 'mv2', visit_id: 'MON-DEL02-001', visit_type: 'ROUTINE', planned_date: d(-9), actual_date: null, status: 'OVERDUE', open_findings_count: 0, sdv_percentage: null },
    { id: 'mv3', visit_id: 'MON-JAI01-001', visit_type: 'ROUTINE', planned_date: d(14), actual_date: null, status: 'PLANNED', open_findings_count: 0, sdv_percentage: null },
  ],
};

export const MOCK_STUDIES: Study[] = [
  { id: 's1', protocol_id: 'AIIA-OA-2026-001', title: 'Efficacy and Safety of Ayurvedic Formulation in Osteoarthritis', short_title: 'AyurVeda OA-2026', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'HIGH', target_enrolment: 150, actual_enrolment: 82, screen_failure_count: 18, therapeutic_area: 'Musculoskeletal', intervention: 'Vatari Guggulu 500mg TID', iec_renewal_due: d(12), ctri_update_due: d(5), compliance_score: 71, data_quality_score: 78, overall_risk_score: 78, ctri_number: 'CTRI/2026/01/000001' },
  { id: 's2', protocol_id: 'AIIA-DM-2025-002', title: 'PramehaCare: Integrated Ayurvedic Management of Type 2 Diabetes', short_title: 'PramehaCare', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'LOW', target_enrolment: 500, actual_enrolment: 410, screen_failure_count: 45, therapeutic_area: 'Endocrinology / Diabetes', intervention: 'Nishamalaki Tablet + Lifestyle Module', iec_renewal_due: d(90), ctri_update_due: d(60), compliance_score: 94, data_quality_score: 92, overall_risk_score: 22, ctri_number: 'CTRI/2025/06/000042' },
  { id: 's3', protocol_id: 'AIIA-GI-2026-003', title: 'AgniBalance: Ayurvedic Formulation for Functional Gastrointestinal Disorders', short_title: 'AgniBalance', phase: 'PHASE_2', status: 'ACTIVE', risk_level: 'HIGH', target_enrolment: 120, actual_enrolment: 43, screen_failure_count: 12, therapeutic_area: 'Gastroenterology', intervention: 'Chitrakadi Vati 250mg BID', iec_renewal_due: d(45), ctri_update_due: d(20), compliance_score: 76, data_quality_score: 81, overall_risk_score: 71, ctri_number: 'CTRI/2026/03/000089' },
  { id: 's4', protocol_id: 'AIIA-INS-2025-004', title: 'NidraShanti: Evaluation of Ashwagandha-based Formulation for Insomnia', short_title: 'NidraShanti', phase: 'PHASE_3', status: 'ACTIVE', risk_level: 'MEDIUM', target_enrolment: 200, actual_enrolment: 134, screen_failure_count: 22, therapeutic_area: 'Neurology / Sleep Medicine', intervention: 'Ashwagandha KSM-66 300mg BD', iec_renewal_due: d(55), ctri_update_due: d(35), compliance_score: 85, data_quality_score: 88, overall_risk_score: 42, ctri_number: 'CTRI/2025/09/000156' },
  { id: 's5', protocol_id: 'AIIA-RESP-2024-005', title: 'Respiratory Wellness: Herbal Formulation in Chronic Obstructive Pulmonary Disease', short_title: 'Respiratory Wellness', phase: 'PHASE_3', status: 'COMPLETED', risk_level: 'LOW', target_enrolment: 180, actual_enrolment: 178, screen_failure_count: 8, therapeutic_area: 'Respiratory', intervention: 'Talisadi Churna + Supportive Care', compliance_score: 97, data_quality_score: 96, overall_risk_score: 8, ctri_number: 'CTRI/2024/02/000034' },
  { id: 's6', protocol_id: 'AIIA-SR-2026-006', title: 'PainRelief Safety Registry: Post-Market Safety Surveillance', short_title: 'PainRelief Safety Registry', phase: 'REGISTRY', status: 'ACTIVE', risk_level: 'LOW', target_enrolment: 1000, actual_enrolment: 437, screen_failure_count: 0, therapeutic_area: 'Pain Management', intervention: 'Various Ayurvedic Analgesics (Registry)', iec_renewal_due: d(120), ctri_update_due: d(75), compliance_score: 90, data_quality_score: 91, overall_risk_score: 18, ctri_number: 'CTRI/2026/01/000018' },
];
