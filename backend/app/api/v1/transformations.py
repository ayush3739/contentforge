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

    # Queue background AI execution pipeline (job creates its own DB session)
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
        custom_instructions=record.get("custom_instructions"),
        template_configs=record.get("template_configs"),
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
    QUEUED -> PLANNING -> GENERATING -> VERIFYING -> RENDERING -> COMPLETED / FAILED
    """
    service = TransformationService(db=db)
    trans = service.get_transformation(id)
    if not trans:
        raise APIError("TRANSFORMATION_NOT_FOUND", f"Transformation request '{id}' does not exist.", status_code=404)

    return TransformationStatusResponse(
        transformation_id=id,
        session_id=trans.get("session_id"),
        status=trans["status"],
        progress_percentage=trans.get("progress_percentage", 100 if trans["status"] == "COMPLETED" else 50),
        message=trans.get("message", "Transformation processing..."),
        artifacts=trans.get("artifacts", []),
    )


@router.get("/{id}/stream", summary="Stream real-time transformation progress via SSE")
async def stream_transformation_progress(
    id: str,
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Streams transformation progress as Server-Sent Events (SSE).
    Listens to real-time events published via Redis Pub/Sub, with automatic fallback
    to DB status polling.
    """
    import asyncio
    import json
    from fastapi.responses import StreamingResponse
    from app.core.redis import subscribe_event_stream

    async def event_generator():
        service = TransformationService(db=db)
        terminal_states = {"COMPLETED", "FAILED"}

        # 1. Emit initial state snapshot immediately
        trans = service.get_transformation(id)
        if not trans:
            yield f"event: error\ndata: {json.dumps({'message': 'Transformation not found'})}\n\n"
            return

        status_val = trans.get("status", "QUEUED")
        initial_data = {
            "transformation_id": id,
            "session_id": trans.get("session_id"),
            "status": status_val,
            "progress_percentage": trans.get("progress_percentage", 10),
            "message": trans.get("message", "Processing transformation..."),
            "artifacts": trans.get("artifacts", []),
        }
        yield f"event: progress\ndata: {json.dumps(initial_data)}\n\n"

        if status_val in terminal_states:
            event_name = "complete" if status_val == "COMPLETED" else "error"
            yield f"event: {event_name}\ndata: {json.dumps(initial_data)}\n\n"
            return

        # 2. Subscribe to real-time Redis Pub/Sub stream (or in-memory fallback)
        channel = f"transformation:{id}:events"
        async for msg in subscribe_event_stream(channel, timeout_seconds=180):
            event_type = msg.get("event", "progress")
            event_data = msg.get("data", {})
            yield f"event: {event_type}\ndata: {json.dumps(event_data)}\n\n"

            cur_status = event_data.get("status")
            if event_type in ("complete", "error") or cur_status in terminal_states:
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

