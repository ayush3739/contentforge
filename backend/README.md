# Backend Workspace — Person 3 (Backend & Database Engineer)

> **Owner:** P3 (Backend / Database Engineer)  
> **Core Stack:** Python 3.11+, FastAPI, PostgreSQL 16 + pgvector, SQLAlchemy 2.0, Alembic, Redis  
> **Master Specification:** [`documents/03_P3_BACKEND_API.md`](../documents/03_P3_BACKEND_API.md)  
> **Team Contract:** [`documents/00_TEAM_INTEGRATION_CONTRACT.md`](../documents/00_TEAM_INTEGRATION_CONTRACT.md)

---

## 🎯 Mission

You own the **FastAPI application layer, database models, persistence, authentication, RBAC middleware, job orchestration, and public APIs**.
You connect the frontend with the AI pipeline (P1) and artifact renderers (P4).

---

## 📁 Recommended Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/                      # API routers (/auth, /sessions, /documents, /transformations, /artifacts, /admin)
│   ├── auth/                        # Password hashing, JWT token creation/validation
│   ├── core/                        # Application configuration, settings, database session
│   ├── middleware/                  # Server-side RBAC middleware, request tracing
│   ├── models/                      # SQLAlchemy ORM models
│   ├── schemas/                     # Pydantic v2 validation models (Request/Response)
│   ├── services/                    # Business service layer (interfaces with P1 AI & P4 renderers)
│   ├── repositories/                # Database query abstractions
│   ├── jobs/                        # Async task orchestration & Redis job state
│   └── main.py                      # FastAPI application entrypoint with CORS & error handlers
├── migrations/                      # Alembic database migrations
├── tests/                           # Backend unit and API tests
└── requirements.txt                 # Backend dependencies
```

---

## 🌐 Public API Contract (`/api/v1`)

- **Auth**: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **Sessions**: `POST /sessions`, `GET /sessions`, `GET /sessions/{id}`, `PATCH /sessions/{id}`
- **Documents**: `POST /sessions/{id}/documents`, `GET /documents/{id}`, `GET /documents/{id}/versions`, `GET /documents/{id}/cco`, `GET /documents/{id}/evidence`
- **Transformations**: `POST /transformations`, `GET /transformations/{id}`, `GET /transformations/{id}/status`
- **Artifacts**: `GET /artifacts/{id}`, `GET /artifacts/{id}/versions`, `GET /artifacts/{id}/download`, `POST /artifacts/{id}/finalize`
- **Verification**: `GET /artifacts/{id}/verification`, `POST /artifacts/{id}/verify`, `POST /artifacts/{id}/revise`
- **Provenance**: `GET /provenance/{id}`, `POST /provenance/{id}/anchor`
- **Admin**: `GET /admin/users`, `POST /admin/users`, `GET /admin/audit-logs`, `GET /admin/security-events`

---

## 🚀 Quickstart

```bash
# 1. Enter the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
alembic upgrade head

# 5. Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive Swagger documentation will be available at `http://localhost:8000/docs`.

---

## ⚠️ Non-Negotiable Rules for Backend

1. **No AI in Route Handlers**: Route handlers must delegate AI processing to P1's AI service via asynchronous background jobs or workers.
2. **PostgreSQL JSONB**: Store semi-structured data (`cco_json`, `issues_json`) as JSONB while keeping high-value identifiers as indexed relational columns.
3. **Off-Storage Binary Files**: Never store binary PDFs/DOCX in PostgreSQL. Store `storage_key`, `checksum`, and `mime_type` in the DB and binary data in object storage.
4. **Enforce RBAC Server-Side**: Protect routes using dependencies like `require_role("reviewer")` or `require_role("admin")`.
