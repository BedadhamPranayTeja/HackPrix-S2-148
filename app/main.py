from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from core.config import settings
from core.database import init_db
from routers import auth, reports, emergencies, profile, admin
from realtime.websocket import websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass


app = FastAPI(
    title="SecureGate Community Security",
    description="Mobile-first SaaS platform for gated community security",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(emergencies.router, prefix="/api/v1/emergencies", tags=["emergencies"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(websocket_router, prefix="/ws")

@app.get("/")
async def root():
    return {"message": "SecureGate API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}