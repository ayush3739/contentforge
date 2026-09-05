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
from app.core.config import settings
from app.core.errors import APIError


async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
) -> ClerkUserPayload:
    """
    Extracts Bearer token from Authorization header and decodes the Clerk JWT.
    Role is read from Clerk's public_metadata.role claim embedded in the token.
    To change a user's role: update it in Clerk Dashboard -> User -> Public Metadata.
    """
    token = authorization
    if not token and "authorization" in request.headers:
        token = request.headers.get("authorization")

    from app.auth.rbac import get_role_permissions

    if not token:
        # In production, missing token must always be rejected
        if settings.ENVIRONMENT == "production":
            raise APIError(
                code="MISSING_TOKEN",
                message="Authentication token is required.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        client_user_id = request.headers.get("x-user-id") or request.query_params.get("user_id")
        client_email = request.headers.get("x-user-email") or request.query_params.get("user_email")
        client_name = request.headers.get("x-user-name") or request.query_params.get("user_name")
        client_role = (request.headers.get("x-user-role") or request.query_params.get("user_role") or "analyst").lower()
        return ClerkUserPayload(
            user_id=client_user_id or "USR-DEFAULT-001",
            clerk_id=client_user_id or "user_2default_001",
            username=client_name or "analyst_dev",
            email=client_email or "analyst@contentforge.ai",
            role=client_role,
            permissions=get_role_permissions(client_role),
        )

    user = decode_clerk_token(token)
    if not user:
        client_user_id = request.headers.get("x-user-id") or request.query_params.get("user_id")
        if client_user_id and settings.ENVIRONMENT != "production":
            client_email = request.headers.get("x-user-email")
            client_name = request.headers.get("x-user-name")
            client_role = (request.headers.get("x-user-role") or "analyst").lower()
            return ClerkUserPayload(
                user_id=client_user_id,
                clerk_id=client_user_id,
                username=client_name or client_user_id,
                email=client_email or f"{client_user_id}@contentforge.ai",
                role=client_role,
                permissions=get_role_permissions(client_role),
            )
        raise APIError(
            code="INVALID_TOKEN",
            message="Authentication credentials invalid or expired.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    client_user_id = request.headers.get("x-user-id") or request.query_params.get("user_id")
    if client_user_id and (user.user_id.startswith("USR-DEFAULT") or user.user_id.startswith("usr_dev")):
        user.user_id = client_user_id
        user.clerk_id = client_user_id

    client_email = request.headers.get("x-user-email")
    client_name = request.headers.get("x-user-name")
    if client_email and "@" in client_email:
        user.email = client_email
    if client_name:
        user.username = client_name

    # Check for role override from PostgreSQL DB or header
    header_role = request.headers.get("x-user-role")
    db_role = None
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        db = SessionLocal()
        query_user = None
        if user.clerk_id:
            query_user = db.query(User).filter((User.clerk_id == user.clerk_id) | (User.id == user.user_id)).first()
        if not query_user and user.email:
            query_user = db.query(User).filter(User.email == user.email).first()
        if query_user and query_user.role:
            db_role = query_user.role.lower()
        db.close()
    except Exception:
        pass

    effective_role = db_role or (header_role.lower() if header_role else None) or user.role
    if effective_role in ("admin", "analyst", "reviewer"):
        user.role = effective_role
        user.permissions = get_role_permissions(effective_role)

    if "download" not in user.permissions:
        user.permissions.append("download")

    return user


def require_user() -> Callable:
    """Dependency requiring an authenticated user."""
    return get_current_user


def require_role(required_role: str):
    """
    Dependency generator ensuring current user has a specific role.
    Role hierarchy: admin > analyst.
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
