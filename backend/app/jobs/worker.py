"""
ContentForge AI — Background Worker Queue Interface
"""

import asyncio
from typing import Optional
from sqlalchemy.orm import Session as DBSession
from app.jobs.orchestrator import TransformationJobOrchestrator, IngestionJobOrchestrator


def dispatch_transformation_job(
    transformation_id: str,
    session_id: str,
    cco_version_id: str,
    output_types: list[str],
    source_text: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Optional[DBSession] = None,
):
    """
    Dispatches asynchronous task via asyncio background task runner.
    In production with Celery/Redis worker nodes, pushes to Redis queue.
    """
    orchestrator = TransformationJobOrchestrator(db=db)
    asyncio.create_task(
        orchestrator.enqueue_and_process(
            transformation_id=transformation_id,
            session_id=session_id,
            cco_version_id=cco_version_id,
            output_types=output_types,
            source_text=source_text,
            user_id=user_id,
        )
    )

def dispatch_ingestion_job(
    document_id: str,
    session_id: str,
    storage_key: str,
    filename: str,
    mime_type: str,
    db: Optional[DBSession] = None,
):
    """
    Dispatches asynchronous ingestion task via asyncio background task runner.
    """
    orchestrator = IngestionJobOrchestrator(db=db)
    asyncio.create_task(
        orchestrator.enqueue_and_process(
            document_id=document_id,
            session_id=session_id,
            storage_key=storage_key,
            filename=filename,
            mime_type=mime_type,
        )
    )
