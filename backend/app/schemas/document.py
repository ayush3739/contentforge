"""
ContentForge AI — Document Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field
from app.schemas.enums import DocumentStatus


class DocumentResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    name: str
    mime_type: str
    version: int = 1
    checksum: Optional[str] = None
    storage_key: Optional[str] = None
    status: DocumentStatus = DocumentStatus.UPLOADED
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None


class DocumentVersionResponse(BaseModel):
    id: str
    document_id: str
    version: int
    checksum: Optional[str] = None
    storage_key: Optional[str] = None
    created_at: Optional[datetime] = None


class DocumentCCOResponse(BaseModel):
    document_id: str
    cco_version_id: str
    version: int
    hash: str
    source_block_count: int = 0
    claim_count: int = 0
    cco_json: dict[str, Any] = {}


class DocumentEvidenceResponse(BaseModel):
    document_id: str
    chunk_count: int = 0
    chunks: list[dict[str, Any]] = []
    source_blocks: list[dict[str, Any]] = []
