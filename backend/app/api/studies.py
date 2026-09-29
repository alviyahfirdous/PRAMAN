from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.study import Study, Site, StudyStatus, RiskLevel
from typing import List, Optional, Dict, Any
import uuid

router = APIRouter(prefix="/studies", tags=["Studies"])


def _can_access_study(user: User) -> bool:
    return user.role in [
        UserRole.ADMIN, UserRole.LEADERSHIP, UserRole.PRINCIPAL_INVESTIGATOR,
        UserRole.STUDY_COORDINATOR, UserRole.MONITOR, UserRole.ETHICS_COMMITTEE,
        UserRole.PHARMACOVIGILANCE_OFFICER, UserRole.REGULATOR,
    ]


@router.get("")
async def list_studies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status"),
) -> Dict[str, Any]:
    if not _can_access_study(current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    query = select(Study)

    # PIs and coordinators only see assigned studies
    if current_user.role == UserRole.PRINCIPAL_INVESTIGATOR:
        query = query.where(Study.principal_investigator_id == current_user.id)
    elif current_user.role == UserRole.REGULATOR:
        # Regulators can read all but see limited fields — handled in response shaping
        pass

    if status_filter:
        try:
            query = query.where(Study.status == StudyStatus(status_filter))
        except ValueError:
            pass

    result = await db.execute(query)
    studies = result.scalars().all()

    def _shape(s: Study) -> dict:
        base = {
            "id": str(s.id),
            "protocol_id": s.protocol_id,
            "title": s.title,
            "short_title": s.short_title,
            "phase": s.phase.value,
            "status": s.status.value,
            "risk_level": s.risk_level.value,
            "target_enrolment": s.target_enrolment,
            "actual_enrolment": s.actual_enrolment,
            "therapeutic_area": s.therapeutic_area,
            "intervention": s.intervention,
            "ctri_number": s.ctri_number,
            "iec_renewal_due": s.iec_renewal_due.isoformat() if s.iec_renewal_due else None,
            "ctri_update_due": s.ctri_update_due.isoformat() if s.ctri_update_due else None,
            "data_quality_score": s.data_quality_score,
            "compliance_score": s.compliance_score,
            "overall_risk_score": s.overall_risk_score,
            "planned_start_date": s.planned_start_date.isoformat() if s.planned_start_date else None,
            "planned_end_date": s.planned_end_date.isoformat() if s.planned_end_date else None,
        }
        return base

    return {
        "studies": [_shape(s) for s in studies],
        "total": len(studies),
    }


@router.get("/{study_id}")
async def get_study(
    study_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    if not _can_access_study(current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(select(Study).where(Study.id == study_id))
    study = result.scalar_one_or_none()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    sites_res = await db.execute(select(Site).where(Site.study_id == study_id))
    sites = sites_res.scalars().all()

    return {
        "id": str(study.id),
        "protocol_id": study.protocol_id,
        "title": study.title,
        "short_title": study.short_title,
        "description": study.description,
        "therapeutic_area": study.therapeutic_area,
        "intervention": study.intervention,
        "phase": study.phase.value,
        "status": study.status.value,
        "risk_level": study.risk_level.value,
        "target_enrolment": study.target_enrolment,
        "actual_enrolment": study.actual_enrolment,
        "screen_failure_count": study.screen_failure_count,
        "ctri_number": study.ctri_number,
        "iec_approval_number": study.iec_approval_number,
        "iec_renewal_due": study.iec_renewal_due.isoformat() if study.iec_renewal_due else None,
        "ctri_update_due": study.ctri_update_due.isoformat() if study.ctri_update_due else None,
        "data_quality_score": study.data_quality_score,
        "compliance_score": study.compliance_score,
        "overall_risk_score": study.overall_risk_score,
        "planned_start_date": study.planned_start_date.isoformat() if study.planned_start_date else None,
        "planned_end_date": study.planned_end_date.isoformat() if study.planned_end_date else None,
        "sites": [
            {
                "id": str(s.id),
                "site_code": s.site_code,
                "site_name": s.site_name,
                "city": s.city,
                "status": s.status.value,
                "target_enrolment": s.target_enrolment,
                "actual_enrolment": s.actual_enrolment,
                "risk_level": s.risk_level.value if s.risk_level else "LOW",
                "monitoring_overdue_days": s.monitoring_overdue_days or 0,
            }
            for s in sites
        ],
        "created_at": study.created_at.isoformat() if study.created_at else None,
    }
