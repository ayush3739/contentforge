"""
ContentForge AI — Background Worker Queue Interface & RQ Task Handlers

Supports Section 14 & 15 of Specification:
- Decouples job dispatching from HTTP request threads.
- Dispatches background jobs to Redis Queue (RQ) when active workers are available.
- Falls back to in-process execution in local development or test environments.
- Enforces strict job idempotency and persists Job state records to PostgreSQL.
"""

import asyncio
from datetime import datetime, timezone
import logging
from typing import Optional
import uuid
from rq import Worker
from sqlalchemy.orm import Session as DBSession

from app.core.database import new_db_session
from app.core.redis import get_rq_queue, get_sync_redis_client, is_redis_available
from app.jobs.orchestrator import IngestionJobOrchestrator, TransformationJobOrchestrator
from app.models.transformation import Job
from app.schemas.enums import JobStatus

logger = logging.getLogger("app.jobs.worker")


def _safe_create_async_task(coro):
    """Schedules an async coroutine on the running event loop, or logs safely if none exists."""
    try:
        loop = asyncio.get_running_loop()
        return loop.create_task(coro)
    except RuntimeError:
        logger.debug("[WORKER] No active event loop found to schedule background task")
        if hasattr(coro, "close"):
            coro.close()
        return None


def has_active_rq_workers() -> bool:
    """Returns True if at least one external RQ worker process is actively listening."""
    if not is_redis_available():
        return False
    try:
        client = get_sync_redis_client()
        workers = Worker.all(connection=client)
        return len(workers) > 0
    except Exception as e:
        logger.debug(f"[RQ-WORKER-CHECK] Could not inspect active workers: {e}")
        return False


def run_transformation_rq_worker(
    transformation_id: str,
    session_id: str,
    cco_version_id: str,
    output_types: list[str],
    source_text: Optional[str] = None,
    user_id: Optional[str] = None,
):
    """
    RQ worker entrypoint executed by standalone worker processes.
    """
    logger.info(f"[RQ-WORKER] Starting execution of transformation {transformation_id}")
    orchestrator = TransformationJobOrchestrator()
    return asyncio.run(
        orchestrator.enqueue_and_process(
            transformation_id=transformation_id,
            session_id=session_id,
            cco_version_id=cco_version_id,
            output_types=output_types,
            source_text=source_text,
            user_id=user_id,
        )
    )


def run_ingestion_rq_worker(
    document_id: str,
    session_id: str,
    storage_key: str,
    filename: str,
    mime_type: str,
):
    """
    RQ worker entrypoint executed by standalone worker processes.
    """
    logger.info(f"[RQ-WORKER] Starting execution of ingestion for document {document_id}")
    orchestrator = IngestionJobOrchestrator()
    return asyncio.run(
        orchestrator.enqueue_and_process(
            document_id=document_id,
            session_id=session_id,
            storage_key=storage_key,
            filename=filename,
            mime_type=mime_type,
        )
    )


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
    Dispatches asynchronous transformation job with idempotency and state tracking.
    Enqueues to Redis RQ if active workers exist, or runs via in-process async task.
    """
    target_db = db or new_db_session()
    job_record_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"

    try:
        # 1. Job Idempotency Check: Don't start a duplicate job if one is already active
        existing_active_job = (
            target_db.query(Job)
            .filter(
                Job.transformation_id == transformation_id,
                Job.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]),
            )
            .first()
        )
        if existing_active_job:
            logger.info(
                f"[JOB-IDEMPOTENCY] Active job '{existing_active_job.job_id}' already running for transformation {transformation_id}. Skipping duplicate dispatch."
            )
            return existing_active_job.job_id

        # 2. Persist initial Job state record in PostgreSQL
        new_job = Job(
            id=job_record_id,
            job_id=job_record_id,
            transformation_id=transformation_id,
            session_id=session_id,
            job_type="transformation",
            status=JobStatus.QUEUED,
            progress_pct=0,
            current_stage="QUEUED",
            payload_json={
                "transformation_id": transformation_id,
                "session_id": session_id,
                "cco_version_id": cco_version_id,
                "output_types": output_types,
                "user_id": user_id,
            },
            started_at=datetime.now(timezone.utc),
        )
        try:
            target_db.add(new_job)
            target_db.commit()
        except Exception as db_err:
            logger.debug(f"[JOB-DB-PERSIST] Skipping DB job insert: {db_err}")
            target_db.rollback()

        # 3. Dispatch to RQ Queue if external workers are listening
        queue = get_rq_queue()
        if queue and has_active_rq_workers():
            rq_job = queue.enqueue(
                run_transformation_rq_worker,
                transformation_id=transformation_id,
                session_id=session_id,
                cco_version_id=cco_version_id,
                output_types=output_types,
                source_text=source_text,
                user_id=user_id,
                job_id=f"rq-{transformation_id}",
            )
            try:
                new_job.job_id = rq_job.id
                new_job.worker_id = "rq_worker_pool"
                target_db.commit()
            except Exception:
                target_db.rollback()
            logger.info(f"[DISPATCH-RQ] Transformation {transformation_id} enqueued to RQ (job id: {rq_job.id})")
            return rq_job.id

        # 4. Fallback: Run in-process asyncio task
        logger.info(f"[DISPATCH-IN-PROCESS] Transformation {transformation_id} running via in-process async worker")
        orchestrator = TransformationJobOrchestrator(db=target_db)
        _safe_create_async_task(
            orchestrator.enqueue_and_process(
                transformation_id=transformation_id,
                session_id=session_id,
                cco_version_id=cco_version_id,
                output_types=output_types,
                source_text=source_text,
                user_id=user_id,
            )
        )
        return job_record_id
    except Exception as e:
        logger.error(f"[DISPATCH-ERROR] Failed to dispatch transformation job: {e}")
        target_db.rollback()
        # Still attempt in-process execution so user is not blocked
        orchestrator = TransformationJobOrchestrator(db=target_db)
        _safe_create_async_task(
            orchestrator.enqueue_and_process(
                transformation_id=transformation_id,
                session_id=session_id,
                cco_version_id=cco_version_id,
                output_types=output_types,
                source_text=source_text,
                user_id=user_id,
            )
        )
        return job_record_id
    finally:
        if db is None:
            target_db.close()


def dispatch_ingestion_job(
    document_id: str,
    session_id: str,
    storage_key: str,
    filename: str,
    mime_type: str,
    db: Optional[DBSession] = None,
):
    """
    Dispatches asynchronous ingestion task with state tracking and RQ support.
    """
    target_db = db or new_db_session()
    job_record_id = f"JOB-ING-{uuid.uuid4().hex[:8].upper()}"

    try:
        # 1. Job Idempotency Check
        existing_active_job = (
            target_db.query(Job)
            .filter(
                Job.document_id == document_id,
                Job.status.in_([JobStatus.QUEUED, JobStatus.RUNNING]),
            )
            .first()
        )
        if existing_active_job:
            logger.info(f"[JOB-IDEMPOTENCY] Ingestion job already active for document {document_id}")
            return existing_active_job.job_id

        # 2. Persist initial Job state record in PostgreSQL
        new_job = Job(
            id=job_record_id,
            job_id=job_record_id,
            document_id=document_id,
            session_id=session_id,
            job_type="ingestion",
            status=JobStatus.QUEUED,
            progress_pct=0,
            current_stage="QUEUED",
            payload_json={
                "document_id": document_id,
                "session_id": session_id,
                "filename": filename,
                "mime_type": mime_type,
            },
            started_at=datetime.now(timezone.utc),
        )
        try:
            target_db.add(new_job)
            target_db.commit()
        except Exception as db_err:
            logger.debug(f"[JOB-DB-PERSIST] Skipping DB job insert: {db_err}")
            target_db.rollback()

        # 3. Dispatch to RQ Queue if external workers are listening
        queue = get_rq_queue()
        if queue and has_active_rq_workers():
            rq_job = queue.enqueue(
                run_ingestion_rq_worker,
                document_id=document_id,
                session_id=session_id,
                storage_key=storage_key,
                filename=filename,
                mime_type=mime_type,
                job_id=f"rq-ing-{document_id}",
            )
            try:
                new_job.job_id = rq_job.id
                new_job.worker_id = "rq_worker_pool"
                target_db.commit()
            except Exception:
                target_db.rollback()
            logger.info(f"[DISPATCH-RQ] Ingestion {document_id} enqueued to RQ (job id: {rq_job.id})")
            return rq_job.id

        # 4. Fallback: Run in-process asyncio task
        logger.info(f"[DISPATCH-IN-PROCESS] Ingestion {document_id} running via in-process async worker")
        orchestrator = IngestionJobOrchestrator(db=target_db)
        _safe_create_async_task(
            orchestrator.enqueue_and_process(
                document_id=document_id,
                session_id=session_id,
                storage_key=storage_key,
                filename=filename,
                mime_type=mime_type,
            )
        )
        return job_record_id
    except Exception as e:
        logger.error(f"[DISPATCH-ERROR] Failed to dispatch ingestion job: {e}")
        target_db.rollback()
        orchestrator = IngestionJobOrchestrator(db=target_db)
        _safe_create_async_task(
            orchestrator.enqueue_and_process(
                document_id=document_id,
                session_id=session_id,
                storage_key=storage_key,
                filename=filename,
                mime_type=mime_type,
            )
        )
        return job_record_id
    finally:
        if db is None:
            target_db.close()
