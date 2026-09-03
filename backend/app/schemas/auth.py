"""
ContentForge AI — Auth Schemas
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    token: Optional[str] = Field(None, description="Clerk JWT Session Token or local bearer token")
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    permissions: list[str] = []
    status: str = "active"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class LogoutResponse(BaseModel):
    status: str = "logged_out"
    message: str = "Successfully logged out session."
