"""
Audit event type constants + payload validation.

Owner: P5. See docs/AUDIT_EVENTS.md for the contract.

P5 does not own the `audit_logs` table (P3 does, per Doc 00 §6 database
ownership). This module exists so P3's insert code — wherever it lives —
uses the same event-type strings and required fields every time, instead of
each call site inventing its own shape.

If P3 hasn't wired a real persistence layer yet, `record_event()` falls back
to emitting structured JSON via infrastructure/logging/, so audit events are
never silently lost during early development.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable


class AuditEventType(str, Enum):
    LOGIN = "LOGIN"
    LOGIN_FAILED = "LOGIN_FAILED"
    FILE_UPLOADED = "FILE_UPLOADED"
    FILE_DELETED = "FILE_DELETED"
    CCO_CREATED = "CCO_CREATED"
    CCO_VERSION_CREATED = "CCO_VERSION_CREATED"
    TRANSFORMATION_STARTED = "TRANSFORMATION_STARTED"
    TRANSFORMATION_COMPLETED = "TRANSFORMATION_COMPLETED"
    ARTIFACT_CREATED = "ARTIFACT_CREATED"
    ARTIFACT_APPROVED = "ARTIFACT_APPROVED"
    ARTIFACT_REJECTED = "ARTIFACT_REJECTED"
    ARTIFACT_REVISED = "ARTIFACT_REVISED"
    USER_CREATED = "USER_CREATED"
    ROLE_CHANGED = "ROLE_CHANGED"
    CONFIG_CHANGED = "CONFIG_CHANGED"
    PROVENANCE_ANCHORED = "PROVENANCE_ANCHORED"


REQUIRED_FIELDS = (
    "actor_id",
    "actor_role",
    "event_type",
    "resource_type",
    "resource_id",
    "result",
)


class InvalidAuditEventError(ValueError):
    pass


@dataclass(frozen=True)
class AuditEvent:
    actor_id: str
    actor_role: str
    event_type: AuditEventType
    resource_type: str
    resource_id: str
    result: str  # "SUCCESS" | "FAILURE"
    request_id: str | None = None
    ip: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self) -> None:
        if self.result not in ("SUCCESS", "FAILURE"):
            raise InvalidAuditEventError(f"result must be SUCCESS or FAILURE, got {self.result!r}")
        if not self.actor_id or not self.actor_role or not self.resource_type or not self.resource_id:
            raise InvalidAuditEventError("actor_id, actor_role, resource_type, resource_id are required")

    def to_dict(self) -> dict[str, Any]:
        d = {
            "actor_id": self.actor_id,
            "actor_role": self.actor_role,
            "event_type": self.event_type.value if isinstance(self.event_type, AuditEventType) else self.event_type,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "result": self.result,
            "request_id": self.request_id,
            "ip": self.ip,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        }
        return d


# Pluggable sink so P3 can swap in a real DB writer once audit_logs exists.
Sink = Callable[[dict[str, Any]], None]


def _stdout_sink(payload: dict[str, Any]) -> None:
    import json

    print(json.dumps({"log_type": "audit", **payload}), file=sys.stdout, flush=True)


_sink: Sink = _stdout_sink


def set_sink(sink: Sink) -> None:
    """Call once at app startup to point audit events at a real DB writer."""
    global _sink
    _sink = sink


def record_event(event: AuditEvent) -> None:
    _sink(event.to_dict())
