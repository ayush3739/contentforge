"""
ContentForge AI — Controlled Artifact Template Registry

Maintains the controlled template specifications and configuration contract for:
1. PPTX: incident_investigation, executive_briefing
2. DOCX: executive_summary, security_advisory
3. Infographic: incident_brief, executive_snapshot

Adheres to Section 4 (WP-5A) of the Automated Verification MVP Specification.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field, model_validator


class ArtifactTemplateConfig(BaseModel):
    """Renderer-neutral template configuration contract persisted in TransformationRequest."""
    artifact_type: str = Field(description="presentation | executive_summary | advisory | infographic | social_post")
    template_id: str = Field(description="Controlled template identifier")
    brand_theme: str = Field(default="executive_blue", description="executive_blue | threat_dark | modern_minimal")
    orientation: str = Field(default="landscape", description="landscape | portrait")
    length: str = Field(default="standard", description="short | standard | long")
    include_evidence_refs: bool = Field(default=True, description="Whether to stamp evidence citations like [E-01]")
    include_verification_footer: bool = Field(default=True, description="Whether to include the automated verification integrity stamp")
    classification_banner: str = Field(default="UNCLASSIFIED // TLP:CLEAR", description="Security classification marker")
    classification: Optional[str] = Field(default=None, description="Public API alias for classification_banner")
    options: dict[str, Any] = Field(default_factory=dict, description="Output-specific options (e.g. slide_count, target_length)")

    @model_validator(mode="after")
    def validate_controlled_template(self) -> "ArtifactTemplateConfig":
        if not self.template_id or self.template_id not in TEMPLATE_SPECS:
            self.template_id = get_default_template_id(self.artifact_type)
        spec = TEMPLATE_SPECS.get(self.template_id)
        if spec and spec.artifact_type != self.artifact_type:
            self.template_id = get_default_template_id(self.artifact_type)
        if self.brand_theme not in {"executive_blue", "threat_dark", "modern_minimal"}:
            self.brand_theme = "executive_blue"
        if self.orientation not in {"landscape", "portrait"}:
            self.orientation = "landscape"
        if self.length not in {"short", "standard", "long"}:
            self.length = "standard"
        if self.classification:
            self.classification_banner = self.classification
        return self


class TemplateSpec(BaseModel):
    id: str
    artifact_type: str
    name: str
    description: str
    recommended_theme: str
    default_orientation: str
    features: list[str]


# -----------------------------------------------------------------------------
# Controlled Template Registry (WP-5A First 6 Demo Templates)
# -----------------------------------------------------------------------------

TEMPLATE_SPECS: dict[str, TemplateSpec] = {
    # Presentation (PPTX) Templates
    "incident_investigation": TemplateSpec(
        id="incident_investigation",
        artifact_type="presentation",
        name="Incident Investigation Deck",
        description="High-contrast cyber threat intelligence layout with IoC callouts, timeline slides, and evidentiary speaker notes.",
        recommended_theme="dark_slate",
        default_orientation="landscape",
        features=["Threat Timeline", "IoC Summary Table", "Detailed Speaker Notes", "Classification Banners", "Evidence Citations"],
    ),
    "executive_briefing": TemplateSpec(
        id="executive_briefing",
        artifact_type="presentation",
        name="Executive Strategic Briefing",
        description="Polished public sector executive slide deck featuring bold KPI cards, high-level takeaways, and citation footers.",
        recommended_theme="executive_blue",
        default_orientation="landscape",
        features=["Executive Takeaways", "Metric Highlight Cards", "Strategic Recommendations", "Verification Footer"],
    ),

    # Document (DOCX) Templates
    "executive_summary": TemplateSpec(
        id="executive_summary",
        artifact_type="executive_summary",
        name="Executive Decision Brief",
        description="Authoritative document format with formal Document Control header, impact summary table, and numbered recommendation checklist.",
        recommended_theme="executive_blue",
        default_orientation="portrait",
        features=["Document Control Block", "Impact Table", "Key Findings Matrix", "Evidence Reference Appendix"],
    ),
    "security_advisory": TemplateSpec(
        id="security_advisory",
        artifact_type="advisory",
        name="Technical Security Advisory",
        description="Structured security advisory layout featuring CVSS severity badge, affected systems grid, IoC table, and mitigation steps.",
        recommended_theme="dark_slate",
        default_orientation="portrait",
        features=["CVSS Severity Callout", "Affected Infrastructure Grid", "Indicators of Compromise Table", "Remediation Checklist"],
    ),

    # Infographic Templates
    "incident_brief": TemplateSpec(
        id="incident_brief",
        artifact_type="infographic",
        name="Incident Intelligence Snapshot",
        description="Data-dense single-page visual artifact with chronology timeline, key impact metrics, and threat assessment badges.",
        recommended_theme="dark_slate",
        default_orientation="landscape",
        features=["Severity Header", "Chronological Timeline", "Impact Metrics Grid", "Provenance Verification Seal"],
    ),
    "executive_snapshot": TemplateSpec(
        id="executive_snapshot",
        artifact_type="infographic",
        name="Executive Dashboard Snapshot",
        description="Clean, modern KPI visualization with strategic comparison progress bars and grounded key takeaways.",
        recommended_theme="executive_blue",
        default_orientation="landscape",
        features=["High-Level Metric Cards", "Comparison Bars", "Strategic Priorities", "Evidence Badges"],
    ),

    # Video Package Templates
    "video_package_default": TemplateSpec(
        id="video_package_default",
        artifact_type="video_package",
        name="Storyboard & Scene Narration Package",
        description="Sequential scene-by-scene multimedia briefing storyboard with visual prompts, narration scripts, and evidence markers.",
        recommended_theme="executive_blue",
        default_orientation="landscape",
        features=["Scene Sequence Flow", "Narration Scripts", "On-Screen Display Directives", "Evidence Markers"],
    ),

    # Social Post Templates
    "social_post_default": TemplateSpec(
        id="social_post_default",
        artifact_type="social_post",
        name="Executive Social Broadcast",
        description="Platform-optimized short-form executive briefing with punchy hooks, key takeaways, and hashtags.",
        recommended_theme="executive_blue",
        default_orientation="portrait",
        features=["Executive Hook", "Grounded Bullet Points", "Call to Action", "Official Hashtags"],
    ),
}


def get_template_spec(template_id: str) -> Optional[TemplateSpec]:
    return TEMPLATE_SPECS.get(template_id)


def require_template_spec(template_id: str, artifact_type: str) -> TemplateSpec:
    """Return a controlled template or fallback gracefully before any renderer receives content."""
    spec = get_template_spec(template_id)
    if spec is None or spec.artifact_type != artifact_type:
        default_id = get_default_template_id(artifact_type)
        spec = get_template_spec(default_id)
    if spec is None:
        spec = TemplateSpec(
            id=template_id or "default",
            artifact_type=artifact_type,
            name=f"{artifact_type.replace('_', ' ').title()} Template",
            description="Default output specification",
            recommended_theme="executive_blue",
            default_orientation="landscape",
            features=["Standard Layout"],
        )
    return spec


def get_default_template_id(artifact_type: str) -> str:
    """Returns the primary recommended template ID for a given artifact type."""
    defaults = {
        "presentation": "executive_briefing",
        "executive_summary": "executive_summary",
        "advisory": "security_advisory",
        "infographic": "executive_snapshot",
        "video_package": "video_package_default",
        "social_post": "social_post_default",
    }
    return defaults.get(artifact_type, "executive_briefing")


def list_templates_for_type(artifact_type: str) -> list[TemplateSpec]:
    return [spec for spec in TEMPLATE_SPECS.values() if spec.artifact_type == artifact_type]
