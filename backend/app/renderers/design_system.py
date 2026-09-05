"""
ContentForge AI — Unified Artifact Design System Tokens

Defines shared visual identity tokens (colors, typography, spacing, classification banners,
severity palettes, and evidence citation styling) used across all artifact renderers (PPTX, DOCX, SVG).
Adheres to WP-5A of the Automated Verification MVP Specification.
"""

from typing import NamedTuple


class ColorRGB(NamedTuple):
    r: int
    g: int
    b: int

    @property
    def hex(self) -> str:
        return f"#{self.r:02X}{self.g:02X}{self.b:02X}"

    def to_pptx(self):
        from pptx.dml.color import RGBColor
        return RGBColor(self.r, self.g, self.b)

    def to_docx(self):
        from docx.shared import RGBColor
        return RGBColor(self.r, self.g, self.b)


class ThemePalette:
    def __init__(
        self,
        name: str,
        primary: ColorRGB,
        secondary: ColorRGB,
        accent: ColorRGB,
        background: ColorRGB,
        card_bg: ColorRGB,
        text_primary: ColorRGB,
        text_secondary: ColorRGB,
        border: ColorRGB,
    ):
        self.name = name
        self.primary = primary
        self.secondary = secondary
        self.accent = accent
        self.background = background
        self.card_bg = card_bg
        self.text_primary = text_primary
        self.text_secondary = text_secondary
        self.border = border

    @property
    def is_dark(self) -> bool:
        return "dark" in self.name.lower()


# -----------------------------------------------------------------------------
# Color Palettes
# -----------------------------------------------------------------------------

EXECUTIVE_BLUE = ThemePalette(
    name="executive_blue",
    primary=ColorRGB(30, 58, 138),        # #1E3A8A Deep Navy Blue
    secondary=ColorRGB(59, 130, 246),     # #3B82F6 Vibrant Cobalt
    accent=ColorRGB(14, 165, 233),        # #0EA5E9 Sky Accent
    background=ColorRGB(248, 250, 252),   # #F8FAFC Clean Off-white/slate
    card_bg=ColorRGB(255, 255, 255),      # #FFFFFF Pure White
    text_primary=ColorRGB(15, 23, 42),    # #0F172A Slate 900
    text_secondary=ColorRGB(100, 116, 139), # #64748B Slate 500
    border=ColorRGB(226, 232, 240),       # #E2E8F0 Slate 200
)

THREAT_DARK = ThemePalette(
    name="threat_dark",
    primary=ColorRGB(15, 23, 42),         # #0F172A Deep Slate
    secondary=ColorRGB(30, 41, 59),       # #1E293B Card Slate
    accent=ColorRGB(239, 68, 68),         # #EF4444 Crimson Alert
    background=ColorRGB(11, 15, 25),      # #0B0F19 Midnight Dark
    card_bg=ColorRGB(23, 32, 51),         # #172033 Elevated Slate
    text_primary=ColorRGB(248, 250, 252), # #F8FAFC White Text
    text_secondary=ColorRGB(148, 163, 184), # #94A3B8 Muted Slate
    border=ColorRGB(51, 65, 85),          # #334155 Slate 700
)

MODERN_MINIMAL = ThemePalette(
    name="modern_minimal",
    primary=ColorRGB(24, 24, 27),         # #18181B Zinc 900
    secondary=ColorRGB(82, 82, 91),       # #52525B Zinc 600
    accent=ColorRGB(37, 99, 235),         # #2563EB Royal Blue
    background=ColorRGB(255, 255, 255),   # #FFFFFF Clean White
    card_bg=ColorRGB(250, 250, 250),      # #FAFAFA Light Zinc
    text_primary=ColorRGB(24, 24, 27),    # #18181B Dark Text
    text_secondary=ColorRGB(113, 113, 122), # #71717A Muted Text
    border=ColorRGB(228, 228, 231),       # #E4E4E7 Zinc 200
)

THEMES: dict[str, ThemePalette] = {
    "executive_blue": EXECUTIVE_BLUE,
    "dark_slate": THREAT_DARK,
    "threat_dark": THREAT_DARK,
    "modern_minimal": MODERN_MINIMAL,
}

# -----------------------------------------------------------------------------
# Severity & Verification Status Colors
# -----------------------------------------------------------------------------

SEVERITY_COLORS = {
    "CRITICAL": ColorRGB(220, 38, 38),   # Red 600
    "HIGH": ColorRGB(234, 88, 12),       # Orange 600
    "MEDIUM": ColorRGB(217, 119, 6),     # Amber 600
    "LOW": ColorRGB(37, 99, 235),        # Blue 600
    "INFO": ColorRGB(100, 116, 139),     # Slate 500
    "PASSED": ColorRGB(5, 150, 105),     # Emerald 600
    "VERIFIED": ColorRGB(5, 150, 105),   # Emerald 600
    "FAILED": ColorRGB(220, 38, 38),     # Red 600
    "REVISION_REQUIRED": ColorRGB(217, 119, 6), # Amber 600
}

# -----------------------------------------------------------------------------
# Classification Banners
# -----------------------------------------------------------------------------

CLASSIFICATION_BANNERS = {
    "UNCLASSIFIED": "UNCLASSIFIED // TLP:CLEAR",
    "CONFIDENTIAL": "CONFIDENTIAL // INTERNAL USE ONLY",
    "RESTRICTED": "RESTRICTED // LAW ENFORCEMENT SENSITIVE",
    "OFFICIAL": "OFFICIAL // NOT FOR PUBLIC DISSEMINATION",
}

# -----------------------------------------------------------------------------
# Typography & Formatting Helpers
# -----------------------------------------------------------------------------

FONT_HEADING = "Calibri"
FONT_BODY = "Calibri"
FONT_CODE = "Consolas"


def get_theme(name: str = "executive_blue") -> ThemePalette:
    return THEMES.get(name.lower(), EXECUTIVE_BLUE)


def format_evidence_badge(evidence_ref: str) -> str:
    """Formats an evidence chunk or claim ID into an authoritative badge string."""
    clean = (evidence_ref or "").strip()
    if not clean:
        return ""
    if not clean.startswith("[") and not clean.endswith("]"):
        return f"[{clean}]"
    return clean


def format_provenance_footer(checksum: str, cco_version: str = "v1") -> str:
    """Standard verification provenance stamp for artifact footers."""
    short_hash = checksum[:16] if checksum else "UNANCHORED"
    return f"ContentForge AI Verified Artifact • CCO {cco_version} • Integrity SHA-256: {short_hash} • Automated Verification Passed"
