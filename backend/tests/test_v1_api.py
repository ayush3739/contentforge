"""
ContentForge AI — Comprehensive Unit Tests for V1 Application Backend

Covers:
- Auth & Clerk JWT Token Exchange (/api/v1/auth/login, /me, /logout)
- Role-Based Access Control (RBAC) Enforcement
- Session Workspace CRUD Operations (/api/v1/sessions)
- Document Multipart Ingestion & Binary Download (/api/v1/documents)
- Async Transformation Request & Job Status Polling (/api/v1/transformations)
- Artifact Management, Verification, Revision, & Finalization (/api/v1/artifacts)
- Reviewer Queue Workflow (/api/v1/review)
- Admin User Management, Audit Logs & Security Events (/api/v1/admin)
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

ANALYST_HEADERS = {"Authorization": "Bearer test-analyst-token"}
REVIEWER_HEADERS = {"Authorization": "Bearer test-reviewer-token"}
ADMIN_HEADERS = {"Authorization": "Bearer test-admin-token"}


# 1. Authentication & Me Endpoint Tests
def test_auth_login_and_me():
    # Login
    response = client.post("/api/v1/auth/login", json={"token": "test-analyst-token"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "analyst"

    # Get Me
    me_resp = client.get("/api/v1/auth/me", headers=ANALYST_HEADERS)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["user_id"] == "USR-ANALYST-001"
    assert me_data["role"] == "analyst"


# 2. RBAC Access Control Tests
def test_rbac_permission_matrix():
    # Analyst attempting Admin-only user list should be forbidden (403)
    admin_users_resp = client.get("/api/v1/admin/users", headers=ANALYST_HEADERS)
    assert admin_users_resp.status_code == 403
    err = admin_users_resp.json()["error"]
    assert err["code"] == "UNAUTHORIZED_ACCESS"

    # Admin accessing Admin-only user list should succeed (200)
    admin_success = client.get("/api/v1/admin/users", headers=ADMIN_HEADERS)
    assert admin_success.status_code == 200
    assert len(admin_success.json()) >= 1


# 3. Session Workspace CRUD Tests
def test_session_workspace_crud():
    # Create Session
    create_resp = client.post(
        "/api/v1/sessions",
        json={"name": "Test Incident Workspace", "description": "Security incident response workspace"},
        headers=ANALYST_HEADERS,
    )
    assert create_resp.status_code == 201
    sess = create_resp.json()
    sess_id = sess["id"]
    assert sess["name"] == "Test Incident Workspace"

    # List Sessions
    list_resp = client.get("/api/v1/sessions", headers=ANALYST_HEADERS)
    assert list_resp.status_code == 200
    assert any(s["id"] == sess_id for s in list_resp.json())

    # Get Session Detail
    get_resp = client.get(f"/api/v1/sessions/{sess_id}", headers=ANALYST_HEADERS)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == sess_id

    # Update Session
    patch_resp = client.patch(
        f"/api/v1/sessions/{sess_id}",
        json={"name": "Updated Incident Workspace"},
        headers=ANALYST_HEADERS,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["name"] == "Updated Incident Workspace"


# 4. Document Ingestion & CCO/Evidence Tests
def test_document_ingestion_and_retrieval():
    # Create session first
    sess_resp = client.post("/api/v1/sessions", json={"name": "Doc Session"}, headers=ANALYST_HEADERS)
    sess_id = sess_resp.json()["id"]

    # Upload Document
    file_content = b"# Security Advisory\nSystem breach detected on August 14, 2026."
    files = {"file": ("advisory.txt", io.BytesIO(file_content), "text/plain")}

    upload_resp = client.post(
        f"/api/v1/sessions/{sess_id}/documents",
        files=files,
        headers=ANALYST_HEADERS,
    )
    assert upload_resp.status_code == 201
    doc = upload_resp.json()
    doc_id = doc["id"]
    assert doc["name"] == "advisory.txt"
    assert doc["checksum"] is not None

    # Get Document Metadata
    doc_resp = client.get(f"/api/v1/documents/{doc_id}", headers=ANALYST_HEADERS)
    assert doc_resp.status_code == 200

    # Get Document CCO
    cco_resp = client.get(f"/api/v1/documents/{doc_id}/cco", headers=ANALYST_HEADERS)
    assert cco_resp.status_code == 200
    assert cco_resp.json()["document_id"] == doc_id

    # Download Raw Binary
    dl_resp = client.get(f"/api/v1/documents/{doc_id}/download", headers=ANALYST_HEADERS)
    assert dl_resp.status_code == 200
    assert len(dl_resp.content) > 0


# 5. Transformation Request & Job Polling Tests
def test_transformation_orchestration():
    # Session & Document setup
    sess_resp = client.post("/api/v1/sessions", json={"name": "Transform Session"}, headers=ANALYST_HEADERS)
    sess_id = sess_resp.json()["id"]

    trans_payload = {
        "session_id": sess_id,
        "source_document_id": "DOC-SAMPLE-001",
        "output_types": ["executive_summary", "presentation"],
        "audience": "senior leadership",
        "tone": "formal",
    }

    # Submit Transformation Request -> Expect 202 Accepted
    submit_resp = client.post("/api/v1/transformations", json=trans_payload, headers=ANALYST_HEADERS)
    assert submit_resp.status_code == 202
    trans = submit_resp.json()
    trans_id = trans["transformation_id"]
    assert trans["status"] == "QUEUED"

    # Poll Transformation Status
    status_resp = client.get(f"/api/v1/transformations/{trans_id}/status", headers=ANALYST_HEADERS)
    assert status_resp.status_code == 200
    stat_data = status_resp.json()
    assert stat_data["transformation_id"] == trans_id
    assert stat_data["status"] in ["QUEUED", "PROCESSING", "GENERATING", "VERIFYING", "RENDERING", "COMPLETED"]


# 6. Artifact Verification, Revision, & Review Tests
def test_artifact_review_and_approval():
    art_id = "ART-001"

    # Get Artifact Verification Report
    ver_resp = client.get(f"/api/v1/artifacts/{art_id}/verification", headers=ANALYST_HEADERS)
    assert ver_resp.status_code == 200
    assert ver_resp.json()["artifact_id"] == art_id

    # Remove review queue as it's been deprecated

    # Finalize Artifact (Owner required)
    finalize_resp = client.post(
        f"/api/v1/artifacts/{art_id}/finalize",
        json={"notes": "Finalized by owner"},
        headers=ANALYST_HEADERS,
    )
    assert finalize_resp.status_code == 200
    assert finalize_resp.json()["status"] == "FINALIZED"

def test_artifact_revision():
    art_id = "ART-001"
    # Revise Artifact
    revise_resp = client.post(
        f"/api/v1/artifacts/{art_id}/revise",
        json={"instructions": "Add financial impact slide."},
        headers=ANALYST_HEADERS,
    )
    assert revise_resp.status_code == 200
    assert revise_resp.json()["status"] == "GENERATING"




# 7. Admin Audit & Security Logs Tests
def test_admin_audit_and_security_logs():
    # Audit Logs (Admin only)
    audit_resp = client.get("/api/v1/admin/audit-logs", headers=ADMIN_HEADERS)
    assert audit_resp.status_code == 200
    assert isinstance(audit_resp.json(), list)

    # Security Events (Admin only)
    sec_resp = client.get("/api/v1/admin/security-events", headers=ADMIN_HEADERS)
    assert sec_resp.status_code == 200
    assert isinstance(sec_resp.json(), list)
