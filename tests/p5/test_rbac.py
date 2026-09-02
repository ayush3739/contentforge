import pytest

from infrastructure.security.rbac import (
    PERMISSIONS,
    AuthorizationError,
    Role,
    has_permission,
    require_permission,
    require_role,
)


def test_every_permission_lists_at_least_one_role():
    for permission, roles in PERMISSIONS.items():
        assert len(roles) > 0, f"{permission} has no allowed roles"


def test_hierarchy_is_respected_admin_superset_of_reviewer_superset_of_analyst():
    """
    Per docs/RBAC.md: reviewer permissions ⊇ analyst permissions,
    admin permissions ⊇ reviewer permissions. Any permission reviewer has,
    admin must also have. Any permission analyst has, reviewer must also have.
    """
    for permission, roles in PERMISSIONS.items():
        if Role.ANALYST in roles:
            assert Role.REVIEWER in roles, f"{permission}: analyst has it but reviewer doesn't"
        if Role.REVIEWER in roles:
            assert Role.ADMIN in roles, f"{permission}: reviewer has it but admin doesn't"


def test_admin_has_every_permission():
    for permission, roles in PERMISSIONS.items():
        assert Role.ADMIN in roles, f"admin is missing permission: {permission}"


def test_has_permission_matches_matrix():
    assert has_permission(Role.ANALYST, "create_session") is True
    assert has_permission(Role.ANALYST, "approve_artifact") is False
    assert has_permission(Role.REVIEWER, "approve_artifact") is True
    assert has_permission(Role.ADMIN, "manage_users") is True
    assert has_permission(Role.ANALYST, "manage_users") is False


def test_require_permission_raises_for_disallowed_role():
    with pytest.raises(AuthorizationError):
        require_permission(Role.ANALYST, "manage_users")


def test_require_permission_passes_for_allowed_role():
    require_permission(Role.ADMIN, "manage_users")  # should not raise


def test_require_role_hierarchy():
    require_role(Role.ADMIN, minimum=Role.REVIEWER)  # should not raise
    with pytest.raises(AuthorizationError):
        require_role(Role.ANALYST, minimum=Role.REVIEWER)


def test_unknown_permission_raises_keyerror():
    with pytest.raises(KeyError):
        has_permission(Role.ADMIN, "not_a_real_permission")
