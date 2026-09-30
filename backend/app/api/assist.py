import re
import hashlib
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Protocol
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/assist", tags=["AI Assist"])

# Non-negotiable roles: REGULATOR has no access to this page
ALLOWED_ASSIST_ROLES = [
    UserRole.ADMIN,
    UserRole.PRINCIPAL_INVESTIGATOR,
    UserRole.STUDY_COORDINATOR,
    UserRole.PHARMACOVIGILANCE_OFFICER,
    UserRole.MONITOR,
    UserRole.LEADERSHIP,
]

# Pydantic Models
class EvidenceQuote(BaseModel):
    quote: str
    start: int
    end: int

class DraftField(BaseModel):
    key: str
    label: str
    group: str
    value: Optional[str] = None
    evidence: Optional[EvidenceQuote] = None
    status: str  # Extracted | Suggested | Uncertain | Missing | HumanAssessmentRequired
    cue: Optional[str] = None
    conflict: Optional[Dict[str, List[str]]] = None

class AEEvent(BaseModel):
    id: str
    fields: List[DraftField]

class DraftResponse(BaseModel):
    id: str
    noteHash: str
    modelVersion: str
    promptVersion: str
    createdAt: str
    groups: Dict[str, List[DraftField]]
    aeEvents: List[AEEvent]
    state: str = "Draft"

class AssistRequest(BaseModel):
    note: str = Field(..., min_length=1, description="Raw unstructured clinical note")
    mode: Optional[str] = Field("mock", description="Extractor mode: mock | live")

# Pluggable Provider Protocol
class LLMModelProvider(Protocol):
    async def extract_raw(self, note: str) -> Dict[str, Any]:
        ...

class RuleBasedExtractorProvider:
    """Deterministic server-side rule extractor (mirrors client-side logic for offline safety)"""
    async def extract_raw(self, note: str) -> Dict[str, Any]:
        # Regex extractors
        subject_match = re.search(r'(?:Subject|Patient|screening subject)\s+([A-Z0-9]{3,}-[A-Z0-9\-]+)|\b(SUB-[A-Z0-9\-]+|PRM-[A-Z0-9\-]+)\b', note, re.I)
        protocol_match = re.search(r'(AyurVeda\s+OA-2026|AgniBalance(?:\s+trial)?|AIIA-OA-[0-9\-]+|AIIA-GI-[0-9\-]+)', note, re.I)
        site_match = re.search(r'(Delhi\s+Main\s+Campus|Dwarka\s+Extension(?:\s+site)?|AIIA\s+Main\s+Campus|DEL-01|DEL-02|JAI-01)', note, re.I)
        visit_match = re.search(r'(Week\s+\d+(?:\s+protocol\s+visit|\s+milestone)?|Screening\s+&\s+Consent|Screening\s+subject|Unscheduled\s+Safety\s+Assessment|baseline\s+randomization|Visit\s+\d+)', note, re.I)

        return {
            "subject": subject_match.group(1) or subject_match.group(2) if subject_match else None,
            "subject_span": (subject_match.start(), subject_match.end(), subject_match.group(0)) if subject_match else None,
            "protocol": protocol_match.group(1) if protocol_match else None,
            "protocol_span": (protocol_match.start(), protocol_match.end(), protocol_match.group(0)) if protocol_match else None,
            "site": site_match.group(1) if site_match else None,
            "site_span": (site_match.start(), site_match.end(), site_match.group(0)) if site_match else None,
            "visit": visit_match.group(1) if visit_match else None,
            "visit_span": (visit_match.start(), visit_match.end(), visit_match.group(0)) if visit_match else None,
        }

# Swappable providers: OpenAI, Claude, Vertex AI, Self-Hosted
class ExternalLLMProvider:
    """Stubbed provider interface for pluggable foundation models (OpenAI/Claude/Vertex)"""
    def __init__(self, provider_type: str = "openai"):
        self.provider_type = provider_type

    async def extract_raw(self, note: str) -> Dict[str, Any]:
        # In production: make API call with low temperature and structured output schema
        # For demo: fallback to deterministic extractor
        return await RuleBasedExtractorProvider().extract_raw(note)


def get_server_provider(provider_type: str = "rule") -> Any:
    if provider_type in ["openai", "claude", "vertex"]:
        return ExternalLLMProvider(provider_type)
    return RuleBasedExtractorProvider()


def server_validate_and_enforce_rules(draft: DraftResponse, note: str) -> DraftResponse:
    """Server-side enforcement of Rules 2 and 3:
    - Verbatim evidence quotes checked
    - Seriousness, Causality, Expectedness forced to HumanAssessmentRequired with value=None
    """
    for group_name, fields in draft.groups.items():
        for f in fields:
            # Rule 3: Check quote in note
            if f.evidence:
                if f.evidence.quote not in note:
                    f.value = None
                    f.status = "Missing"
                    f.evidence = None

    for ev in draft.aeEvents:
        for f in ev.fields:
            # Rule 2: Non-negotiable AI safety rule
            if f.key in ["ae_seriousness", "ae_causality", "ae_expectedness"]:
                f.status = "HumanAssessmentRequired"
                f.value = None
            elif f.evidence and f.evidence.quote not in note:
                f.value = None
                f.status = "Missing"
                f.evidence = None

    return draft


@router.post("/structure", response_model=DraftResponse)
async def structure_clinical_note(
    body: AssistRequest,
    current_user: User = Depends(get_current_user),
) -> DraftResponse:
    # 1. Role authorization check
    if current_user.role not in ALLOWED_ASSIST_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied for role {current_user.role}. Clinical drafting is restricted to site staff.",
        )

    note = body.note
    note_hash = hashlib.sha256(note.encode("utf-8")).hexdigest()
    now_iso = datetime.now(timezone.utc).isoformat()

    provider = get_server_provider("rule")
    raw = await provider.extract_raw(note)

    # Subject & Visit
    def make_field(key: str, label: str, group: str, val: Optional[str], span: Optional[tuple]) -> DraftField:
        if val and span:
            return DraftField(
                key=key,
                label=label,
                group=group,
                value=val,
                evidence=EvidenceQuote(quote=span[2], start=span[0], end=span[1]),
                status="Extracted",
            )
        return DraftField(key=key, label=label, group=group, value=None, evidence=None, status="Missing")

    subject_fields = [
        make_field("subject_id", "Subject Identifier", "Subject & Visit", raw["subject"], raw["subject_span"]),
        make_field("protocol_id", "Protocol / Study Name", "Subject & Visit", raw["protocol"], raw["protocol_span"]),
        make_field("site", "Clinical Site", "Subject & Visit", raw["site"], raw["site_span"]),
        make_field("visit_milestone", "Visit / Milestone", "Subject & Visit", raw["visit"], raw["visit_span"]),
    ]

    # Vitals
    bp_match = re.search(r'(?:Blood\s+pressure|BP)\s*([0-9]{2,3})\s*/\s*([0-9]{2,3}(?:\s*mmHg)?)', note, re.I)
    pulse_match = re.search(r'(?:heart\s+rate|Pulse|HR)\s*([0-9]{2,3}(?:\s*bpm)?)', note, re.I)
    spo2_match = re.search(r'(?:SpO2|Oxygen\s+saturation)\s*([0-9]{2,3}\s*%)', note, re.I)
    weight_match = re.search(r'(?:weight)\s*([0-9]{2,3}(?:\.[0-9]+)?\s*kg)', note, re.I)
    bmi_match = re.search(r'(?:BMI)\s*([0-9]{2,3}(?:\.[0-9]+)?\s*(?:kg/m2|kg/m²)?)', note, re.I)

    vitals_fields = [
        make_field("vital_sysbp", "Systolic Blood Pressure (mmHg)", "Vitals", bp_match.group(1) if bp_match else None, (bp_match.start(), bp_match.end(), bp_match.group(0)) if bp_match else None),
        make_field("vital_diabp", "Diastolic Blood Pressure (mmHg)", "Vitals", bp_match.group(2).replace("mmHg", "").strip() if bp_match else None, (bp_match.start(), bp_match.end(), bp_match.group(0)) if bp_match else None),
        make_field("vital_pulse", "Heart Rate / Pulse (bpm)", "Vitals", pulse_match.group(1).replace("bpm", "").strip() if pulse_match else None, (pulse_match.start(), pulse_match.end(), pulse_match.group(0)) if pulse_match else None),
        make_field("vital_spo2", "SpO2 Oxygen Saturation (%)", "Vitals", spo2_match.group(1).replace("%", "").strip() if spo2_match else None, (spo2_match.start(), spo2_match.end(), spo2_match.group(0)) if spo2_match else None),
        make_field("vital_weight", "Weight (kg)", "Vitals", weight_match.group(1).replace("kg", "").strip() if weight_match else None, (weight_match.start(), weight_match.end(), weight_match.group(0)) if weight_match else None),
        make_field("vital_bmi", "BMI (kg/m²)", "Vitals", bmi_match.group(1).replace("kg/m2", "").replace("kg/m²", "").strip() if bmi_match else None, (bmi_match.start(), bmi_match.end(), bmi_match.group(0)) if bmi_match else None),
    ]

    # Efficacy
    womac_match = re.search(r'WOMAC.*?([0-9]{1,3})', note, re.I)
    base_match = re.search(r'down\s+from\s+([0-9]{1,3})\s+at\s+baseline', note, re.I)

    efficacy_fields = [
        make_field("efficacy_womac_total", "WOMAC Total Score", "Efficacy", womac_match.group(1) if womac_match else None, (womac_match.start(), womac_match.end(), womac_match.group(0)) if womac_match else None),
        make_field("efficacy_womac_baseline", "WOMAC Baseline Score", "Efficacy", base_match.group(1) if base_match else None, (base_match.start(), base_match.end(), base_match.group(0)) if base_match else None),
    ]

    # Compute percent change in code
    if womac_match and base_match:
        cur = float(womac_match.group(1))
        base = float(base_match.group(1))
        if base > 0:
            reduction = ((base - cur) / base) * 100
            efficacy_fields.append(
                DraftField(
                    key="efficacy_womac_change",
                    label="WOMAC % Change from Baseline",
                    group="Efficacy",
                    value=f"{reduction:.1f}% reduction ({base:.0f} -> {cur:.0f})",
                    evidence=EvidenceQuote(quote=womac_match.group(0), start=womac_match.start(), end=womac_match.end()),
                    status="Extracted",
                )
            )

    # Medication
    prod_match = re.search(r'(Vatari\s+Guggulu|Chitrakadi\s+Vati)', note, re.I)
    dose_match = re.search(r'([0-9]+(?:\.[0-9]+)?\s*mg\s*(?:QD|BID|TID|QID|OD|BD))', note, re.I)
    batch_match = re.search(r'(?:batch\s+|formulation\s+batch\s+)([A-Z0-9]{1,4}-[A-Z0-9]{2,6}-[0-9]{4}-[A-Z0-9]+)', note, re.I)

    med_fields = [
        make_field("med_product", "Study Product / Formulation", "Medication", prod_match.group(1) if prod_match else None, (prod_match.start(), prod_match.end(), prod_match.group(0)) if prod_match else None),
        make_field("med_dose", "Dose & Frequency", "Medication", dose_match.group(1) if dose_match else None, (dose_match.start(), dose_match.end(), dose_match.group(0)) if dose_match else None),
        make_field("med_batch", "Batch Number", "Medication", batch_match.group(1) if batch_match else None, (batch_match.start(), batch_match.end(), batch_match.group(0)) if batch_match else None),
    ]

    # Ayurveda (Anupana is warm milk / warm water; NOT ORS)
    prakriti_match = re.search(r'([A-Za-z\-]+(?:\s+dominant)?\s*(?:Dwandwaja\s+)?Prakriti)', note, re.I)
    agni_match = re.search(r'(Tikshnagni|Mandagni|Manda\s+Agni|Vishamagni|Samagni)', note, re.I)
    anupana_match = re.search(r'(?:with\s+|milk\s+|Anupana:?\s*)(warm\s+(?:milk|water)|Ksheera(?:\s+Anupana)?|water\s*\(Ushnodaka\)|warm\s+milk\s*\(Ksheera\s+Anupana\))', note, re.I)

    ayur_fields = [
        make_field("ayur_prakriti", "Ayurvedic Prakriti Examination", "Ayurveda", prakriti_match.group(1) if prakriti_match else None, (prakriti_match.start(), prakriti_match.end(), prakriti_match.group(0)) if prakriti_match else None),
        make_field("ayur_agni", "Agni Assessment", "Ayurveda", agni_match.group(1) if agni_match else None, (agni_match.start(), agni_match.end(), agni_match.group(0)) if agni_match else None),
        make_field("ayur_anupana", "Prescribed Anupana", "Ayurveda", anupana_match.group(1) if anupana_match else None, (anupana_match.start(), anupana_match.end(), anupana_match.group(0)) if anupana_match else None),
    ]

    # AE Events
    ae_events: List[AEEvent] = []
    if "burning sensation in epigastrium" in note.lower() or "abdominal cramping" in note.lower():
        term_match = re.search(r'(severe\s+episodic\s+abdominal\s+cramping[^\.\n]*|mild\s+burning\s+sensation\s+in\s+epigastrium[^\.\n]*)', note, re.I)
        sev_match = re.search(r'Severity:\s*Moderate|Graded\s+as\s+mild', note, re.I)
        narrative_severe = "severe episodic abdominal cramping" in note.lower()
        structured_moderate = "severity: moderate" in note.lower()

        conflict = None
        sev_status = "Extracted"
        sev_val = "MODERATE" if structured_moderate else "MILD"
        if narrative_severe and structured_moderate:
            sev_status = "Uncertain"
            sev_val = "Moderate (Conflicted with narrative 'severe')"
            conflict = {"quotes": ["severe episodic abdominal cramping", "Severity: Moderate"]}

        # Rule 2: Seriousness, Causality, Expectedness ALWAYS HumanAssessmentRequired
        ae_fields = [
            make_field("ae_term", "Reported AE Term", "Adverse Events", term_match.group(1) if term_match else None, (term_match.start(), term_match.end(), term_match.group(0)) if term_match else None),
            DraftField(
                key="ae_severity",
                label="AE Severity Grade",
                group="Adverse Events",
                value=sev_val,
                evidence=EvidenceQuote(quote=sev_match.group(0), start=sev_match.start(), end=sev_match.end()) if sev_match else None,
                status=sev_status,
                conflict=conflict,
            ),
            DraftField(
                key="ae_seriousness",
                label="Seriousness (SAE vs AE)",
                group="Adverse Events",
                value=None,
                evidence=None,
                status="HumanAssessmentRequired",
                cue="Requires clinical investigator assessment",
            ),
            DraftField(
                key="ae_causality",
                label="Causality Assessment",
                group="Adverse Events",
                value=None,
                evidence=None,
                status="HumanAssessmentRequired",
                cue="Requires clinical investigator assessment",
            ),
            DraftField(
                key="ae_expectedness",
                label="Expectedness (RSI Evaluation)",
                group="Adverse Events",
                value=None,
                evidence=None,
                status="HumanAssessmentRequired",
                cue="Must be verified against Reference Safety Information (RSI)",
            ),
            DraftField(
                key="ae_suggested_coding",
                label="Suggested Term Candidates (Local Demo Dictionary)",
                group="Adverse Events",
                value="Suggested terms from local demo dictionary",
                evidence=None,
                status="Suggested",
                cue="Coding requires licensed MedDRA",
            ),
        ]
        ae_events.append(AEEvent(id="ae-event-1", fields=ae_fields))

    draft = DraftResponse(
        id=f"draft-{int(datetime.now().timestamp())}",
        noteHash=note_hash,
        modelVersion="server-governed-rule-v1.0",
        promptVersion="prm-server-assist-v2.2",
        createdAt=now_iso,
        groups={
            "Subject & Visit": subject_fields,
            "Vitals": vitals_fields,
            "Efficacy": efficacy_fields,
            "Medication": med_fields,
            "Ayurveda": ayur_fields,
        },
        aeEvents=ae_events,
        state="Draft",
    )

    return server_validate_and_enforce_rules(draft, note)
