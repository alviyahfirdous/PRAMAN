from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database.session import init_db
from app.api.auth import router as auth_router
from app.api.dashboards import router as dashboards_router
from app.api.studies import router as studies_router
from app.api.assist import router as assist_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("praman")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 PRAMAN starting up...")
    await init_db()
    logger.info("✅ Database tables verified")
    yield
    logger.info("PRAMAN shutting down")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "PRAMAN Clinical Research Command Centre API. "
        "GCP-ASU-aligned controls | ICMR-guideline-supporting workflow | "
        "FHIR R4-ready demo export | CDISC-aligned mapping. "
        "Synthetic demo data — Not submission-ready."
    ),
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboards_router, prefix=settings.API_V1_PREFIX)
app.include_router(studies_router, prefix=settings.API_V1_PREFIX)
app.include_router(assist_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "disclaimer": settings.DISCLAIMER,
    }


@app.get("/")
async def root():
    return {
        "product": "PRAMAN",
        "subtitle": "Trust • Compliance • Safer Trials",
        "version": settings.VERSION,
        "docs": "/api/docs",
        "health": "/health",
        "disclaimer": settings.DISCLAIMER,
    }
