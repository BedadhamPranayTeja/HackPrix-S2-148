from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(Document):
    name: str
    email: EmailStr = Field(unique=True, index=True)
    password: str
    role: UserRole = UserRole.USER
    unit_number: Optional[str] = None
    phone_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Settings:
        name = "users"