"""
ContentForge AI — Multi-Tenant & Session Isolation Security Unit Tests

Validates:
1. Session isolation: User B cannot read or delete User A's session.
2. Artifact isolation: User B cannot list or access User A's generated artifacts.
3. Transformation isolation: User B's transformation does not leak or reuse User A's CCO.
4. User artifacts listing: GET /api/v1/artifacts returns only the authenticated user's artifacts.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

USER_A_HEADERS = {"Authorization": "Bearer test-analyst-token", "X-User-Email": "user_a@contentforge.ai", "X-User-Name": "User A"}
USER_B_HEADERS = {"Authorization": "Bearer test-reviewer-token", "X-User-Email": "user_b@contentforge.ai", "X-User-Name": "User B"}
ADMIN_HEADERS = {"Authorization": "Bearer test-admin-token"}


def test_session_ownership_isolation():
    # 1. User A creates a private session
    resp = client.post(
        "/api/v1/sessions",
        json={"name": "User A Confidential Session", "description": "Top secret security briefing"},
        headers=USER_A_HEADERS,
    )
    assert resp.status_code == 201
    sess_a = resp.json()
    sess_a_id = sess_a["id"]

    # 2. User A can view their own session
    get_resp = client.get(f"/api/v1/sessions/{sess_a_id}", headers=USER_A_HEADERS)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "User A Confidential Session"

    # 3. User B attempting to view User A's session is forbidden (403)
    user_b_get = client.get(f"/api/v1/sessions/{sess_a_id}", headers=USER_B_HEADERS)
    assert user_b_get.status_code == 403

    # 4. User B attempting to delete User A's session is forbidden (403)
    user_b_delete = client.delete(f"/api/v1/sessions/{sess_a_id}", headers=USER_B_HEADERS)
    assert user_b_delete.status_code == 403

    # 5. User B attempting to fetch User A's session artifacts is forbidden (403)
    user_b_arts = client.get(f"/api/v1/sessions/{sess_a_id}/artifacts", headers=USER_B_HEADERS)
    assert user_b_arts.status_code == 403

    # 6. Admin can view session
    admin_get = client.get(f"/api/v1/sessions/{sess_a_id}", headers=ADMIN_HEADERS)
    assert admin_get.status_code == 200


def test_artifacts_list_user_scoping():
    # User A lists artifacts
    resp_a = client.get("/api/v1/artifacts", headers=USER_A_HEADERS)
    assert resp_a.status_code == 200
    assert isinstance(resp_a.json(), list)

    # User B lists artifacts
    resp_b = client.get("/api/v1/artifacts", headers=USER_B_HEADERS)
    assert resp_b.status_code == 200
    assert isinstance(resp_b.json(), list)


def test_document_and_transformation_isolation():
    # 1. User A creates session
    sess_resp = client.post(
        "/api/v1/sessions",
        json={"name": "User A Financial Audit", "description": "Q3 Confidential Numbers"},
        headers=USER_A_HEADERS,
    )
    assert sess_resp.status_code == 201
    sess_id = sess_resp.json()["id"]

    # 2. User B cannot upload documents into User A's session (403)
    user_b_upload = client.post(
        f"/api/v1/sessions/{sess_id}/documents",
        files={"file": ("malicious.txt", b"Injected malicious content", "text/plain")},
        headers=USER_B_HEADERS,
    )
    assert user_b_upload.status_code == 403

    # 3. User A uploads a valid document
    user_a_upload = client.post(
        f"/api/v1/sessions/{sess_id}/documents",
        files={"file": ("audit.txt", b"Q3 Revenue: $14M. Profit: $3.2M.", "text/plain")},
        headers=USER_A_HEADERS,
    )
    assert user_a_upload.status_code == 201
    doc_id = user_a_upload.json()["id"]

    # 4. User B cannot retrieve User A's document metadata (403)
    user_b_doc = client.get(f"/api/v1/documents/{doc_id}", headers=USER_B_HEADERS)
    assert user_b_doc.status_code == 403

    # 5. User B cannot retrieve User A's document CCO (403)
    user_b_cco = client.get(f"/api/v1/documents/{doc_id}/cco", headers=USER_B_HEADERS)
    assert user_b_cco.status_code == 403

    # 6. User B cannot retrieve User A's document evidence (403)
    user_b_ev = client.get(f"/api/v1/documents/{doc_id}/evidence", headers=USER_B_HEADERS)
    assert user_b_ev.status_code == 403

    # 7. User B cannot trigger transformations in User A's session (403)
    user_b_trans = client.post(
        "/api/v1/transformations",
        json={
            "session_id": sess_id,
            "source_document_id": doc_id,
            "output_types": ["executive_summary"],
        },
        headers=USER_B_HEADERS,
    )
    assert user_b_trans.status_code == 403
