from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class EmergencyType(str, Enum):
    FIRE = "fire"
    ACCIDENT = "accident"
    VIOLENCE = "violence"
    MEDICAL = "medical"
    GENERAL = "general"


class EmergencyStatus(str, Enum):
    ACTIVE = "active"
    RESPONDED = "responded"
    RESOLVED = "resolved"


class Emergency(Document):
    user_id: str = Field(index=True)
    type: EmergencyType
    location: str
    status: EmergencyStatus = EmergencyStatus.ACTIVE
    admin_id: Optional[str] = None
    response_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

    class Settings:
        name = "emergencies"