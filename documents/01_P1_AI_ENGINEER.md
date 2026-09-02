# Person 1 — AI Engineer / AI Backend
## Owner: Complete AI Pipeline — Source/Prompt → Final Verified Content

## 1. Mission

You own the **entire intelligence layer** of ContentForge AI.

Your responsibility begins when source information and operator transformation parameters enter the AI pipeline and ends when the system has produced **structured, verified content** ready for P4 to render.

You are NOT responsible for the React UI, core CRUD APIs, infrastructure, or blockchain.

---

# 2. Your Pipeline

```text
SOURCE
 ↓
INGESTED REPRESENTATION
 ↓
CONTENT UNDERSTANDING
 ↓
LAYOUT / SEMANTIC EXTRACTION
 ↓
CCO
 ↓
EVIDENCE INDEX / RAG
 ↓
TRANSFORMATION REQUEST
 ↓
TRANSFORMATION PLANNER
 ↓
EVIDENCE RETRIEVAL
 ↓
PROMPT COMPILER
 ↓
LLM
 ↓
STRUCTURED OUTPUT
 ↓
GROUNDING VERIFICATION
 ↓
CROSS-OUTPUT CONSISTENCY
 ↓
REVISION LOOP
 ↓
FINAL VERIFIED AI CONTENT
```

---

# 3. Modules You Own

```text
ai/
├── ingestion/
├── extraction/
├── cco/
├── chunking/
├── retrieval/
├── planner/
├── prompts/
├── generation/
├── verification/
├── revision/
├── schemas/
└── service.py
```

## Ingestion/Understanding

Input may include:

- text
- PDF
- DOCX
- image
- video transcript
- free-text context

The initial MVP should prioritize PDF/DOCX/text.

Do not make every page an independent LLM call.

---

# 4. Extraction Architecture

Preferred flow:

```text
Document
 ↓
Parser/OCR
 ↓
Layout blocks
 ↓
Semantic chunking
 ↓
Deterministic extraction
 ↓
Bounded/batched semantic extraction
 ↓
Merge + resolve
 ↓
CCO
```

Use deterministic extraction where possible:

- dates
- numbers
- IDs
- URLs
- headings
- table structure

Use LLM structured extraction for semantic:

- claims
- entities
- relationships
- important facts

---

# 5. CCO

The CCO is the semantic source of truth.

It should represent:

```text
metadata
sections
entities
claims
facts
dates
numbers
tables
evidence references
confidence
conflicts
```

Example:

```json
{
  "version": 3,
  "entities": [],
  "claims": [
    {
      "id": "claim-001",
      "text": "...",
      "evidence_refs": ["chunk-12"],
      "confidence": 0.96
    }
  ]
}
```

Every important generated factual statement should be traceable to CCO/evidence.

---

# 6. RAG

RAG is retrieval memory.

It should contain chunks with:

```text
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

Use RAG when the generation task requires source details that should not be stuffed into a giant prompt.

Retrieval should be:

```text
Transformation objective
+
output type
+
CCO
 ↓
retrieval query
 ↓
top-k evidence
 ↓
generation context
```

---

# 7. Transformation Planner

Input:

```text
output_types
audience
tone
language
detail_level
objective
style
```

Output:

```json
{
  "workflow": "executive_summary",
  "sections": [],
  "evidence_requirements": [],
  "constraints": [],
  "schema": "ExecutiveSummarySchema"
}
```

The planner decides **how** to transform, not the final factual content.

---

# 8. Prompt Compiler

Do not construct prompts as random strings throughout the codebase.

Create a centralized prompt layer:

```text
system instructions
+
security constraints
+
transformation recipe
+
operator parameters
+
CCO facts
+
retrieved evidence
+
output schema
```

Conceptually:

```text
Prompt =
SystemPolicy
+ SecurityPolicy
+ Recipe
+ OperatorIntent
+ CCO
+ Evidence
+ OutputSchema
```

Source content must remain untrusted data.

---

# 9. Model Gateway

Create a model-agnostic interface:

```python
class LLMProvider:
    async def generate(
        self,
        messages,
        response_schema,
        model=None
    ):
        ...
```

Possible providers:

```text
Gemini/OpenAI-compatible API for demo
↓
local/open-weight model later
```

Do not hard-code the rest of the application to one model.

---

# 10. Structured Generation

Prefer schema-constrained output.

Examples:

```text
ExecutiveSummary
SocialPost
Advisory
Presentation
InfographicSpec
VideoPackage
```

Example:

```json
{
  "title": "...",
  "key_points": [],
  "summary": "...",
  "source_refs": []
}
```

P4 should receive this structured result.

---

# 11. Verification

Verification is a first-class AI module.

Check:

### Grounding

Does the generated claim exist in the CCO/evidence?

### Factual consistency

Are:

- names
- numbers
- dates
- identifiers
- events

consistent?

### Unsupported claims

Flag generated information with no evidence.

### Cross-output consistency

If Summary says:

```text
Affected systems: 14
```

Presentation must not say:

```text
Affected systems: 17
```

when both use the same CCO version.

---

# 12. Verification Output

```json
{
  "status": "passed",
  "grounding_score": 0.94,
  "consistency_score": 0.98,
  "unsupported_claims": [],
  "issues": []
}
```

Possible status:

```text
PASSED
FAILED
REVIEW_REQUIRED
```

Do not automatically claim that an LLM score is absolute truth. It is a verification signal.

---

# 13. Revision Loop

```text
GENERATE
 ↓
VERIFY
 ↓
PASS? ── YES → FINAL
 ↓ NO
Collect issues
 ↓
RETRIEVE better evidence
 ↓
REVISE
 ↓
VERIFY again
```

Set a bounded retry count.

Example:

```text
MAX_REVISIONS = 2
```

Avoid unbounded LLM calls.

---

# 14. AI API Boundary

P3 exposes public application APIs.

Your internal service should expose functions/endpoints equivalent to:

```text
understand()
build_cco()
retrieve()
plan()
generate()
verify()
revise()
transform()
```

The main orchestration call:

```text
transform(request)
```

should return:

```json
{
  "transformation_id": "...",
  "cco_version": 3,
  "outputs": [],
  "verification": {}
}
```

---

# 15. Your Database Needs

Coordinate with P3.

You need access to:

```text
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

Do not independently create duplicate tables.

---

# 16. Your First MVP

Build in this order:

### Step 1
Text input → CCO

### Step 2
PDF → extracted text/layout → CCO

### Step 3
CCO → embeddings → retrieval

### Step 4
CCO + retrieval + transformation parameters → Executive Summary

### Step 5
Add LinkedIn/X

### Step 6
Verification

### Step 7
Revision loop

### Step 8
Presentation structured output

---

# 17. AI Security

You own AI-level controls:

- prompt injection handling
- untrusted source separation
- structured output validation
- unsupported-claim detection
- bounded generation
- model timeout handling
- token/context limits

P5 owns infrastructure security.

---

# 18. What You Do NOT Own

Do not become responsible for:

```text
React pages
JWT middleware
user CRUD
database migrations ownership
Docker deployment
Kubernetes
Hyperledger
PPTX rendering
DOCX rendering
file download infrastructure
```

You provide interfaces to those modules.

---

# 19. Definition of Done

Your AI module is done when:

```text
PDF/text
 ↓
CCO
 ↓
RAG
 ↓
Transformation plan
 ↓
Structured generation
 ↓
Verification
 ↓
Verified JSON
```

works end-to-end with reproducible logs and tests.

---

# 20. Key Principle

**Your job is not "make an LLM call."**

Your job is to build the **content-intelligence and transformation engine around the LLM**.
