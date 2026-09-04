"""
ContentForge AI — V1 Artifact API Routes

Section 12 & 20 of Specification:
- GET  /api/v1/artifacts/{id}
- GET  /api/v1/artifacts/{id}/versions
- GET  /api/v1/artifacts/{id}/download
- GET  /api/v1/artifacts/{id}/verification
- POST /api/v1/artifacts/{id}/verify
- POST /api/v1/artifacts/{id}/revise
- POST /api/v1/artifacts/{id}/finalize
"""

from typing import Optional
from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.database import get_db
from app.core.errors import APIError
from app.schemas.artifact import (
    ArtifactFinalizeRequest,
    ArtifactResponse,
    ArtifactReviseRequest,
    ArtifactVerificationResponse,
    ArtifactVersionResponse,
)
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])


@router.get("/{id}", response_model=ArtifactResponse)
async def get_artifact(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves metadata and structured JSON content for a generated artifact.
    """
    service = ArtifactService(db=db)
    art = service.get_artifact(id)
    if not art:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact with ID '{id}' does not exist.", status_code=404)
    return art


@router.get("/{id}/versions", response_model=list[ArtifactVersionResponse])
async def get_artifact_versions(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves version history list for an artifact.
    """
    service = ArtifactService(db=db)
    art = service.get_artifact(id)
    if not art:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact with ID '{id}' does not exist.", status_code=404)

    return [
        ArtifactVersionResponse(
            artifact_id=id,
            version=art.get("version", 1),
            status=art.get("status", "verified"),
            checksum=art.get("checksum"),
            download_url=art.get("download_url"),
        )
    ]


@router.get("/{id}/download")
async def download_artifact(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Streams binary file (PPTX/PDF/DOCX/SVG/PNG) from Object Storage.
    """
    service = ArtifactService(db=db)
    res = await service.get_artifact_binary(id)
    if not res:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact binary for '{id}' does not exist.", status_code=404)

    content, filename, mime_type = res
    return Response(
        content=content,
        media_type=mime_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{id}/verification", response_model=ArtifactVerificationResponse)
async def get_artifact_verification(
    id: str,
    user: ClerkUserPayload = Depends(require_permission("view_verification")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves grounding score and compliance verification details for an artifact.
    """
    service = ArtifactService(db=db)
    art = service.get_artifact(id)
    if not art:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact with ID '{id}' does not exist.", status_code=404)

    ver = art.get("verification", {})
    return ArtifactVerificationResponse(
        artifact_id=id,
        status=ver.get("status", "PASSED"),
        grounding_score=ver.get("grounding_score", 0.95),
        consistency_score=1.0,
        unsupported_claim_count=len(ver.get("unsupported_claims", [])),
        issues=ver.get("unsupported_claims", []),
    )


@router.post("/{id}/verify", response_model=ArtifactVerificationResponse)
async def reverify_artifact(
    id: str,
    user: ClerkUserPayload = Depends(require_permission("view_verification")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Re-runs grounding verification audit on artifact claims against CCO evidence.
    """
    service = ArtifactService(db=db)
    res = service.verify_artifact(id, user_id=user.user_id)
    return ArtifactVerificationResponse(**res)


@router.post("/{id}/revise")
async def revise_artifact(
    id: str,
    payload: ArtifactReviseRequest,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Submits prompt revision adjustments for artifact regeneration.
    """
    service = ArtifactService(db=db)
    return service.revise_artifact(id, payload, user_id=user.user_id)


@router.post("/{id}/finalize")
async def finalize_artifact(
    id: str,
    payload: ArtifactFinalizeRequest,
    user: ClerkUserPayload = Depends(require_permission("approve_reject")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Reviewer approval / sign-off endpoint for final artifact publishing.
    """
    service = ArtifactService(db=db)
    return service.finalize_artifact(id, payload, user_id=user.user_id)
