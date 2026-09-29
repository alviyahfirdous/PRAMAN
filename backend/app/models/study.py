import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum as SAEnum,
    Text, ForeignKey, Integer, Float, Date
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class StudyPhase(str, enum.Enum):
    PHASE_1 = "PHASE_1"
    PHASE_2 = "PHASE_2"
    PHASE_3 = "PHASE_3"
    PHASE_4 = "PHASE_4"
    OBSERVATIONAL = "OBSERVATIONAL"
    REGISTRY = "REGISTRY"


class StudyStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ETHICS_REVIEW = "ETHICS_REVIEW"
    APPROVED = "APPROVED"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    COMPLETED = "COMPLETED"
    CLOSED = "CLOSED"
    TERMINATED = "TERMINATED"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Study(Base):
    __tablename__ = "studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    protocol_id = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    short_title = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    therapeutic_area = Column(String(255), nullable=True)
    intervention = Column(String(500), nullable=True)
    phase = Column(SAEnum(StudyPhase, name="studyphase"), nullable=False, default=StudyPhase.PHASE_3)
    status = Column(SAEnum(StudyStatus, name="studystatus"), nullable=False, default=StudyStatus.DRAFT)
    risk_level = Column(SAEnum(RiskLevel, name="risklevel"), nullable=False, default=RiskLevel.LOW)

    # Targets
    target_enrolment = Column(Integer, nullable=False, default=0)
    actual_enrolment = Column(Integer, nullable=False, default=0)
    screen_failure_count = Column(Integer, nullable=False, default=0)

    # Dates
    planned_start_date = Column(Date, nullable=True)
    actual_start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)

    # Compliance
    ctri_number = Column(String(100), nullable=True)
    iec_approval_number = Column(String(100), nullable=True)
    iec_renewal_due = Column(Date, nullable=True)
    ctri_update_due = Column(Date, nullable=True)
    data_quality_score = Column(Float, nullable=True, default=100.0)
    compliance_score = Column(Float, nullable=True, default=100.0)
    overall_risk_score = Column(Float, nullable=True, default=0.0)

    # PI
    principal_investigator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Metadata
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    principal_investigator = relationship("User", foreign_keys=[principal_investigator_id])
    sites = relationship("Site", back_populates="study", lazy="select")
    participants = relationship("ParticipantPseudonym", back_populates="study", lazy="select")


class SiteStatus(str, enum.Enum):
    PENDING_ACTIVATION = "PENDING_ACTIVATION"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    CLOSED = "CLOSED"


class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False, index=True)
    site_code = Column(String(50), nullable=False)
    site_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    status = Column(SAEnum(SiteStatus, name="sitestatus"), nullable=False, default=SiteStatus.PENDING_ACTIVATION)
    target_enrolment = Column(Integer, nullable=False, default=0)
    actual_enrolment = Column(Integer, nullable=False, default=0)
    risk_level = Column(SAEnum(RiskLevel, name="siterisklevel"), nullable=True)
    site_investigator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    last_monitoring_visit = Column(Date, nullable=True)
    next_monitoring_visit = Column(Date, nullable=True)
    monitoring_overdue_days = Column(Integer, nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    study = relationship("Study", back_populates="sites")
    site_investigator = relationship("User", foreign_keys=[site_investigator_id])
    participants = relationship("ParticipantPseudonym", back_populates="site", lazy="select")
