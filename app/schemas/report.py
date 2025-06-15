from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.report import ReportCategory, ReportStatus


class ReportBase(BaseModel):
    category: ReportCategory
    title: str
    description: str
    location: str
    evidence_url: Optional[str] = None
    victim_name: Optional[str] = None
    victim_contact: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    status: Optional[ReportStatus] = None
    admin_response: Optional[str] = None


class ReportResponse(ReportBase):
    id: str
    user_id: str
    status: ReportStatus
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True