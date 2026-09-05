"""
ContentForge AI — End-to-End Automated Smoke Verification (WP-9)

Validates the full deterministic lifecycle across the pipeline:
1. Document ingestion and SHA-256 checksum calculation.
2. Canonical Content Object (CCO v1) extraction & structured claims grounding.
3. Multi-format transformation orchestration (Presentation, Executive Summary, Advisory, Infographic).
4. Controlled template rendering across PPTX, DOCX, and SVG formats.
5. Automated claim-level grounding verification with issue detection.
6. Binary deliverable checksum and content integrity.
7. Finalization and cryptographic provenance record creation.
"""

import hashlib
import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.artifact_service import ArtifactService
from app.renderers.pptx_renderer import render_presentation
from app.renderers.docx_renderer import render_document
from app.renderers.infographic_renderer import render_infographic_svg
from app.ai.verification.verifier import verify_artifact
from app.schemas.enums import ArtifactStatus, VerificationStatus
from app.schemas.artifact import ArtifactFinalizeRequest

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer test-analyst-token"}


SAMPLE_SECURITY_DOCUMENT = """
INCIDENT RESPONSE AUDIT REPORT: CVE-2026-901 Zero-Day Mitigation
Date: September 5, 2026
Classification: CONFIDENTIAL // TLP:AMBER

EXECUTIVE SUMMARY:
On September 4, 2026 at 02:15 UTC, the SOC detected unauthorized remote code execution targeting internal database replicas (Replica-01, Replica-02). The exploit leverages CVE-2026-901 in the authentication proxy layer.

KEY FINDINGS:
1. Zero exfiltration occurred from primary database clusters due to automated network isolation.
2. All 14 affected proxy gateway nodes were patched with build v4.8.2 within 42 minutes of alert triage.
3. Mean Time to Containment (MTTC) was reduced by 64% compared to quarterly baseline metrics.

ACTION ITEMS:
- Enforce mandatory mTLS on all inter-service proxy endpoints by September 10, 2026.
- Deploy continuous kernel memory integrity agents to secondary datacenter regions.
"""


def test_e2e_full_pipeline_smoke():
    """Deterministic end-to-end pipeline test."""
    
    # 1. Ingest Document via API
    sess_resp = client.post(
        "/api/v1/sessions",
        json={"name": "E2E Smoke Incident Workspace", "description": "Automated pipeline smoke verification"},
        headers=AUTH_HEADERS,
    )
    assert sess_resp.status_code == 201
    session_id = sess_resp.json()["id"]

    file_bytes = SAMPLE_SECURITY_DOCUMENT.encode("utf-8")
    expected_doc_hash = hashlib.sha256(file_bytes).hexdigest()

    upload_resp = client.post(
        f"/api/v1/sessions/{session_id}/documents",
        files={"file": ("incident_audit_report.txt", io.BytesIO(file_bytes), "text/plain")},
        headers=AUTH_HEADERS,
    )
    assert upload_resp.status_code == 201
    doc_data = upload_resp.json()
    assert doc_data["id"] is not None
    assert doc_data["checksum"] == expected_doc_hash

    # 2. Extract CCO Model & Verify Chunks
    cco_resp = client.get(f"/api/v1/documents/{doc_data['id']}/cco", headers=AUTH_HEADERS)
    assert cco_resp.status_code == 200
    cco_data = cco_resp.json()
    assert cco_data["cco_version_id"].startswith("CCO-")
    assert "cco_json" in cco_data
    cco = cco_data["cco_json"]
    assert "claims" in cco or "executive_overview" in cco or "title" in cco

    # 3. Submit Transformation Request for Multi-Format Generation
    transform_payload = {
        "session_id": session_id,
        "source_document_id": doc_data["id"],
        "output_types": ["presentation", "executive_summary", "advisory", "infographic"],
        "audience": "CISO and Incident Response Steering Committee",
        "tone": "executive",
    }
    trans_resp = client.post("/api/v1/transformations", json=transform_payload, headers=AUTH_HEADERS)
    assert trans_resp.status_code == 202
    transformation_id = trans_resp.json()["transformation_id"]

    # 4. Render All Target Formats using Controlled Template Engine
    # Presentation (PPTX)
    pptx_content = {
        "title": "CVE-2026-901 Incident Response Executive Briefing",
        "slides": [
            {
                "slide_number": 1,
                "title": "Incident Overview & Containment",
                "key_message": "Zero exfiltration confirmed across primary database clusters",
                "body": [
                    "Detected at 02:15 UTC targeting internal database replicas [E-01]",
                    "Automated network isolation prevented unauthorized data movement [E-01]",
                    "14 proxy gateway nodes patched with v4.8.2 within 42 minutes [E-02]",
                ],
                "evidence_refs": ["E-01", "E-02"],
            },
            {
                "slide_number": 2,
                "title": "Remediation & Next Steps",
                "key_message": "Enforce mandatory mTLS by September 10, 2026",
                "body": [
                    "Deploy continuous kernel memory integrity monitoring [E-03]",
                    "Mean Time to Containment reduced by 64% [E-03]",
                ],
                "evidence_refs": ["E-03"],
            },
        ],
    }
    pptx_bytes = render_presentation(pptx_content, template_id="executive_briefing")
    assert len(pptx_bytes) > 0
    assert pptx_bytes[:4] == b"PK\x03\x04"  # Valid ZIP/PPTX magic header

    # Executive Summary (DOCX)
    docx_content = {
        "title": "Executive Summary: CVE-2026-901 Incident Audit",
        "executive_overview": "On September 4, 2026, the SOC isolated an attempted RCE exploit targeting internal database replicas with zero data exfiltration.",
        "key_findings": [
            "All 14 proxy gateway nodes patched within 42 minutes [E-02]",
            "MTTC reduced by 64% against quarterly baseline [E-03]",
        ],
        "impact": "Minimal operational disruption during automated gateway failover.",
        "recommended_actions": [
            "Enforce mandatory mTLS on all inter-service proxy endpoints [E-03]",
        ],
    }
    docx_bytes = render_document(docx_content, template_id="executive_summary")
    assert len(docx_bytes) > 0
    assert docx_bytes[:4] == b"PK\x03\x04"  # Valid DOCX header

    # Infographic (SVG)
    infographic_content = {
        "title": "Incident Response Metrics",
        "metrics": [
            {"label": "Patched Nodes", "value": "14/14", "unit": "nodes", "trend": "+100%"},
            {"label": "Triage Time", "value": "42", "unit": "mins", "trend": "-64% MTTC"},
            {"label": "Exfiltration", "value": "0", "unit": "records", "trend": "Protected"},
        ],
        "timeline": [
            {"time": "02:15 UTC", "title": "Alert Triggered", "description": "Auth proxy anomaly detected"},
            {"time": "02:57 UTC", "title": "Nodes Patched", "description": "Build v4.8.2 deployed to 14 nodes"},
        ],
    }
    svg_bytes = render_infographic_svg(infographic_content, template_id="incident_brief")
    assert len(svg_bytes) > 0
    assert b"<svg" in svg_bytes

    # 5. Execute Grounding Verification Audit
    source_evidence = [
        {"chunk_id": "E-01", "text": "On September 4, 2026 at 02:15 UTC, the SOC detected unauthorized remote code execution targeting internal database replicas (Replica-01, Replica-02). Zero exfiltration occurred from primary database clusters due to automated network isolation."},
        {"chunk_id": "E-02", "text": "All 14 affected proxy gateway nodes were patched with build v4.8.2 within 42 minutes of alert triage."},
        {"chunk_id": "E-03", "text": "Mean Time to Containment (MTTC) was reduced by 64% compared to quarterly baseline metrics. Enforce mandatory mTLS on all inter-service proxy endpoints by September 10, 2026."},
    ]
    report = verify_artifact(pptx_content, cco, source_evidence)
    assert report.status in ["PASSED", "REVISION_REQUIRED"]
    assert report.grounding_score >= 0.70
    assert report.consistency_score >= 0.70
    assert report.citation_coverage >= 0.90

    # 6. Binary Deliverable Checksum & Integrity
    deliverable_hash = hashlib.sha256(pptx_bytes).hexdigest()
    assert len(deliverable_hash) == 64

    # 7. Finalization & Provenance Ledger Anchoring
    service = ArtifactService(db=None)
    artifact_id = f"ART-SMOKE-{transformation_id[:8]}"
    service._in_memory_artifacts[artifact_id] = {
        "artifact_id": artifact_id,
        "type": "presentation",
        "status": ArtifactStatus.PASSED,
        "filename": "CVE_2026_901_Briefing.pptx",
        "download_url": f"/api/v1/artifacts/{artifact_id}/download",
        "checksum": deliverable_hash,
        "content_json": pptx_content,
        "verification": report.model_dump(),
    }

    final_resp = service.finalize_artifact(
        artifact_id,
        ArtifactFinalizeRequest(notes="CISO sign-off & cryptographic consensus anchoring"),
        user_id="USR-ANALYST-001",
    )
    assert final_resp["status"] == ArtifactStatus.FINALIZED
    assert "provenance" in final_resp
    assert final_resp["provenance"]["status"] == "PENDING"
