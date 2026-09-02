import pytest

from infrastructure.storage.keys import (
    InvalidStorageKeyError,
    artifact_key,
    preview_key,
    source_key,
    temporary_key,
    validate_key,
    new_id,
)


def test_source_key_shape():
    doc_id = new_id()
    key = source_key(doc_id, 1, "report.pdf")
    assert key == f"sources/{doc_id}/1/source.pdf"


def test_artifact_key_shape():
    art_id = new_id()
    key = artifact_key(art_id, 2, "executive_summary", "pptx")
    assert key == f"artifacts/{art_id}/2/artifact.pptx"


def test_preview_key_shape():
    art_id = new_id()
    key = preview_key(art_id, 1)
    assert key == f"artifacts/{art_id}/1/preview.pdf"


def test_temporary_key_uses_server_generated_uuid():
    session_id = new_id()
    key = temporary_key(session_id, "whatever-the-user-named-it.docx")
    assert key.startswith(f"temporary/{session_id}/")
    assert key.endswith(".docx")


@pytest.mark.parametrize(
    "malicious_filename_key",
    [
        "sources/../../etc/passwd/1/source.pdf",
        "/absolute/path/1/source.pdf",
        "sources/doc/1/../../../source.pdf",
        "sources\\doc\\1\\source.pdf",
        "sources/doc id with spaces/1/source.pdf",
    ],
)
def test_validate_key_rejects_path_traversal_and_unsafe_segments(malicious_filename_key):
    with pytest.raises(InvalidStorageKeyError):
        validate_key(malicious_filename_key)


def test_validate_key_accepts_well_formed_key():
    doc_id = new_id()
    key = f"sources/{doc_id}/1/source.pdf"
    assert validate_key(key) == key


def test_generated_keys_never_embed_raw_user_filename_as_a_path_segment():
    """The user's filename must never become the storage_key itself — only its extension."""
    doc_id = new_id()
    key = source_key(doc_id, 1, "../../malicious/name.pdf")
    assert ".." not in key
    assert "malicious" not in key
