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


class EthicsDecision(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    CLARIFICATION_REQUESTED = "CLARIFICATION_REQUESTED"
    HELD = "HELD"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class EthicsSubmissionType(str, enum.Enum):
    INITIAL_APPROVAL = "INITIAL_APPROVAL"
    AMENDMENT = "AMENDMENT"
    CONTINUING_REVIEW = "CONTINUING_REVIEW"
    DEVIATION_REPORT = "DEVIATION_REPORT"
    SAE_REPORT = "SAE_REPORT"
    CLOSURE_REPORT = "CLOSURE_REPORT"


class EthicsReview(Base):
    __tablename__ = "ethics_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    protocol_id = Column(String(100), nullable=True)
    submission_type = Column(SAEnum(EthicsSubmissionType, name="ethicssubmissiontype"), nullable=False)
    protocol_version = Column(String(20), nullable=True)
    submission_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    decision = Column(SAEnum(EthicsDecision, name="ethicsdecision"),
                      nullable=False, default=EthicsDecision.PENDING)
    decision_date = Column(Date, nullable=True)
    decision_notes = Column(Text, nullable=True)
    assigned_reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    quorum_metadata = Column(JSONB, nullable=True)   # placeholder, not full quorum tracking
    pi_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    document_reference = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    assigned_reviewer = relationship("User", foreign_keys=[assigned_reviewer_id])
    pi = relationship("User", foreign_keys=[pi_id])


class CTRIStatus(str, enum.Enum):
    REGISTERED = "REGISTERED"
    UPDATE_REQUIRED = "UPDATE_REQUIRED"
    UPDATE_SUBMITTED = "UPDATE_SUBMITTED"
    SUSPENDED = "SUSPENDED"
    COMPLETED = "COMPLETED"


class CTRIRegistration(Base):
    __tablename__ = "ctri_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False, unique=True)
    ctri_number = Column(String(100), nullable=True, unique=True)
    registration_date = Column(Date, nullable=True)
    status = Column(SAEnum(CTRIStatus, name="ctristatus"), nullable=False, default=CTRIStatus.REGISTERED)
    last_update_date = Column(Date, nullable=True)
    next_update_due = Column(Date, nullable=True)
    update_history = Column(JSONB, nullable=True, default=list)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class ProtocolDeviation(Base):
    __tablename__ = "protocol_deviations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deviation_id = Column(String(50), unique=True, nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participant_pseudonyms.id"), nullable=True)
    deviation_type = Column(String(100), nullable=False)  # e.g. ELIGIBILITY, DOSING, VISIT_WINDOW
    severity = Column(String(50), nullable=False, default="MINOR")  # MINOR, MAJOR, CRITICAL
    description = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=True)
    impact_assessment = Column(Text, nullable=True)
    reported_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    pi_reviewed = Column(Boolean, default=False)
    iec_notified = Column(Boolean, default=False)
    capa_required = Column(Boolean, default=False)
    status = Column(String(50), default="OPEN")  # OPEN, UNDER_REVIEW, CAPA_OPEN, CLOSED
    occurrence_date = Column(Date, nullable=True)
    detected_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    reported_by = relationship("User", foreign_keys=[reported_by_id])


class MonitoringVisit(Base):
    __tablename__ = "monitoring_visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    visit_id = Column(String(50), unique=True, nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    monitor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    visit_type = Column(String(50), default="ROUTINE")  # ROUTINE, REMOTE, TRIGGER, CLOSEOUT
    planned_date = Column(Date, nullable=True)
    actual_date = Column(Date, nullable=True)
    status = Column(String(50), default="PLANNED")  # PLANNED, IN_PROGRESS, COMPLETED, OVERDUE
    findings_count = Column(Integer, default=0)
    open_findings_count = Column(Integer, default=0)
    sdv_percentage = Column(Float, nullable=True)  # Source Data Verification %
    notes = Column(Text, nullable=True)
    report_reference = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    monitor = relationship("User", foreign_keys=[monitor_id])


class DataQuery(Base):
    __tablename__ = "data_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(String(50), unique=True, nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participant_pseudonyms.id"), nullable=True)
    field_name = Column(String(100), nullable=True)
    query_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)
    raised_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    answered_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="OPEN")  # OPEN, ANSWERED, CLOSED, OVERRIDDEN
    raised_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    answered_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    raised_by = relationship("User", foreign_keys=[raised_by_id])
    answered_by = relationship("User", foreign_keys=[answered_by_id])
