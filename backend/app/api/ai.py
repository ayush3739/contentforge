import logging
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.responses import StreamingResponse
import json

from app.ai.pipeline import (
    PipelineTransformRequest,
    PipelineTransformResponse,
    run_transformation_pipeline,
    run_transformation_pipeline_stream,
)
from app.ai.gateway import get_llm_provider
from app.ai.embeddings import get_embedding_model
from app.core.config import settings
from app.core.database import get_async_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Engine (P1)"])


@router.post(
    "/transform",
    response_model=PipelineTransformResponse,
    summary="Transform source document into verified cross-platform artifacts",
    description="End-to-end pipeline: Ingestion -> CCO -> pgvector RAG -> Structured Generation -> Verification -> Revision",
)
async def transform_document(
    request: PipelineTransformRequest,
    db: AsyncSession = Depends(get_async_db),
) -> PipelineTransformResponse:
    """
    Transforms raw source content into verified, renderer-neutral structured JSON.
    Generates presentation slides, executive summaries, or advisories grounded in source evidence.
    """
    try:
        response = await run_transformation_pipeline(request, db=db)
        return response
    except Exception as e:
        logger.exception("Error executing transformation pipeline")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transformation pipeline failed: {str(e)}",
        )


@router.post(
    "/transform/stream",
    summary="Transform source document with live Server-Sent Events (SSE) streaming",
    description="Streams real-time milestone events ('progress', 'artifact', 'complete', 'error') as text/event-stream.",
)
async def transform_document_stream(
    request: PipelineTransformRequest,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Server-Sent Events (SSE) streaming endpoint.
    Yields real-time pipeline phase updates, individual artifacts as they complete,
    and the final complete payload.
    """
    async def sse_event_publisher():
        try:
            async for item in run_transformation_pipeline_stream(request, db=db):
                event_name = item.get("event", "message")
                data_json = json.dumps(item.get("data", {}))
                yield f"event: {event_name}\ndata: {data_json}\n\n"
        except Exception as exc:
            logger.exception("Error in SSE event stream")
            err_json = json.dumps({"message": str(exc), "stage": "failed"})
            yield f"event: error\ndata: {err_json}\n\n"

    return StreamingResponse(
        sse_event_publisher(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/health",
    summary="Check AI engine health and active models",
)
async def ai_health():
    """
    Returns the status of the AI pipeline components:
    - Active LLM provider (Gemini / Groq / OpenAI)
    - Active embedding model (Local sentence-transformers / 384-dim)
    """
    provider = get_llm_provider()
    embedding_status = "ready"
    try:
        # Check if local embedding model loads cleanly
        get_embedding_model()
    except Exception as e:
        embedding_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "active_llm_provider": provider.__class__.__name__,
        "configured_llm": settings.LLM_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "embedding_model": settings.EMBEDDING_MODEL,
        "embedding_dimension": settings.EMBEDDING_DIMENSION,
        "embedding_status": embedding_status,
    }
