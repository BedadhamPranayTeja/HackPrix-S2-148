from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "securitysentry"

    JWT_SECRET_KEY: str = "your_secret_key_here_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    MAPBOX_TOKEN: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
