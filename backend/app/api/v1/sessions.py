"""
ContentForge AI — V1 Session Workspace API Routes

Section 7 of Specification:
- POST   /api/v1/sessions
- GET    /api/v1/sessions
- GET    /api/v1/sessions/{id}
- PATCH  /api/v1/sessions/{id}
- DELETE /api/v1/sessions/{id}
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.database import get_db
from app.core.errors import APIError
from app.schemas.artifact import ArtifactResponse
from app.schemas.session import SessionCreate, SessionDetailResponse, SessionResponse, SessionUpdate
from app.services.session_service import SessionService
from app.services.artifact_service import ArtifactService

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    user: ClerkUserPayload = Depends(require_permission("create_session")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Creates a new application session workspace.
    """
    service = SessionService(db=db)
    return service.create_session(payload, user=user)


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    all_users: bool = Query(False, description="List all sessions across all users (admin management only)"),
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Lists workspace sessions created by current user.
    """
    service = SessionService(db=db)
    user_filter = None if (all_users and user.role == "admin") else user.user_id
    return service.list_sessions(user_id=user_filter)


@router.get("/{id}", response_model=SessionDetailResponse)
async def get_session(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves full details for a session including attached documents and transformation requests.
    """
    service = SessionService(db=db)
    sess = service.get_session(id, user_id=user.user_id, role=user.role)
    if not sess:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return sess


@router.get("/{id}/artifacts", response_model=list[ArtifactResponse])
async def get_session_artifacts(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves all generated artifacts for a session.
    """
    service = SessionService(db=db)
    sess = service.get_session(id, user_id=user.user_id, role=user.role)
    if not sess:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    art_service = ArtifactService(db=db)
    return art_service.get_artifacts_by_session(id, user_id=user.user_id, role=user.role)


@router.patch("/{id}", response_model=SessionResponse)
async def update_session(
    id: str,
    payload: SessionUpdate,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Updates session workspace metadata or status.
    """
    service = SessionService(db=db)
    sess = service.update_session(id, payload, user_id=user.user_id, role=user.role)
    if not sess:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return sess


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Deletes a session workspace and cascade purges associated document metadata.
    """
    service = SessionService(db=db)
    success = service.delete_session(id, user_id=user.user_id, role=user.role)
    if not success:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return None
