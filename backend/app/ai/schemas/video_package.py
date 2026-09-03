from pydantic import BaseModel, Field

class Scene(BaseModel):
    scene_number: int = Field(..., description="Chronological scene number")
    visual_description: str = Field(..., description="Detailed description of what is shown on screen")
    narration: str = Field(..., description="The voiceover script for this scene")
    on_screen_text: str = Field(..., description="Text overlays to display during the scene")
    evidence_refs: list[str] = Field(default_factory=list, description="List of chunk IDs or claim IDs supporting this scene")

class VideoPackageSchema(BaseModel):
    artifact_type: str = Field("video_package", description="Type of artifact")
    title: str = Field(..., description="Main title of the video")
    estimated_duration_seconds: int = Field(..., description="Estimated duration of the video in seconds")
    target_audience: str = Field(..., description="The intended audience for the video")
    scenes: list[Scene] = Field(..., description="List of scenes comprising the video storyboard and script")
