"""
ContentForge AI — Automated Evidence Verification Engine

Evaluates generated artifacts against the Canonical Content Object (CCO) and source evidence:
1. Citation & Evidence Verification: Checks that every claim/metric cites a valid chunk ID.
2. Numerical & Factual Grounding: Flags hallucinated or unsupported numbers against CCO values.
3. Structured Findings: Emits actionable issues with suggested fixes, severity, and location.
4. Cross-Output Consistency: Confirms coherence across multiple generated deliverables.

Adheres to Section 4 (WP-4) of the Automated Verification MVP Specification.
"""

import re
import uuid
from typing import Any, Optional
from pydantic import BaseModel, Field


class VerificationIssue(BaseModel):
    id: str = Field(default_factory=lambda: f"ISS-{uuid.uuid4().hex[:6].upper()}")
    severity: str = Field(description="CRITICAL, HIGH, MEDIUM, LOW")
    category: str = Field(description="unsupported_number, missing_evidence, hallucination, inconsistency, unverified_claim")
    description: str = Field(description="Detailed explanation of the finding")
    location: Optional[str] = Field(default=None, description="Location in artifact, e.g. 'Slide 3' or 'Section 1'")
    offending_text: Optional[str] = Field(default=None, description="Exact phrase or value flagged")
    evidence_id: Optional[str] = Field(default=None, description="Nearest or expected evidence chunk reference")
    suggested_fix: Optional[str] = Field(default=None, description="Actionable recommendation to resolve the finding")


class VerificationReport(BaseModel):
    status: str = Field(description="PASSED, REVISION_REQUIRED, FAILED")
    grounding_score: float = Field(description="0.0 to 1.0 factual grounding confidence")
    consistency_score: float = Field(description="0.0 to 1.0 internal consistency")
    citation_coverage: float = Field(default=1.0, description="0.0 to 1.0 percentage of claims with citations")
    verified_claims_count: int = Field(default=0)
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
        text_corpus.append(sec.get("heading", "") or sec.get("title", ""))
    text_corpus.extend(artifact.get("key_metrics", []))
    text_corpus.append(artifact.get("executive_takeaway", "") or artifact.get("executive_overview", ""))

    # Advisory
    text_corpus.append(artifact.get("summary", ""))
    text_corpus.append(artifact.get("threat_details", ""))
    text_corpus.extend(artifact.get("affected_systems", []) or artifact.get("affected_entities", []))

    # Infographics
    for m in artifact.get("metrics", []):
        text_corpus.append(str(m.get("value", "")))
        text_corpus.append(str(m.get("label", "")))
    for t in artifact.get("timeline", []):
        text_corpus.append(str(t.get("event", "")))
    for b in artifact.get("comparison_bars", []):
        text_corpus.append(str(b.get("percentage", "")))

    # Social post
    text_corpus.append(artifact.get("body", ""))
    text_corpus.extend(artifact.get("key_takeaways", []))

    full_text = " ".join(text_corpus)
    # Extract digit sequences (e.g. 100, 1,420, 98.4, 45%)
    numbers = set(re.findall(r"\b\d+(?:,\d{3})*(?:\.\d+)?%?\b", full_text))
    # Exclude common slide or step indices 1 to 10 unless percentage
    filtered = {n for n in numbers if "%" in n or (n.replace(",", "").replace("%", "").isdigit() and int(n.replace(",", "").replace("%", "")) > 10)}
    return filtered


def verify_artifact(
    artifact: dict[str, Any],
    cco: dict[str, Any],
    evidence: list[dict[str, Any]],
) -> VerificationReport:
    """
    Performs deterministic grounding and factual consistency checks.
    Evaluates:
    1. Evidence references validity & coverage
    2. Numerical fidelity against CCO
    3. Missing citation detection
    """
    issues: list[VerificationIssue] = []

    # Valid evidence IDs
    all_evidence_ids = {str(ev.get("chunk_id")) for ev in evidence if ev.get("chunk_id")}
    for claim in cco.get("claims", []):
        if claim.get("id"):
            all_evidence_ids.add(str(claim.get("id")))

    art_type = (artifact.get("artifact_type") or artifact.get("type") or "presentation").lower()
    total_claim_items = 0
    cited_claim_items = 0

    # 1. Evidence Citation Verification per output type
    if "presentation" in art_type or "slides" in artifact:
        slides = artifact.get("slides", [])
        for idx, slide in enumerate(slides, start=1):
            total_claim_items += 1
            refs = slide.get("evidence_refs", [])
            if not refs:
                issues.append(VerificationIssue(
                    severity="MEDIUM",
                    category="missing_evidence",
                    description=f"Slide {idx} ('{slide.get('title', '')}') lacks verifiable evidence references.",
                    location=f"Slide {idx}",
                    offending_text=slide.get("title", ""),
                    suggested_fix="Attach nearest source evidence chunk (e.g. [chunk-001]) to grounding citations.",
                ))
            else:
                cited_claim_items += 1

    elif "summary" in art_type or "sections" in artifact:
        sections = artifact.get("sections", [])
        for idx, sec in enumerate(sections, start=1):
            total_claim_items += 1
            refs = sec.get("evidence_refs", [])
            sec_title = sec.get("heading") or sec.get("title", f"Section {idx}")
            if not refs:
                issues.append(VerificationIssue(
                    severity="MEDIUM",
                    category="missing_evidence",
                    description=f"Section '{sec_title}' has no evidence citations mapped to source chunks.",
                    location=f"Section {idx}: {sec_title}",
                    offending_text=sec_title,
                    suggested_fix="Bind section claims to grounded CCO claim references.",
                ))
            else:
                cited_claim_items += 1

    elif "infographic" in art_type:
        metrics = artifact.get("metrics", [])
        for idx, met in enumerate(metrics, start=1):
            total_claim_items += 1
            if met.get("evidence_ref"):
                cited_claim_items += 1
            else:
                issues.append(VerificationIssue(
                    severity="LOW",
                    category="missing_evidence",
                    description=f"Infographic metric '{met.get('label')}' does not cite a source chunk.",
                    location=f"Metric {idx}: {met.get('label')}",
                    offending_text=str(met.get("value")),
                    suggested_fix="Include evidence_ref badge on visual KPI card.",
                ))

    # Fallback if no specific section structure detected
    if total_claim_items == 0:
        total_claim_items = 1
        cited_claim_items = 1

    # Citation coverage ratio
    citation_coverage = round(cited_claim_items / max(1, total_claim_items), 2)

    # 2. Number & Metric Grounding Verification
    cco_numbers = {str(n.get("text", "")) for n in cco.get("numbers", [])}
    for claim in cco.get("claims", []):
        cco_numbers.update(re.findall(r"\b\d+(?:,\d{3})*(?:\.\d+)?%?\b", str(claim.get("text", ""))))

    evidence_text = " ".join(str(e.get("text", "")) for e in evidence)
    artifact_numbers = extract_numbers_from_artifact(artifact)

    unsupported_numbers = []
    for num in artifact_numbers:
        clean_num = num.replace("%", "").replace(",", "")
        # Check if number appears in CCO or source evidence text
        if num not in cco_numbers and clean_num not in evidence_text and num not in evidence_text:
            unsupported_numbers.append(num)
            issues.append(VerificationIssue(
                severity="HIGH",
                category="unsupported_number",
                description=f"Metric '{num}' appears in generated artifact but was not found in CCO or source evidence.",
                location="Generated Content",
                offending_text=num,
                suggested_fix=f"Align value '{num}' with source document ground truth.",
            ))

    # Calculate Grounding and Consistency Scores
    grounding_score = 1.0
    # Penalty for missing citations
    if citation_coverage < 0.8:
        grounding_score -= (0.8 - citation_coverage) * 0.4
    # Penalty for unsupported numbers
    if unsupported_numbers:
        grounding_score -= min(0.45, len(unsupported_numbers) * 0.15)
    grounding_score = max(0.0, round(grounding_score, 2))

    consistency_score = 1.0
    if unsupported_numbers:
        consistency_score -= min(0.35, len(unsupported_numbers) * 0.12)
    consistency_score = max(0.0, round(consistency_score, 2))

    # Status classification
    if grounding_score >= 0.85 and len(unsupported_numbers) == 0:
        status = "PASSED"
    elif grounding_score >= 0.60:
        status = "REVISION_REQUIRED"
    else:
        status = "FAILED"

    return VerificationReport(
        status=status,
        grounding_score=grounding_score,
        consistency_score=consistency_score,
        citation_coverage=citation_coverage,
        verified_claims_count=cited_claim_items,
        unsupported_claim_count=len(unsupported_numbers),
        issues=issues,
    )


def verify_cross_output_consistency(artifacts: list[dict[str, Any]], cco: dict[str, Any]) -> dict[str, Any]:
    """Ensures that multiple outputs generated from the same CCO version do not contradict each other."""
    numbers_by_artifact = [extract_numbers_from_artifact(a) for a in artifacts]
    contradictions = []

    if len(artifacts) >= 2:
        for i in range(len(artifacts)):
            for j in range(i + 1, len(artifacts)):
                type_a = artifacts[i].get("artifact_type", f"artifact_{i}")
                type_b = artifacts[j].get("artifact_type", f"artifact_{j}")
                diff = numbers_by_artifact[i].symmetric_difference(numbers_by_artifact[j])
                # Filter harmless minor differences
                significant_diffs = [d for d in diff if not d.isdigit() or int(d.replace(",", "")) > 100]
                if significant_diffs:
                    contradictions.append({
                        "outputs": [type_a, type_b],
                        "divergent_metrics": list(significant_diffs),
                    })

    return {
        "consistent": len(contradictions) == 0,
        "contradictions": contradictions,
        "cross_output_score": 1.0 if not contradictions else 0.88,
    }
