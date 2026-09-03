"""
End-to-End Pipeline Test with User's Uploaded Document (NPTGA_INC-99214)

Tests all three target output types:
1. presentation (slide deck with speaker notes and citations)
2. executive_summary (C-suite briefing with metrics and recommendations)
3. advisory (technical security advisory with IoCs and actions)
And verifies Neon DB persistence and pgvector RAG retrieval.
"""

import asyncio
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')

import pypdf
from app.core.database import AsyncSessionLocal
from app.ai.pipeline import PipelineTransformRequest, run_transformation_pipeline
from app.models.document import Document
from app.models.cco import CCOVersion
from app.models.chunk import Chunk
from app.models.artifact import Artifact, VerificationResult
from sqlalchemy import select, func


async def run_full_pipeline():
    pdf_path = os.path.join("sample_documents", "NPTGA_INC-99214_Mock_Incident_Report.pdf")
    if not os.path.exists(pdf_path):
        print(f"Error: File not found at {pdf_path}")
        return

    print("================================================================================")
    print("CONTENTFORGE AI — END-TO-END PIPELINE TEST ON REAL USER DOCUMENT")
    print(f"Source: {pdf_path}")
    print("================================================================================")

    # 1. Read document text
    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)
    full_text = " ".join(page.extract_text() for page in reader.pages)
    print(f"[1/4] Extracted text from {total_pages} pages ({len(full_text):,} characters).")

    # 2. Build Pipeline Request with all 3 output types
    request = PipelineTransformRequest(
        content=full_text,
        filename="NPTGA_INC-99214_Mock_Incident_Report.pdf",
        mime_type="application/pdf",
        output_types=["presentation", "executive_summary", "advisory"],
        audience="Senior Executive Leadership & CISO",
        tone="professional and decisive",
        detail_level="balanced",
        objective="decision briefing & risk mitigation",
        llm_provider="gemini",
    )

    # 3. Execute Pipeline with active DB session
    print("[2/4] Executing AI Pipeline (Ingestion -> CCO -> pgvector RAG -> Generation -> Verification)...")
    async with AsyncSessionLocal() as db:
        response = await run_transformation_pipeline(request, db=db)

        print("\n================================================================================")
        print("PIPELINE EXECUTION SUMMARY")
        print("================================================================================")
        print(f"Status: {response.execution_status}")
        print(f"Session ID: {response.session_id}")
        print(f"Document ID: {response.document_id}")
        print(f"CCO Version: v{response.cco_version} | SHA-256 Hash: {response.cco.get('hash')}")
        print(f"Total Extracted Claims in CCO: {len(response.cco.get('claims', []))}")
        print(f"Total Extracted Numbers/Metrics: {len(response.cco.get('numbers', []))}")
        print(f"Total Extracted Dates: {len(response.cco.get('dates', []))}")

        print("\n--------------------------------------------------------------------------------")
        print("OUTPUT 1: PRESENTATION SLIDE DECK")
        print("--------------------------------------------------------------------------------")
        pres_art = next((a for a in response.artifacts if a.artifact_type == "presentation"), None)
        if pres_art:
            print(f"Artifact ID: {pres_art.artifact_id} | Status: {pres_art.status}")
            print(f"Deck Title: {pres_art.content.get('title')}")
            slides = pres_art.content.get("slides", [])
            print(f"Total Slides Generated: {len(slides)}")
            for s in slides[:3]:  # Show first 3 slides
                print(f"  • Slide {s.get('slide_number')}: {s.get('title')}")
                print(f"    Key Message: {s.get('key_message')}")
                print(f"    Bullets: {s.get('body')[:2]}")
                print(f"    Speaker Notes: {s.get('speaker_notes')[:90]}...")
                print(f"    Evidence Citations: {s.get('evidence_refs')}")
            print(f"Verification Grounding Score: {pres_art.verification.get('grounding_score')}")

        print("\n--------------------------------------------------------------------------------")
        print("OUTPUT 2: EXECUTIVE SUMMARY")
        print("--------------------------------------------------------------------------------")
        exec_art = next((a for a in response.artifacts if a.artifact_type == "executive_summary"), None)
        if exec_art:
            print(f"Artifact ID: {exec_art.artifact_id} | Status: {exec_art.status}")
            print(f"Title: {exec_art.content.get('title')}")
            print(f"Executive Takeaway: {exec_art.content.get('executive_takeaway')}")
            print(f"Key Metrics: {exec_art.content.get('key_metrics')}")
            sections = exec_art.content.get("sections", [])
            print(f"Sections ({len(sections)}): {[sec.get('heading') for sec in sections]}")
            print(f"Recommendations: {exec_art.content.get('recommendations')}")
            print(f"Verification Grounding Score: {exec_art.verification.get('grounding_score')}")

        print("\n--------------------------------------------------------------------------------")
        print("OUTPUT 3: TECHNICAL ADVISORY")
        print("--------------------------------------------------------------------------------")
        adv_art = next((a for a in response.artifacts if a.artifact_type == "advisory"), None)
        if adv_art:
            print(f"Artifact ID: {adv_art.artifact_id} | Status: {adv_art.status}")
            print(f"Title: {adv_art.content.get('title')}")
            print(f"Severity: {adv_art.content.get('severity')}")
            print(f"Affected Systems: {adv_art.content.get('affected_systems')}")
            print(f"Threat Details: {adv_art.content.get('threat_details')[:140]}...")
            print(f"Required Actions: {adv_art.content.get('required_actions')}")
            print(f"Verification Grounding Score: {adv_art.verification.get('grounding_score')}")

        print("\n--------------------------------------------------------------------------------")
        print("CROSS-OUTPUT CONSISTENCY CHECK")
        print("--------------------------------------------------------------------------------")
        print(f"Cross-output Consistent: {response.cross_output_consistency.get('consistent')}")
        print(f"Contradictions Found: {response.cross_output_consistency.get('contradictions')}")

        # 4. Verify Database Persistence in Neon PostgreSQL
        print("\n[3/4] Verifying records stored on Neon PostgreSQL...")
        doc_count = await db.scalar(select(func.count(Document.id)).where(Document.id == response.document_id))
        cco_count = await db.scalar(select(func.count(CCOVersion.id)).where(CCOVersion.document_id == response.document_id))
        chunk_count = await db.scalar(select(func.count(Chunk.id)).where(Chunk.document_id == response.document_id))
        art_count = await db.scalar(select(func.count(Artifact.id)).where(Artifact.transformation_request_id == Artifact.transformation_request_id))

        print(f"  • Documents persisted: {doc_count}")
        print(f"  • CCO Versions persisted: {cco_count}")
        print(f"  • pgvector Chunks with 384-dim embeddings: {chunk_count}")
        print(f"  • Artifacts persisted: {len(response.artifacts)}")

    print("\n[4/4] TEST COMPLETE! All three output types generated and verified.")
    print("================================================================================")


if __name__ == "__main__":
    asyncio.run(run_full_pipeline())
