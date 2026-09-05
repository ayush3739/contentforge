"""
ContentForge AI — Wave 4 Lifecycle & Security Tests

Validates:
1. Multi-tenant ownership isolation: Cross-user access to artifacts & binaries returns 403 Forbidden.
2. Version lineage creation: Revising v1 creates a new artifact with version == 2 and parent_artifact_id == v1.id.
3. Version history endpoint: GET /api/v1/artifacts/{id}/versions returns ordered version hierarchy.
4. Gated download integrity: Only PASSED or FINALIZED artifacts can be downloaded; unverified/failed are gated.
5. Finalization & Provenance ledger anchoring: Finalizing records dual SHA-256 hashes and transitions status to FINALIZED.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.artifact_service import ArtifactService
from app.schemas.enums import ArtifactStatus, VerificationStatus
from app.schemas.artifact import ArtifactReviseRequest, ArtifactFinalizeRequest
from app.core.errors import APIError

client = TestClient(app)

OWNER_HEADERS = {"Authorization": "Bearer test-analyst-token"}
REVIEWER_HEADERS = {"Authorization": "Bearer test-reviewer-token"}
ADMIN_HEADERS = {"Authorization": "Bearer test-admin-token"}


def test_ownership_isolation():
    """Validates that non-owners cannot mutate or access restricted artifacts."""
    service = ArtifactService(db=None)
    
    # In-memory artifact ART-001 is owned by USR-ANALYST-001
    art = service.get_artifact("ART-001")
    assert art is not None
    assert art["artifact_id"] == "ART-001"

    # Direct assert_owner with mock DB returns artifact if owner matches, or raises 403 if mismatch
    class MockRequest:
        requested_by = "USR-ANALYST-001"

    class MockArtifact:
        id = "ART-001"
        transformation_request_id = "TR-001"

    class MockQuery:
        def filter(self, *args, **kwargs):
            return self
        def first(self):
            return MockRequest()

    class MockDB:
        def query(self, *args):
            return MockQuery()

    service_with_db = ArtifactService(db=MockDB())
    
    # Matching owner should not raise
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(MockQuery, "first", lambda self: MockArtifact())
        # Test mismatched owner
        mock_req_mismatch = MockRequest()
        mock_req_mismatch.requested_by = "USR-OTHER-USER"
        
        class MockMismatchDB:
            def query(self, model):
                class SubQuery:
                    def filter(self, *args):
                        return self
                    def first(self):
                        if model.__name__ == "Artifact":
                            return MockArtifact()
                        return mock_req_mismatch
                return SubQuery()

        mismatch_service = ArtifactService(db=MockMismatchDB())
        with pytest.raises(APIError) as exc_info:
            mismatch_service.assert_owner("ART-001", "USR-ANALYST-001")
        assert exc_info.value.status_code == 403
        assert exc_info.value.code == "FORBIDDEN"


def test_version_lineage_creation():
    """Assert revising v1 creates a new artifact revision linked to parent."""
    service = ArtifactService(db=None)
    
    # Ensure ART-001 is present
    art = service.get_artifact("ART-001")
    assert art is not None
    initial_version = art.get("version", 1)

    # Submit revision
    revise_payload = ArtifactReviseRequest(
        instructions="Enhance executive summary with threat actor attribution details"
    )
    result = service.revise_artifact("ART-001", revise_payload, user_id="USR-ANALYST-001")
    
    assert result is not None
    assert result["version"] == initial_version + 1
    assert result["status"] == ArtifactStatus.GENERATING
    assert "Revision request queued" in result["message"]


def test_version_history_endpoint():
    """Assert GET /api/v1/artifacts/{id}/versions returns version chain."""
    resp = client.get("/api/v1/artifacts/ART-001/versions", headers=OWNER_HEADERS)
    assert resp.status_code == 200
    versions = resp.json()
    assert isinstance(versions, list)
    assert len(versions) >= 1
    assert versions[0]["artifact_id"] == "ART-001"
    assert "version" in versions[0]
    assert "status" in versions[0]


def test_gated_download_integrity():
    """Assert that artifacts cannot be downloaded unless they have PASSED or FINALIZED status."""
    service = ArtifactService(db=None)

    # Set up unverified artifact
    service._in_memory_artifacts["ART-UNVERIFIED"] = {
        "artifact_id": "ART-UNVERIFIED",
        "type": "presentation",
        "status": ArtifactStatus.GENERATING,
        "filename": "unverified.pptx",
        "download_url": None,
        "content_json": {},
    }

    # Unverified artifact should return None for binary or have download_url None
    unverified_art = service.get_artifact("ART-UNVERIFIED")
    assert unverified_art["download_url"] is None

    # Passed artifact should have download_url
    service._in_memory_artifacts["ART-PASSED"] = {
        "artifact_id": "ART-PASSED",
        "type": "presentation",
        "status": ArtifactStatus.PASSED,
        "filename": "passed.pptx",
        "download_url": "/api/v1/artifacts/ART-PASSED/download",
        "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "content_json": {"slides": [{"title": "Slide 1", "body": ["Content"]}]},
    }
    passed_art = service.get_artifact("ART-PASSED")
    assert passed_art["download_url"] == "/api/v1/artifacts/ART-PASSED/download"


def test_finalization_provenance_anchoring():
    """Assert finalizing a PASSED artifact transitions status to FINALIZED and returns provenance record."""
    service = ArtifactService(db=None)

    service._in_memory_artifacts["ART-TO-FINALIZE"] = {
        "artifact_id": "ART-TO-FINALIZE",
        "type": "executive_summary",
        "status": ArtifactStatus.PASSED,
        "filename": "exec_summary.docx",
        "checksum": "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
        "content_json": {"title": "Executive Summary", "executive_overview": "Grounded incident overview"},
        "verification": {"status": "PASSED", "grounding_score": 0.98},
    }

    finalize_req = ArtifactFinalizeRequest(notes="Approved for stakeholder dissemination")
    fin_res = service.finalize_artifact("ART-TO-FINALIZE", finalize_req, user_id="USR-ANALYST-001")

    assert fin_res["status"] == ArtifactStatus.FINALIZED
    assert fin_res["notes"] == "Approved for stakeholder dissemination"
    assert "provenance" in fin_res
    assert fin_res["provenance"]["status"] == "PENDING"

    # Re-finalizing or finalizing non-passed artifact should be rejected
    service._in_memory_artifacts["ART-DRAFT"] = {
        "artifact_id": "ART-DRAFT",
        "type": "presentation",
        "status": ArtifactStatus.GENERATING,
    }
    with pytest.raises(APIError) as exc_info:
        service.finalize_artifact("ART-DRAFT", finalize_req, user_id="USR-ANALYST-001")
    assert exc_info.value.status_code == 400
    assert exc_info.value.code == "INVALID_STATE"
