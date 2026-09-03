from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import get_database, close_database
from app.services.rec_service import rec_engine
from app.api.recommendations import router as rec_router
from app.api.chat import router as chat_router
from app.api.interactions import router as interaction_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB and initialize Recommendation Engine & Weights
    logger.info("🚀 Starting AI & Recommendation Microservice...")
    try:
        get_database()
        rec_engine.initialize()
    except Exception as e:
        logger.error(f"Error during startup: {e}")
    yield
    # Shutdown
    logger.info("🛑 Shutting down AI Microservice...")
    close_database()

app = FastAPI(
    title="Laptop E-Commerce AI & Recommendation Microservice",
    description="Microservice providing Deep Learning (Two-Tower / Switching Hybrid) Recommendations and RAG Chatbot.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS setup
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root status
@app.get("/")
async def root():
    return {
        "service": "AI & Recommendation Microservice",
        "version": "2.0.0",
        "status": "online",
        "recommender_ready": rec_engine.is_ready,
        "items_count": len(rec_engine.item_id_list) if rec_engine.is_ready else 0,
        "endpoints": {
            "recommendations": "/api/v1/recommendations",
            "chat": "/api/v1/chat/conversations",
            "interactions": "/api/v1/interactions/track"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}

# Mount API v1 Routers
app.include_router(rec_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(interaction_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=(settings.NODE_ENV == "development"))
