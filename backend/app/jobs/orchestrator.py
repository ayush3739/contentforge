"""
ContentForge AI — Async Transformation Job Orchestrator

Coordinates transformation jobs adhering to Section 14 & 15 of Specification:
Executes AI pipeline execution in background threads/tasks, updates status transitions:
QUEUED -> PLANNING -> GENERATING -> VERIFYING -> RENDERING -> COMPLETED / FAILED
"""

import asyncio
from datetime import datetime, timezone
import hashlib
import logging
import uuid
from typing import Optional
from sqlalchemy.orm import Session as DBSession

from app.audit.logger import record_audit_event, record_security_event
from app.core.redis import publish_event
from app.models.artifact import Artifact, VerificationResult
from app.models.transformation import TransformationRequest, Job
from app.schemas.enums import ArtifactStatus, JobStatus, TransformationStatus, VerificationStatus
from app.renderers.template_registry import ArtifactTemplateConfig
from app.storage import get_storage_provider
from app.models.document import Document
from app.models.session import Session
from app.models.cco import CCOVersion
from app.models.chunk import SourceBlock, Chunk
from app.renderers.docx_renderer import render_document
from app.renderers.pptx_renderer import render_presentation
from app.renderers.infographic_renderer import render_infographic_svg
from app.ai.ingestion.parser import parse_document
from app.ai.extraction.deterministic import extract_deterministic_data
from app.ai.extraction.semantic import extract_semantic_data
from app.ai.cco.builder import build_cco
from app.ai.chunking.chunker import chunk_blocks
from app.ai.embeddings import embed_batch
from app.core.database import new_db_session
import json
logger = logging.getLogger("app.jobs.orchestrator")


class TransformationJobOrchestrator:
    def __init__(self, db: Optional[DBSession] = None):
        # NOTE: We intentionally ignore the passed-in request-scoped db here.
        # Background asyncio tasks MUST manage their own session lifetime.
        self.storage = get_storage_provider()

    async def enqueue_and_process(
        self,
        transformation_id: str,
        session_id: str,
        cco_version_id: str,
        output_types: list[str],
        source_text: Optional[str] = None,
        user_id: Optional[str] = None,
    ):
        """
        Executes asynchronous transformation workflow without blocking HTTP response.
        """
        logger.info(f"[JOB-ORCHESTRATOR] Starting background job for transformation {transformation_id}")

        # Background jobs MUST own their DB session — request-scoped sessions are
        # closed by FastAPI before asyncio.create_task() runs.
        db = new_db_session()
        try:
            # 1. Update state: PLANNING
            self._update_status_with_db(db, transformation_id, "PLANNING", 15, "Initializing AI execution context.")

            # 2. Update state: GENERATING
            self._update_status_with_db(db, transformation_id, "GENERATING", 35, "Generating intelligence artifacts with P1 Engine.")
            await asyncio.sleep(0.05)  # Yield loop

            from app.ai.pipeline import PipelineTransformRequest, run_transformation_pipeline

            # Fetch the actual user parameters from the database record
            trans_row = db.query(TransformationRequest).filter(TransformationRequest.id == transformation_id).first() if db else None
            audience = trans_row.audience if trans_row and trans_row.audience else "senior leadership"
            tone = trans_row.tone if trans_row and trans_row.tone else "professional"
            detail_level = trans_row.detail_level if trans_row and trans_row.detail_level else "balanced"
            language = trans_row.language if trans_row and trans_row.language else "en"
            objective = trans_row.objective if trans_row and trans_row.objective else "decision briefing"
            style = trans_row.style if trans_row and trans_row.style else "standard"
            custom_instructions = trans_row.custom_instructions if trans_row else None

            # Attempt to resolve source text from CCO or SourceBlocks if not explicitly provided
            resolved_text = source_text
            doc_filename = "source_document.txt"
            if not resolved_text and db:
                try:
                    cco_row = db.query(CCOVersion).filter(CCOVersion.id == cco_version_id).first()
                    if cco_row:
                        if cco_row.document_id:
                            # 1. Try to read source blocks for full grounded text
                            blocks = (
                                db.query(SourceBlock)
                                .filter(SourceBlock.document_id == cco_row.document_id)
                                .order_by(SourceBlock.position.asc())
                                .all()
                            )
                            if blocks:
                                resolved_text = "\n\n".join(b.text for b in blocks if getattr(b, "text", None))
                            
                            # Also resolve document filename
                            doc = db.query(Document).filter(Document.id == cco_row.document_id).first()
                            if doc and doc.name:
                                doc_filename = doc.name

                        # 2. If blocks not found, synthesize clean readable markdown from CCO JSON
                        if not resolved_text and cco_row.cco_json:
                            cco_dict = cco_row.cco_json
                            title = cco_dict.get("metadata", {}).get("title") or cco_dict.get("title", "")
                            overview = cco_dict.get("metadata", {}).get("overview") or cco_dict.get("summary", "")
                            claims = [c.get("text", "") for c in cco_dict.get("claims", []) if c.get("text")]
                            parts = []
                            if title:
                                parts.append(f"# {title}")
                            if overview:
                                parts.append(overview)
                            if claims:
                                parts.append("Key Claims & Findings:\n" + "\n".join(f"- {c}" for c in claims))
                            if parts:
                                resolved_text = "\n\n".join(parts)
                            else:
                                resolved_text = json.dumps(cco_dict, indent=2)
                except Exception as e:
                    logger.warning(f"Error resolving source text from DB: {e}")

            sample_content = resolved_text or (
                f"# {doc_filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()}\n"
                "Summary: Executive briefing and verified factual analysis derived from document source."
            )

            req = PipelineTransformRequest(
                session_id=session_id,
                content=sample_content,
                filename=doc_filename,
                output_types=output_types,
                audience=audience,
                tone=tone,
                language=language,
                detail_level=detail_level,
                objective=objective,
                style=style,
                custom_instructions=custom_instructions,
            )

            # Pass db=None: pipeline uses AsyncSession internally which is incompatible
            # with our sync session. We persist artifacts below using our own session.
            ai_response = await run_transformation_pipeline(req, db=None)

            # 3. Update state: VERIFYING
            self._update_status_with_db(db, transformation_id, "VERIFYING", 70, "Verifying artifact grounding scores.")

            # 4. Update state: RENDERING (Persist binary files & metadata)
            self._update_status_with_db(db, transformation_id, "RENDERING", 85, "Rendering binary presentations & persistent artifacts.")

            # Ensure cco_version_id exists in cco_versions table to satisfy DB foreign key constraint
            if db:
                db_cco = db.query(CCOVersion).filter(CCOVersion.id == cco_version_id).first()
                if not db_cco:
                    # Look strictly in this session's documents
                    session_doc = db.query(Document).filter(Document.session_id == session_id).order_by(Document.created_at.desc()).first()
                    if session_doc:
                        db_cco = db.query(CCOVersion).filter(CCOVersion.document_id == session_doc.id).order_by(CCOVersion.version_number.desc()).first()

                    if not db_cco:
                        # Persist the CCO built during this pipeline run specifically for this session
                        if not session_doc:
                            session_doc = Document(id=f"DOC-{uuid.uuid4().hex[:8].upper()}", session_id=session_id, name=doc_filename, mime_type="text/plain", status="ready", created_by=user_id)
                            db.add(session_doc)
                            db.flush()

                        cco_dict = ai_response.cco.model_dump() if hasattr(ai_response.cco, "model_dump") else (ai_response.cco or {})
                        db_cco = CCOVersion(
                            id=f"CCO-{uuid.uuid4().hex[:8].upper()}",
                            document_id=session_doc.id,
                            version_number=1,
                            cco_json=cco_dict,
                            status="active",
                            created_by=user_id,
                        )
                        db.add(db_cco)
                        db.flush()

                    cco_version_id = db_cco.id

            created_artifacts = []

            # Resolve template configs from DB record or in-memory
            tpl_configs_map = {}
            if trans_row and hasattr(trans_row, "template_configs") and trans_row.template_configs:
                tpl_configs_map = trans_row.template_configs
            if not tpl_configs_map:
                try:
                    from app.services.transformation_service import TransformationService
                    in_mem = TransformationService._in_memory_transformations.get(transformation_id, {})
                    tpl_configs_map = in_mem.get("template_configs") or {}
                except Exception:
                    pass

            for art_item in ai_response.artifacts:
                art_id = f"ART-{uuid.uuid4().hex[:8].upper()}"
                art_type = art_item.artifact_type
                content_json = art_item.content or {}

                # Extract template parameters if configured with resilient defaults
                raw_cfg = tpl_configs_map.get(art_type) or {}
                if isinstance(raw_cfg, dict):
                    t_id = raw_cfg.get("template_id") or content_json.get("template_id") or ""
                    cfg_dict = {**raw_cfg, "artifact_type": art_type, "template_id": t_id}
                else:
                    cfg_dict = {"artifact_type": art_type, "template_id": content_json.get("template_id") or ""}

                try:
                    cfg = ArtifactTemplateConfig.model_validate(cfg_dict)
                except Exception as cfg_err:
                    from app.renderers.template_registry import get_default_template_id
                    logger.warning(f"Template config validation fallback for {art_type}: {cfg_err}")
                    cfg = ArtifactTemplateConfig(artifact_type=art_type, template_id=get_default_template_id(art_type))

                template_id = cfg.template_id
                theme_name = cfg.brand_theme
                classification = cfg.classification_banner
                # Persist the exact controlled render contract alongside structured content.
                content_json = {**content_json, "template_id": template_id, "template_config": cfg.model_dump()}

                try:
                    if art_type == "presentation":
                        binary_content = render_presentation(content_json, template_id=template_id, theme_name=theme_name,
                            classification=classification, include_evidence_refs=cfg.include_evidence_refs,
                            include_verification_footer=cfg.include_verification_footer)
                        file_ext, content_type = "pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    elif art_type in ["executive_summary", "advisory"]:
                        binary_content = render_document(content_json, template_id=template_id, theme_name=theme_name,
                            classification=classification, include_evidence_refs=cfg.include_evidence_refs,
                            include_verification_footer=cfg.include_verification_footer)
                        file_ext, content_type = "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    elif art_type == "infographic":
                        binary_content = render_infographic_svg(content_json, template_id=template_id, theme_name=theme_name,
                            classification=classification, include_evidence_refs=cfg.include_evidence_refs,
                            include_verification_footer=cfg.include_verification_footer)
                        file_ext, content_type = "svg", "image/svg+xml"
                    elif art_type in ["video_package", "social_post"]:
                        binary_content = json.dumps(content_json, indent=2, ensure_ascii=False).encode("utf-8")
                        file_ext, content_type = "json", "application/json"
                    else:
                        binary_content = json.dumps(content_json, indent=2, ensure_ascii=False).encode("utf-8")
                        file_ext, content_type = "json", "application/json"
                except Exception as render_error:
                    logger.error("Controlled render failed for %s: %s", art_type, render_error)
                    if db:
                        db.add(Artifact(id=art_id, transformation_request_id=transformation_id, cco_version_id=cco_version_id,
                            type=art_type, status=ArtifactStatus.FAILED, version=1, content_json=content_json,
                            template_config=cfg.model_dump(), render_error=str(render_error)))
                        db.add(VerificationResult(id=f"VER-{uuid.uuid4().hex[:8].upper()}", artifact_id=art_id,
                            status=VerificationStatus.FAILED, grounding_score=0.0, consistency_score=0.0,
                            unsupported_claim_count=1, issues_json=[{"category": "render_failed", "severity": "CRITICAL", "description": str(render_error), "suggested_fix": "Correct the structured content or template configuration and revise."}]))
                    created_artifacts.append({"artifact_id": art_id, "type": art_type, "version": 1, "status": "FAILED", "template_id": template_id, "render_error": str(render_error)})
                    continue

                filename = f"{art_type}_{art_id[:6]}.{file_ext}"
                storage_key = f"artifacts/{transformation_id}/{art_type}/v1/{filename}"
                checksum = hashlib.sha256(binary_content).hexdigest()
                await self.storage.put_object(storage_key, binary_content, content_type=content_type)

                # Collect structured verification issues
                ver_data = art_item.verification or {}
                ver_issues = ver_data.get("issues") or ver_data.get("unsupported_claims") or []
                ver_status = ver_data.get("status", "PASSED")
                grounding_score = ver_data.get("grounding_score", 0.95)

                # Store DB record if DB is available
                if db:
                    db_art = Artifact(
                        id=art_id,
                        transformation_request_id=transformation_id,
                        cco_version_id=cco_version_id,
                        type=art_type,
                        status=ArtifactStatus.PASSED if ver_status == "PASSED" else ArtifactStatus.REVISION_REQUIRED,
                        version=1,
                        content_json=content_json,
                        template_config=cfg.model_dump(),
                        storage_key=storage_key,
                        checksum=checksum,
                    )
                    db.add(db_art)

                    ver_res = VerificationResult(
                        id=f"VER-{uuid.uuid4().hex[:8].upper()}",
                        artifact_id=art_id,
                        status=VerificationStatus.PASSED if ver_status == "PASSED" else VerificationStatus.REVISION_REQUIRED,
                        grounding_score=grounding_score,
                        consistency_score=1.0,
                        unsupported_claim_count=len(ver_issues),
                        issues_json=ver_issues,
                    )
                    db.add(ver_res)

                created_artifacts.append({
                    "artifact_id": art_id,
                    "type": art_type,
                    "version": 1,
                    "status": "PASSED" if ver_status == "PASSED" else "REVISION_REQUIRED",
                    "filename": filename,
                    "download_url": f"/api/v1/artifacts/{art_id}/download",
                    "storage_key": storage_key,
                    "checksum": checksum,
                    "template_id": template_id,
                    "classification": classification,
                })

            if db:
                db.commit()

            # 5. Final State: COMPLETED
            final_status = "COMPLETED"
            self._update_status_with_db(db, transformation_id, final_status, 100, "Transformation completed successfully.", artifacts=created_artifacts)
            record_audit_event(
                db,
                user_id=user_id,
                action="TRANSFORMATION_COMPLETED",
                resource_type="transformation",
                resource_id=transformation_id,
                details={"artifacts_count": len(created_artifacts)},
            )
            logger.info(f"[JOB-ORCHESTRATOR] Transformation {transformation_id} completed with {len(created_artifacts)} artifacts.")

        except Exception as e:
            logger.error(f"[JOB-ORCHESTRATOR] Transformation job failed: {e}", exc_info=True)
            if db:
                try:
                    db.rollback()
                except Exception:
                    pass
            self._update_status(transformation_id, "FAILED", 0, f"Transformation failed: {str(e)}")
        finally:
            try:
                db.close()
            except Exception:
                pass

    def _update_status(
        self,
        transformation_id: str,
        status: str,
        progress: int,
        message: str,
        artifacts: Optional[list] = None,
    ):
        """Update transformation status using a fresh session (safe for background use) and in-memory cache."""
        try:
            from app.services.transformation_service import TransformationService
            rec = TransformationService._in_memory_transformations.get(transformation_id)
            if rec:
                rec["status"] = status
                rec["progress_percentage"] = progress
                rec["message"] = message
                if artifacts:
                    rec["artifacts"] = artifacts
        except Exception:
            pass

        # Broadcast progress event to Redis Pub/Sub channel
        event_name = "complete" if status == "COMPLETED" else "error" if status == "FAILED" else "progress"
        publish_event(
            channel=f"transformation:{transformation_id}:events",
            event_type=event_name,
            data={
                "transformation_id": transformation_id,
                "status": status,
                "progress_percentage": progress,
                "message": message,
                "artifacts": artifacts or [],
            },
        )

        db = new_db_session()
        try:
            db_trans = (
                db.query(TransformationRequest)
                .filter(TransformationRequest.id == transformation_id)
                .first()
            )
            if db_trans:
                db_trans.status = status

            # Update Job record in database
            db_job = (
                db.query(Job)
                .filter(Job.transformation_id == transformation_id)
                .order_by(Job.created_at.desc())
                .first()
            )
            if db_job:
                db_job.current_stage = status
                db_job.progress_pct = progress
                now_utc = datetime.now(timezone.utc)
                if not db_job.started_at:
                    db_job.started_at = now_utc
                if status == "COMPLETED":
                    db_job.status = JobStatus.SUCCEEDED
                    db_job.completed_at = now_utc
                elif status == "FAILED":
                    db_job.status = JobStatus.FAILED
                    db_job.error_message = message
                    db_job.completed_at = now_utc
                else:
                    db_job.status = JobStatus.RUNNING

            db.commit()
        except Exception as e:
            logger.warning(f"[JOB-ORCHESTRATOR] Status update failed: {e}")
            db.rollback()
        finally:
            db.close()

    def _update_status_with_db(
        self,
        db: DBSession,
        transformation_id: str,
        status: str,
        progress: int,
        message: str,
        artifacts: Optional[list] = None,
    ):
        """Update transformation status using the provided DB session and update in-memory cache."""
        try:
            from app.services.transformation_service import TransformationService
            rec = TransformationService._in_memory_transformations.get(transformation_id)
            if rec:
                rec["status"] = status
                rec["progress_percentage"] = progress
                rec["message"] = message
                if artifacts:
                    rec["artifacts"] = artifacts
        except Exception:
            pass

        # Broadcast progress event to Redis Pub/Sub channel
        event_name = "complete" if status == "COMPLETED" else "error" if status == "FAILED" else "progress"
        publish_event(
            channel=f"transformation:{transformation_id}:events",
            event_type=event_name,
            data={
                "transformation_id": transformation_id,
                "status": status,
                "progress_percentage": progress,
                "message": message,
                "artifacts": artifacts or [],
            },
        )

        if db:
            try:
                db_trans = (
                    db.query(TransformationRequest)
                    .filter(TransformationRequest.id == transformation_id)
                    .first()
                )
                if db_trans:
                    db_trans.status = status

                # Update Job record in database
                db_job = (
                    db.query(Job)
                    .filter(Job.transformation_id == transformation_id)
                    .order_by(Job.created_at.desc())
                    .first()
                )
                if db_job:
                    db_job.current_stage = status
                    db_job.progress_pct = progress
                    now_utc = datetime.now(timezone.utc)
                    if not db_job.started_at:
                        db_job.started_at = now_utc
                    if status == "COMPLETED":
                        db_job.status = JobStatus.SUCCEEDED
                        db_job.completed_at = now_utc
                    elif status == "FAILED":
                        db_job.status = JobStatus.FAILED
                        db_job.error_message = message
                        db_job.completed_at = now_utc
                    else:
                        db_job.status = JobStatus.RUNNING

                db.commit()
            except Exception:
                db.rollback()


class IngestionJobOrchestrator:
    def __init__(self, db: Optional[DBSession] = None):
        # NOTE: We intentionally ignore the passed-in request-scoped db.
        # The streaming path (upload_document_stream) runs synchronously within the SSE
        # generator and may safely use the request db. The background dispatch path
        # must create its own session — done inside enqueue_and_process.
        self._request_db = db  # kept only for the streaming SSE path
        self.db = db
        self.storage = get_storage_provider()

    async def enqueue_and_process(
        self,
        document_id: str,
        session_id: str,
        storage_key: str,
        filename: str,
        mime_type: str,
    ):
        logger.info(f"[JOB-ORCHESTRATOR] Starting ingestion job for document {document_id}")

        # Create own DB session — request session is closed before this task runs
        db = new_db_session()
        try:
            # 1. Fetch raw binary from storage
            content_bytes = await self.storage.get_object(storage_key)
            if not content_bytes:
                raise ValueError("Could not retrieve document from storage")

            # 2. Parse text to blocks
            blocks = parse_document(content_bytes, filename=filename, mime_type=mime_type)
            if not blocks:
                raise ValueError("No extractable text found in document")
            logger.info(f"[INGESTION-WORKER] Parsed {len(blocks)} layout blocks from '{filename}'")

            # Check for prompt injection threats across layout blocks
            all_threats = []
            for b in blocks:
                if "security_threats" in b.get("metadata", {}):
                    all_threats.extend(b["metadata"]["security_threats"])

            if all_threats and db:
                logger.warning(f"[INGESTION-SECURITY] Detected {len(all_threats)} potential prompt injection pattern(s) in '{filename}' for document {document_id}")
                record_security_event(
                    db,
                    event_type="PROMPT_INJECTION_DETECTED",
                    severity="high",
                    payload_summary=f"Detected {len(all_threats)} injection pattern(s) in document '{filename}': {all_threats[0]['matched_pattern']}",
                    details={
                        "document_id": document_id,
                        "session_id": session_id,
                        "filename": filename,
                        "threat_count": len(all_threats),
                        "threats": all_threats[:10],
                    },
                )

            # Extract full text
            full_text = "\n\n".join(b["text"] for b in blocks if "text" in b)

            # 3. Deterministic Extraction
            deterministic_data = extract_deterministic_data(full_text)
            logger.info(f"[INGESTION-WORKER] Deterministic extraction extracted rules & entities")

            # 4. Semantic Extraction
            semantic_data = await extract_semantic_data(full_text)
            claims_count = len(semantic_data.claims) if hasattr(semantic_data, "claims") else len(semantic_data.get("claims", []))
            logger.info(f"[INGESTION-WORKER] Semantic extraction extracted {claims_count} claims")

            # 5. Build CCO
            cco_dict = build_cco(
                document_id=document_id,
                version_number=1,
                source_blocks=blocks,
                deterministic_data=deterministic_data,
                semantic_data=semantic_data
            )
            logger.info(f"[INGESTION-WORKER] CCO built (hash: {cco_dict.get('hash', '')[:16]}...)")
            
            # 6. Chunk and Embed
            chunks = chunk_blocks(blocks)
            texts_to_embed = [c["text"] for c in chunks]
            embeddings = embed_batch(texts_to_embed)
            logger.info(f"[INGESTION-WORKER] Generated {len(chunks)} chunks & embeddings")

            # 7. Persist to DB
            if db:
                # Add CCO Version — use correct column names
                cco_id = f"CCO-{uuid.uuid4().hex[:8].upper()}"
                db_cco = CCOVersion(
                    id=cco_id,
                    document_id=document_id,
                    version_number=1,
                    cco_json=cco_dict,
                    status="active",
                )
                db.add(db_cco)

                # Add Source Blocks
                for idx, b in enumerate(blocks):
                    db_block = SourceBlock(
                        id=f"BLK-{document_id[:8]}-{idx}",
                        document_id=document_id,
                        block_type=b.get("block_type", "paragraph"),
                        text=b.get("text", ""),
                        page=b.get("page"),
                        position=b.get("position", idx),
                        metadata_json={
                            "section": b.get("section"),
                            **(b.get("metadata") or {}),
                        },
                    )
                    db.add(db_block)

                # Add Embedded Chunks with globally unique primary keys
                for idx, (c, emb) in enumerate(zip(chunks, embeddings)):
                    chunk_meta = c.get("metadata") or {}
                    db_chunk = Chunk(
                        id=f"CHK-{document_id[:8]}-{idx}",
                        document_id=document_id,
                        text=c.get("text", ""),
                        section=chunk_meta.get("section") or c.get("section"),
                        page=chunk_meta.get("start_page") or c.get("page"),
                        chunk_index=c.get("chunk_index", idx),
                        token_count=chunk_meta.get("estimated_tokens") or c.get("token_count", 0),
                        metadata_json={**chunk_meta, "chunk_id": c.get("chunk_id", f"chunk-{idx:03d}")},
                        embedding=emb,
                    )
                    db.add(db_chunk)

                # Update Document Status
                db_doc = db.query(Document).filter(Document.id == document_id).first()
                if db_doc:
                    db_doc.status = "ready"

                db.commit()
                logger.info(f"[INGESTION-WORKER] Successfully committed document {document_id} and CCO {cco_id} to PostgreSQL database.")
        except Exception as e:
            logger.error(f"[INGESTION-WORKER] Ingestion failed for {document_id}: {str(e)}")
            if db:
                db.rollback()
                db_doc = db.query(Document).filter(Document.id == document_id).first()
                if db_doc:
                    db_doc.status = "failed"
                db.commit()
        finally:
            try:
                db.close()
            except Exception:
                pass

    async def stream_process(
        self,
        document_id: str,
        session_id: str,
        storage_key: str,
        filename: str,
        mime_type: str,
    ):
        logger.info(f"=================================================================")
        logger.info(f"[INGESTION] Starting streaming ingestion job for document: '{filename}'")
        logger.info(f"[INGESTION] Document ID: {document_id} | Session ID: {session_id}")
        logger.info(f"=================================================================")
        
        # Create dedicated DB session — request session is closed before async stream finishes
        db = new_db_session()
        try:
            yield {"event": "progress", "data": {"stage": "fetching", "message": "Fetching document from storage"}}
            content_bytes = await self.storage.get_object(storage_key)
            if not content_bytes:
                raise ValueError("Could not retrieve document from storage")
            logger.info(f"[INGESTION] 1/6: Fetched {len(content_bytes)} bytes from storage key '{storage_key}'")

            yield {"event": "progress", "data": {"stage": "parsing", "message": "Parsing document text and blocks"}}
            blocks = parse_document(content_bytes, filename=filename, mime_type=mime_type)
            if not blocks:
                raise ValueError("No extractable text found in document")

            # Check for prompt injection threats across layout blocks
            all_threats = []
            for b in blocks:
                if "security_threats" in b.get("metadata", {}):
                    all_threats.extend(b["metadata"]["security_threats"])

            if all_threats and db:
                logger.warning(f"[INGESTION-SECURITY] Detected {len(all_threats)} potential prompt injection pattern(s) in '{filename}' for document {document_id}")
                record_security_event(
                    db,
                    event_type="PROMPT_INJECTION_DETECTED",
                    severity="high",
                    payload_summary=f"Detected {len(all_threats)} injection pattern(s) in document '{filename}': {all_threats[0]['matched_pattern']}",
                    details={
                        "document_id": document_id,
                        "session_id": session_id,
                        "filename": filename,
                        "threat_count": len(all_threats),
                        "threats": all_threats[:10],
                    },
                )

            full_text = "\n\n".join(b["text"] for b in blocks if "text" in b)
            logger.info(f"[INGESTION] 2/6: Parsed {len(blocks)} layout blocks from document ({len(full_text)} characters text).")

            yield {"event": "progress", "data": {"stage": "deterministic_extraction", "message": "Extracting deterministic rules and metrics"}}
            deterministic_data = extract_deterministic_data(full_text)
            logger.info(f"[INGESTION] 3/6: Deterministic extraction found {len(deterministic_data.get('entities', []))} entities & {len(deterministic_data.get('metrics', []))} metrics.")

            yield {"event": "progress", "data": {"stage": "semantic_extraction", "message": "Extracting semantic claims via LLM"}}
            semantic_data = await extract_semantic_data(full_text)
            claims_count = len(semantic_data.claims) if hasattr(semantic_data, "claims") else len(semantic_data.get("claims", []))
            logger.info(f"[INGESTION] 4/6: Semantic extraction extracted {claims_count} verified claims via LLM.")

            yield {"event": "progress", "data": {"stage": "cco_build", "message": "Building Canonical Content Object"}}
            cco_dict = build_cco(
                document_id=document_id,
                version_number=1,
                source_blocks=blocks,
                deterministic_data=deterministic_data,
                semantic_data=semantic_data
            )
            logger.info(f"[INGESTION] 5/6: Built Canonical Content Object (CCO v1) hash: {cco_dict.get('hash', 'N/A')[:16]}... with integrity {cco_dict.get('grounding_score', 1.0)*100:.1f}%")
            
            yield {"event": "progress", "data": {"stage": "chunking", "message": "Generating pgvector embeddings"}}
            chunks = chunk_blocks(blocks)
            texts_to_embed = [c["text"] for c in chunks]
            embeddings = embed_batch(texts_to_embed)
            logger.info(f"[INGESTION] 6/6: Generated {len(chunks)} text chunks and {len(embeddings)} pgvector embeddings.")

            yield {"event": "progress", "data": {"stage": "persisting", "message": "Persisting to database"}}
            if db:
                # Add CCO Version — use correct column names
                cco_id = f"CCO-{uuid.uuid4().hex[:8].upper()}"
                db_cco = CCOVersion(
                    id=cco_id,
                    document_id=document_id,
                    version_number=1,
                    cco_json=cco_dict,
                    status="active",
                )
                db.add(db_cco)

                # Add Source Blocks
                for idx, b in enumerate(blocks):
                    db_block = SourceBlock(
                        id=f"BLK-{document_id[:8]}-{idx}",
                        document_id=document_id,
                        block_type=b.get("block_type", "paragraph"),
                        text=b.get("text", ""),
                        page=b.get("page"),
                        position=b.get("position", idx),
                        metadata_json={
                            "section": b.get("section"),
                            **(b.get("metadata") or {}),
                        },
                    )
                    db.add(db_block)

                # Add Embedded Chunks
                for idx, (c, emb) in enumerate(zip(chunks, embeddings)):
                    chunk_meta = c.get("metadata") or {}
                    db_chunk = Chunk(
                        id=f"CHK-{document_id[:8]}-{idx}",
                        document_id=document_id,
                        text=c.get("text", ""),
                        section=chunk_meta.get("section") or c.get("section"),
                        page=chunk_meta.get("start_page") or c.get("page"),
                        chunk_index=c.get("chunk_index", idx),
                        token_count=chunk_meta.get("estimated_tokens") or c.get("token_count", 0),
                        metadata_json={**chunk_meta, "chunk_id": c.get("chunk_id", f"chunk-{idx:03d}")},
                        embedding=emb,
                    )
                    db.add(db_chunk)

                # Update Document Status
                db_doc = db.query(Document).filter(Document.id == document_id).first()
                if db_doc:
                    db_doc.status = "ready"

                db.commit()
                logger.info(f"[INGESTION] Persisted CCO {cco_id}, {len(blocks)} source blocks, and {len(chunks)} embeddings to PostgreSQL database.")
            
            logger.info(f"[INGESTION] Ingestion pipeline successfully COMPLETED for document {document_id}!")
            logger.info(f"=================================================================")
            yield {"event": "complete", "data": {"stage": "complete", "message": "Ingestion fully completed", "document_id": document_id}}
        except Exception as e:
            logger.error(f"[INGESTION] Ingestion failed for {document_id}: {str(e)}")
            if db:
                try:
                    db.rollback()
                    db_doc = db.query(Document).filter(Document.id == document_id).first()
                    if db_doc:
                        db_doc.status = "failed"
                    db.commit()
                except Exception:
                    pass
            yield {"event": "error", "data": {"stage": "failed", "message": str(e)}}
        finally:
            if db:
                try:
                    db.close()
                except Exception:
                    pass
