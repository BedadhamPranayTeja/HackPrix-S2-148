from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ReportCategory(str, Enum):
    THEFT = "theft"
    ASSAULT = "assault"
    VANDALISM = "vandalism"
    SUSPICIOUS = "suspicious"
    NOISE = "noise"
    OTHER = "other"


class ReportStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    RESOLVED = "resolved"
    DENIED = "denied"


class Report(Document):
    user_id: str = Field(index=True)
    category: ReportCategory
    title: str
    description: str
    location: str
    evidence_url: Optional[str] = None
    victim_name: Optional[str] = None
    victim_contact: Optional[str] = None
    status: ReportStatus = ReportStatus.PENDING
    admin_response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reports"