import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum as SAEnum,
    Text, ForeignKey, Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    PRINCIPAL_INVESTIGATOR = "PRINCIPAL_INVESTIGATOR"
    STUDY_COORDINATOR = "STUDY_COORDINATOR"
    MONITOR = "MONITOR"
    ETHICS_COMMITTEE = "ETHICS_COMMITTEE"
    PHARMACOVIGILANCE_OFFICER = "PHARMACOVIGILANCE_OFFICER"
    LEADERSHIP = "LEADERSHIP"
    REGULATOR = "REGULATOR"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(320), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="userrole"), nullable=False, default=UserRole.STUDY_COORDINATOR)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)

    # Profile
    designation = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)

    # Timestamps (UTC)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Soft-delete / account management
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<User {self.email} role={self.role}>"
