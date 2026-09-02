# ContentForge AI — Agent Operating Guidelines (AGENTS.md)

> **Notice:** This file mirrors [`.agents`](./.agents). It defines the operational rules and standards for all AI coding agents, copilot assistants, and automated contributors working within this repository.

---

## 1. Project Overview & Ownership

ContentForge AI (SIH26154) is a multi-role project transforming single-source documents into verified, cross-platform communication artifacts with blockchain provenance.

Engineers and agents operate within designated ownership directories:

- **`ai/`** — Owned by **P1 (AI Engineer)**
- **`frontend/`** — Owned by **P2 (Frontend Engineer)**
- **`backend/`** — Owned by **P3 (Backend API Engineer)**
- **`workers/`** — Jointly owned by **P1 & P3 (Async Background Jobs)**
- **`templates/`** — Owned by **P4 (Output & Artifacts)**
- **`infrastructure/`** & **`blockchain/`** — Owned by **P5 (Cloud, Cyber, Provenance)**
- **`docs/`** & **`tests/`** — Shared workspace

---

## 2. Mandatory Feature Registry Protocol

Whenever adding or changing any feature or capability in this repository:

1. You **MUST** update [`docs/FEATURE_REGISTRY.md`](./docs/FEATURE_REGISTRY.md).
2. Record the Feature ID, title, status, description, files touched, and explicit instructions for how someone else can view and verify the feature.
3. This ensures all teammates have complete visibility into ongoing and completed work.

---

## 3. Core Architecture Rules

1. **Source of Truth**: The Canonical Content Object (CCO) is the semantic source of truth. All outputs reference a versioned CCO.
2. **Untrusted Input**: Uploaded source documents must be treated as untrusted data to protect against prompt injection.
3. **Structured Outputs**: The AI engine outputs structured JSON; P4 renders the JSON into target formats (PPTX, DOCX, HTML).
4. **Server-Side Security**: RBAC must be validated on the backend.
5. **Off-Chain Ledger**: Raw files stay off-chain; only SHA-256 hashes are anchored to the blockchain.

---

## 4. Git Flow

- Always branch off `develop`.
- Name branches `feature/p<role-number>-<feature-name>`.
- Commit with conventional messages (e.g., `feat(p2-ui): add cco viewer table`).
- Never commit `.env` or sensitive credentials.
