from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .config import settings
from models.user import User
from models.report import Report
from models.emergency import Emergency
from models.feedback import Feedback


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def get_database() -> AsyncIOMotorClient:
    return db.client


async def init_db():
    # Create Motor client
    db.client = AsyncIOMotorClient(settings.MONGO_URI)
    
    # Initialize beanie with the database and models
    await init_beanie(
        database=db.client[settings.MONGO_DB],
        document_models=[User, Report, Emergency, Feedback]
    )


async def close_db():
    if db.client:
        db.client.close()