from infrastructure.provenance.hashing import (
    build_provenance_payload,
    canonical_json,
    hash_bytes,
    hash_provenance_payload,
)


def test_hash_is_deterministic():
    data = b"hello contentforge"
    assert hash_bytes(data) == hash_bytes(data)


def test_different_content_produces_different_hash():
    assert hash_bytes(b"artifact version 1") != hash_bytes(b"artifact version 2")


def test_canonical_json_is_order_independent():
    payload_a = {"b": 2, "a": 1}
    payload_b = {"a": 1, "b": 2}
    assert canonical_json(payload_a) == canonical_json(payload_b)


def test_provenance_payload_hash_deterministic_and_sensitive():
    payload1 = build_provenance_payload(
        cco_version=1,
        transformation_parameters={"tone": "formal"},
        artifact_hash=hash_bytes(b"artifact-bytes-v1"),
        verification_result={"status": "PASSED", "grounding_score": 0.9},
    )
    payload2 = build_provenance_payload(
        cco_version=1,
        transformation_parameters={"tone": "formal"},
        artifact_hash=hash_bytes(b"artifact-bytes-v1"),
        verification_result={"status": "PASSED", "grounding_score": 0.9},
    )
    assert hash_provenance_payload(payload1) == hash_provenance_payload(payload2)

    payload3 = build_provenance_payload(
        cco_version=2,  # different CCO version
        transformation_parameters={"tone": "formal"},
        artifact_hash=hash_bytes(b"artifact-bytes-v1"),
        verification_result={"status": "PASSED", "grounding_score": 0.9},
    )
    assert hash_provenance_payload(payload1) != hash_provenance_payload(payload3)
