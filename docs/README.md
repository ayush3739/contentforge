# Shared Team Documentation & Knowledge Base

This folder serves as the shared reference and technical index for all five engineers on the ContentForge AI team.

---

## 📚 Core Documentation Index

The source-of-truth specifications are maintained in the [`documents/`](../documents) directory:

1. **[00_TEAM_INTEGRATION_CONTRACT.md](../documents/00_TEAM_INTEGRATION_CONTRACT.md)**  
   *The foundational contract for all five developers. Defines shared tech baseline, DB schema, API routes, RBAC, and git rules.*

2. **[01_P1_AI_ENGINEER.md](../documents/01_P1_AI_ENGINEER.md)**  
   *Complete AI pipeline specification: Ingestion, Extraction, CCO model, RAG, Prompt Compiler, Generation, Verification, Revision.*

3. **[03_P3_BACKEND_API.md](../documents/03_P3_BACKEND_API.md)**  
   *Backend application architecture: FastAPI, routes, DB entities, migrations, RBAC middleware, job orchestration, audit logging.*

4. **[04_P4_OUTPUT_ARTIFACT.md](../documents/04_P4_OUTPUT_ARTIFACT.md)**  
   *Artifact and output engine specification: Transformation recipes, renderers (PPTX, DOCX/PDF, HTML, Social), checksums, versioning.*

5. **[05_P5_CLOUD_CYBER_BLOCKCHAIN.md](../documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md)**  
   *Security, infrastructure, and blockchain guide: Docker setup, audit trail, security events, prompt injection defense, Hyperledger provenance.*

6. **[ContentForge_AI_Frontend_PRD.md](../documents/ContentForge_AI_Frontend_PRD.md)**  
   *Frontend PRD: Complete UI layouts, page wireframes, state management, component tree, API integration, and hackathon demo flow.*

---

## 🏛️ Quick Architecture Summary

- **CCO (Canonical Content Object)** = Semantic source of truth.
- **RAG / Evidence Index** = Retrieval memory (cites exact chunks/pages).
- **Session State** = Application / workspace memory.
- **Artifacts** = Generated products (PPTX, PDF, HTML) strictly reflecting CCO.
- **LLM** = Replaceable transformation engine behind an agnostic gateway.
- **Provenance** = SHA-256 hashes of finalized artifacts anchored to Hyperledger Fabric.
