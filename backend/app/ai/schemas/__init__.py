from app.ai.schemas.presentation import PresentationSchema, Slide
from app.ai.schemas.executive_summary import ExecutiveSummarySchema, SummarySection
from app.ai.schemas.advisory import AdvisorySchema
from app.ai.schemas.social_post import SocialPostSchema
from app.ai.schemas.infographic import InfographicSchema
from app.ai.schemas.video_package import VideoPackageSchema

SCHEMA_REGISTRY = {
    "presentation": PresentationSchema,
    "executive_summary": ExecutiveSummarySchema,
    "advisory": AdvisorySchema,
    "social_post": SocialPostSchema,
    "infographic": InfographicSchema,
    "video_package": VideoPackageSchema,
}

__all__ = [
    "PresentationSchema",
    "Slide",
    "ExecutiveSummarySchema",
    "SummarySection",
    "AdvisorySchema",
    "SocialPostSchema",
    "InfographicSchema",
    "VideoPackageSchema",
    "SCHEMA_REGISTRY",
]
