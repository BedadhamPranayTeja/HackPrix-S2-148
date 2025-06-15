from fastapi import APIRouter, Depends
from models.user import User
from schemas.user import UserUpdate, UserResponse
from core.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        unit_number=current_user.unit_number,
        phone_number=current_user.phone_number,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.patch("/", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.unit_number is not None:
        current_user.unit_number = update_data.unit_number
    if update_data.phone_number is not None:
        current_user.phone_number = update_data.phone_number
    
    await current_user.save()
    
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        unit_number=current_user.unit_number,
        phone_number=current_user.phone_number,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )