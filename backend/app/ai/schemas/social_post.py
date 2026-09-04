from typing import Optional
from pydantic import BaseModel, Field


class SocialPostSchema(BaseModel):
    artifact_type: str = Field(default="social_post", description="Always 'social_post'")
    title: Optional[str] = Field(default="Executive Communications Update", description="Campaign or post title")
    platform: str = Field(default="LinkedIn", description="Target platform: LinkedIn, X, Instagram, Newsletter")
    target_audience: str = Field(..., description="The intended audience for the post")
    hook: str = Field(..., description="An engaging opening headline or hook to capture attention")
    body: str = Field(..., description="The main content narrative, integrating facts and context in a professional voice")
    key_takeaways: list[str] = Field(default_factory=list, description="List of 3-4 impactful factual takeaways formatted cleanly")
    call_to_action: str = Field(..., description="A clear, professional next step for the audience")
    hashtags: list[str] = Field(default_factory=list, description="3-5 relevant hashtags optimized for the platform")
    thread: Optional[list[str]] = Field(default=None, description="Optional multi-tweet breakdown if formatted for X/Twitter")
    evidence_refs: list[str] = Field(default_factory=list, description="List of chunk IDs or claim IDs used to ground this post")

