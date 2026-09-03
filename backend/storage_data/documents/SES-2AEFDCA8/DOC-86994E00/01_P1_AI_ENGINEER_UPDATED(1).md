# Person 1 --- AI Engineer / AI Backend

## Owner: Content Intelligence + Transformation Engine

**Project:** ContentForge AI\
**SIH:** 2026 --- SIH26154\
**Team:** Elite Coders\
**Backend architecture:** FastAPI-centric

------------------------------------------------------------------------

## 1. Mission

You own the complete AI intelligence pipeline:

``` text
SOURCE
  ↓
DOCUMENT UNDERSTANDING
  ↓
CCO
  ↓
EVIDENCE / RAG
  ↓
TRANSFORMATION PLANNING
  ↓
PROMPT COMPILATION
  ↓
STRUCTURED LLM GENERATION
  ↓
VERIFICATION
  ↓
REVISION
  ↓
FINAL VERIFIED STRUCTURED CONTENT
```

Your work starts with an accessible source/document representation and
transformation request, and ends with **verified, renderer-neutral
structured JSON**.

You do NOT own React/frontend, authentication/JWT, user CRUD, session
CRUD, object-storage infrastructure, artifact download infrastructure,
PPTX/PDF rendering, Docker/deployment, or Hyperledger.

------------------------------------------------------------------------

## 2. Critical Team Boundary

### P3 Backend owns

``` text
FastAPI public API
Authentication
RBAC
Users
Sessions
Document metadata
File upload/storage integration
Transformation records
Artifact metadata
Job queue
Audit persistence
API contracts
```

### P1 AI owns

``` text
Document understanding
Parsing/OCR integration
Semantic chunking
CCO construction
Embeddings
RAG/retrieval
Transformation planner
Prompt compiler
LLM/model gateway
Structured generation
Grounding verification
Consistency checks
Revision
AI-level security
```

### P4 owns

``` text
Transformation recipes as renderer specifications
PPTX renderer
DOCX/PDF renderer
Infographic renderer
HTML/SVG
Artifact binary generation
```

Critical interface:

``` text
P1 AI
   ↓
Verified renderer-neutral JSON
   ↓
P4 Renderer
   ↓
PPTX / PDF / DOCX / SVG / HTML
```

P1 must not make PPTX binary generation part of the core AI contract.

------------------------------------------------------------------------

## 3. What P1 Needs From P3 Before Integration

P1 can start independently with fixtures, but serious integration
requires:

``` text
transformation_id
session_id
source_document_id
document_version_id
source access/storage reference
output_types
audience
tone
language
detail_level
objective
style
```

Example:

``` json
{
  "transformation_id": "TR-001",
  "session_id": "SES-001",
  "source_document_id": "DOC-001",
  "document_version_id": "DOCV-002",
  "output_types": ["executive_summary", "presentation"],
  "audience": "senior leadership",
  "tone": "professional",
  "language": "English",
  "detail_level": "concise",
  "objective": "decision briefing",
  "style": "formal"
}
```

------------------------------------------------------------------------

## 4. AI Internal Interface

Implement the AI engine as Python modules with stable interfaces:

``` python
understand(source)
build_cco(understanding)
index_chunks(chunks)
retrieve(query, filters)
plan(request, cco)
compile_prompt(plan, cco, evidence)
generate(prompt, schema)
verify(artifact, cco, evidence)
revise(artifact, verification_feedback)
transform(request)
```

Main orchestration:

``` python
transform(request)
```

returns:

``` json
{
  "transformation_id": "TR-001",
  "cco_version": 3,
  "outputs": [],
  "verification": {}
}
```

------------------------------------------------------------------------

## 5. Document Understanding

MVP priority:

1.  PDF
2.  DOCX
3.  TXT/text

Future:

-   images
-   video transcripts
-   additional document types

Pipeline:

``` text
Document
  ↓
Parser / OCR
  ↓
Layout blocks
  ↓
Semantic chunks
  ↓
Deterministic extraction
  ↓
Bounded semantic extraction
  ↓
Merge / conflict detection
  ↓
CCO
```

Do NOT make one LLM call per page.

Use deterministic extraction for dates, numbers, identifiers, URLs,
headings and table structure.

Use structured LLM extraction for semantic claims, entities,
relationships and important facts.

------------------------------------------------------------------------

## 6. CCO --- Canonical Content Object

The CCO is the semantic source of truth.

It should contain:

``` text
document metadata
version
sections
entities
claims
facts
dates
numbers
identifiers
tables
source references
page/block/bbox provenance where available
confidence
conflicts
```

Example:

``` json
{
  "document_id": "DOC-001",
  "version": 3,
  "claims": [
    {
      "id": "claim-001",
      "text": "14 systems were affected.",
      "evidence_refs": ["chunk-021"],
      "confidence": 0.96
    }
  ]
}
```

Every important generated factual statement should be traceable to
CCO/evidence.

------------------------------------------------------------------------

## 7. RAG / Evidence

RAG is retrieval memory; it is not the CCO.

Chunks should contain:

``` text
chunk_id
document_version_id
text
section
page
block
bbox
embedding
metadata
```

Retrieval:

``` text
Transformation objective
+
output type
+
CCO context
      ↓
retrieval query
      ↓
top-k evidence
      ↓
generation context
```

P3 provides PostgreSQL + pgvector access. P1 owns embedding/indexing and
retrieval strategy.

------------------------------------------------------------------------

## 8. Transformation Planner

Input:

``` text
output_types
audience
tone
language
detail_level
objective
style
```

Output:

``` json
{
  "workflow": "presentation",
  "sections": [],
  "evidence_requirements": [],
  "constraints": [],
  "schema": "PresentationSchema"
}
```

The planner decides how the source should be transformed, not what
unsupported facts should be invented.

------------------------------------------------------------------------

## 9. Prompt Compiler

Centralize prompt construction:

``` text
System Policy
+
Security Policy
+
Transformation Recipe
+
Operator Intent
+
CCO
+
Retrieved Evidence
+
Output Schema
```

Source content must remain untrusted data.

Do not allow source text to override system/application instructions.

------------------------------------------------------------------------

## 10. Model Gateway

Use a provider-independent interface:

``` python
class LLMProvider:
    async def generate(
        self,
        messages,
        response_schema,
        model=None
    ):
        ...
```

The application must not depend directly on one model provider.

Demo can use an API provider; production should permit a
local/open-weight model.

------------------------------------------------------------------------

## 11. Structured Output Schemas

Required:

``` text
ExecutiveSummary
Advisory
Presentation
InfographicSpec
VideoPackage
SocialPost
VerificationResult
```

Presentation example:

``` json
{
  "artifact_type": "presentation",
  "title": "Incident Briefing",
  "slides": [
    {
      "slide_number": 1,
      "title": "Incident Overview",
      "body": ["..."],
      "key_message": "...",
      "speaker_notes": "...",
      "evidence_refs": ["chunk-021"]
    }
  ]
}
```

The JSON must be renderer-neutral.

------------------------------------------------------------------------

## 12. Verification

Verification checks:

### Grounding

Does each important claim have supporting CCO/evidence?

### Critical facts

Verify names, numbers, dates, identifiers, events and statistics.

### Unsupported claims

Flag statements without adequate evidence.

### Cross-output consistency

If multiple outputs use CCO v3, shared facts must remain consistent.

Example:

``` text
Executive Summary → affected systems = 14
Presentation       → affected systems = 14
Advisory           → affected systems = 14
```

Verification result:

``` json
{
  "status": "REVIEW_REQUIRED",
  "grounding_score": 0.94,
  "consistency_score": 0.98,
  "unsupported_claims": [],
  "issues": []
}
```

Scores are signals, not absolute truth.

------------------------------------------------------------------------

## 13. Revision Loop

``` text
GENERATE
  ↓
VERIFY
  ↓
PASS? ── YES → FINAL
  ↓ NO
COLLECT ISSUES
  ↓
RETRIEVE BETTER EVIDENCE
  ↓
REVISE
  ↓
VERIFY AGAIN
```

Use a bounded retry count, e.g.:

``` text
MAX_REVISIONS = 2
```

Never allow unbounded LLM retries.

------------------------------------------------------------------------

## 14. AI Security

P1 owns:

-   prompt-injection resistance
-   source/instruction separation
-   structured-output validation
-   unsupported-claim detection
-   context/token limits
-   model timeouts
-   bounded retries
-   suspicious instructions in retrieved content
-   AI security-event emission

P5 owns infrastructure security.

A source document is **data**, not instructions.

------------------------------------------------------------------------

## 15. Multiple Outputs From One Source

Do not independently summarize the source six times.

Preferred:

``` text
SOURCE
  ↓
ONE CCO
  ↓
ONE EVIDENCE LAYER
  ↓
MULTIPLE TRANSFORMATION PLANS
  ├── Executive Summary
  ├── Advisory
  ├── Presentation
  ├── Infographic
  ├── Video Package
  └── Social
```

This is essential for cross-output consistency.

------------------------------------------------------------------------

## 16. PPT Output Contract

P1 generates:

``` text
Presentation JSON
```

P1 does NOT generate:

``` text
presentation.pptx
```

Workflow:

``` text
Source
 ↓
CCO
 ↓
Evidence
 ↓
Presentation Planner
 ↓
Presentation JSON
 ↓
Verification
 ↓
Verified Presentation JSON
 ↓
P4
 ↓
PPTX
```

Each slide should carry evidence references where appropriate.

------------------------------------------------------------------------

## 17. Artifact Storage Boundary

P1 does not store final PPTX/PDF binaries.

``` text
P1 → verified JSON
P4 → PPTX/PDF binary
P3 → artifact metadata/API
P5 → object-storage infrastructure
```

Object storage contains actual files. PostgreSQL contains metadata.

------------------------------------------------------------------------

## 18. AI Database Dependencies

Coordinate with P3. Do not create duplicate application tables.

P1 needs access to:

``` text
documents
document_versions
source_blocks
chunks
cco_versions
transformation_requests
transformation_recipes
artifacts
verification_results
```

Persistence schema ownership stays with P3.

------------------------------------------------------------------------

## 19. Development Order

### Phase 1

``` text
TXT → CCO → verified structured JSON
```

### Phase 2

``` text
PDF → layout-aware extraction → CCO
```

### Phase 3

``` text
CCO → chunks → embeddings → pgvector → retrieval
```

### Phase 4

``` text
CCO + evidence → Executive Summary → verification
```

### Phase 5

Add LinkedIn/X, Advisory, Presentation, InfographicSpec and
VideoPackage.

### Phase 6

Add revision loop and multi-output consistency.

------------------------------------------------------------------------

## 20. Testing

Test independently:

``` text
CCO extraction
chunking
retrieval
schema validation
prompt injection
grounding
critical-number consistency
cross-output consistency
model timeout
revision bounds
```

Use deterministic fixtures.

------------------------------------------------------------------------

## 21. Definition of Done

P1 is complete when:

``` text
PDF/TXT
   ↓
Understanding
   ↓
CCO
   ↓
RAG
   ↓
Transformation Plan
   ↓
Structured Generation
   ↓
Verification
   ↓
Verified JSON
```

works end-to-end.

Presentation integration must produce verified Presentation JSON that P4
can render into PPTX.

------------------------------------------------------------------------

## 22. Key Principle

> **Your job is not to make an LLM call. Your job is to build the
> content-intelligence and transformation engine around the LLM.**
