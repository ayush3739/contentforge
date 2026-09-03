import logging
import uuid
from typing import Any, AsyncGenerator, Optional
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.ingestion.parser import parse_document
from app.ai.extraction.deterministic import extract_deterministic_data
from app.ai.extraction.semantic import extract_semantic_data
from app.ai.cco.builder import build_cco
from app.ai.chunking.chunker import chunk_blocks
from app.ai.retrieval.indexer import index_chunks_async
from app.ai.retrieval.retriever import retrieve_evidence_async, retrieve_in_memory
from app.ai.planner.planner import plan_transformation_async
from app.ai.prompts.compiler import compile_transformation_prompt
from app.ai.generation.generator import generate_structured_artifact
from app.ai.verification.verifier import verify_artifact, verify_cross_output_consistency
from app.ai.revision.revisor import revise_artifact

# Database models
from app.models.document import Document
from app.models.cco import CCOVersion
from app.models.transformation import TransformationRequest
from app.models.artifact import Artifact, VerificationResult
from app.models.session import Session as WorkspaceSession

logger = logging.getLogger(__name__)


class PipelineTransformRequest(BaseModel):
    session_id: Optional[str] = Field(default=None, description="Existing or new session ID")
    content: str = Field(description="Raw text, markdown, or text extracted from document")
    filename: str = Field(default="document.txt", description="Source document filename")
    mime_type: str = Field(default="text/plain", description="MIME type")
    output_types: list[str] = Field(
        default=["executive_summary", "presentation"],
        description="Target output formats: presentation, executive_summary, advisory, social_post, infographic, video_package"
    )
    audience: str = Field(default="senior leadership", description="Target audience")
    tone: str = Field(default="professional", description="Tone of voice")
    language: str = Field(default="en", description="Target language")
    detail_level: str = Field(default="balanced", description="concise, balanced, or detailed")
    objective: str = Field(default="decision briefing", description="Primary goal")
    style: str = Field(default="standard", description="Stylistic formatting")
    llm_provider: Optional[str] = Field(default=None, description="gemini, groq, or openai")


class PipelineArtifactResult(BaseModel):
    artifact_id: str
    artifact_type: str
    status: str
    content: dict[str, Any]
    verification: dict[str, Any]


class PipelineTransformResponse(BaseModel):
    session_id: str
    document_id: str
    document_version_id: str
    cco_version: int
    cco: dict[str, Any]
    artifacts: list[PipelineArtifactResult]
    cross_output_consistency: dict[str, Any]
    execution_status: str


async def run_transformation_pipeline_stream(
    request: PipelineTransformRequest,
    db: Optional[AsyncSession] = None,
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Asynchronous generator executing the ContentForge AI Pipeline and
    yielding Server-Sent Events (SSE) milestone updates in real time.
    """
    logger.info(f"Starting streaming transformation pipeline for '{request.filename}'...")

    try:
        yield {
            "event": "progress",
            "data": {"stage": "init", "progress": 5, "message": f"Initializing transformation session for '{request.filename}'..."}
        }

        # 1. Setup Session and Document IDs
        session_id = request.session_id or f"SES-{uuid.uuid4().hex[:8].upper()}"
        doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        doc_version_id = doc_id
        trans_req_id = f"TR-{uuid.uuid4().hex[:8].upper()}"

        # 2. Document Understanding & Parsing
        yield {
            "event": "progress",
            "data": {"stage": "parsing", "progress": 15, "message": "Parsing document layout and structural blocks..."}
        }
        source_blocks = parse_document(
            content=request.content,
            filename=request.filename,
            mime_type=request.mime_type,
        )
        full_text = " ".join(b.get("text", "") for b in source_blocks)

        # 3 & 4. Extraction
        yield {
            "event": "progress",
            "data": {"stage": "extraction", "progress": 30, "message": f"Parsed {len(source_blocks)} blocks. Extracting metrics and semantic claims..."}
        }
        deterministic_data = extract_deterministic_data(full_text)
        semantic_data = await extract_semantic_data(
            text_content=full_text,
            provider_name=request.llm_provider,
        )

        # 5. Build CCO
        cco = build_cco(
            document_id=doc_id,
            version_number=1,
            source_blocks=source_blocks,
            deterministic_data=deterministic_data,
            semantic_data=semantic_data,
        )
        yield {
            "event": "progress",
            "data": {
                "stage": "cco_ready",
                "progress": 45,
                "message": f"Constructed CCO v1 with {len(cco.get('claims', []))} verified claims.",
                "claims_count": len(cco.get("claims", [])),
                "entities_count": len(cco.get("entities", [])),
                "hash": cco.get("hash"),
            }
        }

        # 6. Semantic Chunking
        raw_chunks = chunk_blocks(source_blocks)

        # 7. pgvector Indexing & Storage
        yield {
            "event": "progress",
            "data": {"stage": "indexing", "progress": 55, "message": f"Generating pgvector embeddings for {len(raw_chunks)} semantic chunks..."}
        }
        cco_record_id = f"CCO-{uuid.uuid4().hex[:8].upper()}"
        if db is not None:
            try:
                existing_session = await db.get(WorkspaceSession, session_id)
                if not existing_session:
                    new_session = WorkspaceSession(id=session_id, name=f"Session for {request.filename}")
                    db.add(new_session)

                doc_record = Document(
                    id=doc_id,
                    session_id=session_id,
                    name=request.filename,
                    mime_type=request.mime_type,
                    version=1,
                    status="parsed",
                )
                db.add(doc_record)

                cco_record = CCOVersion(
                    id=cco_record_id,
                    document_id=doc_id,
                    version_number=1,
                    cco_json=cco,
                    status="active",
                )
                db.add(cco_record)

                trans_record = TransformationRequest(
                    id=trans_req_id,
                    session_id=session_id,
                    cco_version_id=cco_record_id,
                    output_types=request.output_types,
                    audience=request.audience,
                    tone=request.tone,
                    language=request.language,
                    detail_level=request.detail_level,
                    objective=request.objective,
                    style=request.style,
                    status="completed",
                )
                db.add(trans_record)
                await db.flush()

                await index_chunks_async(db, doc_id, raw_chunks)
            except Exception as e:
                logger.warning(f"Database persistence step encountered error (falling back to in-memory): {e}")

        # 8. Multi-Artifact Transformation, Verification & Revision
        generated_artifacts: list[PipelineArtifactResult] = []
        raw_artifact_dicts: list[dict[str, Any]] = []

        total_outputs = len(request.output_types)
        for i, art_type in enumerate(request.output_types):
            current_pct = 55 + int(((i + 0.5) / max(1, total_outputs)) * 35)
            yield {
                "event": "progress",
                "data": {
                    "stage": f"generating_{art_type}",
                    "progress": current_pct,
                    "message": f"Planning and generating structured {art_type.replace('_', ' ').title()}...",
                    "current_artifact": art_type,
                }
            }

            plan = await plan_transformation_async(
                artifact_type=art_type,
                audience=request.audience,
                tone=request.tone,
                language=request.language,
                detail_level=request.detail_level,
                objective=request.objective,
                style=request.style,
                cco=cco,
                provider_name=request.llm_provider,
            )

            evidence = []
            seen_chunk_ids = set()
            for query in plan.retrieval_queries:
                if db is not None:
                    try:
                        chunks = await retrieve_evidence_async(db, query, doc_id, top_k=2)
                    except Exception:
                        chunks = retrieve_in_memory(query, raw_chunks, top_k=2)
                else:
                    chunks = retrieve_in_memory(query, raw_chunks, top_k=2)
                
                for chunk in chunks:
                    chunk_id = chunk.get("chunk_id")
                    if chunk_id and chunk_id not in seen_chunk_ids:
                        seen_chunk_ids.add(chunk_id)
                        evidence.append(chunk)

            compiled_prompt = compile_transformation_prompt(plan, cco, evidence)

            artifact_json = await generate_structured_artifact(
                artifact_type=art_type,
                compiled_messages=compiled_prompt,
                provider_name=request.llm_provider,
            )

            # Verification
            verification_report = verify_artifact(artifact_json, cco, evidence)

            # Revision loop if needed
            if verification_report.status != "PASSED":
                artifact_json, verification_report = await revise_artifact(
                    artifact=artifact_json,
                    report=verification_report,
                    plan=plan,
                    cco=cco,
                    evidence=evidence,
                    provider_name=request.llm_provider,
                )

            artifact_id = f"ART-{uuid.uuid4().hex[:8].upper()}"
            raw_artifact_dicts.append(artifact_json)

            # Persist Artifact and VerificationResult to database if available
            if db is not None:
                try:
                    art_row = Artifact(
                        id=artifact_id,
                        transformation_request_id=trans_req_id,
                        cco_version_id=cco_record_id,
                        type=art_type,
                        status=verification_report.status,
                        version=1,
                        content_json=artifact_json,
                        revision_history=[],
                    )
                    db.add(art_row)
                    ver_row = VerificationResult(
                        id=f"VER-{uuid.uuid4().hex[:8].upper()}",
                        artifact_id=artifact_id,
                        status=verification_report.status,
                        grounding_score=verification_report.grounding_score,
                        consistency_score=verification_report.consistency_score,
                        unsupported_claim_count=verification_report.unsupported_claim_count,
                        issues_json=[item.model_dump() for item in verification_report.issues],
                    )
                    db.add(ver_row)
                    await db.commit()
                except Exception as e:
                    logger.warning(f"Error persisting artifact to DB: {e}")

            art_result = PipelineArtifactResult(
                artifact_id=artifact_id,
                artifact_type=art_type,
                status=verification_report.status,
                content=artifact_json,
                verification=verification_report.model_dump(),
            )
            generated_artifacts.append(art_result)

            # Yield early artifact event so frontend can start rendering preview right away!
            yield {
                "event": "artifact",
                "data": art_result.model_dump(),
            }

        # 9. Cross-Output Consistency Verification
        yield {
            "event": "progress",
            "data": {"stage": "cross_output_verification", "progress": 95, "message": "Auditing cross-output consistency across all generated artifacts..."}
        }
        cross_output = verify_cross_output_consistency(raw_artifact_dicts, cco)

        final_response = PipelineTransformResponse(
            session_id=session_id,
            document_id=doc_id,
            document_version_id=doc_version_id,
            cco_version=1,
            cco=cco,
            artifacts=generated_artifacts,
            cross_output_consistency=cross_output,
            execution_status="COMPLETED",
        )

        # Auto-save latest run output to backend/latest_run_output.json for zero-token inspection
        try:
            import json, os
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            run_output_path = os.path.join(base_dir, "latest_run_output.json")
            with open(run_output_path, "w", encoding="utf-8") as f:
                json.dump(final_response.model_dump(), f, indent=2, default=str)
            logger.info(f"Saved pipeline run output to {run_output_path}")
        except Exception as save_err:
            logger.debug(f"Failed to auto-save run log: {save_err}")

        # Final complete event with the full payload
        yield {
            "event": "complete",
            "data": final_response.model_dump(),
        }

    except Exception as exc:
        logger.exception("Error during streaming transformation pipeline")
        yield {
            "event": "error",
            "data": {"message": str(exc), "stage": "failed"},
        }


async def run_transformation_pipeline(
    request: PipelineTransformRequest,
    db: Optional[AsyncSession] = None,
) -> PipelineTransformResponse:
    """
    Master end-to-end AI Pipeline orchestrator (synchronous/await interface).
    Consumes the streaming pipeline and returns the final verified PipelineTransformResponse.
    """
    final_resp = None
    async for item in run_transformation_pipeline_stream(request, db=db):
        if item.get("event") == "complete":
            final_resp = PipelineTransformResponse(**item["data"])
        elif item.get("event") == "error":
            raise RuntimeError(item["data"]["message"])
    if final_resp:
        return final_resp
    raise RuntimeError("Transformation pipeline completed without producing a final response.")
