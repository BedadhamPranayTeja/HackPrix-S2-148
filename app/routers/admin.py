from fastapi import APIRouter, Depends
from typing import List
from models.user import User
from models.report import Report
from models.emergency import Emergency
from schemas.report import ReportResponse
from schemas.emergency import EmergencyResponse
from core.dependencies import get_admin_user

router = APIRouter()

@router.get("/reports", response_model=List[ReportResponse])
async def get_all_reports(admin_user: User = Depends(get_admin_user)):
    reports = await Report.find_all().to_list()
    
    return [
        ReportResponse(
            id=str(report.id),
            user_id=report.user_id,
            category=report.category,
            title=report.title,
            description=report.description,
            location=report.location,
            evidence_url=report.evidence_url,
            victim_name=report.victim_name,
            victim_contact=report.victim_contact,
            status=report.status,
            admin_response=report.admin_response,
            created_at=report.created_at,
            updated_at=report.updated_at
        ) for report in reports
    ]

@router.get("/emergencies", response_model=List[EmergencyResponse])
async def get_all_emergencies(admin_user: User = Depends(get_admin_user)):
    emergencies = await Emergency.find_all().to_list()
    
    return [
        EmergencyResponse(
            id=str(emergency.id),
            user_id=emergency.user_id,
            type=emergency.type,
            location=emergency.location,
            status=emergency.status,
            admin_id=emergency.admin_id,
            response_notes=emergency.response_notes,
            created_at=emergency.created_at,
            resolved_at=emergency.resolved_at
        ) for emergency in emergencies
    ]