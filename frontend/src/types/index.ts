// PRAMAN Frontend Type Definitions
// Matches backend Pydantic schemas

export type UserRole =
  | 'ADMIN'
  | 'PRINCIPAL_INVESTIGATOR'
  | 'STUDY_COORDINATOR'
  | 'MONITOR'
  | 'ETHICS_COMMITTEE'
  | 'PHARMACOVIGILANCE_OFFICER'
  | 'LEADERSHIP'
  | 'REGULATOR';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  designation?: string;
  department?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StudyStatus = 'DRAFT' | 'ETHICS_REVIEW' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'CLOSED' | 'TERMINATED';
export type StudyPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'PHASE_4' | 'OBSERVATIONAL' | 'REGISTRY';

export interface Study {
  id: string;
  protocol_id: string;
  title: string;
  short_title?: string;
  description?: string;
  therapeutic_area?: string;
  intervention?: string;
  phase: StudyPhase;
  status: StudyStatus;
  risk_level: RiskLevel;
  target_enrolment: number;
  actual_enrolment: number;
  screen_failure_count: number;
  ctri_number?: string;
  iec_approval_number?: string;
  iec_renewal_due?: string;
  ctri_update_due?: string;
  data_quality_score?: number;
  compliance_score?: number;
  overall_risk_score?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  created_at?: string;
  sites?: Site[];
}

export interface Site {
  id: string;
  site_code: string;
  site_name: string;
  city?: string;
  state?: string;
  status: string;
  target_enrolment: number;
  actual_enrolment: number;
  risk_level: RiskLevel;
  monitoring_overdue_days: number;
}

export type SafetyCaseStatus =
  | 'DRAFT'
  | 'INITIAL_REPORT_SUBMITTED'
  | 'TRIAGE'
  | 'MEDICAL_REVIEW'
  | 'FOLLOW_UP_REQUIRED'
  | 'FOLLOW_UP_RECEIVED'
  | 'REGULATORY_REVIEW'
  | 'CLOSED_BY_AUTHORISED_HUMAN'
  | 'NULLIFIED';

export interface SafetyCase {
  id: string;
  case_id: string;
  event_category: string;
  event_term: string;
  status: SafetyCaseStatus;
  seriousness?: string;
  severity?: string;
  causality?: string;
  regulatory_due_date?: string;
  hours_remaining?: number;
}

export interface SafetySignal {
  id: string;
  description: string;
  event_term: string;
  event_count: number;
  site_count: number;
  status: string;
  disclaimer: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface LeadershipDashboard {
  disclaimer: string;
  kpis: {
    active_studies: number;
    total_studies: number;
    total_enrolled: number;
    total_target: number;
    studies_at_risk: number;
    urgent_safety_cases: number;
    average_data_quality_score: number;
    overdue_compliance_items: number;
  };
  study_cards: Array<{
    id: string;
    protocol_id: string;
    title: string;
    status: string;
    risk_level: RiskLevel;
    enrolled: number;
    target: number;
    compliance_score?: number;
    data_quality_score?: number;
    iec_renewal_due?: string;
    ctri_update_due?: string;
    risk_score?: number;
  }>;
  critical_actions: Array<{
    type: string;
    study?: string;
    case_id?: string;
    days_remaining?: number;
    hours_remaining?: number;
    severity: string;
    status?: string;
  }>;
  site_performance: Array<{
    id: string;
    site_code: string;
    site_name: string;
    target: number;
    enrolled: number;
    risk_level: string;
    monitoring_overdue_days: number;
  }>;
  notifications: Notification[];
}
