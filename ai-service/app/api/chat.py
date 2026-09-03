from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, Dict, Any

from app.core.security import get_current_user_optional, get_current_user_required
from app.services.rag_service import rag_service
from app.models.schemas import (
    CreateConversationRequest,
    SendMessageRequest,
    SendMessageResponse,
    SendMessageResponseData
)

router = APIRouter(prefix="/chat", tags=["Chatbot RAG"])

@router.post("/conversations", status_code=status.HTTP_201_CREATED)
async def create_conversation(
    req: CreateConversationRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    user_id = current_user.get("id") if current_user else None
    conv = rag_service.create_conversation(user_id=user_id, title=req.title)
    return {"success": True, "data": conv}

@router.get("/conversations")
async def get_conversations(
    limit: int = Query(default=20),
    skip: int = Query(default=0),
    current_user: Dict[str, Any] = Depends(get_current_user_required)
):
    user_id = current_user["id"]
    convs = rag_service.get_user_conversations(user_id=user_id, limit=limit, skip=skip)
    return {"success": True, "count": len(convs), "data": convs}

@router.get("/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    user_id = current_user.get("id") if current_user else None
    detail = rag_service.get_conversation_detail(conversation_id, user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True, "data": detail}

import logging
logger = logging.getLogger("ai-service.chat")

@router.post("/conversations/{conversation_id}/messages", response_model=SendMessageResponse)
async def send_message(
    conversation_id: str,
    req: SendMessageRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    try:
        if not req.message or not req.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        detail = rag_service.get_conversation_detail(conversation_id)
        if not detail:
            raise HTTPException(status_code=404, detail="Conversation not found")

        res = rag_service.chat(conversation_id, req.message.strip())

        return SendMessageResponse(
            success=True,
            data=SendMessageResponseData(
                message=res["message"],
                suggested_products=res["suggested_products"],
                response_time_ms=res["total_time_ms"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

