# Shared Testing Workspace

> **Shared Ownership:** All team members  
> **Frameworks:** `pytest` (Backend/AI/Renderers), `jest` / `vitest` (Frontend)

---

## 🎯 Testing Responsibilities

Every PR into `develop` must include tests validating its features:

- **P1 (AI)**: Unit tests for extraction rules, CCO validation, prompt compiler, and verification scoring logic.
- **P2 (Frontend)**: Component tests, form validation, and mock API handling.
- **P3 (Backend)**: FastAPI test client tests for `/api/v1` routes, auth, RBAC permissions, and DB queries.
- **P4 (Artifacts)**: Recipe validation tests, rendering tests (verifying PPTX and HTML output structures), and checksum checks.
- **P5 (Infra & Security)**: Audit log generation tests, tamper detection verification, and token expiration tests.

---

## 🏃 Running Tests

```bash
# Backend & AI Python tests
pytest tests/
pytest backend/tests/
pytest ai/tests/

# Frontend tests
cd frontend && npm test
```
