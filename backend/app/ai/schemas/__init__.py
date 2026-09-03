from app.ai.schemas.presentation import PresentationSchema, Slide
from app.ai.schemas.executive_summary import ExecutiveSummarySchema, SummarySection
from app.ai.schemas.advisory import AdvisorySchema

SCHEMA_REGISTRY = {
    "presentation": PresentationSchema,
    "executive_summary": ExecutiveSummarySchema,
    "advisory": AdvisorySchema,
}

__all__ = [
    "PresentationSchema",
    "Slide",
    "ExecutiveSummarySchema",
    "SummarySection",
    "AdvisorySchema",
    "SCHEMA_REGISTRY",
]
