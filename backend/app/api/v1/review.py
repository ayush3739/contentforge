"""
ContentForge AI — V1 Review Workflow API Routes

Section 21 of Specification:
- GET  /api/v1/review
"""

from fastapi import APIRouter, Depends
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission
from app.schemas.review import ReviewQueueItem
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/review", tags=["Review Queue"])


@router.get("", response_model=list[ReviewQueueItem])
async def get_review_queue(
    user: ClerkUserPayload = Depends(require_permission("approve_reject")),
):
    """
    Retrieves queue of generated artifacts requiring manual reviewer sign-off or approval.
    Requires Reviewer or Admin role.
    """
    queue = ArtifactService.list_review_queue()
    return [ReviewQueueItem(**item) for item in queue]
