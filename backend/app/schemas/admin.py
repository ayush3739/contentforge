"""
ContentForge AI — Admin & User Management Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreateRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = Field("analyst", description="analyst, reviewer, admin")
    password: Optional[str] = None
    clerk_id: Optional[str] = None


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None


class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., description="analyst, reviewer, admin")


class UserResponse(BaseModel):
    id: str
    clerk_id: Optional[str] = None
    name: str
    email: str
    role: str
    status: str
    created_at: Optional[datetime] = None


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    actor_name: Optional[str] = None
    email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details_json: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None


class SecurityEventResponse(BaseModel):
    id: str
    event_type: str
    severity: str
    source_ip: Optional[str] = None
    payload_summary: Optional[str] = None
    details_json: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
