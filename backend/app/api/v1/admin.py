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
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_role
from app.core.errors import APIError
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
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Lists system users, active roles, and account status. Requires Admin role.
    """
    service = AuditService()
    return [UserResponse(**u) for u in service.list_users()]


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateRequest,
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Provisions a new system user account. Requires Admin role.
    """
    return UserResponse(
        id=f"USR-{payload.email.split('@')[0]}",
        clerk_id=payload.clerk_id or f"user_clerk_{payload.email.split('@')[0]}",
        name=payload.name,
        email=payload.email,
        role=payload.role,
        status="active",
    )


@router.patch("/users/{id}", response_model=UserResponse)
async def update_user(
    id: str,
    payload: UserUpdateRequest,
    user: ClerkUserPayload = Depends(require_permission("manage_users")),
):
    """
    Updates user details or status. Requires Admin role.
    """
    return UserResponse(
        id=id,
        name=payload.name or "Updated User",
        email=payload.email or f"{id}@contentforge.ai",
        role="analyst",
        status=payload.status or "active",
    )


@router.patch("/users/{id}/roles", response_model=UserResponse)
async def update_user_role(
    id: str,
    payload: UserRoleUpdateRequest,
    user: ClerkUserPayload = Depends(require_permission("manage_roles")),
):
    """
    Updates user access control role (analyst, reviewer, admin). Requires Admin role.
    """
    return UserResponse(
        id=id,
        name="User Profile",
        email=f"{id}@contentforge.ai",
        role=payload.role,
        status="active",
    )


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    user: ClerkUserPayload = Depends(require_permission("system_audit")),
):
    """
    Retrieves system audit logs (LOGIN, UPLOAD, SESSION_CREATED, TRANSFORMATION_STARTED, ARTIFACT_APPROVED, etc.).
    Requires Admin role.
    """
    service = AuditService()
    return [AuditLogResponse(**log) for log in service.get_audit_logs(limit=limit)]


@router.get("/security-events", response_model=list[SecurityEventResponse])
async def get_security_events(
    limit: int = Query(50, ge=1, le=500),
    user: ClerkUserPayload = Depends(require_permission("system_audit")),
):
    """
    Retrieves security log events (PROMPT_INJECTION_DETECTED, UNAUTHORIZED_ACCESS, RATE_LIMIT_EXCEEDED, etc.).
    Requires Admin role.
    """
    service = AuditService()
    return [SecurityEventResponse(**ev) for ev in service.get_security_events(limit=limit)]
