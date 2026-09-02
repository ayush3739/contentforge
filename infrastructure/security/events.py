"""
Security event type constants + payload validation.

Owner: P5. See docs/SECURITY_EVENTS.md for the contract and ownership split.

P5 provides the event shape + a fallback stdout sink; P1 owns detection
logic (what counts as a prompt injection); P3 owns wiring this into actual
FastAPI middleware/handlers and the real security_events table.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable


class SecurityEventType(str, Enum):
    PROMPT_INJECTION_DETECTED = "PROMPT_INJECTION_DETECTED"
    MALICIOUS_FILE_DETECTED = "MALICIOUS_FILE_DETECTED"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
    INVALID_TOKEN = "INVALID_TOKEN"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    SUSPICIOUS_REQUEST = "SUSPICIOUS_REQUEST"
    OUTPUT_VALIDATION_FAILED = "OUTPUT_VALIDATION_FAILED"
    HASH_MISMATCH = "HASH_MISMATCH"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


_DEFAULT_SEVERITY = {
    SecurityEventType.PROMPT_INJECTION_DETECTED: Severity.HIGH,
    SecurityEventType.MALICIOUS_FILE_DETECTED: Severity.CRITICAL,
    SecurityEventType.UNAUTHORIZED_ACCESS: Severity.HIGH,
    SecurityEventType.INVALID_TOKEN: Severity.MEDIUM,
    SecurityEventType.RATE_LIMIT_EXCEEDED: Severity.LOW,
    SecurityEventType.SUSPICIOUS_REQUEST: Severity.MEDIUM,
    SecurityEventType.OUTPUT_VALIDATION_FAILED: Severity.MEDIUM,
    SecurityEventType.HASH_MISMATCH: Severity.CRITICAL,
}


class InvalidSecurityEventError(ValueError):
    pass


@dataclass(frozen=True)
class SecurityEvent:
    event_type: SecurityEventType
    resource_type: str
    resource_id: str
    actor_id: str | None = None
    severity: Severity | None = None
    request_id: str | None = None
    ip: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self) -> None:
        if not self.resource_type or not self.resource_id:
            raise InvalidSecurityEventError("resource_type and resource_id are required")

    def effective_severity(self) -> Severity:
        return self.severity or _DEFAULT_SEVERITY.get(self.event_type, Severity.MEDIUM)

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_type": self.event_type.value if isinstance(self.event_type, SecurityEventType) else self.event_type,
            "severity": self.effective_severity().value,
            "actor_id": self.actor_id,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "request_id": self.request_id,
            "ip": self.ip,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        }


Sink = Callable[[dict[str, Any]], None]


def _stdout_sink(payload: dict[str, Any]) -> None:
    import json

    print(json.dumps({"log_type": "security", **payload}), file=sys.stdout, flush=True)


_sink: Sink = _stdout_sink


def set_sink(sink: Sink) -> None:
    global _sink
    _sink = sink


def record_event(event: SecurityEvent) -> None:
    _sink(event.to_dict())
