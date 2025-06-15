from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime


class Feedback(Document):
    user_id: str = Field(index=True)
    message: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "feedback"