# ContentForge AI — Documentation Hub (`docs/`)

Welcome to the centralized documentation hub for **ContentForge AI** (SIH 2026 — SIH26154 | Elite Coders).  
Documentation is organized into two distinct sections: **Project Specifications** and **Working Logs & Registry**.

---

## 📁 Documentation Organization

```text
docs/
├── specifications/          # Official project documents, contracts, work orders & PRDs
│   ├── 00_CONTENTFORGE_WORK_ORDER.md
│   ├── 00_TEAM_INTEGRATION_CONTRACT.md
│   ├── ContentForge_AI_Frontend_PRD.md
│   ├── 01_P1_AI_ENGINEER.md
│   ├── 03_P3_BACKEND_API.md
│   ├── 04_P4_OUTPUT_ARTIFACT.md
│   ├── 05_P5_CLOUD_CYBER_BLOCKCHAIN.md
│   └── README.md
│
├── registry/                # Live feature registry and working logs
│   ├── FEATURE_REGISTRY.md  # Single source of truth for implemented features & verification steps
│   └── README.md
│
└── README.md                # This directory index
```

---

## 📑 1. Project Specifications (`docs/specifications/`)

| Document | Scope |
|---|---|
| **[`specifications/00_CONTENTFORGE_WORK_ORDER.md`](./specifications/00_CONTENTFORGE_WORK_ORDER.md)** | Master team execution sequence, handoff matrix, and PPTX workflow. |
| **[`specifications/00_TEAM_INTEGRATION_CONTRACT.md`](./specifications/00_TEAM_INTEGRATION_CONTRACT.md)** | Shared engineering contract across all developers (DB, API, CCO, RBAC). |
| **[`specifications/ContentForge_AI_Frontend_PRD.md`](./specifications/ContentForge_AI_Frontend_PRD.md)** | Complete UI wireframes, page layouts, and client specifications. |
| **[`specifications/01_P1_AI_ENGINEER.md`](./specifications/01_P1_AI_ENGINEER.md)** | AI intelligence pipeline: CCO extraction, RAG, structured generation, verification. |
| **[`specifications/03_P3_BACKEND_API.md`](./specifications/03_P3_BACKEND_API.md)** | FastAPI backend APIs, PostgreSQL+pgvector, JWT/RBAC, and job orchestration. |
| **[`specifications/04_P4_OUTPUT_ARTIFACT.md`](./specifications/04_P4_OUTPUT_ARTIFACT.md)** | Transformation recipes, PPTX/PDF/DOCX renderers, and SHA-256 checksums. |
| **[`specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](./specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN.md)** | Security controls, Docker setup, audit logging, and Hyperledger provenance. |

---

## 📋 2. Working Logs & Feature Registry (`docs/registry/`)

- **[`registry/FEATURE_REGISTRY.md`](./registry/FEATURE_REGISTRY.md)**:  
  **Mandatory Tracker:** Whenever any teammate or AI agent adds, modifies, or finishes a feature, they **must** log the Feature ID, description, touched files, and verification commands in this registry so teammates can inspect and verify their work.
