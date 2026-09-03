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
from fastapi import APIRouter, Depends, status
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.errors import APIError
from app.schemas.session import SessionCreate, SessionDetailResponse, SessionResponse, SessionUpdate
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    user: ClerkUserPayload = Depends(require_permission("create_session")),
):
    """
    Creates a new application session workspace.
    """
    service = SessionService()
    return service.create_session(payload, user_id=user.user_id)


@router.get("", response_model=list[SessionResponse])
async def list_sessions(user: ClerkUserPayload = Depends(require_user())):
    """
    Lists workspace sessions created by current user or accessible to role.
    """
    service = SessionService()
    return service.list_sessions(user_id=None if user.role == "admin" else user.user_id)


@router.get("/{id}", response_model=SessionDetailResponse)
async def get_session(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
):
    """
    Retrieves full details for a session including attached documents and transformation requests.
    """
    service = SessionService()
    sess = service.get_session(id)
    if not sess:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return sess


@router.patch("/{id}", response_model=SessionResponse)
async def update_session(
    id: str,
    payload: SessionUpdate,
    user: ClerkUserPayload = Depends(require_user()),
):
    """
    Updates session workspace metadata or status.
    """
    service = SessionService()
    sess = service.update_session(id, payload, user_id=user.user_id)
    if not sess:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return sess


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
):
    """
    Deletes a session workspace and cascade purges associated document metadata.
    """
    service = SessionService()
    success = service.delete_session(id, user_id=user.user_id)
    if not success:
        raise APIError("SESSION_NOT_FOUND", f"Session with ID '{id}' does not exist.", status_code=404)
    return None
