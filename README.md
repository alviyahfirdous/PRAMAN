# PRAMAN — Clinical Research Command Centre
### Trust • Compliance • Safer Trials

> **⚠️ Synthetic demo data — Not submission-ready**
> GCP-ASU-aligned controls | ICMR-guideline-supporting workflow | FHIR R4-ready demo export | CDISC-aligned mapping | Synthetic demo data only

---

## Overview

PRAMAN is a secure, role-based Clinical Trial Management System and Clinical Research Command Centre for Ayurveda research at AIIA. This is a **SIH prototype** using entirely synthetic data.

---

## Quick Start

### Prerequisites
- Docker Desktop (recommended)
- OR: Python 3.12 + Node 20 + PostgreSQL 16 + Redis 7

---

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone and enter directory
cd PRAMAN

# 2. Copy environment template
copy .env.example .env

# 3. Build and start all services
docker-compose up --build

# 4. (In another terminal) Seed synthetic demo data
docker-compose exec backend python -m app.database.seed

# 5. Open in browser
# Frontend: http://localhost:5173
# Backend API docs: http://localhost:8000/api/docs
# Health check: http://localhost:8000/health
```

---

### Option B: Local Development (without Docker)

#### Backend

```bash
cd PRAMAN/backend

# Install Python dependencies
pip install -r requirements.txt

# Ensure PostgreSQL and Redis are running
# Create database: createdb praman

# Copy and configure env
copy .env.example .env
# Edit .env with your local DB credentials

# Start backend
uvicorn app.main:app --reload --port 8000

# Seed demo data (in separate terminal)
cd PRAMAN/backend
python -m app.database.seed
```

#### Frontend

```bash
cd PRAMAN/frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Open: http://localhost:5173
```

---

## Demo Credentials

All demo users have password: **`Demo@123`**

| Role | Email | Dashboard |
|------|-------|-----------|
| Leadership | `leadership@praman.demo` | `/dashboard/leadership` |
| Principal Investigator | `pi@praman.demo` | `/dashboard/pi` |
| Study Coordinator | `coordinator@praman.demo` | `/dashboard/coordinator` |
| Pharmacovigilance Officer | `pv@praman.demo` | `/dashboard/pharmacovigilance` |
| Ethics Committee | `ethics@praman.demo` | `/dashboard/ethics` |
| Monitor | `monitor@praman.demo` | `/dashboard/monitor` |
| Regulator | `regulator@praman.demo` | `/dashboard/leadership` |
| Admin | `admin@praman.demo` | `/dashboard/leadership` |

---

## Architecture

```
PRAMAN/
├── frontend/          React 18 + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── api/       Axios API client with JWT interceptor
│       ├── lib/       Auth store (Zustand), utilities
│       ├── pages/     Login, role dashboards, studies
│       ├── layouts/   AppShell with role-filtered sidebar
│       ├── routes/    ProtectedRoute with role guards
│       └── types/     TypeScript type definitions
├── backend/           Python 3.12 + FastAPI + SQLAlchemy 2
│   └── app/
│       ├── core/      Config, security (bcrypt JWT), deps
│       ├── database/  Async session, seed data
│       ├── models/    User, Study, Site, Participant, AE, Audit…
│       ├── schemas/   Pydantic v2 request/response schemas
│       └── api/       Auth, Dashboard, Studies routers
├── docker-compose.yml PostgreSQL + Redis + Backend + Frontend
└── .env.example       Environment template
```

---

## Technology Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query · React Hook Form · Zod · Recharts · Lucide React · Zustand

**Backend:** Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2 · PostgreSQL · JWT (python-jose) · bcrypt (passlib)

**Infrastructure:** Docker Compose · PostgreSQL 16 · Redis 7 · Celery (Phase 2)

---

## Synthetic Data Summary

| Entity | Count |
|--------|-------|
| Demo users | 8 (all roles) |
| Studies | 6 |
| Sites | 9 |
| Pseudonymised participants | 45+ |
| Adverse events | 5 (1 SAE + 4 GI events) |
| Safety signal | 1 (GI clustering) |
| Ethics reviews | 4 |
| CTRI registrations | 6 |
| Monitoring visits | 3 |
| Protocol deviations | 2 |
| Data queries | 2 |
| AI interactions | 1 |
| Audit events | 8 (hash-chained) |
| Notifications | 6 |

---

## Demo Verification Steps

1. Login as `leadership@praman.demo` → See AyurVeda OA-2026 as HIGH RISK
2. See SAE-2026-041 with 3-hour deadline in Critical Action Queue
3. Login as `pi@praman.demo` → See SAE requiring e-signature
4. Login as `coordinator@praman.demo` → See 8 participants needing re-consent
5. Login as `pv@praman.demo` → See safety signal (4 GI events, 2 sites)
6. Login as `ethics@praman.demo` → See pending review queue
7. Navigate to /studies → See all 6 studies with risk levels
8. Each role sees ONLY their authorised navigation items

---

## Compliance Disclaimers

- This is a **synthetic-data SIH prototype only**
- GCP-ASU-aligned controls (not GCP-certified software)
- ICMR-guideline-supporting workflow (not a certified compliance tool)
- FHIR R4-ready demo export (not validated for submission)
- CDISC-aligned mapping (not submission-ready)
- ABDM integration-ready architecture (not an ABDM-certified product)
- MedDRA / WHO Drug coding-ready fields (licensing required for production)
- Not submission-ready. Not for use with real patient data.

---

## Phase Roadmap

| Phase | Status | Contents |
|-------|--------|----------|
| 1 | ✅ Complete | Auth, roles, dashboards, seed data |
| 2 | 🔄 Planned | Coordinator workflow, participants, visits |
| 3 | 🔄 Planned | SAE workflow, PV deadline engine |
| 4 | 🔄 Planned | Compliance Digital Twin, Risk Radar |
| 5 | 🔄 Planned | Ethics dashboard, protocol comparison |
| 6 | 🔄 Planned | AI Note Structuring, AI Governance Register |
| 7 | 🔄 Planned | FHIR/CDISC exports, inspection pack |
