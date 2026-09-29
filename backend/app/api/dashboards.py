from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, timedelta, datetime, timezone
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.study import Study, Site, RiskLevel, StudyStatus
from app.models.participant import ParticipantPseudonym, ConsentStatus
from app.models.safety import AdverseEvent, SafetyCaseStatus, SafetySignal, SafetySignalStatus
from app.models.compliance import EthicsReview, CTRIRegistration, ProtocolDeviation, MonitoringVisit, DataQuery
from app.models.audit import Notification
from typing import Any, Dict
import uuid

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


def _role_guard(user: User, required: list):
    if user.role not in required:
        raise HTTPException(status_code=403, detail="Access denied for this dashboard")


@router.get("/leadership")
async def leadership_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.LEADERSHIP, UserRole.ADMIN])

    studies_res = await db.execute(select(Study))
    studies = studies_res.scalars().all()

    active_studies = [s for s in studies if s.status == StudyStatus.ACTIVE]
    total_enrolled = sum(s.actual_enrolment for s in studies)
    total_target = sum(s.target_enrolment for s in studies)
    at_risk = [s for s in studies if s.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL)]

    # Urgent safety
    urgent_ae_res = await db.execute(
        select(AdverseEvent).where(
            AdverseEvent.status.in_([SafetyCaseStatus.TRIAGE, SafetyCaseStatus.MEDICAL_REVIEW])
        )
    )
    urgent_aes = urgent_ae_res.scalars().all()

    # Notifications
    notif_res = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        ).limit(10)
    )
    notifications = notif_res.scalars().all()

    # Site performance
    sites_res = await db.execute(select(Site))
    sites = sites_res.scalars().all()

    study_cards = [
        {
            "id": str(s.id),
            "protocol_id": s.protocol_id,
            "title": s.short_title or s.title,
            "status": s.status.value,
            "risk_level": s.risk_level.value,
            "enrolled": s.actual_enrolment,
            "target": s.target_enrolment,
            "compliance_score": s.compliance_score,
            "data_quality_score": s.data_quality_score,
            "iec_renewal_due": s.iec_renewal_due.isoformat() if s.iec_renewal_due else None,
            "ctri_update_due": s.ctri_update_due.isoformat() if s.ctri_update_due else None,
            "risk_score": s.overall_risk_score,
        }
        for s in studies
    ]

    site_performance = [
        {
            "id": str(s.id),
            "site_code": s.site_code,
            "site_name": s.site_name,
            "target": s.target_enrolment,
            "enrolled": s.actual_enrolment,
            "risk_level": s.risk_level.value if s.risk_level else "LOW",
            "monitoring_overdue_days": s.monitoring_overdue_days or 0,
        }
        for s in sites[:8]
    ]

    today = date.today()
    critical_actions = []
    for s in studies:
        if s.iec_renewal_due:
            days = (s.iec_renewal_due - today).days
            if days <= 30:
                critical_actions.append({
                    "type": "IEC_RENEWAL",
                    "study": s.short_title or s.title,
                    "days_remaining": days,
                    "severity": "CRITICAL" if days <= 7 else "WARNING",
                })
        if s.ctri_update_due:
            days = (s.ctri_update_due - today).days
            if days <= 14:
                critical_actions.append({
                    "type": "CTRI_UPDATE",
                    "study": s.short_title or s.title,
                    "days_remaining": days,
                    "severity": "CRITICAL" if days <= 3 else "WARNING",
                })

    for ae in urgent_aes[:5]:
        hrs = None
        if ae.regulatory_due_date:
            delta = ae.regulatory_due_date - datetime.now(timezone.utc)
            hrs = max(0, int(delta.total_seconds() / 3600))
        critical_actions.append({
            "type": "SAE_PENDING_REVIEW",
            "case_id": ae.case_id,
            "status": ae.status.value,
            "hours_remaining": hrs,
            "severity": "CRITICAL",
        })

    avg_dq = (
        sum(s.data_quality_score for s in studies if s.data_quality_score) / len(studies)
        if studies else 100.0
    )

    return {
        "disclaimer": "Aggregate view only. No direct participant identifiers shown. Synthetic demo data.",
        "kpis": {
            "active_studies": len(active_studies),
            "total_studies": len(studies),
            "total_enrolled": total_enrolled,
            "total_target": total_target,
            "studies_at_risk": len(at_risk),
            "urgent_safety_cases": len(urgent_aes),
            "average_data_quality_score": round(avg_dq, 1),
            "overdue_compliance_items": len([a for a in critical_actions if a.get("days_remaining", 99) < 0]),
        },
        "study_cards": study_cards,
        "critical_actions": critical_actions[:10],
        "site_performance": site_performance,
        "notifications": [
            {"id": str(n.id), "title": n.title, "message": n.message, "severity": n.severity}
            for n in notifications
        ],
    }


@router.get("/pi")
async def pi_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.PRINCIPAL_INVESTIGATOR, UserRole.ADMIN])

    studies_res = await db.execute(
        select(Study).where(Study.principal_investigator_id == current_user.id)
    )
    studies = studies_res.scalars().all()

    ae_res = await db.execute(
        select(AdverseEvent).where(
            AdverseEvent.pi_reviewer_id == current_user.id,
            AdverseEvent.status == SafetyCaseStatus.MEDICAL_REVIEW,
        )
    )
    pending_aes = ae_res.scalars().all()

    return {
        "assigned_studies": [
            {
                "id": str(s.id),
                "protocol_id": s.protocol_id,
                "title": s.short_title or s.title,
                "status": s.status.value,
                "risk_level": s.risk_level.value,
                "enrolled": s.actual_enrolment,
                "target": s.target_enrolment,
                "compliance_score": s.compliance_score,
            }
            for s in studies
        ],
        "pending_approvals": {
            "sae_reviews": len(pending_aes),
            "protocol_deviations": 3,
            "iec_renewals": 1,
            "consent_amendments": 2,
            "capa_approvals": 2,
        },
        "approval_queue": [
            {
                "type": "SAE_REVIEW",
                "case_id": ae.case_id,
                "description": f"SAE review and e-signature: {ae.event_term}",
                "status": ae.status.value,
                "created_at": ae.created_at.isoformat(),
                "hours_remaining": (
                    max(0, int((ae.regulatory_due_date - datetime.now(timezone.utc)).total_seconds() / 3600))
                    if ae.regulatory_due_date else None
                ),
                "requires_signature": True,
            }
            for ae in pending_aes[:5]
        ],
    }


@router.get("/coordinator")
async def coordinator_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.STUDY_COORDINATOR, UserRole.ADMIN])

    participants_res = await db.execute(
        select(ParticipantPseudonym).where(
            ParticipantPseudonym.assigned_coordinator_id == current_user.id
        ).limit(50)
    )
    participants = participants_res.scalars().all()

    reconsent_res = await db.execute(
        select(ParticipantPseudonym).where(
            ParticipantPseudonym.assigned_coordinator_id == current_user.id,
            ParticipantPseudonym.re_consent_required == True,
        )
    )
    reconsent_pending = reconsent_res.scalars().all()

    ae_drafts_res = await db.execute(
        select(AdverseEvent).where(
            AdverseEvent.reported_by_id == current_user.id,
            AdverseEvent.status == SafetyCaseStatus.DRAFT,
        )
    )
    ae_drafts = ae_drafts_res.scalars().all()

    return {
        "summary": {
            "total_participants": len(participants),
            "re_consent_pending": len(reconsent_pending),
            "open_ae_drafts": len(ae_drafts),
            "today_visits": 3,
            "open_queries": 7,
        },
        "participants": [
            {
                "id": str(p.id),
                "pseudonymised_subject_id": p.pseudonymised_subject_id,
                "status": p.status.value,
                "consent_status": p.consent_status.value,
                "re_consent_required": p.re_consent_required,
                "enrollment_date": p.enrollment_date.isoformat() if p.enrollment_date else None,
            }
            for p in participants[:20]
        ],
        "re_consent_pending": [
            {
                "id": str(p.id),
                "pseudonymised_subject_id": p.pseudonymised_subject_id,
                "re_consent_reason": p.re_consent_reason,
                "re_consent_deadline": p.re_consent_deadline.isoformat() if p.re_consent_deadline else None,
            }
            for p in reconsent_pending
        ],
        "ae_drafts": [
            {"case_id": ae.case_id, "event_term": ae.event_term, "created_at": ae.created_at.isoformat()}
            for ae in ae_drafts
        ],
    }


@router.get("/ethics")
async def ethics_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.ETHICS_COMMITTEE, UserRole.ADMIN])

    reviews_res = await db.execute(
        select(EthicsReview).limit(20)
    )
    reviews = reviews_res.scalars().all()

    from app.models.compliance import EthicsDecision
    pending = [r for r in reviews if r.decision == EthicsDecision.PENDING]

    return {
        "summary": {
            "total_submissions": len(reviews),
            "pending_review": len(pending),
            "approved": len([r for r in reviews if r.decision == EthicsDecision.APPROVED]),
            "clarification_requested": len([r for r in reviews if r.decision == EthicsDecision.CLARIFICATION_REQUESTED]),
        },
        "review_queue": [
            {
                "id": str(r.id),
                "study_id": str(r.study_id),
                "submission_type": r.submission_type.value,
                "protocol_version": r.protocol_version,
                "submission_date": r.submission_date.isoformat() if r.submission_date else None,
                "due_date": r.due_date.isoformat() if r.due_date else None,
                "decision": r.decision.value,
            }
            for r in reviews[:10]
        ],
    }


@router.get("/pharmacovigilance")
async def pv_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.PHARMACOVIGILANCE_OFFICER, UserRole.ADMIN])

    ae_res = await db.execute(select(AdverseEvent).limit(50))
    aes = ae_res.scalars().all()

    signals_res = await db.execute(select(SafetySignal))
    signals = signals_res.scalars().all()

    today = datetime.now(timezone.utc)

    urgent = [ae for ae in aes if ae.regulatory_due_date and
              (ae.regulatory_due_date - today).total_seconds() < 86400 * 3]

    return {
        "disclaimer": "MedDRA/WHO Drug coding-ready fields. Terminology licensing required before production use.",
        "kpis": {
            "total_cases": len(aes),
            "draft_cases": len([a for a in aes if a.status == SafetyCaseStatus.DRAFT]),
            "triage_queue": len([a for a in aes if a.status == SafetyCaseStatus.TRIAGE]),
            "medical_review_pending": len([a for a in aes if a.status == SafetyCaseStatus.MEDICAL_REVIEW]),
            "urgent_cases": len(urgent),
            "potential_signals": len([s for s in signals if s.status == SafetySignalStatus.DETECTED]),
        },
        "cases": [
            {
                "id": str(ae.id),
                "case_id": ae.case_id,
                "event_category": ae.event_category.value,
                "event_term": ae.event_term,
                "status": ae.status.value,
                "seriousness": ae.seriousness.value if ae.seriousness else None,
                "severity": ae.severity.value if ae.severity else None,
                "causality": ae.causality.value if ae.causality else None,
                "regulatory_due_date": ae.regulatory_due_date.isoformat() if ae.regulatory_due_date else None,
                "hours_remaining": (
                    max(0, int((ae.regulatory_due_date - today).total_seconds() / 3600))
                    if ae.regulatory_due_date else None
                ),
            }
            for ae in aes[:20]
        ],
        "signals": [
            {
                "id": str(s.id),
                "description": s.signal_description,
                "event_term": s.suspected_event_term,
                "event_count": s.event_count,
                "site_count": s.site_count,
                "status": s.status.value,
                "disclaimer": s.disclaimer,
            }
            for s in signals
        ],
    }


@router.get("/monitor")
async def monitor_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    _role_guard(current_user, [UserRole.MONITOR, UserRole.ADMIN])

    visits_res = await db.execute(
        select(MonitoringVisit).where(MonitoringVisit.monitor_id == current_user.id).limit(20)
    )
    visits = visits_res.scalars().all()

    return {
        "monitoring_visits": [
            {
                "id": str(v.id),
                "visit_id": v.visit_id,
                "visit_type": v.visit_type,
                "planned_date": v.planned_date.isoformat() if v.planned_date else None,
                "actual_date": v.actual_date.isoformat() if v.actual_date else None,
                "status": v.status,
                "open_findings_count": v.open_findings_count,
                "sdv_percentage": v.sdv_percentage,
            }
            for v in visits
        ],
    }
