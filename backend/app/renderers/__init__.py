"""
Artifact Renderers & Recipes Package — Owned by P4 (Artifact Engineer)

Transforms P1's verified structured JSON into production-ready output deliverables:
- pptx_renderer.py: python-pptx presentation slide generation (incident_investigation, executive_briefing)
- docx_renderer.py: python-docx executive summary and security advisory generation
- infographic_renderer.py: server-side SVG vector infographic generation (incident_brief, executive_snapshot)
- template_registry.py: controlled WP-5A template specifications
- design_system.py: ContentForge unified design tokens
"""

from app.renderers.pptx_renderer import render_presentation
from app.renderers.docx_renderer import render_document
from app.renderers.infographic_renderer import render_infographic_svg
from app.renderers.template_registry import (
    TEMPLATE_SPECS,
    TemplateSpec,
    ArtifactTemplateConfig,
    get_template_spec,
    require_template_spec,
    get_default_template_id,
    list_templates_for_type,
)

__all__ = [
    "render_presentation",
    "render_document",
    "render_infographic_svg",
    "TEMPLATE_SPECS",
    "TemplateSpec",
    "ArtifactTemplateConfig",
    "get_template_spec",
    "require_template_spec",
    "get_default_template_id",
    "list_templates_for_type",
]
