from pydantic import BaseModel, Field

class SocialPostSchema(BaseModel):
    artifact_type: str = Field("social_post", description="Type of artifact")
    platform: str = Field(..., description="Target platform, e.g., LinkedIn, X, Twitter")
    target_audience: str = Field(..., description="The intended audience for the post")
    hook: str = Field(..., description="An engaging opening sentence to grab attention")
    body: str = Field(..., description="The main content of the post, maintaining the requested tone and objective")
    key_takeaways: list[str] = Field(..., description="A list of 2-4 key bullet points summarizing the most important facts")
    call_to_action: str = Field(..., description="A clear next step for the reader, e.g., Read the full report")
    hashtags: list[str] = Field(..., description="Relevant hashtags optimized for the platform")
    evidence_refs: list[str] = Field(default_factory=list, description="List of chunk IDs or claim IDs used to generate this post")
