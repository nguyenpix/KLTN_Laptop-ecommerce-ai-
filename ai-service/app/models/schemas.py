from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Recommendation Schemas ---
class RecommendationItem(BaseModel):
    product_id: str
    id: Optional[int] = None
    title: str
    name: Optional[str] = None
    price: float
    brand: Optional[str] = None
    category: Optional[str] = None
    images: Optional[Dict[str, Any]] = None
    specifications: Optional[Dict[str, Any]] = None
    score: float
    algorithm: Optional[str] = "two_tower_hybrid"

class RecommendationsData(BaseModel):
    recommendations: List[Dict[str, Any]]
    algorithm: str = "two_tower_switching_hybrid"
    user_id: Optional[str] = None
    total: int
    is_cold_start: bool = False
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class RecommendationsResponse(BaseModel):
    success: bool = True
    data: RecommendationsData

# --- Chat Schemas ---
class CreateConversationRequest(BaseModel):
    title: Optional[str] = "Tư vấn Laptop"

class SendMessageRequest(BaseModel):
    message: str

class ReferencedProduct(BaseModel):
    product_id: str
    name: str
    price: float
    images: Optional[Any] = None
    similarity_score: float = 0.0

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SendMessageResponseData(BaseModel):
    message: Dict[str, Any]
    suggested_products: List[Dict[str, Any]] = []
    response_time_ms: float = 0.0

class SendMessageResponse(BaseModel):
    success: bool = True
    data: SendMessageResponseData

# --- Interaction Schemas ---
class TrackInteractionRequest(BaseModel):
    product_id: str
    interaction_type: str = Field(..., description="view, like, cart, order, feedback")
    metadata: Optional[Dict[str, Any]] = None

class InteractionResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None
