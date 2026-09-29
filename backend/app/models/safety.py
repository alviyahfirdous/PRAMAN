import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum as SAEnum,
    Text, ForeignKey, Integer, Float, Date, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class EventCategory(str, enum.Enum):
    AE = "AE"
    ADR = "ADR"
    SAE = "SAE"
    SUSAR = "SUSAR"
    PRODUCT_QUALITY_COMPLAINT = "PRODUCT_QUALITY_COMPLAINT"
    MEDICATION_ERROR = "MEDICATION_ERROR"
    LACK_OF_EFFICACY = "LACK_OF_EFFICACY"
    PREGNANCY_EXPOSURE = "PREGNANCY_EXPOSURE"
    OVERDOSE = "OVERDOSE"
    OTHER_SPECIAL_SITUATION = "OTHER_SPECIAL_SITUATION"


class SeriousnessCategory(str, enum.Enum):
    DEATH = "DEATH"
    LIFE_THREATENING = "LIFE_THREATENING"
    HOSPITALISATION = "HOSPITALISATION"
    PROLONGED_HOSPITALISATION = "PROLONGED_HOSPITALISATION"
    PERSISTENT_DISABILITY = "PERSISTENT_DISABILITY"
    CONGENITAL_ANOMALY = "CONGENITAL_ANOMALY"
    MEDICALLY_SIGNIFICANT = "MEDICALLY_SIGNIFICANT"
    NOT_SERIOUS = "NOT_SERIOUS"


class Severity(str, enum.Enum):
    MILD = "MILD"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    LIFE_THREATENING = "LIFE_THREATENING"
    FATAL = "FATAL"


class Causality(str, enum.Enum):
    CERTAIN = "CERTAIN"
    PROBABLE = "PROBABLE"
    POSSIBLE = "POSSIBLE"
    UNLIKELY = "UNLIKELY"
    CONDITIONAL = "CONDITIONAL"
    UNASSESSABLE = "UNASSESSABLE"
    HUMAN_REVIEW_REQUIRED = "HUMAN_REVIEW_REQUIRED"


class Expectedness(str, enum.Enum):
    EXPECTED = "EXPECTED"
    UNEXPECTED = "UNEXPECTED"
    HUMAN_REVIEW_REQUIRED = "HUMAN_REVIEW_REQUIRED"


class Outcome(str, enum.Enum):
    RECOVERED = "RECOVERED"
    RECOVERING = "RECOVERING"
    NOT_RECOVERED = "NOT_RECOVERED"
    RECOVERED_WITH_SEQUELAE = "RECOVERED_WITH_SEQUELAE"
    FATAL = "FATAL"
    UNKNOWN = "UNKNOWN"


class SafetyCaseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    INITIAL_REPORT_SUBMITTED = "INITIAL_REPORT_SUBMITTED"
    TRIAGE = "TRIAGE"
    MEDICAL_REVIEW = "MEDICAL_REVIEW"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"
    FOLLOW_UP_RECEIVED = "FOLLOW_UP_RECEIVED"
    REGULATORY_REVIEW = "REGULATORY_REVIEW"
    CLOSED_BY_AUTHORISED_HUMAN = "CLOSED_BY_AUTHORISED_HUMAN"
    NULLIFIED = "NULLIFIED"


class AdverseEvent(Base):
    __tablename__ = "adverse_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    case_id = Column(String(50), unique=True, nullable=False, index=True)

    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    participant_id = Column(UUID(as_uuid=True), ForeignKey("participant_pseudonyms.id"), nullable=False)

    event_category = Column(SAEnum(EventCategory, name="eventcategory"), nullable=False)
    event_term = Column(String(500), nullable=False)
    event_narrative = Column(Text, nullable=True)
    preferred_term = Column(String(255), nullable=True)   # MedDRA PT (coding-ready field)
    system_organ_class = Column(String(255), nullable=True)  # MedDRA SOC
    terminology_version = Column(String(50), nullable=True)  # e.g. "MedDRA 27.0"

    # Clinical assessment — requires human review
    seriousness = Column(SAEnum(SeriousnessCategory, name="seriousnesscategory"), nullable=True)
    seriousness_criteria = Column(JSONB, nullable=True)
    severity = Column(SAEnum(Severity, name="severity"), nullable=True)
    causality = Column(SAEnum(Causality, name="causality"), default=Causality.HUMAN_REVIEW_REQUIRED)
    expectedness = Column(SAEnum(Expectedness, name="expectedness"), default=Expectedness.HUMAN_REVIEW_REQUIRED)
    outcome = Column(SAEnum(Outcome, name="outcome"), nullable=True)
    action_taken = Column(Text, nullable=True)

    # Suspected intervention
    suspected_intervention = Column(String(500), nullable=True)
    who_drug_code = Column(String(100), nullable=True)  # coding-ready

    # Timestamps
    occurrence_timestamp = Column(DateTime(timezone=True), nullable=True)
    receipt_timestamp = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    regulatory_due_date = Column(DateTime(timezone=True), nullable=True)
    reported_at = Column(DateTime(timezone=True), nullable=True)

    # Workflow
    status = Column(SAEnum(SafetyCaseStatus, name="safetycasestatus"),
                    nullable=False, default=SafetyCaseStatus.DRAFT)
    reported_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assigned_pv_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    medical_reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    pi_reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Source document
    source_document_ref = Column(String(500), nullable=True)

    # Flags
    is_duplicate = Column(Boolean, default=False)
    parent_case_id = Column(UUID(as_uuid=True), ForeignKey("adverse_events.id"), nullable=True)

    # Correction/nullification
    nullification_reason = Column(Text, nullable=True)
    correction_summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    participant = relationship("ParticipantPseudonym", back_populates="adverse_events")
    reported_by = relationship("User", foreign_keys=[reported_by_id])
    assigned_pv = relationship("User", foreign_keys=[assigned_pv_id])
    medical_reviewer = relationship("User", foreign_keys=[medical_reviewer_id])
    follow_ups = relationship("SafetyFollowUp", back_populates="adverse_event", lazy="select")


class SafetyFollowUp(Base):
    __tablename__ = "safety_follow_ups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    adverse_event_id = Column(UUID(as_uuid=True), ForeignKey("adverse_events.id"), nullable=False)
    follow_up_number = Column(Integer, nullable=False, default=1)
    follow_up_narrative = Column(Text, nullable=False)
    updated_outcome = Column(SAEnum(Outcome, name="followup_outcome"), nullable=True)
    updated_causality = Column(SAEnum(Causality, name="followup_causality"), nullable=True)
    reported_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    adverse_event = relationship("AdverseEvent", back_populates="follow_ups")
    reported_by = relationship("User", foreign_keys=[reported_by_id])


class SafetySignalStatus(str, enum.Enum):
    DETECTED = "DETECTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    MORE_DATA_NEEDED = "MORE_DATA_NEEDED"
    CLOSED = "CLOSED"


class SafetySignal(Base):
    __tablename__ = "safety_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    signal_description = Column(Text, nullable=False)
    suspected_event_term = Column(String(255), nullable=False)
    suspected_intervention = Column(String(500), nullable=False)
    case_ids = Column(JSONB, nullable=True)   # list of AE case IDs
    site_count = Column(Integer, default=1)
    event_count = Column(Integer, default=1)
    detection_method = Column(String(255), nullable=True)
    detection_rationale = Column(Text, nullable=True)
    status = Column(SAEnum(SafetySignalStatus, name="safetysignalstatus"),
                    nullable=False, default=SafetySignalStatus.DETECTED)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    disclaimer = Column(Text, default="Potential pattern detected — requires pharmacovigilance expert review. This does not establish causality.")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    reviewer = relationship("User", foreign_keys=[reviewer_id])
