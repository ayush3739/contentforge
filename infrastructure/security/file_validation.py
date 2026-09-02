"""
Upload validation primitives: MIME sniffing, size limits, and a malware-scan
hook interface (not a real scanner — see docs/FILE_SECURITY.md).

Owner: P5. Wired into the actual upload endpoint by P3.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

# Minimal magic-byte sniffing so we don't require an extra dependency for a
# handful of expected source types. Extend as P1/P3 need more formats.
_SIGNATURES: dict[bytes, str] = {
    b"%PDF-": "application/pdf",
    b"PK\x03\x04": "application/zip",  # docx/pptx/xlsx are zip containers
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
}


class FileValidationError(ValueError):
    pass


def sniff_mime(data: bytes) -> str:
    """Best-effort content-type sniff from magic bytes. Returns 'application/octet-stream' if unknown."""
    for sig, mime in _SIGNATURES.items():
        if data.startswith(sig):
            return mime
    if data[:5].lstrip().startswith(b"<"):
        return "text/plain"  # crude XML/HTML/plain-text fallback
    return "application/octet-stream"


def validate_mime(data: bytes, allowed: set[str]) -> str:
    mime = sniff_mime(data)
    if mime not in allowed:
        raise FileValidationError(f"Rejected upload: sniffed MIME {mime!r} not in allowed set {allowed!r}")
    return mime


def validate_size(size_bytes: int, max_mb: int = 50) -> None:
    max_bytes = max_mb * 1024 * 1024
    if size_bytes <= 0:
        raise FileValidationError("Rejected upload: empty file")
    if size_bytes > max_bytes:
        raise FileValidationError(f"Rejected upload: {size_bytes} bytes exceeds {max_mb}MB limit")


@dataclass(frozen=True)
class ScanResult:
    scanned: bool
    clean: bool
    engine: str = "none"
    detail: str = "Malware scanning not configured for hackathon build — see docs/FILE_SECURITY.md"


def _no_op_scan(data: bytes) -> ScanResult:
    return ScanResult(scanned=False, clean=True)


# Swap this for a real scanner (ClamAV daemon call, cloud API, etc.) later —
# call sites should only ever call `MALWARE_SCAN_HOOK(data)`, never assume
# which implementation is behind it.
MALWARE_SCAN_HOOK: Callable[[bytes], ScanResult] = _no_op_scan
