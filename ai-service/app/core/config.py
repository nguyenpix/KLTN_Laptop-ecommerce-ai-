import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Base directory of ai-service
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    NODE_ENV: str = os.getenv("NODE_ENV", "development")

    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://nguyendangnguyen1606_db_user:xzFPnnkUqKigG3wN@projectlaptopcluster0.i8ibppc.mongodb.net/root_laptops?retryWrites=true&w=majority&appName=ProjectLaptopCluster0"
    )
    DB_NAME: str = os.getenv("DB_NAME", "root_laptops")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

    OPENCODE_API_KEY: str = os.getenv("OPENCODE_API_KEY", "")
    OPENCODE_BASE_URL: str = os.getenv("OPENCODE_BASE_URL", "https://opencode.ai/zen/v1")
    OPENCODE_MODEL: str = os.getenv("OPENCODE_MODEL", "deepseek-v4-flash-free")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_API_KEY: str = os.getenv("HUGGINGFACE_API_KEY", "")

    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5000")

    WEIGHTS_DIR: Path = BASE_DIR / "weights"

    class Config:
        case_sensitive = True

settings = Settings()
settings.WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
