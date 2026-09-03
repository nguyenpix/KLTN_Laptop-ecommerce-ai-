from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, Dict, Any

from app.core.security import get_current_user_optional, get_current_user_required
from app.services.rec_service import rec_engine
from app.models.schemas import RecommendationsResponse, RecommendationsData

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    exclude_interacted: bool = Query(default=True),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Get personalized recommendations using Two-Tower model & Switching Hybrid.
    Falls back to Content-Based if user is cold-start (new user).
    """
    user_id = current_user.get("id") if current_user else None
    
    recs, is_cold_start, algorithm = rec_engine.recommend_for_user(
        user_id=user_id,
        limit=limit,
        exclude_interacted=exclude_interacted
    )

    return RecommendationsResponse(
        success=True,
        data=RecommendationsData(
            recommendations=recs,
            algorithm=algorithm,
            user_id=user_id,
            total=len(recs),
            is_cold_start=is_cold_start
        )
    )

@router.get("/similar/{product_id}")
async def get_similar_laptops(
    product_id: str,
    limit: int = Query(default=5, ge=1, le=20)
):
    """
    Item-to-Item Content-Based recommendations based on laptop hardware specs.
    """
    similar_items = rec_engine.recommend_similar_items(product_id, limit=limit)
    return {
        "success": True,
        "data": {
            "similar_products": similar_items,
            "count": len(similar_items)
        }
    }
