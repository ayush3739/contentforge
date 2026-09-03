import io
import re
from typing import Any, Optional
import pypdf


def parse_text(content_str: str) -> list[dict[str, Any]]:
    """
    Parses plain text / markdown into layout blocks.
    Identifies headings, lists, tables, and paragraphs.
    """
    lines = content_str.splitlines()
    blocks: list[dict[str, Any]] = []
    current_paragraph: list[str] = []
    current_section: str = "Introduction"
    position = 0

    def flush_paragraph():
        nonlocal position
        if current_paragraph:
            text = " ".join(current_paragraph).strip()
            if text:
                blocks.append({
                    "block_type": "paragraph",
                    "text": text,
                    "section": current_section,
                    "page": 1,
                    "position": position,
                    "metadata": {}
                })
                position += 1
            current_paragraph.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            flush_paragraph()
            continue

        # Heading detection (# Heading or ALL CAPS short lines)
        if stripped.startswith("#"):
            flush_paragraph()
            current_section = stripped.lstrip("#").strip()
            blocks.append({
                "block_type": "heading",
                "text": current_section,
                "section": current_section,
                "page": 1,
                "position": position,
                "metadata": {"level": len(stripped) - len(stripped.lstrip("#"))}
            })
            position += 1
        elif (stripped.isupper() and len(stripped) < 60) or stripped.endswith(":"):
            flush_paragraph()
            current_section = stripped.rstrip(":")
            blocks.append({
                "block_type": "heading",
                "text": stripped,
                "section": current_section,
                "page": 1,
                "position": position,
                "metadata": {"style": "caps_heading"}
            })
            position += 1
        else:
            current_paragraph.append(stripped)

    flush_paragraph()
    return blocks


def parse_pdf(pdf_bytes: bytes) -> list[dict[str, Any]]:
    """
    Parses PDF bytes into structured layout blocks with page numbers.
    """
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    blocks: list[dict[str, Any]] = []
    position = 0
    current_section = "Document Body"

    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        lines = text.splitlines()
        current_paragraph: list[str] = []

        def flush_page_paragraph():
            nonlocal position
            if current_paragraph:
                p_text = " ".join(current_paragraph).strip()
                if p_text:
                    blocks.append({
                        "block_type": "paragraph",
                        "text": p_text,
                        "section": current_section,
                        "page": page_num,
                        "position": position,
                        "metadata": {"page": page_num}
                    })
                    position += 1
                current_paragraph.clear()

        for line in lines:
            stripped = line.strip()
            if not stripped:
                flush_page_paragraph()
                continue

            if stripped.startswith("#") or (len(stripped) < 60 and stripped.isupper()):
                flush_page_paragraph()
                current_section = stripped.lstrip("#").strip()
                blocks.append({
                    "block_type": "heading",
                    "text": current_section,
                    "section": current_section,
                    "page": page_num,
                    "position": position,
                    "metadata": {"page": page_num}
                })
                position += 1
            else:
                current_paragraph.append(stripped)

        flush_page_paragraph()

    return blocks


def parse_docx(content_bytes: bytes) -> list[dict[str, Any]]:
    """
    Parses Microsoft Word (.docx) documents into structured layout blocks.
    Extracts paragraphs, headings, and table rows.
    """
    import io
    from docx import Document
    file_stream = io.BytesIO(content_bytes)
    doc = Document(file_stream)
    blocks: list[dict[str, Any]] = []
    current_section = "Introduction"
    position = 0

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue
        if p.style.name.startswith("Heading"):
            current_section = text
            blocks.append({
                "block_type": "heading",
                "text": text,
                "section": current_section,
                "page": 1,
                "position": position,
                "metadata": {"style": p.style.name}
            })
        else:
            blocks.append({
                "block_type": "paragraph",
                "text": text,
                "section": current_section,
                "page": 1,
                "position": position,
                "metadata": {}
            })
        position += 1

    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                blocks.append({
                    "block_type": "table",
                    "text": row_text,
                    "section": current_section,
                    "page": 1,
                    "position": position,
                    "metadata": {}
                })
                position += 1

    return blocks


def parse_document(content: bytes | str, filename: str = "", mime_type: str = "text/plain") -> list[dict[str, Any]]:
    """
    Main ingestion parser dispatcher supporting PDF, DOCX, TXT, MD.
    """
    if isinstance(content, str):
        return parse_text(content)

    if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
        return parse_pdf(content)
    elif "word" in mime_type or filename.lower().endswith(".docx"):
        return parse_docx(content)
    else:
        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            text_content = content.decode("latin-1")
        return parse_text(text_content)

