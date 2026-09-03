from pymongo import MongoClient
import logging
from .config import settings

logger = logging.getLogger("ai-service.database")

client: MongoClient = None
db = None

def get_database():
    global client, db
    if db is None:
        try:
            logger.info("Connecting to MongoDB Atlas...")
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=8000)
            client.admin.command("ping")
            db = client[settings.DB_NAME]
            logger.info(f"Connected to MongoDB Atlas: database '{settings.DB_NAME}'")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e
    return db

def close_database():
    global client, db
    if client is not None:
        client.close()
        client = None
        db = None
        logger.info("MongoDB connection closed.")
