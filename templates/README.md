# Templates & Artifact Workspace — Person 4 (Output Full-Stack Engineer)

> **Owner:** P4 (Full-stack Output & Artifact Engineer)  
> **Core Responsibilities:** Transformation Recipes + Renderers (PPTX, DOCX, HTML/PDF, Social) + Checksum Calculation + Artifact Previews  
> **Master Specification:** [`documents/04_P4_OUTPUT_ARTIFACT.md`](../documents/04_P4_OUTPUT_ARTIFACT.md)  
> **Team Contract:** [`documents/00_TEAM_INTEGRATION_CONTRACT.md`](../documents/00_TEAM_INTEGRATION_CONTRACT.md)

---

## 🎯 Mission

You take P1's **verified, structured AI output** and transform it into high-quality, consumable deliverables (PPTX presentation slides, executive briefing documents, structured advisories, platform-ready social posts, etc.).

---

## 📁 Recommended Structure

```text
templates/
├── recipes/                         # Declarative recipe schemas & template definitions
│   ├── executive_summary.json       # Required fields, section order, layout constraints
│   ├── presentation.json            # Slide layouts, bullet limits, speaker note formats
│   ├── advisory.json                # Threat/incident advisory section specs
│   ├── social_post.json             # LinkedIn, X/Twitter formatting and character rules
│   ├── infographic.json             # Visual hierarchy, chart and metric cards spec
│   └── video_package.json           # Script, storyboard, scene cues, narration format
├── renderers/                       # Format-specific rendering engines
│   ├── base_renderer.py             # Base renderer interface with SHA-256 calculation
│   ├── executive_summary_renderer.py# HTML, Markdown, and DOCX/PDF generation
│   ├── presentation_renderer.py     # python-pptx presentation generation
│   ├── advisory_renderer.py         # Standardized technical advisory renderer
│   └── social_renderer.py           # Social media platform text & card generator
└── requirements.txt                 # Dependencies (python-pptx, jinja2, weasyprint, etc.)
```

---

## 🔄 Renderer Pipeline

```text
AI Verified JSON
       ↓
Validate against Recipe Schema
       ↓
Target Format Renderer (PPTX / HTML / DOCX)
       ↓
Calculate SHA-256 Checksum
       ↓
Write to Object Storage / Local Storage Key
       ↓
Notify P3 Backend / P5 Blockchain Anchor
```

---

## ⚠️ Non-Negotiable Rules for Artifacts

1. **No Factual Invention**: You must never fabricate or rewrite facts during rendering. Use only the data provided in P1's verified output.
2. **Immutable Versions**: Never overwrite an existing artifact file. Always produce versioned artifacts (`v1`, `v2`, etc.).
3. **Cryptographic Checksum**: Always compute the SHA-256 hash of every finalized artifact file before sending it to P5 for blockchain provenance anchoring.
4. **HTML Sanitization**: Ensure any generated HTML preview is sanitized to avoid XSS vulnerabilities.
