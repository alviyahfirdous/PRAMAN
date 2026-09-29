"""
PRAMAN Synthetic Demo Seed Data
================================
All data is synthetic. No real patient, clinical, or institutional data.
This seed is for SIH prototype demonstration only.
"""
import asyncio
import uuid
import hashlib
import json
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    User, UserRole,
    Study, Site, StudyPhase, StudyStatus, RiskLevel, SiteStatus,
    ParticipantPseudonym, ConsentVersion, ConsentEvent, Visit,
    ParticipantStatus, ConsentStatus, VisitStatus,
    AdverseEvent, SafetyFollowUp, SafetySignal,
    EventCategory, SeriousnessCategory, Severity, Causality,
    Expectedness, Outcome, SafetyCaseStatus, SafetySignalStatus,
    AuditEvent, Notification, AIInteraction, AIInteractionStatus, AuditAction,
    EthicsReview, CTRIRegistration, ProtocolDeviation, MonitoringVisit, DataQuery,
    EthicsDecision, EthicsSubmissionType, CTRIStatus,
)
from app.database.session import Base

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

TODAY = date.today()
NOW = datetime.now(timezone.utc)

DEMO_PASSWORD = get_password_hash("Demo@123")


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


async def seed(db: AsyncSession):
    print("🌱 Seeding PRAMAN demo data...")

    # ─── USERS ────────────────────────────────────────────
    users = {}

    user_defs = [
        ("admin@praman.demo", "admin", "Admin User", UserRole.ADMIN, "System Administrator", "IT"),
        ("pi@praman.demo", "pi", "Dr. Arjun Sharma", UserRole.PRINCIPAL_INVESTIGATOR, "Principal Investigator", "Clinical Research"),
        ("coordinator@praman.demo", "coordinator", "Priya Nair", UserRole.STUDY_COORDINATOR, "Study Coordinator", "Research Operations"),
        ("monitor@praman.demo", "monitor", "Karan Mehta", UserRole.MONITOR, "Clinical Research Associate", "Monitoring"),
        ("ethics@praman.demo", "ethics", "Dr. Sunita Rao", UserRole.ETHICS_COMMITTEE, "Ethics Committee Member", "IEC"),
        ("pv@praman.demo", "pv", "Dr. Vikram Singh", UserRole.PHARMACOVIGILANCE_OFFICER, "Pharmacovigilance Officer", "Drug Safety"),
        ("leadership@praman.demo", "leadership", "Dr. Meena Iyer", UserRole.LEADERSHIP, "Director of Research", "Leadership"),
        ("regulator@praman.demo", "regulator", "Ravi Kumar", UserRole.REGULATOR, "Regulatory Observer", "External"),
    ]

    for email, username, full_name, role, designation, dept in user_defs:
        u = User(
            id=uuid.uuid4(),
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=DEMO_PASSWORD,
            role=role,
            designation=designation,
            department=dept,
            is_active=True,
            is_verified=True,
        )
        db.add(u)
        users[username] = u

    await db.flush()
    print(f"  ✓ Created {len(users)} demo users")

    # ─── STUDIES ──────────────────────────────────────────
    pi_user = users["pi"]
    admin_user = users["admin"]

    study_defs = [
        {
            "protocol_id": "AIIA-OA-2026-001",
            "title": "Efficacy and Safety of Ayurvedic Formulation in Osteoarthritis of Knee",
            "short_title": "AyurVeda OA-2026",
            "phase": StudyPhase.PHASE_3,
            "status": StudyStatus.ACTIVE,
            "risk_level": RiskLevel.HIGH,
            "target_enrolment": 150,
            "actual_enrolment": 82,
            "therapeutic_area": "Musculoskeletal",
            "intervention": "Vatari Guggulu 500mg TID",
            "ctri_number": "CTRI/2026/01/000001",
            "iec_approval_number": "AIIA/IEC/2025/12",
            "iec_renewal_due": TODAY + timedelta(days=12),
            "ctri_update_due": TODAY + timedelta(days=5),
            "data_quality_score": 78.0,
            "compliance_score": 71.0,
            "overall_risk_score": 78.0,
            "planned_start_date": date(2026, 1, 15),
            "screen_failure_count": 18,
            "description": "A randomized, double-blind, placebo-controlled trial to evaluate the efficacy and safety of Vatari Guggulu in patients with osteoarthritis of the knee. GCP-ASU-aligned controls | ICMR-guideline-supporting workflow.",
        },
        {
            "protocol_id": "AIIA-DM-2025-002",
            "title": "PramehaCare: Integrated Ayurvedic Management of Type 2 Diabetes Mellitus",
            "short_title": "PramehaCare",
            "phase": StudyPhase.PHASE_3,
            "status": StudyStatus.ACTIVE,
            "risk_level": RiskLevel.LOW,
            "target_enrolment": 500,
            "actual_enrolment": 410,
            "therapeutic_area": "Endocrinology / Diabetes",
            "intervention": "Nishamalaki Tablet + Lifestyle Module",
            "ctri_number": "CTRI/2025/06/000042",
            "iec_approval_number": "AIIA/IEC/2025/06",
            "iec_renewal_due": TODAY + timedelta(days=90),
            "ctri_update_due": TODAY + timedelta(days=60),
            "data_quality_score": 92.0,
            "compliance_score": 94.0,
            "overall_risk_score": 22.0,
            "planned_start_date": date(2025, 6, 1),
            "screen_failure_count": 45,
            "description": "A pragmatic randomized trial evaluating integrated Ayurvedic management including Nishamalaki Tablet and structured lifestyle intervention in T2DM. CDISC-aligned mapping.",
        },
        {
            "protocol_id": "AIIA-GI-2026-003",
            "title": "AgniBalance: Ayurvedic Formulation for Functional Gastrointestinal Disorders",
            "short_title": "AgniBalance",
            "phase": StudyPhase.PHASE_2,
            "status": StudyStatus.ACTIVE,
            "risk_level": RiskLevel.HIGH,
            "target_enrolment": 120,
            "actual_enrolment": 43,
            "therapeutic_area": "Gastroenterology",
            "intervention": "Chitrakadi Vati 250mg BID",
            "ctri_number": "CTRI/2026/03/000089",
            "iec_approval_number": "AIIA/IEC/2026/01",
            "iec_renewal_due": TODAY + timedelta(days=45),
            "ctri_update_due": TODAY + timedelta(days=20),
            "data_quality_score": 81.0,
            "compliance_score": 76.0,
            "overall_risk_score": 71.0,
            "planned_start_date": date(2026, 3, 1),
            "screen_failure_count": 12,
            "description": "Phase 2 exploratory trial of Chitrakadi Vati in functional GI disorders. ABDM integration-ready architecture.",
        },
        {
            "protocol_id": "AIIA-INS-2025-004",
            "title": "NidraShanti: Evaluation of Ashwagandha-based Formulation for Insomnia",
            "short_title": "NidraShanti",
            "phase": StudyPhase.PHASE_3,
            "status": StudyStatus.ACTIVE,
            "risk_level": RiskLevel.MEDIUM,
            "target_enrolment": 200,
            "actual_enrolment": 134,
            "therapeutic_area": "Neurology / Sleep Medicine",
            "intervention": "Ashwagandha KSM-66 300mg BD",
            "ctri_number": "CTRI/2025/09/000156",
            "iec_approval_number": "AIIA/IEC/2025/08",
            "iec_renewal_due": TODAY + timedelta(days=55),
            "ctri_update_due": TODAY + timedelta(days=35),
            "data_quality_score": 88.0,
            "compliance_score": 85.0,
            "overall_risk_score": 42.0,
            "planned_start_date": date(2025, 9, 1),
            "screen_failure_count": 22,
            "description": "Randomized controlled trial of KSM-66 Ashwagandha in primary insomnia. FHIR R4-ready demo export.",
        },
        {
            "protocol_id": "AIIA-RESP-2024-005",
            "title": "Respiratory Wellness: Herbal Formulation in Chronic Obstructive Pulmonary Disease",
            "short_title": "Respiratory Wellness",
            "phase": StudyPhase.PHASE_3,
            "status": StudyStatus.COMPLETED,
            "risk_level": RiskLevel.LOW,
            "target_enrolment": 180,
            "actual_enrolment": 178,
            "therapeutic_area": "Respiratory",
            "intervention": "Talisadi Churna + Supportive Care",
            "ctri_number": "CTRI/2024/02/000034",
            "iec_approval_number": "AIIA/IEC/2024/01",
            "iec_renewal_due": None,
            "ctri_update_due": None,
            "data_quality_score": 96.0,
            "compliance_score": 97.0,
            "overall_risk_score": 8.0,
            "planned_start_date": date(2024, 2, 1),
            "screen_failure_count": 8,
            "description": "Completed Phase 3 trial of Talisadi Churna in COPD. Close-out documentation pending archival.",
        },
        {
            "protocol_id": "AIIA-SR-2026-006",
            "title": "PainRelief Safety Registry: Post-Market Safety Surveillance of Ayurvedic Analgesics",
            "short_title": "PainRelief Safety Registry",
            "phase": StudyPhase.REGISTRY,
            "status": StudyStatus.ACTIVE,
            "risk_level": RiskLevel.LOW,
            "target_enrolment": 1000,
            "actual_enrolment": 437,
            "therapeutic_area": "Pain Management",
            "intervention": "Various Ayurvedic Analgesic Formulations (Registry)",
            "ctri_number": "CTRI/2026/01/000018",
            "iec_approval_number": "AIIA/IEC/2025/11",
            "iec_renewal_due": TODAY + timedelta(days=120),
            "ctri_update_due": TODAY + timedelta(days=75),
            "data_quality_score": 91.0,
            "compliance_score": 90.0,
            "overall_risk_score": 18.0,
            "planned_start_date": date(2026, 1, 1),
            "screen_failure_count": 0,
            "description": "Ongoing pharmacovigilance registry for post-market safety surveillance of commonly used Ayurvedic analgesic formulations. MedDRA/WHO Drug coding-ready fields.",
        },
    ]

    studies = {}
    for sd in study_defs:
        s = Study(
            id=uuid.uuid4(),
            principal_investigator_id=pi_user.id,
            created_by_id=admin_user.id,
            planned_start_date=sd.pop("planned_start_date", None),
            **sd
        )
        db.add(s)
        studies[s.short_title] = s

    await db.flush()
    print(f"  ✓ Created {len(studies)} studies")

    # ─── SITES ────────────────────────────────────────────
    oa_study = studies["AyurVeda OA-2026"]
    pramoha = studies["PramehaCare"]
    agni = studies["AgniBalance"]

    site_defs = [
        (oa_study, "DEL-01", "AIIA Main Campus, New Delhi", "New Delhi", "Delhi", SiteStatus.ACTIVE, 50, 38, RiskLevel.LOW, 0),
        (oa_study, "DEL-02", "AIIA Extension Centre, Dwarka", "New Delhi", "Delhi", SiteStatus.ACTIVE, 50, 19, RiskLevel.HIGH, 9),
        (oa_study, "JAI-01", "Jaipur Research Site", "Jaipur", "Rajasthan", SiteStatus.ACTIVE, 50, 25, RiskLevel.MEDIUM, 0),
        (pramoha, "MUM-01", "Mumbai Clinical Centre", "Mumbai", "Maharashtra", SiteStatus.ACTIVE, 250, 215, RiskLevel.LOW, 0),
        (pramoha, "PUN-01", "Pune Diabetes Clinic", "Pune", "Maharashtra", SiteStatus.ACTIVE, 250, 195, RiskLevel.LOW, 0),
        (agni, "DEL-03", "AIIA GI Research Unit", "New Delhi", "Delhi", SiteStatus.ACTIVE, 60, 24, RiskLevel.HIGH, 5),
        (agni, "CHE-01", "Chennai Gastro Centre", "Chennai", "Tamil Nadu", SiteStatus.ACTIVE, 60, 19, RiskLevel.MEDIUM, 0),
        (studies["NidraShanti"], "BLR-01", "Bangalore Sleep Clinic", "Bengaluru", "Karnataka", SiteStatus.ACTIVE, 200, 134, RiskLevel.LOW, 0),
        (studies["PainRelief Safety Registry"], "NAT-01", "National Registry Site", "New Delhi", "Delhi", SiteStatus.ACTIVE, 1000, 437, RiskLevel.LOW, 0),
    ]

    sites = {}
    for study_ref, code, name, city, state, status, tgt, actual, risk, overdue in site_defs:
        s = Site(
            id=uuid.uuid4(),
            study_id=study_ref.id,
            site_code=code,
            site_name=name,
            city=city,
            state=state,
            status=status,
            target_enrolment=tgt,
            actual_enrolment=actual,
            risk_level=risk,
            site_investigator_id=pi_user.id,
            monitoring_overdue_days=overdue,
            last_monitoring_visit=TODAY - timedelta(days=45 + overdue),
            next_monitoring_visit=TODAY + timedelta(days=30),
        )
        db.add(s)
        sites[code] = s

    await db.flush()
    print(f"  ✓ Created {len(sites)} sites")

    # ─── CONSENT VERSIONS ─────────────────────────────────
    cv1 = ConsentVersion(
        id=uuid.uuid4(),
        study_id=oa_study.id,
        version_number="v1.0",
        language="English",
        format="Written",
        approved=True,
        iec_approved_date=date(2025, 12, 15),
        effective_date=date(2026, 1, 15),
        re_consent_required=False,
        created_by_id=admin_user.id,
    )
    cv2 = ConsentVersion(
        id=uuid.uuid4(),
        study_id=oa_study.id,
        version_number="v2.0",
        language="English",
        format="Written",
        approved=True,
        iec_approved_date=date(2026, 4, 1),
        effective_date=date(2026, 4, 10),
        re_consent_required=True,
        change_summary="Updated risk section: added gastrointestinal adverse events based on interim safety review. Re-consent required for all active participants.",
        created_by_id=admin_user.id,
    )
    cv_hindi = ConsentVersion(
        id=uuid.uuid4(),
        study_id=oa_study.id,
        version_number="v2.0-HI",
        language="Hindi",
        format="Written",
        approved=True,
        iec_approved_date=date(2026, 4, 5),
        effective_date=date(2026, 4, 15),
        re_consent_required=True,
        change_summary="Hindi translation of v2.0.",
        created_by_id=admin_user.id,
    )
    db.add_all([cv1, cv2, cv_hindi])
    await db.flush()
    print("  ✓ Created consent versions")

    # ─── PARTICIPANTS ──────────────────────────────────────
    coordinator = users["coordinator"]
    site_del01 = sites["DEL-01"]
    site_del02 = sites["DEL-02"]
    site_jai01 = sites["JAI-01"]

    participants = []
    # DEL-01 participants
    for i in range(1, 21):
        needs_reconsent = i <= 4
        p = ParticipantPseudonym(
            id=uuid.uuid4(),
            pseudonymised_subject_id=f"SUB-DEL01-{i:04d}",
            study_id=oa_study.id,
            site_id=site_del01.id,
            status=ParticipantStatus.ACTIVE if i <= 18 else ParticipantStatus.COMPLETED,
            consent_status=ConsentStatus.RE_CONSENT_REQUIRED if needs_reconsent else ConsentStatus.OBTAINED,
            screening_date=date(2026, 2, i),
            enrollment_date=date(2026, 2, i + 7),
            re_consent_required=needs_reconsent,
            re_consent_reason="Protocol v2.0 updated risk section — re-consent required." if needs_reconsent else None,
            re_consent_deadline=TODAY + timedelta(days=7) if needs_reconsent else None,
            assigned_coordinator_id=coordinator.id,
            created_by_id=coordinator.id,
        )
        db.add(p)
        participants.append(p)

    # DEL-02 participants (fewer — below target)
    for i in range(1, 12):
        needs_reconsent = i <= 4
        p = ParticipantPseudonym(
            id=uuid.uuid4(),
            pseudonymised_subject_id=f"SUB-DEL02-{i:04d}",
            study_id=oa_study.id,
            site_id=site_del02.id,
            status=ParticipantStatus.ACTIVE,
            consent_status=ConsentStatus.RE_CONSENT_REQUIRED if needs_reconsent else ConsentStatus.OBTAINED,
            screening_date=date(2026, 2, i + 2),
            enrollment_date=date(2026, 2, i + 10),
            re_consent_required=needs_reconsent,
            re_consent_reason="Protocol v2.0 updated risk section — re-consent required." if needs_reconsent else None,
            re_consent_deadline=TODAY + timedelta(days=5) if needs_reconsent else None,
            assigned_coordinator_id=coordinator.id,
            created_by_id=coordinator.id,
        )
        db.add(p)
        participants.append(p)

    # JAI-01 participants
    for i in range(1, 14):
        p = ParticipantPseudonym(
            id=uuid.uuid4(),
            pseudonymised_subject_id=f"SUB-JAI01-{i:04d}",
            study_id=oa_study.id,
            site_id=site_jai01.id,
            status=ParticipantStatus.ACTIVE,
            consent_status=ConsentStatus.OBTAINED,
            screening_date=date(2026, 3, i),
            enrollment_date=date(2026, 3, i + 7),
            assigned_coordinator_id=coordinator.id,
            created_by_id=coordinator.id,
        )
        db.add(p)
        participants.append(p)

    await db.flush()
    print(f"  ✓ Created {len(participants)} pseudonymised participants")

    # ─── CONSENT EVENTS ───────────────────────────────────
    for p in participants[:10]:
        ce = ConsentEvent(
            id=uuid.uuid4(),
            participant_id=p.id,
            consent_version_id=cv1.id,
            event_type="INITIAL",
            signed_at=NOW - timedelta(days=30),
            obtained_by_id=coordinator.id,
            language_used="English",
            comprehension_confirmed=True,
            voluntary_confirmed=True,
            coercion_screened=True,
            consent_future_research=True,
            consent_samples=True,
        )
        db.add(ce)

    await db.flush()

    # ─── ADVERSE EVENTS (Safety Signal Seed) ──────────────
    pv_officer = users["pv"]
    # SAE that needs PI signature (critical case)
    sae_critical = AdverseEvent(
        id=uuid.uuid4(),
        case_id="SAE-2026-041",
        study_id=oa_study.id,
        site_id=site_del01.id,
        participant_id=participants[0].id,
        event_category=EventCategory.SAE,
        event_term="Severe Hepatotoxicity",
        event_narrative=(
            "Participant SUB-DEL01-0001 presented with jaundice and elevated liver enzymes at Week 8 visit. "
            "Admitted to hospital on D+56. Liver function tests: ALT 450 U/L, AST 380 U/L. "
            "Study formulation was temporarily withheld. Causality and expectedness require medical review."
        ),
        seriousness=SeriousnessCategory.HOSPITALISATION,
        severity=Severity.SEVERE,
        causality=Causality.HUMAN_REVIEW_REQUIRED,
        expectedness=Expectedness.HUMAN_REVIEW_REQUIRED,
        outcome=Outcome.RECOVERING,
        action_taken="Study drug withheld. Supportive treatment initiated. Hepatology consult requested.",
        suspected_intervention="Vatari Guggulu 500mg TID",
        occurrence_timestamp=NOW - timedelta(hours=30),
        receipt_timestamp=NOW - timedelta(hours=20),
        regulatory_due_date=NOW + timedelta(hours=3),  # 3 hours remaining!
        status=SafetyCaseStatus.MEDICAL_REVIEW,
        reported_by_id=coordinator.id,
        assigned_pv_id=pv_officer.id,
        pi_reviewer_id=pi_user.id,
    )
    db.add(sae_critical)

    # Four GI events across two sites within 14 days (safety signal seed)
    gi_events = [
        ("AE-2026-101", "Severe abdominal pain and vomiting", site_del02, participants[10], NOW - timedelta(days=13)),
        ("AE-2026-102", "Nausea, abdominal cramps, loose stools", site_del02, participants[11], NOW - timedelta(days=10)),
        ("AE-2026-103", "Severe epigastric pain and nausea", site_jai01, participants[20], NOW - timedelta(days=7)),
        ("AE-2026-104", "Abdominal distension and vomiting", site_jai01, participants[21], NOW - timedelta(days=4)),
    ]

    gi_ae_objects = []
    for case_id, term, site, participant, occ_time in gi_events:
        ae = AdverseEvent(
            id=uuid.uuid4(),
            case_id=case_id,
            study_id=oa_study.id,
            site_id=site.id,
            participant_id=participant.id,
            event_category=EventCategory.AE,
            event_term=term,
            seriousness=SeriousnessCategory.NOT_SERIOUS,
            severity=Severity.MODERATE,
            causality=Causality.HUMAN_REVIEW_REQUIRED,
            expectedness=Expectedness.HUMAN_REVIEW_REQUIRED,
            outcome=Outcome.RECOVERING,
            action_taken="Symptomatic treatment. Study drug continued.",
            suspected_intervention="Vatari Guggulu 500mg TID",
            occurrence_timestamp=occ_time,
            receipt_timestamp=occ_time + timedelta(hours=4),
            regulatory_due_date=occ_time + timedelta(days=15),
            status=SafetyCaseStatus.TRIAGE,
            reported_by_id=coordinator.id,
            assigned_pv_id=pv_officer.id,
        )
        db.add(ae)
        gi_ae_objects.append(ae)

    await db.flush()

    # Safety Signal
    signal = SafetySignal(
        id=uuid.uuid4(),
        signal_description=(
            "Potential clustering of gastrointestinal adverse events (abdominal pain, vomiting, nausea) "
            "across DEL-02 and JAI-01 sites within a 14-day window. "
            "All events involve the same study formulation (Vatari Guggulu 500mg TID). "
            "4 events detected across 2 sites. Review required by pharmacovigilance expert."
        ),
        suspected_event_term="Gastrointestinal disorders (abdominal pain, vomiting, nausea)",
        suspected_intervention="Vatari Guggulu 500mg TID",
        case_ids=[str(ae.id) for ae in gi_ae_objects],
        site_count=2,
        event_count=4,
        detection_method="Rule-based clustering: ≥3 similar events, same intervention, ≥2 sites, 14-day window",
        detection_rationale="Transparent rule-based detection. Does not establish causality. Human pharmacovigilance review required.",
        status=SafetySignalStatus.DETECTED,
        disclaimer="Potential pattern detected — requires pharmacovigilance expert review. This does not establish causality.",
    )
    db.add(signal)
    print("  ✓ Created adverse events and safety signal")

    # ─── ETHICS REVIEWS ───────────────────────────────────
    ethics_user = users["ethics"]
    ethics_reviews = [
        EthicsReview(
            id=uuid.uuid4(),
            study_id=oa_study.id,
            protocol_id="AIIA-OA-2026-001",
            submission_type=EthicsSubmissionType.INITIAL_APPROVAL,
            protocol_version="v1.0",
            submission_date=date(2025, 11, 1),
            due_date=date(2025, 12, 1),
            decision=EthicsDecision.APPROVED,
            decision_date=date(2025, 12, 10),
            assigned_reviewer_id=ethics_user.id,
            pi_id=pi_user.id,
        ),
        EthicsReview(
            id=uuid.uuid4(),
            study_id=oa_study.id,
            protocol_id="AIIA-OA-2026-001",
            submission_type=EthicsSubmissionType.AMENDMENT,
            protocol_version="v2.0",
            submission_date=date(2026, 3, 15),
            due_date=date(2026, 4, 1),
            decision=EthicsDecision.APPROVED,
            decision_date=date(2026, 3, 28),
            decision_notes="Amendment approved. Updated risk language is appropriate. Re-consent required for all active participants.",
            assigned_reviewer_id=ethics_user.id,
            pi_id=pi_user.id,
        ),
        EthicsReview(
            id=uuid.uuid4(),
            study_id=oa_study.id,
            protocol_id="AIIA-OA-2026-001",
            submission_type=EthicsSubmissionType.CONTINUING_REVIEW,
            protocol_version="v2.0",
            submission_date=TODAY - timedelta(days=5),
            due_date=TODAY + timedelta(days=12),
            decision=EthicsDecision.PENDING,
            assigned_reviewer_id=ethics_user.id,
            pi_id=pi_user.id,
        ),
        EthicsReview(
            id=uuid.uuid4(),
            study_id=oa_study.id,
            protocol_id="AIIA-OA-2026-001",
            submission_type=EthicsSubmissionType.SAE_REPORT,
            protocol_version="v2.0",
            submission_date=TODAY - timedelta(days=1),
            due_date=TODAY + timedelta(days=7),
            decision=EthicsDecision.PENDING,
            assigned_reviewer_id=ethics_user.id,
            pi_id=pi_user.id,
            document_reference="SAE-2026-041",
        ),
    ]
    db.add_all(ethics_reviews)

    # ─── CTRI REGISTRATIONS ───────────────────────────────
    for study_obj in studies.values():
        if study_obj.ctri_number:
            ctri = CTRIRegistration(
                id=uuid.uuid4(),
                study_id=study_obj.id,
                ctri_number=study_obj.ctri_number,
                registration_date=study_obj.planned_start_date or date(2025, 1, 1),
                status=CTRIStatus.UPDATE_REQUIRED if study_obj.ctri_update_due and (study_obj.ctri_update_due - TODAY).days <= 30 else CTRIStatus.REGISTERED,
                next_update_due=study_obj.ctri_update_due,
                last_update_date=TODAY - timedelta(days=60),
            )
            db.add(ctri)

    # ─── MONITORING VISITS ────────────────────────────────
    monitor = users["monitor"]
    mvs = [
        MonitoringVisit(id=uuid.uuid4(), visit_id="MON-DEL01-001", study_id=oa_study.id, site_id=site_del01.id,
                        monitor_id=monitor.id, visit_type="ROUTINE", planned_date=TODAY - timedelta(days=30),
                        actual_date=TODAY - timedelta(days=28), status="COMPLETED", findings_count=4,
                        open_findings_count=1, sdv_percentage=87.5),
        MonitoringVisit(id=uuid.uuid4(), visit_id="MON-DEL02-001", study_id=oa_study.id, site_id=site_del02.id,
                        monitor_id=monitor.id, visit_type="ROUTINE", planned_date=TODAY - timedelta(days=9),
                        actual_date=None, status="OVERDUE", findings_count=0, open_findings_count=0,
                        sdv_percentage=None),
        MonitoringVisit(id=uuid.uuid4(), visit_id="MON-JAI01-001", study_id=oa_study.id, site_id=site_jai01.id,
                        monitor_id=monitor.id, visit_type="ROUTINE", planned_date=TODAY + timedelta(days=14),
                        actual_date=None, status="PLANNED", findings_count=0, open_findings_count=0,
                        sdv_percentage=None),
    ]
    db.add_all(mvs)

    # ─── PROTOCOL DEVIATIONS ──────────────────────────────
    devs = [
        ProtocolDeviation(id=uuid.uuid4(), deviation_id="DEV-2026-001", study_id=oa_study.id,
                          site_id=site_del02.id, participant_id=participants[10].id,
                          deviation_type="VISIT_WINDOW", severity="MINOR",
                          description="Visit 4 conducted 3 days outside the allowed ±7 day window due to participant travel.",
                          status="OPEN", occurrence_date=TODAY - timedelta(days=15),
                          detected_date=TODAY - timedelta(days=14), reported_by_id=coordinator.id),
        ProtocolDeviation(id=uuid.uuid4(), deviation_id="DEV-2026-002", study_id=oa_study.id,
                          site_id=site_del01.id, participant_id=participants[5].id,
                          deviation_type="ELIGIBILITY", severity="MAJOR",
                          description="Enrolled participant found to have creatinine level slightly above upper limit at baseline. Missed during screening.",
                          status="UNDER_REVIEW", occurrence_date=TODAY - timedelta(days=20),
                          detected_date=TODAY - timedelta(days=18), reported_by_id=coordinator.id,
                          pi_reviewed=False, iec_notified=False, capa_required=True),
    ]
    db.add_all(devs)

    # ─── DATA QUERIES ─────────────────────────────────────
    queries = [
        DataQuery(id=uuid.uuid4(), query_id="QRY-2026-001", study_id=oa_study.id,
                  site_id=site_del01.id, participant_id=participants[2].id,
                  field_name="VAS_PAIN_SCORE_W4", query_text="VAS pain score at Week 4 is missing. Please provide.",
                  raised_by_id=monitor.id, status="OPEN",
                  raised_at=NOW - timedelta(days=5)),
        DataQuery(id=uuid.uuid4(), query_id="QRY-2026-002", study_id=oa_study.id,
                  site_id=site_del02.id,
                  field_name="CONCOMITANT_MED", query_text="Concomitant medication list is incomplete for Visit 2.",
                  raised_by_id=monitor.id, status="OPEN",
                  raised_at=NOW - timedelta(days=3)),
    ]
    db.add_all(queries)

    # ─── AI INTERACTION SAMPLE ────────────────────────────
    raw_note = (
        "Participant SUB-DEL-0042 came for Week 4 visit. After taking the study formulation yesterday evening, "
        "the participant had severe stomach pain and vomiting. The participant was taken to a nearby hospital. "
        "Symptoms improved after treatment. Coordinator informed Dr Rao today at 10:15 AM. "
        "Participant is currently stable."
    )
    structured_output = {
        "participant": {"value": "SUB-DEL-0042", "confidence": "HIGH", "label": "Extracted"},
        "visit": {"value": "Week 4", "confidence": "HIGH", "label": "Extracted"},
        "event_terms": {"value": ["abdominal pain", "vomiting"], "confidence": "HIGH", "label": "Extracted"},
        "severity": {"value": "Severe", "confidence": "MEDIUM", "label": "Suggested — verify"},
        "seriousness": {"value": None, "confidence": None, "label": "Human assessment required"},
        "suspected_intervention": {"value": "Study formulation", "confidence": "MEDIUM", "label": "Suggested — verify"},
        "action_taken": {"value": "Hospital treatment", "confidence": "HIGH", "label": "Extracted"},
        "outcome": {"value": "Stable/improving", "confidence": "MEDIUM", "label": "Suggested — verify"},
        "causality": {"value": None, "confidence": None, "label": "Human assessment required"},
        "expectedness": {"value": None, "confidence": None, "label": "Human assessment required"},
        "missing_fields": {
            "value": ["exact onset date/time", "hospitalisation details", "causality", "expectedness"],
            "label": "Missing — manual entry required",
        },
    }
    ai_interaction = AIInteraction(
        id=uuid.uuid4(),
        ai_assistance_id="AI-NS-2026-0001",
        feature_name="AE/SAE Note Structuring",
        model_name="mock-local-v1",
        model_version="1.0.0",
        prompt_template_version="1.0.0",
        input_record_ids=["SUB-DEL-0042"],
        input_hash=hashlib.sha256(raw_note.encode()).hexdigest(),
        raw_input=raw_note,
        generated_output=structured_output,
        output_hash=hashlib.sha256(json.dumps(structured_output, sort_keys=True).encode()).hexdigest(),
        uncertainty_metadata={
            "overall_confidence": "MEDIUM",
            "fields_requiring_human_review": ["seriousness", "causality", "expectedness"],
            "disclaimer": "AI draft only. Human review required before submission.",
        },
        review_status=AIInteractionStatus.UNDER_HUMAN_REVIEW,
    )
    db.add(ai_interaction)

    # ─── NOTIFICATIONS ────────────────────────────────────
    notif_defs = [
        (users["pi"], "SAE Requires Urgent Review", "SAE-2026-041 requires your e-signature. 3 hours remaining.", "CRITICAL", "AdverseEvent", "SAE-2026-041"),
        (users["pi"], "IEC Renewal Due in 12 Days", "IEC renewal for AyurVeda OA-2026 is due in 12 days.", "WARNING", "EthicsReview", None),
        (users["coordinator"], "Re-consent Required", "8 participants require re-consent under protocol v2.0.", "WARNING", "Study", str(oa_study.id)),
        (users["pv"], "Safety Signal Detected", "Potential GI event clustering detected across DEL-02 and JAI-01. Review required.", "CRITICAL", "SafetySignal", None),
        (users["monitor"], "Monitoring Visit Overdue", "DEL-02 monitoring visit is overdue by 9 days.", "CRITICAL", "MonitoringVisit", None),
        (users["leadership"], "CTRI Update Due in 5 Days", "AyurVeda OA-2026 CTRI update is due in 5 days.", "WARNING", "CTRIRegistration", None),
    ]

    for user_obj, title, message, severity, entity_type, entity_id in notif_defs:
        n = Notification(
            id=uuid.uuid4(),
            user_id=user_obj.id,
            title=title,
            message=message,
            severity=severity,
            entity_type=entity_type,
            entity_id=entity_id,
            is_read=False,
        )
        db.add(n)

    # ─── AUDIT EVENTS ─────────────────────────────────────
    def make_hash(content: str, prev_hash: str = "") -> str:
        return hashlib.sha256(f"{prev_hash}{content}".encode()).hexdigest()

    prev_hash = ""
    audit_defs = [
        (admin_user, AuditAction.CREATE, "User", "admin@praman.demo", "Demo user created", None, {"action": "seed"}),
        (admin_user, AuditAction.CREATE, "Study", "AIIA-OA-2026-001", "Study created", None, {"protocol_id": "AIIA-OA-2026-001"}),
        (coordinator.id, AuditAction.CREATE, "ParticipantPseudonym", "SUB-DEL01-0001", "Participant pseudonym created", None, None),
        (coordinator.id, AuditAction.CREATE, "ConsentEvent", "SUB-DEL01-0001", "Initial consent obtained", None, None),
        (coordinator.id, AuditAction.CREATE, "AdverseEvent", "SAE-2026-041", "SAE report created (DRAFT)", None, {"case_id": "SAE-2026-041"}),
        (coordinator.id, AuditAction.SUBMIT, "AdverseEvent", "SAE-2026-041", "SAE submitted for triage", {"status": "DRAFT"}, {"status": "INITIAL_REPORT_SUBMITTED"}),
        (pv_officer.id, AuditAction.UPDATE, "AdverseEvent", "SAE-2026-041", "SAE moved to medical review", {"status": "TRIAGE"}, {"status": "MEDICAL_REVIEW"}),
        (admin_user, AuditAction.CREATE, "AIInteraction", "AI-NS-2026-0001", "AI note structuring draft generated", None, {"feature": "AE/SAE Note Structuring"}),
    ]

    seq = 1
    for actor, action, entity_type, entity_id, desc, old_val, new_val in audit_defs:
        actor_obj = actor if isinstance(actor, User) else admin_user
        content = f"{seq}|{actor_obj.email}|{action.value}|{entity_type}|{entity_id}|{desc}"
        record_hash = make_hash(content, prev_hash)
        ae_ev = AuditEvent(
            id=uuid.uuid4(),
            sequence_number=seq,
            actor_id=actor_obj.id,
            actor_email=actor_obj.email,
            actor_role=actor_obj.role.value,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            description=desc,
            old_value=old_val,
            new_value=new_val,
            previous_hash=prev_hash,
            record_hash=record_hash,
            is_system_generated=(actor_obj == admin_user),
            timestamp=NOW - timedelta(minutes=(len(audit_defs) - seq) * 10),
        )
        db.add(ae_ev)
        prev_hash = record_hash
        seq += 1

    await db.commit()
    print(f"  ✓ Created {seq - 1} audit events")
    print("\n✅ Seed complete!")
    print("\n📋 Demo credentials:")
    print("   admin@praman.demo / Demo@123 (ADMIN)")
    print("   pi@praman.demo / Demo@123 (PRINCIPAL_INVESTIGATOR)")
    print("   coordinator@praman.demo / Demo@123 (STUDY_COORDINATOR)")
    print("   monitor@praman.demo / Demo@123 (MONITOR)")
    print("   ethics@praman.demo / Demo@123 (ETHICS_COMMITTEE)")
    print("   pv@praman.demo / Demo@123 (PHARMACOVIGILANCE_OFFICER)")
    print("   leadership@praman.demo / Demo@123 (LEADERSHIP)")
    print("   regulator@praman.demo / Demo@123 (REGULATOR)")
    print("\n⚠️  SYNTHETIC DEMO DATA ONLY — Not submission-ready")


async def main():
    await create_tables()
    async with AsyncSessionLocal() as db:
        await seed(db)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
