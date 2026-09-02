import pytest

from infrastructure.audit.events import (
    AuditEvent,
    AuditEventType,
    InvalidAuditEventError,
    record_event,
    set_sink,
)


def test_valid_event_builds_and_serializes():
    event = AuditEvent(
        actor_id="user-1",
        actor_role="analyst",
        event_type=AuditEventType.LOGIN,
        resource_type="user",
        resource_id="user-1",
        result="SUCCESS",
    )
    payload = event.to_dict()
    assert payload["event_type"] == "LOGIN"
    assert payload["result"] == "SUCCESS"
    assert "timestamp" in payload


def test_invalid_result_rejected():
    with pytest.raises(InvalidAuditEventError):
        AuditEvent(
            actor_id="user-1",
            actor_role="analyst",
            event_type=AuditEventType.LOGIN_FAILED,
            resource_type="user",
            resource_id="user-1",
            result="MAYBE",  # only SUCCESS/FAILURE allowed
        )


def test_missing_actor_rejected():
    with pytest.raises(InvalidAuditEventError):
        AuditEvent(
            actor_id="",
            actor_role="analyst",
            event_type=AuditEventType.LOGIN,
            resource_type="user",
            resource_id="user-1",
            result="SUCCESS",
        )


def test_record_event_uses_configured_sink():
    captured = []
    set_sink(captured.append)
    try:
        record_event(
            AuditEvent(
                actor_id="user-2",
                actor_role="admin",
                event_type=AuditEventType.ROLE_CHANGED,
                resource_type="user",
                resource_id="user-3",
                result="SUCCESS",
            )
        )
        assert len(captured) == 1
        assert captured[0]["event_type"] == "ROLE_CHANGED"
    finally:
        from infrastructure.audit.events import _stdout_sink

        set_sink(_stdout_sink)
