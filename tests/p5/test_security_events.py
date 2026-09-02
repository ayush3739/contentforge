import pytest

from infrastructure.security.events import (
    InvalidSecurityEventError,
    SecurityEvent,
    SecurityEventType,
    Severity,
    record_event,
    set_sink,
)


def test_valid_event_builds_and_serializes():
    event = SecurityEvent(
        event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
        resource_type="route_group",
        resource_id="login",
    )
    payload = event.to_dict()
    assert payload["event_type"] == "RATE_LIMIT_EXCEEDED"
    assert payload["severity"] == Severity.LOW.value  # default severity for this type
    assert "timestamp" in payload


def test_missing_resource_type_rejected():
    with pytest.raises(InvalidSecurityEventError):
        SecurityEvent(event_type=SecurityEventType.INVALID_TOKEN, resource_type="", resource_id="x")


def test_missing_resource_id_rejected():
    with pytest.raises(InvalidSecurityEventError):
        SecurityEvent(event_type=SecurityEventType.INVALID_TOKEN, resource_type="token", resource_id="")


def test_explicit_severity_overrides_default():
    event = SecurityEvent(
        event_type=SecurityEventType.SUSPICIOUS_REQUEST,
        resource_type="request",
        resource_id="req-1",
        severity=Severity.CRITICAL,
    )
    assert event.effective_severity() == Severity.CRITICAL


def test_record_event_uses_configured_sink():
    captured = []
    set_sink(captured.append)
    try:
        record_event(
            SecurityEvent(
                event_type=SecurityEventType.HASH_MISMATCH,
                resource_type="artifact",
                resource_id="artifact-9",
            )
        )
        assert len(captured) == 1
        assert captured[0]["event_type"] == "HASH_MISMATCH"
    finally:
        from infrastructure.security.events import _stdout_sink

        set_sink(_stdout_sink)  # restore default so other tests aren't affected
