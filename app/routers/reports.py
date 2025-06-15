from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from models.user import User
from models.report import Report
from schemas.report import ReportCreate, ReportUpdate, ReportResponse
from core.dependencies import get_current_user, get_admin_user

router = APIRouter()

@router.post("/", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user)
):
    report = Report(
        user_id=str(current_user.id),
        category=report_data.category,
        title=report_data.title,
        description=report_data.description,
        location=report_data.location,
        evidence_url=report_data.evidence_url,
        victim_name=report_data.victim_name,
        victim_contact=report_data.victim_contact
    )
    
    await report.insert()
    
    return ReportResponse(
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
    )

@router.get("/user", response_model=List[ReportResponse])
async def get_user_reports(current_user: User = Depends(get_current_user)):
    reports = await Report.find(Report.user_id == str(current_user.id)).to_list()
    
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

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user)
):
    report = await Report.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Users can only view their own reports, admins can view all
    if current_user.role != "admin" and report.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return ReportResponse(
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
    )

@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    update_data: ReportUpdate,
    admin_user: User = Depends(get_admin_user)
):
    report = await Report.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if update_data.status:
        report.status = update_data.status
    if update_data.admin_response:
        report.admin_response = update_data.admin_response
    
    report.updated_at = datetime.utcnow()
    await report.save()
    
    return ReportResponse(
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
    )