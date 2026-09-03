from typing import Optional
from pydantic import BaseModel, Field


class Slide(BaseModel):
    slide_number: int = Field(description="Sequential slide number starting at 1")
    title: str = Field(description="Concise slide title")
    key_message: str = Field(description="The primary takeaway of this slide")
    body: list[str] = Field(description="Bullet points forming the slide content")
    speaker_notes: str = Field(description="Detailed notes and talking points for the presenter")
    evidence_refs: list[str] = Field(
        default_factory=list,
        description="References to source chunk IDs or claim IDs supporting this slide (e.g. ['chunk-001', 'claim-002'])"
    )


class PresentationSchema(BaseModel):
    artifact_type: str = Field(default="presentation", description="Always 'presentation'")
    title: str = Field(description="Overall presentation title")
    subtitle: Optional[str] = Field(default=None, description="Subtitle or briefing context")
    target_audience: str = Field(description="Intended audience (e.g. Senior Leadership, Incident Response Team)")
    slides: list[Slide] = Field(description="Array of slides in presentation order")
