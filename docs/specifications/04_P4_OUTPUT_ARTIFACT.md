# Person 4 — Full-stack Output & Artifact Engineer
## Owner: Transformation Recipes + Renderers + Artifact Experience

## 1. Mission

Take P1's **verified structured AI output** and turn it into usable artefacts.

You do not independently rewrite factual content.

---

# 2. Pipeline

```text
AI Structured Output
 ↓
Transformation Recipe
 ↓
Artifact Builder
 ↓
Renderer
 ↓
Preview
 ↓
Export
 ↓
Artifact Storage
```

---

# 3. Output Types

MVP:

```text
Executive Summary
LinkedIn/X
Advisory
Presentation
```

Additional:

```text
Infographic specification
Video package
```

---

# 4. Transformation Recipes

Create reusable templates:

```text
templates/
├── executive_summary/
├── social_post/
├── advisory/
├── presentation/
├── infographic/
└── video_package/
```

A recipe defines:

```text
required fields
section order
formatting
length constraints
rendering rules
```

---

# 5. Executive Summary

Example structured input:

```json
{
  "title": "...",
  "executive_overview": "...",
  "key_findings": [],
  "impact": [],
  "recommended_actions": []
}
```

Render to:

```text
HTML
PDF
DOCX
```

---

# 6. Presentation

Input:

```json
{
  "slides": [
    {
      "title": "...",
      "bullets": [],
      "speaker_notes": []
    }
  ]
}
```

Render to:

```text
PPTX
```

Do not add unsupported facts while rendering.

---

# 7. Advisory

Use structured sections:

```text
Title
Severity / classification
Summary
Affected entities
Observed activity
Indicators
Recommended actions
References
```

---

# 8. Social Output

Generate platform-specific display:

```text
LinkedIn
X
```

The actual wording comes from P1's verified content.

P4 applies presentation/format constraints.

---

# 9. Artifact Metadata

Each artifact should preserve:

```text
artifact_id
type
status
cco_version
transformation_id
content_json
storage_key
checksum
created_at
```

---

# 10. Preview

Frontend integration should provide:

```text
Artifact card
 ↓
Preview
 ↓
Download
```

Preview can initially use HTML rendering.

---

# 11. Artifact Versions

Never silently overwrite an existing artifact.

Use:

```text
Artifact
 ├── v1
 ├── v2
 └── v3
```

A revised AI output should produce a new artifact version.

---

# 12. API Integration

Consume:

```http
GET /artifacts/{id}
GET /artifacts/{id}/versions
GET /artifacts/{id}/download
POST /artifacts/{id}/finalize
```

Coordinate with P3 before changing response schemas.

---

# 13. Checksum

Before finalization:

```text
artifact file
 ↓
SHA-256
 ↓
checksum
```

Pass checksum to P5 for provenance anchoring.

---

# 14. First Build

### Day 1

- recipe interface
- artifact schema

### Day 2

- Executive Summary renderer
- HTML preview

### Day 3

- Presentation PPTX renderer

### Day 4

- Advisory + social formats

### Day 5

- PDF/DOCX/export polish

---

# 15. Security

Never:

- execute generated code
- trust generated HTML blindly
- accept arbitrary filesystem paths
- expose storage credentials

Sanitize generated HTML where required.

---

# 16. Definition of Done

An output is done when:

```text
AI JSON
 ↓
validated recipe
 ↓
rendered artifact
 ↓
stored
 ↓
checksum calculated
 ↓
frontend preview/download works
```

and no factual content was silently invented during rendering.
