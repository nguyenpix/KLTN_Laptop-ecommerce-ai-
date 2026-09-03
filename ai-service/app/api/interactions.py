from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

from app.core.security import get_current_user_required
from app.core.database import get_database
from app.models.schemas import TrackInteractionRequest, InteractionResponse
from app.services.rec_service import rec_engine

router = APIRouter(prefix="/interactions", tags=["Interactions"])

WEIGHT_MAP = {
    "view": 1.0,
    "like": 3.0,
    "cart": 4.0,
    "order": 5.0,
    "feedback": 4.0
}

@router.post("/track", response_model=InteractionResponse)
async def track_interaction(
    req: TrackInteractionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_required)
):
    db = get_database()
    user_id = current_user["id"]
    itype = req.interaction_type.lower()
    weight = WEIGHT_MAP.get(itype, 1.0)

    doc = {
        "user_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id,
        "product_id": ObjectId(req.product_id) if ObjectId.is_valid(req.product_id) else req.product_id,
        "interaction_type": itype,
        "weight": weight,
        "metadata": req.metadata or {},
        "timestamp": datetime.utcnow()
    }

    res = db.interactions.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["user_id"] = str(doc["user_id"])
    doc["product_id"] = str(doc["product_id"])

    # Update in-memory R_matrix if present
    if rec_engine.is_ready and user_id in rec_engine.user_id_to_idx and str(req.product_id) in rec_engine.item_id_to_idx:
        u_idx = rec_engine.user_id_to_idx[user_id]
        i_idx = rec_engine.item_id_to_idx[str(req.product_id)]
        rec_engine.R_matrix[u_idx, i_idx] = max(rec_engine.R_matrix[u_idx, i_idx], float(weight))

    return InteractionResponse(
        success=True,
        message=f"Tracked {itype} interaction successfully",
        data=doc
    )

@router.post("/view")
async def track_view(
    body: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_required)
):
    pid = body.get("productId") or body.get("product_id")
    if not pid:
        raise HTTPException(status_code=400, detail="productId is required")
    return await track_interaction(TrackInteractionRequest(product_id=str(pid), interaction_type="view"), current_user)

@router.post("/like/{product_id}")
async def toggle_like(
    product_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_required)
):
    return await track_interaction(TrackInteractionRequest(product_id=product_id, interaction_type="like"), current_user)
