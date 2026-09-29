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


class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    SUBMIT = "SUBMIT"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    HOLD = "HOLD"
    SIGN = "SIGN"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXPORT = "EXPORT"
    IMPORT = "IMPORT"
    BREAK_GLASS = "BREAK_GLASS"
    ROLE_CHANGE = "ROLE_CHANGE"
    ACCESS_DENIED = "ACCESS_DENIED"
    AI_GENERATE = "AI_GENERATE"
    AI_REVIEW = "AI_REVIEW"
    CORRECTION = "CORRECTION"
    NULLIFICATION = "NULLIFICATION"
    UPLOAD = "UPLOAD"


class AuditEvent(Base):
    """
    Append-only, tamper-evident audit log.
    Hash chain: each event hashes itself + previous_hash.
    Administrators CANNOT edit or delete these records.
    """
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    sequence_number = Column(Integer, autoincrement=True, unique=True, nullable=False)

    # Who
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    actor_email = Column(String(320), nullable=False)
    actor_role = Column(String(100), nullable=False)

    # What
    action = Column(SAEnum(AuditAction, name="auditaction"), nullable=False)
    entity_type = Column(String(100), nullable=False)  # e.g. "AdverseEvent", "Study"
    entity_id = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    # Change detail
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    reason = Column(Text, nullable=True)

    # Context
    study_id = Column(String(100), nullable=True)
    site_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    session_id = Column(String(255), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Source
    is_system_generated = Column(Boolean, default=False)

    # Tamper evidence
    previous_hash = Column(String(64), nullable=True)    # SHA-256 of previous event
    record_hash = Column(String(64), nullable=True)      # SHA-256 of this event

    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    actor = relationship("User", foreign_keys=[actor_id])


class ElectronicSignature(Base):
    __tablename__ = "electronic_signatures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    signer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    meaning = Column(String(500), nullable=False)  # e.g. "I approve this SAE report as medically reviewed"
    signed_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    content_hash = Column(String(64), nullable=False)  # hash of signed content at time of signing
    is_valid = Column(Boolean, default=True)           # invalidated if content changes materially
    invalidation_reason = Column(Text, nullable=True)
    invalidated_at = Column(DateTime(timezone=True), nullable=True)
    re_authenticated = Column(Boolean, default=True)   # must re-auth before signing
    signature_version = Column(Integer, default=1)

    signer = relationship("User", foreign_keys=[signer_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="INFO")  # INFO, WARNING, CRITICAL
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", foreign_keys=[user_id])


class AIInteractionStatus(str, enum.Enum):
    DRAFT_GENERATED = "DRAFT_GENERATED"
    UNDER_HUMAN_REVIEW = "UNDER_HUMAN_REVIEW"
    ACCEPTED_WITH_EDITS = "ACCEPTED_WITH_EDITS"
    ACCEPTED_AS_DRAFT = "ACCEPTED_AS_DRAFT"
    REJECTED = "REJECTED"
    ESCALATED_TO_EXPERT = "ESCALATED_TO_EXPERT"
    EXPIRED = "EXPIRED"


class AIInteraction(Base):
    """AI Governance Register — every AI-assisted action is recorded here."""
    __tablename__ = "ai_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ai_assistance_id = Column(String(50), unique=True, nullable=False)
    feature_name = Column(String(100), nullable=False)
    model_name = Column(String(100), nullable=False, default="mock-local-v1")
    model_version = Column(String(50), nullable=False, default="1.0.0")
    prompt_template_version = Column(String(50), nullable=True, default="1.0.0")

    input_record_ids = Column(JSONB, nullable=True)
    input_hash = Column(String(64), nullable=True)

    raw_input = Column(Text, nullable=True)
    generated_output = Column(JSONB, nullable=True)
    output_hash = Column(String(64), nullable=True)

    uncertainty_metadata = Column(JSONB, nullable=True)

    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    review_status = Column(SAEnum(AIInteractionStatus, name="aiinteractionstatus"),
                            nullable=False, default=AIInteractionStatus.DRAFT_GENERATED)
    edit_summary = Column(Text, nullable=True)
    override_reason = Column(Text, nullable=True)
    final_output = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    finalised_at = Column(DateTime(timezone=True), nullable=True)

    reviewer = relationship("User", foreign_keys=[reviewer_id])
