# ContentForge AI — Feature Registry & Change Tracker

> **Purpose:** This is the single source of truth for all implemented and in-progress features across the team.  
> **Mandatory Rule for Developers & AI Agents:** Whenever adding, updating, or completing a feature, you **MUST** record it in this file so teammates, leads, and reviewers can view, test, and verify what was built.

---

## 📊 Summary Status Board

| Feature ID | Feature Name | Owner | Branch | Status | Last Updated |
|---|---|---|---|---|---|
| `FEAT-000` | Repository Scaffold & Base Setup | Shared | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-001` | Streamline to Frontend, Backend & Docs | Shared | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-002` | Root Registry & Organized Docs Hub (PRDs & Specs) | Shared | `main` | ✅ Completed | 2026-09-02 |
| `FEAT-BE-001`| Backend uv Init, Folder Layout & Health Route | P3 (Backend) | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-AI-001`| Content Intelligence & Transformation Engine (P1) | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-002`| Consolidated Schema Migration & Sample Doc Ingestion | P1 / P3 | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-003`| Server-Sent Events (SSE) Live Transformation Stream | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-004`| Agentic RAG Pipeline & CCO Memory Optimization | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-FE-001`| *Example: Session Workspace & CCO Viewer* | P2 (Frontend) | `feature/frontend-workspace` | 📋 Planned | - |
| `FEAT-RN-001`| *Example: Executive Summary HTML Renderer*| P4 (Renderers)| `feature/renderer-exec`| 📋 Planned | - |

---

## 📝 Detailed Feature Log

### [FEAT-002] Root Registry & Organized Docs Hub (PRDs & Specifications)
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `main` / `develop`
- **Status:** ✅ Completed
- **Description:**  
  Established `registry/` at the repository root as the dedicated space for working logs and feature tracking (`FEATURE_REGISTRY.md`). Inside `docs/`, cleanly organized documentation into two clear categories: `docs/prds/` (Product Requirements Documents) and `docs/specifications/` (Technical engineering contracts, work orders, and role architecture specifications). Updated all repository pointers and agent instructions accordingly.
- **Touched / Created Files:**
  - `registry/FEATURE_REGISTRY.md`, `registry/README.md`
  - `docs/prds/` (PRDs)
  - `docs/specifications/` (contracts, work orders, P1-P5 specifications)
  - `docs/README.md`, `README.md`, `CONTRIBUTING.md`, `.agents`, `AGENTS.md`
  - `backend/README.md`, `frontend/README.md`
- **How to View & Verify:**
  - View root directory: `ls -la` (shows `registry/` at root alongside `docs/`, `frontend/`, and `backend/`)
  - Inspect `docs/`: `ls docs/` (shows `prds/` and `specifications/`)
  - Inspect registry: `cat registry/FEATURE_REGISTRY.md`

---

### [FEAT-BE-001] Backend uv Init, Package Structure & Health Route
- **Role / Owner:** P3 (Backend API Engineer)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Initialized the Python backend project with `uv` (`pyproject.toml` with FastAPI, Uvicorn, Pytest, HTTPX), established initial package directories with purpose documentation (`app/api/v1/`, `app/ai/`, `app/renderers/`, `app/core/`, `app/models/`, `app/schemas/`, `app/services/`, `app/jobs/`, `app/storage/`, `app/audit/`, `migrations/`, `tests/`), created `app/main.py` with CORS and health check routes (`GET /health`, `GET /api/v1/health`), and verified functionality with automated unit tests.
- **Touched / Created Files:**
  - `backend/pyproject.toml`, `backend/.python-version`, `backend/uv.lock`
  - `backend/app/main.py` (FastAPI app with `/health` and `/api/v1/health`)
  - `backend/app/__init__.py`
  - `backend/app/api/__init__.py`, `backend/app/api/v1/__init__.py`
  - `backend/app/ai/__init__.py`, `backend/app/renderers/__init__.py`
  - `backend/app/core/__init__.py`, `backend/app/models/__init__.py`
  - `backend/app/schemas/__init__.py`, `backend/app/services/__init__.py`
  - `backend/app/jobs/__init__.py`, `backend/app/storage/__init__.py`, `backend/app/audit/__init__.py`
  - `backend/migrations/README.md`
  - `backend/tests/__init__.py`, `backend/tests/test_health.py`
- **How to View & Verify:**
  - Run automated tests:
    ```bash
    cd backend
    uv run pytest
    ```
  - Start the backend server:
    ```bash
    cd backend
    uv run uvicorn app.main:app --reload --port 8000
    ```
  - View Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
  - Query health route: [http://localhost:8000/health](http://localhost:8000/health) or `curl http://localhost:8000/health` (Expected output: `{"status":"healthy","service":"backend","database":"ready","version":"0.1.0"}`)

---

### [FEAT-AI-001] Content Intelligence & Transformation Engine (P1)
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Implemented the complete P1 intelligence and transformation pipeline according to `01_P1_AI_ENGINEER_UPDATED(1).md` and `00_TEAM_INTEGRATION_CONTRACT.md`. Includes:
  1. **Database Models & Alembic Migrations:** Full ORM models (`Document`, `DocumentVersion`, `SourceBlock`, `Chunk` with pgvector `Vector(384)`, `CCOVersion`, `TransformationRequest`, `Artifact`, `VerificationResult`, `ProvenanceRecord`, `AuditLog`, `SecurityEvent`) and executed migration `fd0001723855` against Neon DB.
  2. **Model-Agnostic LLM Gateway:** Provider-independent gateway (`LLMProvider`) supporting Google Gemini (`gemini-2.5-flash`), Groq (`llama-3.3-70b-versatile`), and OpenAI fallback.
  3. **Local Vector Embeddings:** Zero-cost, offline-capable sentence-transformers embedding engine (`all-MiniLM-L6-v2`, 384 dimensions) for pgvector RAG indexing.
  4. **Document Ingestion & Understanding:** Layout-aware parser for TXT/MD/PDF, regex-based deterministic extractor (dates, numbers, metrics, CVE/incident IDs), and bounded semantic LLM extractor (claims, entities, key findings).
  5. **Canonical Content Object (CCO) Builder:** Semantic source-of-truth builder with integrity hash (SHA-256), conflict tracking, and evidence linkage.
  6. **Semantic Chunking & pgvector RAG:** 300-500 token window chunker with page/section provenance and cosine distance similarity search.
  7. **Transformation Planner & Prompt Compiler:** Tamper-resistant prompt compiler enforcing strict source/instruction separation to prevent prompt injection.
  8. **Structured Generation & Verification Engine:** Pydantic schema validation for Presentation (slides), ExecutiveSummary, and Advisory; automated grounding checker, unsupported number detection, and bounded automated revision loop (`MAX_REVISIONS = 2`).
  9. **FastAPI Endpoints:** `POST /api/v1/ai/transform` and `GET /api/v1/ai/health`.
- **Key Modules / Files Modified:**
  - `backend/app/models/` (`base.py`, `user.py`, `session.py`, `document.py`, `chunk.py`, `cco.py`, `transformation.py`, `artifact.py`, `provenance.py`, `audit.py`)
  - `backend/migrations/` (`env.py`, `versions/fd0001723855_initial_schema_with_pgvector.py`, `script.py.mako`)
  - `backend/app/core/` (`config.py`, `database.py`)
  - `backend/app/ai/gateway.py`, `backend/app/ai/embeddings.py`
  - `backend/app/ai/ingestion/parser.py`, `backend/app/ai/extraction/deterministic.py`, `backend/app/ai/extraction/semantic.py`, `backend/app/ai/cco/builder.py`
  - `backend/app/ai/chunking/chunker.py`, `backend/app/ai/retrieval/indexer.py`, `backend/app/ai/retrieval/retriever.py`
  - `backend/app/ai/schemas/` (`presentation.py`, `executive_summary.py`, `advisory.py`, `__init__.py`)
  - `backend/app/ai/planner/planner.py`, `backend/app/ai/prompts/compiler.py`, `backend/app/ai/generation/generator.py`
  - `backend/app/ai/verification/verifier.py`, `backend/app/ai/revision/revisor.py`, `backend/app/ai/pipeline.py`
  - `backend/app/api/v1/ai.py`, `backend/app/main.py`
  - `backend/tests/test_ai_pipeline.py`
- **Exposed Endpoints:**
  - `POST /api/v1/ai/transform` — Full transformation pipeline (Input: raw text / document + target formats; Output: verified renderer-neutral JSON)
  - `GET /api/v1/ai/health` — AI subsystem health and active model configuration
- **How to View & Verify:**
  - Run the automated test suite:
    ```bash
    cd backend
    uv run pytest
    ```
    (Expected output: 11 passed tests)
  - Verify database migrations on Neon DB:
    ```bash
    cd backend
    uv run alembic current
    ```
    (Expected output: `fd0001723855 (head)`)
  - Start server and query AI health:
    ```bash
    cd backend
    uv run uvicorn app.main:app --reload --port 8000
    ```
    Visit [http://localhost:8000/api/v1/ai/health](http://localhost:8000/api/v1/ai/health) or check Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### [FEAT-001] Streamline Repository to Frontend, Backend & Docs
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Consolidated the repository layout into two primary application packages (`frontend/` and `backend/`) and a single centralized documentation folder (`docs/`). Moved all specification documents from `documents/` into `docs/` and integrated updated work order (`00_CONTENTFORGE_WORK_ORDER.md`), AI engineering specs (`01_P1_AI_ENGINEER.md`), backend specs (`03_P3_BACKEND_API.md`), and cloud/blockchain specs (`05_P5_CLOUD_CYBER_BLOCKCHAIN.md`).
- **Touched / Created Files:**
  - `frontend/` (Next.js application workspace)
  - `backend/` (FastAPI core, AI intelligence, artifact renderers)
  - `docs/` (all contracts, work orders, PRDs, and feature registry)
  - `README.md`, `CONTRIBUTING.md`, `.agents`, `AGENTS.md`
- **How to View & Verify:**
  - View root directory: `ls -la` (only `frontend/`, `backend/`, and `docs/` appear as workspaces)
  - Inspect `docs/` to confirm all specifications are present: `ls docs/`

### [FEAT-AI-002] Consolidated Schema Migration & Sample Multi-Page Test Documents
- **Role / Owner:** P1 (AI Engineer) / P3 (Backend API)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Consolidated database models to simplify maintenance:
  1. Merged `roles` and `user_roles` into a single `role` column on `users`.
  2. Merged `document_versions` into `documents` (`version`, `checksum`, `storage_key`, `status`).
  3. Merged `artifact_versions` into `artifacts` (`version`, `revision_history` JSONB).
  4. Repointed `chunks`, `source_blocks`, and `cco_versions` directly to `documents.id`.
  5. Applied Alembic migration `0f944dc249bc` to Neon PostgreSQL.
  6. Added native Microsoft Word (.docx) support to the ingestion parser alongside PDF and text.
  7. Created multi-page test documents (`sample_documents/cyber_incident_report_INC88412.docx` and `.pdf`) modeling a public sector cyber incident report (SIH26154).
- **Touched / Created Files:**
  - `backend/app/models/user.py`, `document.py`, `chunk.py`, `cco.py`, `artifact.py`, `__init__.py`
  - `backend/app/ai/ingestion/parser.py` (added `parse_docx`)
  - `backend/app/ai/pipeline.py`, `indexer.py`, `retriever.py`
  - `backend/migrations/versions/0f944dc249bc_consolidate_and_simplify_models.py`
  - `backend/scripts/generate_sample_documents.py`
  - `backend/sample_documents/cyber_incident_report_INC88412.docx`
  - `backend/sample_documents/cyber_incident_report_INC88412.pdf`
- **How to View & Verify:**
  - Run test suite: `uv run pytest` (11/11 passing)
  - Inspect sample documents in `backend/sample_documents/`

### [FEAT-AI-003] Server-Sent Events (SSE) Live Transformation Streaming
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Implemented real-time Server-Sent Events (SSE) streaming for the AI document transformation pipeline.
  - Added async generator `run_transformation_pipeline_stream` in `backend/app/ai/pipeline.py`.
  - Exposed `POST /api/ai/transform/stream` returning `text/event-stream`.
  - Streams live milestone events:
    - `event: progress` (stage, percentage 5-95%, description)
    - `event: artifact` (streams individual artifacts as soon as they are generated and verified)
    - `event: complete` (yields the complete `PipelineTransformResponse` payload)
    - `event: error` (safe error handling without crashing connection)
  - Configured `WindowsSelectorEventLoopPolicy` in `app/main.py` for Psycopg async pool compatibility on Windows.
- **Touched / Created Files:**
  - `backend/app/ai/pipeline.py` (`run_transformation_pipeline_stream`)
  - `backend/app/api/ai.py` (`POST /transform/stream`)
  - `backend/app/main.py` (`WindowsSelectorEventLoopPolicy`)
- **How to View & Verify:**
  - Test via Swagger UI or via `uv run python scripts/run_user_document_pipeline.py`.

---

### [FEAT-AI-004] Agentic RAG Pipeline & CCO Memory Optimization
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Overhauled the AI pipeline architecture to move from static RAG querying to Agentic RAG querying.
  1. **Dual-Model Tiering:** Configured separate routing/planning model (`GROQ_ROUTER_MODEL`) and generation model (`GROQ_GENERATION_MODEL`) for cost/speed efficiency.
  2. **CCO Memory Density Optimization:** Removed generic entity extraction from the LLM prompt, relying completely on deterministic regex endpoints for identifiers (CVEs, IPs, dates, currencies), and increased factual claim extraction limits (from 15 to 40).
  3. **Agentic RAG:** Updated `planner.py` to use an LLM (`plan_transformation_async`) to dynamically analyze the CCO and formulate 3-5 hyper-specific context queries instead of a single static search term.
  4. **Schema Enrichment:** Replaced static JSON outputs with robust structures, adding an `ioc_table` and `incident_timeline` to `AdvisorySchema`, and a `financial_exposure` and `strategic_recommendations` breakdown to `ExecutiveSummarySchema`.
  5. **Context Window Expansion:** Updated `compiler.py` to inject larger chunks of the CCO (40 claims, 40 metrics, 40 identifiers) and executed multi-query aggregation in `pipeline.py`.
- **Touched / Created Files:**
  - `backend/app/core/config.py`, `backend/app/ai/gateway.py`
  - `backend/app/ai/extraction/semantic.py`
  - `backend/app/ai/planner/planner.py`
  - `backend/app/ai/pipeline.py`
  - `backend/app/ai/prompts/compiler.py`
  - `backend/app/ai/schemas/advisory.py`, `backend/app/ai/schemas/executive_summary.py`
- **How to View & Verify:**
  - Run `uv run python scripts/run_user_document_pipeline.py`. Inspect `latest_run_output.json` to see the enriched, multi-paragraph schemas and Agentic plan execution.
  - Run test suite: `uv run pytest` (11/11 passing)

---

### [FEAT-000] Initial Repository Scaffold & Shared Contracts
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Initialized the ContentForge AI monorepo structure, created master configuration files (`.gitignore`, `.env.example`, `docker-compose.yml`, GitHub Actions CI), and established initial team guidelines.
- **Touched / Created Files:**
  - `README.md`, `CONTRIBUTING.md`, `.gitignore`, `.env.example`, `docker-compose.yml`
  - `.github/workflows/ci.yml`
- **How to View & Verify:**
  - Check git status and branches: `git status`, `git branch -a`

---

<!-- 
================================================================================
TEMPLATE FOR NEW FEATURES:
Copy and paste this template below whenever implementing a new feature or task.
================================================================================

### [FEAT-<Area>-<Number>] <Feature Title>
- **Role / Owner:** P1 (AI) | P2 (Frontend) | P3 (Backend) | P4 (Output) | P5 (Infra/Security/Blockchain)
- **Date Added:** YYYY-MM-DD
- **Branch:** feature/<area>-<name>
- **Status:** 🟡 In Progress | ✅ Completed | 🧪 In Review / Testing
- **Description:**  
  <Clear explanation of what the feature does, the problem it solves, and how it fits into the ContentForge pipeline>
- **Key Modules / Files Modified:**
  - `backend/app/path/to/file.py`
  - `frontend/path/to/file.tsx`
- **Exposed Endpoints / Components / Recipes:**
  - `POST /api/v1/your-endpoint` (if backend)
  - `<ComponentName />` (if frontend)
- **How to View & Verify:**
  - Command: `<command to run tests or start service>`
  - URL / Page: `<URL to view the feature in browser or Swagger>`
  - Expected Behavior: `<What someone viewing the feature should observe>`
-->
