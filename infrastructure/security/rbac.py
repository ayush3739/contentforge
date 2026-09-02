"""
RBAC roles, permission matrix, and a reusable authorization-check helper.

Owner: P5. See docs/RBAC.md for the contract this encodes.

P5 does NOT implement authentication (login, tokens, user storage) — that is
P3's ownership. This module only provides the *data* (roles, permissions)
and a thin *enforcement primitive* that P3 wires into its own FastAPI
dependency system once it has a real "current user" resolver.

Usage sketch (in P3's backend, illustrative only — P5 does not own this call site):

    from infrastructure.security.rbac import require_permission

    @router.post("/artifacts/{artifact_id}/finalize")
    def finalize(artifact_id: str, user=Depends(get_current_user)):
        require_permission(user.role, "approve_artifact")
        ...
"""
from __future__ import annotations

from enum import Enum


class Role(str, Enum):
    ANALYST = "analyst"
    REVIEWER = "reviewer"
    ADMIN = "admin"


# Exact permission strings, one row per docs/RBAC.md table.
PERMISSIONS: dict[str, tuple[Role, ...]] = {
    "create_session": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "upload_source": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "run_transformation": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "view_cco_evidence": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "view_artifacts": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "submit_for_review": (Role.ANALYST, Role.REVIEWER, Role.ADMIN),
    "inspect_verification": (Role.REVIEWER, Role.ADMIN),
    "approve_artifact": (Role.REVIEWER, Role.ADMIN),
    "reject_artifact": (Role.REVIEWER, Role.ADMIN),
    "request_revision": (Role.REVIEWER, Role.ADMIN),
    "compare_versions": (Role.REVIEWER, Role.ADMIN),
    "manage_users": (Role.ADMIN,),
    "assign_roles": (Role.ADMIN,),
    "manage_templates": (Role.ADMIN,),
    "inspect_audit_logs": (Role.ADMIN,),
    "inspect_security_events": (Role.ADMIN,),
    "manage_system_config": (Role.ADMIN,),
}


class AuthorizationError(PermissionError):
    """Raised when a role lacks a required permission. P3 should map this to HTTP 403."""


def has_permission(role: str | Role, permission: str) -> bool:
    role_enum = Role(role) if not isinstance(role, Role) else role
    allowed = PERMISSIONS.get(permission)
    if allowed is None:
        raise KeyError(f"Unknown permission: {permission!r}")
    return role_enum in allowed


def require_permission(role: str | Role, permission: str) -> None:
    """Raise AuthorizationError if `role` does not have `permission`. Server-side check only."""
    if not has_permission(role, permission):
        raise AuthorizationError(f"Role {role!r} lacks permission {permission!r}")


def require_role(role: str | Role, minimum: Role) -> None:
    """Hierarchical shortcut: analyst < reviewer < admin."""
    order = [Role.ANALYST, Role.REVIEWER, Role.ADMIN]
    role_enum = Role(role) if not isinstance(role, Role) else role
    if order.index(role_enum) < order.index(minimum):
        raise AuthorizationError(f"Role {role!r} does not meet minimum {minimum!r}")
