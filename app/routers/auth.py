from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from models.user import User
from schemas.user import UserCreate, UserLogin, UserResponse, Token
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        unit_number=user_data.unit_number,
        phone_number=user_data.phone_number
    )
    
    await user.insert()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            unit_number=user.unit_number,
            phone_number=user.phone_number,
            created_at=user.created_at,
            is_active=user.is_active
        )
    }

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    # Find user
    user = await User.find_one(User.email == user_credentials.email)
    if not user or not verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            unit_number=user.unit_number,
            phone_number=user.phone_number,
            created_at=user.created_at,
            is_active=user.is_active
        )
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
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