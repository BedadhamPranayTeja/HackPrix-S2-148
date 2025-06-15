from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from models.user import User
from models.emergency import Emergency
from schemas.emergency import EmergencyCreate, EmergencyUpdate, EmergencyResponse
from core.dependencies import get_current_user, get_admin_user

router = APIRouter()

@router.post("/", response_model=EmergencyResponse)
async def create_emergency(
    emergency_data: EmergencyCreate,
    current_user: User = Depends(get_current_user)
):
    emergency = Emergency(
        user_id=str(current_user.id),
        type=emergency_data.type,
        location=emergency_data.location
    )
    
    await emergency.insert()
    
    return EmergencyResponse(
        id=str(emergency.id),
        user_id=emergency.user_id,
        type=emergency.type,
        location=emergency.location,
        status=emergency.status,
        admin_id=emergency.admin_id,
        response_notes=emergency.response_notes,
        created_at=emergency.created_at,
        resolved_at=emergency.resolved_at
    )

@router.get("/user", response_model=List[EmergencyResponse])
async def get_user_emergencies(current_user: User = Depends(get_current_user)):
    emergencies = await Emergency.find(Emergency.user_id == str(current_user.id)).to_list()
    
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

@router.get("/active", response_model=List[EmergencyResponse])
async def get_active_emergencies(admin_user: User = Depends(get_admin_user)):
    emergencies = await Emergency.find(Emergency.status == "active").to_list()
    
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

@router.patch("/{emergency_id}", response_model=EmergencyResponse)
async def update_emergency(
    emergency_id: str,
    update_data: EmergencyUpdate,
    admin_user: User = Depends(get_admin_user)
):
    emergency = await Emergency.get(emergency_id)
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency not found"
        )
    
    if update_data.status:
        emergency.status = update_data.status
        emergency.admin_id = str(admin_user.id)
        
        if update_data.status == "resolved":
            emergency.resolved_at = datetime.utcnow()
    
    if update_data.response_notes:
        emergency.response_notes = update_data.response_notes
    
    await emergency.save()
    
    return EmergencyResponse(
        id=str(emergency.id),
        user_id=emergency.user_id,
        type=emergency.type,
        location=emergency.location,
        status=emergency.status,
        admin_id=emergency.admin_id,
        response_notes=emergency.response_notes,
        created_at=emergency.created_at,
        resolved_at=emergency.resolved_at
    )