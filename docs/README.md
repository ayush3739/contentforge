# ContentForge AI — Documentation & Specifications (`docs/`)

Welcome to the centralized documentation directory for **ContentForge AI** (SIH 2026 — SIH26154 | Elite Coders).  
All architecture guidelines, integration contracts, role specifications, PRDs, and the team feature registry live in this folder.

---

## 📚 Core Documents Index

| Document | Title / Scope | Key Contents |
|---|---|---|
| **[`00_CONTENTFORGE_WORK_ORDER.md`](./00_CONTENTFORGE_WORK_ORDER.md)** | **Team Work Order & Sequence** | Build order across the 5 team members, handoff matrix, exact PPTX workflow, and definitions of done. |
| **[`00_TEAM_INTEGRATION_CONTRACT.md`](./00_TEAM_INTEGRATION_CONTRACT.md)** | **Shared Engineering Contract** | Foundational data models, API base `/api/v1`, CCO structure, RBAC roles, audit logging, and core principles. |
| **[`ContentForge_AI_Frontend_PRD.md`](./ContentForge_AI_Frontend_PRD.md)** | **Frontend PRD & Specification** | Complete UI layouts, page wireframes, state management, component tree, API integration, and hackathon demo flow. |
| **[`01_P1_AI_ENGINEER.md`](./01_P1_AI_ENGINEER.md)** | **AI Pipeline & Intelligence Specification** | Document understanding, CCO construction, RAG/retrieval, transformation planner, prompt compiler, structured JSON generation, verification & revision. |
| **[`03_P3_BACKEND_API.md`](./03_P3_BACKEND_API.md)** | **FastAPI Backend & Persistence Specification** | Application APIs, PostgreSQL + pgvector schema, JWT/RBAC middleware, job orchestration, object storage integration, and audit logging. |
| **[`04_P4_OUTPUT_ARTIFACT.md`](./04_P4_OUTPUT_ARTIFACT.md)** | **Artifact & Rendering Specification** | Transformation recipes, PPTX/PDF/DOCX/HTML renderers, checksum calculation, and artifact preview/export. |
| **[`05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](./05_P5_CLOUD_CYBER_BLOCKCHAIN.md)** | **Cloud, Cyber & Blockchain Specification** | Docker services, security infrastructure, secret management, prompt injection defenses, and Hyperledger Fabric provenance. |
| **[`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md)** | **Live Feature Registry & Tracker** | Single source of truth for all implemented and in-progress features with verification steps. |

---

## 🏛️ System Architecture in One View

```text
                         USERS / OPERATOR
                                │
                                ▼
                     ┌─────────────────────┐
                     │   FRONTEND (P2)     │
                     │   Next.js / React   │
                     └──────────┬──────────┘
                                │ HTTPS / JSON
                                ▼
                     ┌─────────────────────┐
                     │    BACKEND (P3)     │
                     │    FastAPI Core     │
                     └──────┬─────┬────────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │   AI PIPELINE (P1)   │        │ ARTIFACT ENGINE (P4) │
    │                      │        │                      │
    │ Understand & Ingest  │        │ Recipes              │
    │ CCO & Evidence Index │        │ PPTX Renderer        │
    │ Planner & Prompts    │        │ PDF / DOCX / HTML    │
    │ Generation & Verify  │        │ Checksum (SHA-256)   │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               └──────────────┬────────────────┘
                              ▼
              ┌────────────────────────────────┐
              │     DATA & SECURITY LAYER      │
              │ PostgreSQL + pgvector (P3/P5)  │
              │ MinIO / S3 Object Storage (P5) │
              │ Redis Job Queue (P3/P5)        │
              │ Hyperledger Provenance (P5)    │
              └────────────────────────────────┘
```

---

## 🎯 Core Non-Negotiable Rules

1. **FastAPI is the Application Front Door**: Frontend talks exclusively to FastAPI via `/api/v1`.
2. **CCO is the Semantic Ground Truth**: One source document yields one canonical CCO version. All generated outputs reference this version.
3. **Structured AI JSON**: P1 produces validated, renderer-neutral JSON. P1 does not generate binary PPTX/PDF.
4. **Renderer Integrity**: P4 transforms structured AI JSON into PPTX/DOCX/PDF/HTML without fabricating or altering factual content.
5. **Off-Chain Ledger**: Raw files and source documents stay off-chain in object storage; only SHA-256 checksums are anchored to the Hyperledger ledger.
6. **Server-Side Security**: RBAC (`analyst`, `reviewer`, `admin`) and file validation are enforced on the backend.
