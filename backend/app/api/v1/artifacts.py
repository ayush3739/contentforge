"""
ContentForge AI — V1 Artifact API Routes

Section 12 & 20 of Specification:
- GET  /api/v1/artifacts
- GET  /api/v1/artifacts/{id}
- GET  /api/v1/artifacts/{id}/versions
- GET  /api/v1/artifacts/{id}/download
- GET  /api/v1/artifacts/{id}/verification
- POST /api/v1/artifacts/{id}/verify
- POST /api/v1/artifacts/{id}/revise
- POST /api/v1/artifacts/{id}/finalize
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.database import get_db
from app.core.errors import APIError
from app.models.artifact import Artifact
from app.schemas.artifact import (
    ArtifactFinalizeRequest,
    ArtifactResponse,
    ArtifactReviseRequest,
    ArtifactVerificationResponse,
    ArtifactVersionResponse,
)
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])


@router.get("", response_model=list[ArtifactResponse])
async def list_artifacts(
    session_id: Optional[str] = Query(None, description="Filter artifacts by session ID"),
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Lists generated artifacts for the current user (or across all sessions if admin).
    """
    service = ArtifactService(db=db)
    return service.list_artifacts(user_id=user.user_id, role=user.role, session_id=session_id)


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
    service.assert_owner(id, user.user_id, role=user.role)
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
    service.assert_owner(id, user.user_id, role=user.role)
    art = service.get_artifact(id)
    if not art:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact with ID '{id}' does not exist.", status_code=404)

    if db:
        root_id = art.get("parent_artifact_id") or id
        records = db.query(Artifact).filter(
            (Artifact.id == root_id) | (Artifact.parent_artifact_id == root_id)
        ).order_by(Artifact.version.asc()).all()
        return [ArtifactVersionResponse(artifact_id=item.id, version=item.version, status=item.status,
            checksum=item.checksum, download_url=f"/api/v1/artifacts/{item.id}/download" if item.status.value in {"PASSED", "FINALIZED"} else None,
            created_at=item.created_at, parent_artifact_id=item.parent_artifact_id) for item in records]
    return [ArtifactVersionResponse(artifact_id=id, version=art.get("version", 1), status=art.get("status", "GENERATING"), checksum=art.get("checksum"), download_url=art.get("download_url"))]


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
    service.assert_owner(id, user.user_id, role=user.role)
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
    service.assert_owner(id, user.user_id, role=user.role)
    art = service.get_artifact(id)
    if not art:
        raise APIError("ARTIFACT_NOT_FOUND", f"Artifact with ID '{id}' does not exist.", status_code=404)

    ver = art.get("verification", {})
    return ArtifactVerificationResponse(
        artifact_id=id,
        status=ver.get("status", "PENDING"),
        grounding_score=ver.get("grounding_score", 0.0),
        consistency_score=ver.get("consistency_score", 0.0),
        unsupported_claim_count=ver.get("unsupported_claim_count", 0),
        issues=ver.get("issues", []),
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
    service.assert_owner(id, user.user_id, role=user.role)
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
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Owner-initiated finalization for an artifact. Enforced only for artifacts with PASSED verification status.
    """
    service = ArtifactService(db=db)
    return service.finalize_artifact(id, payload, user_id=user.user_id)
