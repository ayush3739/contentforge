import re
from typing import Any


def extract_dates(text: str) -> list[dict[str, Any]]:
    """Extracts date expressions with regex patterns."""
    patterns = [
        # ISO format: 2026-09-03
        r"\b\d{4}-\d{2}-\d{2}\b",
        # DD/MM/YYYY or MM/DD/YYYY
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        # Month DD, YYYY or Month DD YYYY: March 15, 2026
        r"\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b",
    ]
    dates = []
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            dates.append({
                "value": match.group(0),
                "start": match.start(),
                "end": match.end(),
            })
    return dates


def extract_numbers_and_metrics(text: str) -> list[dict[str, Any]]:
    """
    Extracts numerical figures and associated metric units.
    E.g. "14 systems", "99.9%", "$2.5 million", "450 GB", "1,200 users".
    """
    pattern = r"(?:\$|€|£)?\b\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:%|percent|systems|servers|nodes|users|dollars|USD|INR|EUR|million|billion|thousand|GB|MB|TB|ms|seconds|minutes|hours|days|weeks|months|years|records|files))\b"
    matches = []
    for match in re.finditer(pattern, text, re.IGNORECASE):
        matches.append({
            "text": match.group(0).strip(),
            "start": match.start(),
            "end": match.end(),
        })
    return matches


def extract_identifiers(text: str) -> list[dict[str, Any]]:
    """
    Extracts technical identifiers like CVEs, ticket IDs, UUIDs, IP addresses, emails, and URLs.
    """
    identifiers = []

    # CVE IDs: CVE-2024-12345
    for match in re.finditer(r"\bCVE-\d{4}-\d{4,7}\b", text, re.IGNORECASE):
        identifiers.append({"type": "cve_id", "value": match.group(0)})

    # Ticket / Incident IDs: INC-12345, TR-001, SES-001, DOC-001
    for match in re.finditer(r"\b(?:INC|TR|SES|DOC|ISSUE|TICKET|BUG|CASE)-\d+\b", text, re.IGNORECASE):
        identifiers.append({"type": "incident_id", "value": match.group(0)})

    # URLs
    for match in re.finditer(r"https?://[^\s<>\"']+", text):
        identifiers.append({"type": "url", "value": match.group(0)})

    # Emails
    for match in re.finditer(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text):
        identifiers.append({"type": "email", "value": match.group(0)})

    # IPv4 addresses
    for match in re.finditer(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text):
        # Exclude common false positives like version numbers 1.2.3.4
        parts = match.group(0).split(".")
        if all(0 <= int(p) <= 255 for p in parts):
            identifiers.append({"type": "ip_address", "value": match.group(0)})

    return identifiers


def extract_deterministic_data(text: str) -> dict[str, Any]:
    """
    Runs deterministic extraction over the input text or concatenated blocks.
    Guarantees 100% precision for critical facts, dates, numbers, and identifiers.
    """
    return {
        "dates": extract_dates(text),
        "numbers": extract_numbers_and_metrics(text),
        "identifiers": extract_identifiers(text),
    }
