"""
ContentForge AI — V1 Admin & Security Audit API Routes

Section 22 of Specification:
- GET   /api/v1/admin/users
- POST  /api/v1/admin/users
- PATCH /api/v1/admin/users/{id}
- PATCH /api/v1/admin/users/{id}/roles
- GET   /api/v1/admin/audit-logs
- GET   /api/v1/admin/security-events
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_role
from app.core.database import get_db
from app.core.errors import APIError
from app.models.user import User
from app.audit.logger import record_audit_event
from app.schemas.admin import (
    AuditLogResponse,
    SecurityEventResponse,
    UserCreateRequest,
    UserResponse,
    UserRoleUpdateRequest,
    UserUpdateRequest,
)
from app.services.audit_service import AuditService

router = APIRouter(prefix="/admin", tags=["Admin & Audit"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Lists system users, active roles, and account status from PostgreSQL. Requires Admin role.
    """
    service = AuditService(db=db)
    return [UserResponse(**u) for u in service.list_users()]


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Provisions a new system user account into PostgreSQL. Requires Admin role.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise APIError(
            status_code=status.HTTP_409_CONFLICT,
            code="USER_ALREADY_EXISTS",
            message=f"User with email '{payload.email}' already exists.",
        )

    new_user = User(
        clerk_id=payload.clerk_id,
        name=payload.name,
        email=payload.email,
        role=payload.role,
        status="active",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    record_audit_event(
        db,
        user_id=user.user_id,
        action="USER_PROVISIONED",
        resource_type="user",
        resource_id=new_user.id,
        details={"name": new_user.name, "email": new_user.email, "role": new_user.role},
    )

    return UserResponse(
        id=new_user.id,
        clerk_id=new_user.clerk_id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        status=new_user.status,
        created_at=new_user.created_at,
    )


@router.patch("/users/{id}", response_model=UserResponse)
async def update_user(
    id: str,
    payload: UserUpdateRequest,
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Updates user details or status in PostgreSQL. Requires Admin role.
    """
    target_user = db.query(User).filter((User.id == id) | (User.clerk_id == id)).first()
    if not target_user:
        raise APIError(
            status_code=status.HTTP_404_NOT_FOUND,
            code="USER_NOT_FOUND",
            message=f"User '{id}' was not found.",
        )

    if payload.name:
        target_user.name = payload.name
    if payload.email:
        target_user.email = payload.email
    if payload.status:
        target_user.status = payload.status

    db.commit()
    db.refresh(target_user)

    return UserResponse(
        id=target_user.id,
        clerk_id=target_user.clerk_id,
        name=target_user.name,
        email=target_user.email,
        role=target_user.role,
        status=target_user.status,
        created_at=target_user.created_at,
    )


@router.patch("/users/{id}/roles", response_model=UserResponse)
async def update_user_role(
    id: str,
    payload: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("manage_roles")),
):
    """
    Updates user access control role (analyst, reviewer, admin). Requires Admin role.
    """
    target_user = db.query(User).filter((User.id == id) | (User.clerk_id == id)).first()
    if not target_user:
        raise APIError(
            status_code=status.HTTP_404_NOT_FOUND,
            code="USER_NOT_FOUND",
            message=f"User '{id}' was not found.",
        )

    prev_role = target_user.role
    target_user.role = payload.role
    db.commit()
    db.refresh(target_user)

    record_audit_event(
        db,
        user_id=user.user_id,
        action="USER_ROLE_UPDATED",
        resource_type="user",
        resource_id=target_user.id,
        details={"previous_role": prev_role, "new_role": payload.role},
    )

    return UserResponse(
        id=target_user.id,
        clerk_id=target_user.clerk_id,
        name=target_user.name,
        email=target_user.email,
        role=target_user.role,
        status=target_user.status,
        created_at=target_user.created_at,
    )


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("system_audit")),
):
    """
    Retrieves system audit logs (LOGIN, UPLOAD, SESSION_CREATED, TRANSFORMATION_STARTED, ARTIFACT_APPROVED, etc.)
    from PostgreSQL. Requires Admin role.
    """
    service = AuditService(db=db)
    return [AuditLogResponse(**log) for log in service.get_audit_logs(limit=limit)]


@router.get("/security-events", response_model=list[SecurityEventResponse])
async def get_security_events(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: ClerkUserPayload = Depends(require_permission("system_audit")),
):
    """
    Retrieves security log events (PROMPT_INJECTION_DETECTED, UNAUTHORIZED_ACCESS, RATE_LIMIT_EXCEEDED, etc.)
    from PostgreSQL. Requires Admin role.
    """
    service = AuditService(db=db)
    return [SecurityEventResponse(**ev) for ev in service.get_security_events(limit=limit)]
