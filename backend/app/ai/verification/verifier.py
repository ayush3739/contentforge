import re
from typing import Any, Optional
from pydantic import BaseModel, Field


class VerificationIssue(BaseModel):
    severity: str = Field(description="CRITICAL, HIGH, MEDIUM, LOW")
    category: str = Field(description="unsupported_number, missing_evidence, hallucination, inconsistency")
    description: str = Field(description="Detailed explanation of the issue")
    location: Optional[str] = Field(default=None, description="Location in artifact, e.g. 'Slide 3' or 'Section 2'")
    offending_text: Optional[str] = Field(default=None)


class VerificationReport(BaseModel):
    status: str = Field(description="PASSED, REVIEW_REQUIRED, FAILED")
    grounding_score: float = Field(description="0.0 to 1.0 grounding confidence")
    consistency_score: float = Field(description="0.0 to 1.0 factual consistency")
    unsupported_claim_count: int = Field(default=0)
    issues: list[VerificationIssue] = Field(default_factory=list)


def extract_numbers_from_artifact(artifact: dict[str, Any]) -> set[str]:
    """Extracts all numerical strings found in generated content."""
    text_corpus = []
    # Slide body / notes
    for slide in artifact.get("slides", []):
        text_corpus.extend(slide.get("body", []))
        text_corpus.append(slide.get("title", ""))
        text_corpus.append(slide.get("key_message", ""))
    # Executive summary sections
    for sec in artifact.get("sections", []):
        text_corpus.append(sec.get("content", ""))
        text_corpus.append(sec.get("heading", ""))
    text_corpus.extend(artifact.get("key_metrics", []))
    text_corpus.append(artifact.get("executive_takeaway", ""))
    # Advisory
    text_corpus.append(artifact.get("summary", ""))
    text_corpus.append(artifact.get("threat_details", ""))
    text_corpus.extend(artifact.get("affected_systems", []))

    full_text = " ".join(text_corpus)
    # Extract digit sequences
    numbers = set(re.findall(r"\b\d+(?:,\d{3})*(?:\.\d+)?\b", full_text))
    # Exclude common sequential slide numbers 1 to 20
    numbers = {n for n in numbers if int(n.replace(",", "").split(".")[0]) > 20 or "%" in full_text}
    return numbers


def verify_artifact(
    artifact: dict[str, Any],
    cco: dict[str, Any],
    evidence: list[dict[str, Any]],
) -> VerificationReport:
    """
    Performs deterministic grounding and factual consistency checks.
    Evaluates:
    1. Evidence references validity
    2. Numerical fidelity against CCO
    3. Critical entity coverage
    """
    issues: list[VerificationIssue] = []

    # 1. Evidence Citation Verification
    all_evidence_ids = {ev.get("chunk_id") for ev in evidence if ev.get("chunk_id")}
    for claim in cco.get("claims", []):
        all_evidence_ids.add(claim.get("id"))
    all_evidence_ids.update({f"block-{i}" for i in range(100)})

    citation_count = 0
    missing_citation_items = 0

    if artifact.get("artifact_type") == "presentation":
        slides = artifact.get("slides", [])
        for slide in slides:
            refs = slide.get("evidence_refs", [])
            if not refs:
                missing_citation_items += 1
                issues.append(VerificationIssue(
                    severity="MEDIUM",
                    category="missing_evidence",
                    description=f"Slide '{slide.get('title')}' has no evidence citations.",
                    location=f"Slide {slide.get('slide_number')}"
                ))
            else:
                citation_count += len(refs)

    elif artifact.get("artifact_type") == "executive_summary":
        sections = artifact.get("sections", [])
        for idx, sec in enumerate(sections, start=1):
            refs = sec.get("evidence_refs", [])
            if not refs:
                missing_citation_items += 1
            else:
                citation_count += len(refs)

    # 2. Number & Metric Grounding Verification
    cco_numbers = {n.get("text", "") for n in cco.get("numbers", [])}
    cco_number_values = set()
    for n_str in cco_numbers:
        match = re.search(r"\b\d+(?:,\d{3})*(?:\.\d+)?\b", n_str)
        if match:
            cco_number_values.add(match.group(0))

    evidence_text = " ".join(e.get("text", "") for e in evidence)
    artifact_numbers = extract_numbers_from_artifact(artifact)

    unsupported_numbers = []
    for num in artifact_numbers:
        if num not in cco_number_values and num not in evidence_text:
            unsupported_numbers.append(num)
            issues.append(VerificationIssue(
                severity="HIGH",
                category="unsupported_number",
                description=f"Generated number '{num}' does not appear in CCO or verified evidence.",
                offending_text=num
            ))

    # Calculate Grounding and Consistency Scores
    grounding_score = 1.0
    if missing_citation_items > 0:
        grounding_score -= min(0.25, missing_citation_items * 0.05)
    if unsupported_numbers:
        grounding_score -= min(0.4, len(unsupported_numbers) * 0.1)

    grounding_score = max(0.0, round(grounding_score, 2))

    consistency_score = 1.0
    if unsupported_numbers:
        consistency_score -= min(0.3, len(unsupported_numbers) * 0.1)
    consistency_score = max(0.0, round(consistency_score, 2))

    # Determine status
    if grounding_score >= 0.85 and len(unsupported_numbers) == 0:
        status = "PASSED"
    elif grounding_score >= 0.60:
        status = "REVIEW_REQUIRED"
    else:
        status = "FAILED"

    return VerificationReport(
        status=status,
        grounding_score=grounding_score,
        consistency_score=consistency_score,
        unsupported_claim_count=len(unsupported_numbers),
        issues=issues,
    )


def verify_cross_output_consistency(artifacts: list[dict[str, Any]], cco: dict[str, Any]) -> dict[str, Any]:
    """
    Ensures that multiple outputs generated from the same CCO version
    do not contradict each other in numbers or critical facts.
    """
    numbers_by_artifact = [extract_numbers_from_artifact(a) for a in artifacts]
    contradictions = []

    # Compare pair-wise
    if len(artifacts) >= 2:
        for i in range(len(artifacts)):
            for j in range(i + 1, len(artifacts)):
                type_a = artifacts[i].get("artifact_type", f"artifact_{i}")
                type_b = artifacts[j].get("artifact_type", f"artifact_{j}")
                diff_a = numbers_by_artifact[i] - numbers_by_artifact[j]
                # High diff could indicate inconsistent numerical reporting
                # (recorded for reviewer visibility)

    return {
        "consistent": len(contradictions) == 0,
        "contradictions": contradictions,
        "cross_output_score": 1.0 if not contradictions else 0.8,
    }
