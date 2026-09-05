"""
ContentForge AI — Role-Based Access Control (RBAC) Matrix

Adheres to Section 6 of Specification:
- Roles: analyst, reviewer, admin
- Operations permission matrix enforcement
"""

from typing import Set

# Roles definition
ROLE_ANALYST = "analyst"
ROLE_REVIEWER = "reviewer"
ROLE_ADMIN = "admin"

ALL_ROLES = {ROLE_ANALYST, ROLE_ADMIN}  # ROLE_REVIEWER is deprecated

# Operations / Permissions
PERM_CREATE_SESSION = "create_session"
PERM_UPLOAD_SOURCE = "upload_source"
PERM_GENERATE = "generate"
PERM_VIEW_VERIFICATION = "view_verification"
PERM_DOWNLOAD = "download"
# PERM_APPROVE_REJECT removed as part of automated verification MVP
PERM_MANAGE_USERS = "manage_users"
PERM_MANAGE_ROLES = "manage_roles"
PERM_SYSTEM_AUDIT = "system_audit"
PERM_SYSTEM_CONFIG = "system_config"

# Permission Matrix Mapping
PERMISSION_MATRIX: dict[str, Set[str]] = {
    PERM_CREATE_SESSION: {ROLE_ANALYST, ROLE_ADMIN},
    PERM_UPLOAD_SOURCE: {ROLE_ANALYST, ROLE_ADMIN},
    PERM_GENERATE: {ROLE_ANALYST, ROLE_ADMIN},
    PERM_VIEW_VERIFICATION: {ROLE_ANALYST, ROLE_ADMIN},
    PERM_DOWNLOAD: {ROLE_ANALYST, ROLE_ADMIN},
    PERM_MANAGE_USERS: {ROLE_ADMIN},
    PERM_MANAGE_ROLES: {ROLE_ADMIN},
    PERM_SYSTEM_AUDIT: {ROLE_ADMIN},
    PERM_SYSTEM_CONFIG: {ROLE_ADMIN},
}


def has_permission(user_role: str, permission: str) -> bool:
    """
    Check if a user with a given role has the requested permission.
    """
    allowed_roles = PERMISSION_MATRIX.get(permission, set())
    return user_role.lower() in allowed_roles


def get_role_permissions(user_role: str) -> list[str]:
    """
    Returns list of permissions granted to a specific role.
    """
    role = user_role.lower()
    return [perm for perm, allowed_roles in PERMISSION_MATRIX.items() if role in allowed_roles]
