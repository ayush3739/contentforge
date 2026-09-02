# RBAC Contract (P5 → P3)

> P5 defines and provides reusable roles/permission types. **P3 owns the actual FastAPI authentication/authorization implementation.** P5 does not implement a competing auth system.

## 1. Roles

```
analyst
reviewer
admin
```

These three, exactly as named in `documents/00_TEAM_INTEGRATION_CONTRACT.md` §12 and `documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md` §5. Roles are additive/hierarchical: reviewer ⊇ analyst, admin ⊇ reviewer.

## 2. Permission matrix

| Permission | analyst | reviewer | admin |
|---|---|---|---|
| create session | ✅ | ✅ | ✅ |
| upload source | ✅ | ✅ | ✅ |
| run transformation | ✅ | ✅ | ✅ |
| view CCO / evidence | ✅ | ✅ | ✅ |
| view artifacts | ✅ | ✅ | ✅ |
| submit artifact for review | ✅ | ✅ | ✅ |
| inspect verification / evidence detail | ❌ | ✅ | ✅ |
| approve artifact | ❌ | ✅ | ✅ |
| reject artifact | ❌ | ✅ | ✅ |
| request revision | ❌ | ✅ | ✅ |
| compare artifact versions | ❌ | ✅ | ✅ |
| manage users | ❌ | ❌ | ✅ |
| assign roles | ❌ | ❌ | ✅ |
| manage templates | ❌ | ❌ | ✅ |
| inspect audit logs | ❌ | ❌ | ✅ |
| inspect security events | ❌ | ❌ | ✅ |
| manage system/model config | ❌ | ❌ | ✅ |

This matrix is the literal union of Doc 00 §12 permissions, unmodified. `infrastructure/security/rbac.py` encodes it as data so it can't drift from this table, and `tests/p5/test_rbac.py` checks the two stay consistent.

## 3. Enforcement rule (non-negotiable, per Doc 00 principle #8)

> **RBAC must be enforced server-side. Hiding a frontend button is not security.**

P2 may hide UI affordances for UX, but every P3 endpoint must independently check the caller's role before performing the action. `infrastructure/security/rbac.py::require_role()` / `require_permission()` are provided as a ready-to-use FastAPI dependency for P3 to wire into routes — P5 provides the primitive, P3 wires it into actual endpoints.

## 4. What P5 does NOT do here

- Does not implement `/auth/login`, session/token issuance, or user storage (P3).
- Does not implement password hashing or OAuth flows (P3).
- Does provide: the role/permission constants, the FastAPI-dependency-shaped enforcement helper, and this contract doc, so P3 doesn't have to invent role names or permission strings independently.
