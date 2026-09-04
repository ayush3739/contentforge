"""
ContentForge AI — V1 Transformation Request API Routes

Section 13, 14, and 15 of Specification:
- POST /api/v1/transformations (Returns 202 Accepted + QUEUED state)
- GET  /api/v1/transformations/{id}
- GET  /api/v1/transformations/{id}/status
"""

from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.database import get_db
from app.core.errors import APIError
from app.jobs.worker import dispatch_transformation_job
from app.schemas.transformation import (
    TransformationCreate,
    TransformationResponse,
    TransformationStatusResponse,
)
from app.services.transformation_service import TransformationService

router = APIRouter(prefix="/transformations", tags=["Transformations"])


@router.post("", response_model=TransformationResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_transformation(
    payload: TransformationCreate,
    user: ClerkUserPayload = Depends(require_permission("generate")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Validates transformation request, creates persistent DB record, and enqueues async processing job.
    Returns HTTP 202 Accepted with transformation ID and QUEUED status.
    """
    service = TransformationService(db=db)
    record = service.create_transformation(payload, user_id=user.user_id)

    # Queue background AI execution pipeline
    dispatch_transformation_job(
        transformation_id=record["transformation_id"],
        session_id=payload.session_id,
        cco_version_id=record["cco_version_id"],
        output_types=payload.output_types,
        user_id=user.user_id,
        db=db,
    )

    return TransformationResponse(
        transformation_id=record["transformation_id"],
        session_id=record["session_id"],
        cco_version_id=record["cco_version_id"],
        requested_by=user.user_id,
        output_types=record["output_types"],
        audience=record["audience"],
        tone=record["tone"],
        language=record["language"],
        detail_level=record["detail_level"],
        objective=record["objective"],
        style=record["style"],
        status="QUEUED",
    )


@router.get("/{id}", response_model=TransformationResponse)
async def get_transformation(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves full details for a transformation request.
    """
    service = TransformationService(db=db)
    trans = service.get_transformation(id)
    if not trans:
        raise APIError("TRANSFORMATION_NOT_FOUND", f"Transformation request '{id}' does not exist.", status_code=404)
    return trans


@router.get("/{id}/status", response_model=TransformationStatusResponse)
async def get_transformation_status(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Polling endpoint returning status transitions:
    QUEUED -> PROCESSING -> GENERATING -> VERIFYING -> RENDERING -> COMPLETED / FAILED / REVIEW_REQUIRED
    """
    service = TransformationService(db=db)
    trans = service.get_transformation(id)
    if not trans:
        raise APIError("TRANSFORMATION_NOT_FOUND", f"Transformation request '{id}' does not exist.", status_code=404)

    return TransformationStatusResponse(
        transformation_id=id,
        status=trans["status"],
        progress_percentage=trans.get("progress_percentage", 100 if trans["status"] == "COMPLETED" else 50),
        message=trans.get("message", "Transformation processing..."),
        artifacts=trans.get("artifacts", []),
    )
