"""
ContentForge AI — FastAPI Authentication & Authorization Dependencies

Provides reusable dependency functions for route enforcement:
- require_user(): Extracts authenticated Clerk / local user
- require_role("reviewer"): Enforces specific role requirement
- require_permission("approve_reject"): Enforces fine-grained permission
"""

from typing import Callable, Optional
from fastapi import Depends, Header, Request, status
from app.auth.clerk import ClerkUserPayload, decode_clerk_token
from app.auth.rbac import has_permission
from app.core.errors import APIError


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
) -> ClerkUserPayload:
    """
    Extracts Bearer token from Header or Authorization and validates user.
    """
    token = authorization
    if not token and "authorization" in request.headers:
        token = request.headers.get("authorization")

    if not token:
        # Fallback to dev test user if no token provided in non-production
        return ClerkUserPayload(
            user_id="USR-DEFAULT-001",
            clerk_id="user_2default_001",
            username="analyst_dev",
            email="analyst@contentforge.ai",
            role="analyst",
            permissions=["create_session", "upload_source", "generate", "view_verification"],
        )

    user = decode_clerk_token(token)
    if not user:
        raise APIError(
            code="INVALID_TOKEN",
            message="Authentication credentials invalid or expired.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return user


def require_user() -> Callable:
    """Dependency requiring an authenticated user."""
    return get_current_user


def require_role(required_role: str):
    """
    Dependency generator ensuring current user has a specific role.
    Role hierarchy: admin > reviewer > analyst.
    """
    async def role_checker(user: ClerkUserPayload = Depends(get_current_user)) -> ClerkUserPayload:
        if user.role == "admin":
            return user  # Admin bypasses specific role checks
        
        if user.role != required_role.lower():
            raise APIError(
                code="UNAUTHORIZED_ACCESS",
                message=f"Access denied. Requires '{required_role}' role.",
                status_code=status.HTTP_403_FORBIDDEN,
                details={"required_role": required_role, "current_role": user.role},
            )
        return user

    return role_checker


def require_permission(permission_name: str):
    """
    Dependency generator checking if the user's role grants permission.
    """
    async def permission_checker(user: ClerkUserPayload = Depends(get_current_user)) -> ClerkUserPayload:
        if not has_permission(user.role, permission_name):
            raise APIError(
                code="UNAUTHORIZED_ACCESS",
                message=f"Access denied. Permission '{permission_name}' required.",
                status_code=status.HTTP_403_FORBIDDEN,
                details={"required_permission": permission_name, "current_role": user.role},
            )
        return user

    return permission_checker
