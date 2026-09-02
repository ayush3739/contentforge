"""
Lightweight structured (JSON-lines) logging with request-id propagation.

Owner: P5. See docs/HEALTHCHECKS.md and docs/SECURITY_BOUNDARIES.md for how
request_id ties into tracing. Not a logging platform — just a consistent
JSON shape any service (backend/worker/AI) can `print()` to stdout, which
Docker/any log collector picks up as-is.
"""
from __future__ import annotations

import json
import sys
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

_request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


def new_request_id() -> str:
    return str(uuid.uuid4())


def set_request_id(request_id: str | None = None) -> str:
    """Call at the top of a request/task; returns the id it set (generates one if not given)."""
    rid = request_id or new_request_id()
    _request_id_var.set(rid)
    return rid


def get_request_id() -> str | None:
    return _request_id_var.get()


def log(level: str, event: str, service: str, **fields: Any) -> None:
    """
    Emit one structured JSON log line, e.g.:
        log("INFO", "FILE_UPLOADED", service="backend", document_id=doc_id, size=n)
    """
    payload = {
        "request_id": get_request_id(),
        "service": service,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": level.upper(),
        "event": event,
        **fields,
    }
    print(json.dumps(payload), file=sys.stdout, flush=True)


def info(event: str, service: str, **fields: Any) -> None:
    log("INFO", event, service, **fields)


def warning(event: str, service: str, **fields: Any) -> None:
    log("WARNING", event, service, **fields)


def error(event: str, service: str, **fields: Any) -> None:
    log("ERROR", event, service, **fields)
