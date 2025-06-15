from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.emergency import EmergencyType, EmergencyStatus


class EmergencyBase(BaseModel):
    type: EmergencyType
    location: str


class EmergencyCreate(EmergencyBase):
    pass


class EmergencyUpdate(BaseModel):
    status: Optional[EmergencyStatus] = None
    response_notes: Optional[str] = None


class EmergencyResponse(EmergencyBase):
    id: str
    user_id: str
    status: EmergencyStatus
    admin_id: Optional[str] = None
    response_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True