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


class ParticipantStatus(str, enum.Enum):
    SCREENED = "SCREENED"
    SCREEN_FAILED = "SCREEN_FAILED"
    ENROLLED = "ENROLLED"
    ACTIVE = "ACTIVE"
    WITHDRAWN = "WITHDRAWN"
    COMPLETED = "COMPLETED"
    LOST_TO_FOLLOWUP = "LOST_TO_FOLLOWUP"


class ConsentStatus(str, enum.Enum):
    NOT_OBTAINED = "NOT_OBTAINED"
    OBTAINED = "OBTAINED"
    WITHDRAWN = "WITHDRAWN"
    RE_CONSENT_REQUIRED = "RE_CONSENT_REQUIRED"
    RE_CONSENTED = "RE_CONSENTED"


class ParticipantPseudonym(Base):
    """
    Stores only pseudonymised participant identifiers.
    No real names, phone, address, Aadhaar, or ABHA ID.
    Re-identification keys are stored in a separate protected vault.
    """
    __tablename__ = "participant_pseudonyms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    pseudonymised_subject_id = Column(String(50), unique=True, nullable=False, index=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False, index=True)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False, index=True)
    status = Column(SAEnum(ParticipantStatus, name="participantstatus"),
                    nullable=False, default=ParticipantStatus.SCREENED)
    consent_status = Column(SAEnum(ConsentStatus, name="consentstatus"),
                             nullable=False, default=ConsentStatus.NOT_OBTAINED)

    screening_date = Column(Date, nullable=True)
    enrollment_date = Column(Date, nullable=True)
    withdrawal_date = Column(Date, nullable=True)
    withdrawal_reason = Column(Text, nullable=True)
    completion_date = Column(Date, nullable=True)

    # Re-consent tracking
    re_consent_required = Column(Boolean, default=False)
    re_consent_reason = Column(Text, nullable=True)
    re_consent_deadline = Column(Date, nullable=True)

    assigned_coordinator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    study = relationship("Study", back_populates="participants")
    site = relationship("Site", back_populates="participants")
    assigned_coordinator = relationship("User", foreign_keys=[assigned_coordinator_id])
    consents = relationship("ConsentEvent", back_populates="participant", lazy="select")
    visits = relationship("Visit", back_populates="participant", lazy="select")
    adverse_events = relationship("AdverseEvent", back_populates="participant", lazy="select")


class ConsentVersion(Base):
    __tablename__ = "consent_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    version_number = Column(String(20), nullable=False)
    language = Column(String(50), nullable=False, default="English")
    format = Column(String(50), nullable=True, default="Written")
    approved = Column(Boolean, default=False)
    iec_approved_date = Column(Date, nullable=True)
    effective_date = Column(Date, nullable=True)
    superseded_date = Column(Date, nullable=True)
    re_consent_required = Column(Boolean, default=False)
    change_summary = Column(Text, nullable=True)
    document_reference = Column(String(500), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    consents = relationship("ConsentEvent", back_populates="consent_version", lazy="select")


class ConsentEvent(Base):
    __tablename__ = "consent_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participant_pseudonyms.id"), nullable=False)
    consent_version_id = Column(UUID(as_uuid=True), ForeignKey("consent_versions.id"), nullable=False)
    event_type = Column(String(50), nullable=False, default="INITIAL")  # INITIAL, RE_CONSENT, WITHDRAWAL
    signed_at = Column(DateTime(timezone=True), nullable=True)
    witnessed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    obtained_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    language_used = Column(String(50), nullable=True)
    comprehension_confirmed = Column(Boolean, default=False)
    voluntary_confirmed = Column(Boolean, default=False)
    coercion_screened = Column(Boolean, default=False)

    # Optional data-use consents
    consent_future_research = Column(Boolean, default=False)
    consent_recordings = Column(Boolean, default=False)
    consent_samples = Column(Boolean, default=False)
    consent_data_sharing = Column(Boolean, default=False)
    consent_optional_data_uses = Column(Boolean, default=False)

    withdrawal_at = Column(DateTime(timezone=True), nullable=True)
    withdrawal_reason = Column(Text, nullable=True)
    withdrawal_affects_care = Column(Boolean, default=False)

    notes = Column(Text, nullable=True)
    document_reference = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    participant = relationship("ParticipantPseudonym", back_populates="consents")
    consent_version = relationship("ConsentVersion", back_populates="consents")
    obtained_by = relationship("User", foreign_keys=[obtained_by_id])


class VisitStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_WINDOW = "IN_WINDOW"
    MISSED = "MISSED"
    COMPLETED = "COMPLETED"
    UNSCHEDULED = "UNSCHEDULED"
    EARLY_TERMINATION = "EARLY_TERMINATION"


class Visit(Base):
    __tablename__ = "visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participant_pseudonyms.id"), nullable=False)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    visit_name = Column(String(100), nullable=False)
    visit_number = Column(Integer, nullable=True)
    scheduled_date = Column(Date, nullable=True)
    actual_date = Column(Date, nullable=True)
    window_start = Column(Date, nullable=True)
    window_end = Column(Date, nullable=True)
    status = Column(SAEnum(VisitStatus, name="visitstatus"), nullable=False, default=VisitStatus.SCHEDULED)
    conducted_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    open_queries_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    participant = relationship("ParticipantPseudonym", back_populates="visits")
    conducted_by = relationship("User", foreign_keys=[conducted_by_id])
