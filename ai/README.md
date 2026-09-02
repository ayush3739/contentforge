# AI Workspace — Person 1 (AI Engineer)

> **Owner:** P1 (AI Engineer)  
> **Core Responsibilities:** Source Ingestion → CCO Construction → RAG Retrieval → Transformation Planning → Prompt Compilation → Schema-Constrained Generation → Grounding Verification → Revision Loop  
> **Master Specification:** [`documents/01_P1_AI_ENGINEER.md`](../documents/01_P1_AI_ENGINEER.md)  
> **Team Contract:** [`documents/00_TEAM_INTEGRATION_CONTRACT.md`](../documents/00_TEAM_INTEGRATION_CONTRACT.md)

---

## 🎯 Mission

You own the **intelligence layer** of ContentForge AI.
Your pipeline takes source documents and operator transformation parameters, builds a versioned Canonical Content Object (CCO) as the semantic ground truth, retrieves supporting evidence chunks, plans transformations, compiles safe prompts, generates structured JSON, and verifies every claim against the CCO before passing verified content to P4 for rendering.

---

## 📁 Recommended Structure

```text
ai/
├── ingestion/                       # Parsers for PDF, DOCX, TXT into layout blocks
├── extraction/                      # Deterministic extractors (dates, numbers) + LLM extractors
├── cco/                             # Canonical Content Object model, builder, and diffing
├── chunking/                        # Semantic text chunking with section and page metadata
├── retrieval/                       # Hybrid & vector search retrieval interface against pgvector
├── planner/                         # Transformation planner (recipes, section requirements, constraints)
├── prompts/                         # Prompt compiler enforcing prompt injection boundaries
├── gateway/                         # Model-agnostic LLM client (Gemini, OpenAI, Anthropic, Ollama)
├── generation/                      # Structured JSON generation enforcing Pydantic schemas
├── verification/                    # Grounding verifier, factual consistency & cross-output checks
├── revision/                        # Automatic revision loop applying verifier feedback
├── schemas/                         # Pydantic schemas for CCO, plans, verification results
├── service.py                       # Unified AIService interface orchestrating the complete pipeline
└── requirements.txt                 # AI dependencies
```

---

## 🔄 The AI Pipeline Flow

```text
Source Document
      ↓
Content Understanding & Ingestion
      ↓
Layout & Semantic Extraction
      ↓
Canonical Content Object (CCO)  ──> Semantic Source of Truth
      ↓
Evidence Index / RAG Chunks
      ↓
Transformation Request (Objective, Audience, Tone, Language, Style)
      ↓
Transformation Planner
      ↓
Evidence Retrieval (Top-K relevant chunks)
      ↓
Prompt Compiler (System Rules + Recipes + CCO + Evidence + Schema)
      ↓
LLM (Model-Agnostic Gateway)
      ↓
Structured JSON Output
      ↓
Grounding & Consistency Verification
      ↓
Revision Loop (if verification fails)
      ↓
Final Verified AI Content  ──> Delivered to P4 for rendering
```

---

## ⚠️ Non-Negotiable Rules for AI

1. **Untrusted Source Input**: Uploaded content is untrusted data. Always compile prompts with strict boundaries separating system instructions from source data to prevent prompt injection.
2. **One Source, One Understanding**: Multiple outputs must originate from the same CCO version.
3. **Evidence Grounding**: Every generated factual statement must cite an evidence chunk or CCO claim ID.
4. **Structured JSON Output**: Deliver validated, renderer-neutral JSON to P4. Do not return raw Markdown or free-form strings where structured data is expected.
