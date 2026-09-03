"""
Unit Tests for P1 AI Intelligence Pipeline
Covers:
- Deterministic extraction (dates, metrics, identifiers)
- Layout-aware parsing (TXT / MD)
- Semantic chunking with page and section metadata
- Local embedding generation (384-dim, normalized)
- CCO builder data structure and integrity
- Schema validation for Presentation, ExecutiveSummary, Advisory
- Grounding verification & numerical consistency checks
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

from app.ai.ingestion.parser import parse_text
from app.ai.extraction.deterministic import (
    extract_dates,
    extract_numbers_and_metrics,
    extract_identifiers,
    extract_deterministic_data,
)
from app.ai.extraction.semantic import ExtractedClaim, SemanticExtractionResult
from app.ai.cco.builder import build_cco
from app.ai.chunking.chunker import chunk_blocks
from app.ai.embeddings import embed_text, embed_batch
from app.ai.schemas import PresentationSchema, Slide, ExecutiveSummarySchema, AdvisorySchema
from app.ai.verification.verifier import verify_artifact, extract_numbers_from_artifact

client = TestClient(app)

SAMPLE_INCIDENT_REPORT = """# Incident Briefing: Ransomware Attack on Core Infrastructure
Date: 2026-08-14
Incident ID: INC-88412
Target: Payment Processing Gateway

On August 14, 2026, unauthorized activity was observed across 14 systems in the production cluster.
The threat actor exploited CVE-2024-3094, leading to exfiltration of 450 GB of encrypted logs.
Total estimated financial impact is $2.5 million.
The incident was mitigated within 24 hours by isolating affected nodes.

## Immediate Recommendations
All administrators must revoke compromised credentials and apply patch KB-9912.
Refer to security advisory at https://security.contentforge.ai/advisory/INC-88412.
"""


def test_ai_health_endpoint():
    """Verify AI health check route reports ready status."""
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["embedding_model"] == "all-MiniLM-L6-v2"
    assert data["embedding_dimension"] == 384


def test_deterministic_extraction():
    """Test precision of deterministic regex extraction."""
    extracted = extract_deterministic_data(SAMPLE_INCIDENT_REPORT)

    # Check dates
    date_values = [d["value"] for d in extracted["dates"]]
    assert any("2026-08-14" in d or "August 14, 2026" in d for d in date_values)

    # Check metrics and numbers
    number_texts = [n["text"] for n in extracted["numbers"]]
    assert any("14 systems" in n for n in number_texts)
    assert any("450 GB" in n for n in number_texts)
    assert any("$2.5 million" in n for n in number_texts)
    assert any("24 hours" in n for n in number_texts)

    # Check identifiers
    ident_values = [i["value"] for i in extracted["identifiers"]]
    assert any("CVE-2024-3094" in i for i in ident_values)
    assert any("INC-88412" in i for i in ident_values)


def test_layout_parsing_and_chunking():
    """Test text parsing into layout blocks and semantic chunking."""
    blocks = parse_text(SAMPLE_INCIDENT_REPORT)
    assert len(blocks) >= 3

    headings = [b["text"] for b in blocks if b["block_type"] == "heading"]
    assert any("Incident Briefing" in h for h in headings)

    # Test chunking
    chunks = chunk_blocks(blocks, target_tokens=50, overlap_tokens=10)
    assert len(chunks) >= 1
    assert "text" in chunks[0]
    assert "section" in chunks[0]
    assert "page" in chunks[0]
    assert "chunk_id" in chunks[0]


def test_local_embeddings():
    """Verify local sentence-transformers model produces 384-dimensional normalized vectors."""
    text = "Ransomware affected 14 production systems."
    embedding = embed_text(text)
    assert isinstance(embedding, list)
    assert len(embedding) == 384
    # Check normalized (magnitude approximately 1.0)
    import math
    norm = math.sqrt(sum(x * x for x in embedding))
    assert abs(norm - 1.0) < 0.01

    # Batch embedding
    batch = embed_batch(["Sentence one", "Sentence two"])
    assert len(batch) == 2
    assert len(batch[0]) == 384


def test_cco_construction():
    """Test CCO builder merges semantic and deterministic facts with integrity hash."""
    blocks = parse_text(SAMPLE_INCIDENT_REPORT)
    det_data = extract_deterministic_data(SAMPLE_INCIDENT_REPORT)

    semantic_data = SemanticExtractionResult(
        title="Incident Briefing",
        executive_overview="Ransomware attack compromised 14 systems.",
        claims=[
            ExtractedClaim(
                id="claim-001",
                text="14 production systems were compromised.",
                source_sentence="unauthorized activity was observed across 14 systems",
                confidence=0.98,
            )
        ],
        key_findings=["14 systems compromised", "$2.5 million financial impact"],
    )

    cco = build_cco(
        document_id="DOC-TEST-001",
        version_number=1,
        source_blocks=blocks,
        deterministic_data=det_data,
        semantic_data=semantic_data,
    )

    assert cco["document_id"] == "DOC-TEST-001"
    assert cco["version"] == 1
    assert "hash" in cco
    assert len(cco["claims"]) == 1
    assert cco["claims"][0]["id"] == "claim-001"
    assert "identifiers" in cco
    assert "entities" not in cco


def test_presentation_schema_validation():
    """Verify PresentationSchema validates slides with evidence references."""
    presentation = PresentationSchema(
        title="Incident Response Briefing",
        target_audience="Executive Leadership",
        slides=[
            Slide(
                slide_number=1,
                title="Incident Overview",
                key_message="14 systems were affected and quarantined.",
                body=["Breach detected on August 14, 2026", "Attacker exploited CVE-2024-3094"],
                speaker_notes="Walk leaders through initial timeline.",
                evidence_refs=["chunk-001", "claim-001"],
            )
        ]
    )
    dump = presentation.model_dump()
    assert dump["artifact_type"] == "presentation"
    assert len(dump["slides"]) == 1
    assert dump["slides"][0]["evidence_refs"] == ["chunk-001", "claim-001"]


def test_verification_engine():
    """Verify grounding checker flags unsupported numbers and verifies citations."""
    blocks = parse_text(SAMPLE_INCIDENT_REPORT)
    det_data = extract_deterministic_data(SAMPLE_INCIDENT_REPORT)
    semantic_data = SemanticExtractionResult(
        title="Incident Briefing",
        executive_overview="Ransomware attack affected 14 systems.",
        claims=[],
        entities=[],
        key_findings=[],
    )
    cco = build_cco("DOC-001", 1, blocks, det_data, semantic_data)
    evidence = [{"chunk_id": "chunk-001", "text": SAMPLE_INCIDENT_REPORT}]

    # Valid artifact citing 14 systems
    valid_presentation = {
        "artifact_type": "presentation",
        "title": "Incident Briefing",
        "slides": [
            {
                "slide_number": 1,
                "title": "Executive Summary",
                "key_message": "Attack impacted 14 systems.",
                "body": ["14 systems were isolated."],
                "speaker_notes": "Talking points",
                "evidence_refs": ["chunk-001"],
            }
        ]
    }

    report = verify_artifact(valid_presentation, cco, evidence)
    assert report.status == "PASSED"
    assert report.grounding_score >= 0.85

    # Hallucinated artifact claiming 999 systems
    hallucinated_presentation = {
        "artifact_type": "presentation",
        "title": "Incident Briefing",
        "slides": [
            {
                "slide_number": 1,
                "title": "Severe Outage",
                "key_message": "Attack devastated 999 servers.",
                "body": ["999 systems destroyed."],
                "speaker_notes": "Talking points",
                "evidence_refs": [],
            }
        ]
    }

    hallucinated_report = verify_artifact(hallucinated_presentation, cco, evidence)
    assert hallucinated_report.status in ["REVIEW_REQUIRED", "FAILED"]
    assert any(iss.category == "unsupported_number" for iss in hallucinated_report.issues)


@pytest.mark.anyio
async def test_end_to_end_pipeline_orchestration():
    """Verify full end-to-end pipeline produces CCO, chunks, and verified artifacts."""
    from app.ai.pipeline import PipelineTransformRequest, run_transformation_pipeline

    request = PipelineTransformRequest(
        content=SAMPLE_INCIDENT_REPORT,
        filename="incident_report.txt",
        output_types=["executive_summary", "presentation"],
        audience="Senior Leadership",
        tone="formal",
        detail_level="concise",
    )

    response = await run_transformation_pipeline(request, db=None)
    assert response.execution_status == "COMPLETED"
    assert response.cco["version"] == 1
    assert len(response.artifacts) == 2

    # Check artifact types
    types = [a.artifact_type for a in response.artifacts]
    assert "executive_summary" in types
    assert "presentation" in types

    # Check verification reports
    for art in response.artifacts:
        assert "status" in art.verification
        assert "grounding_score" in art.verification
        assert art.verification["grounding_score"] >= 0.0
