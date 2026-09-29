from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "PRAMAN Clinical Research Command Centre"
    VERSION: str = "0.1.0-mvp"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    DISCLAIMER: str = (
        "PRAMAN is a synthetic-data SIH prototype. "
        "GCP-ASU-aligned controls | ICMR-guideline-supporting workflow | "
        "FHIR R4-ready demo export | CDISC-aligned mapping. "
        "Not submission-ready. Synthetic demo data only."
    )

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(64)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://praman_user:praman_secret@localhost:5432/praman"
    DATABASE_URL_SYNC: str = "postgresql://praman_user:praman_secret@localhost:5432/praman"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @property
    def allowed_origins(self) -> List[str]:
        return [self.FRONTEND_ORIGIN, "http://localhost:3000", "http://localhost:5174"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
