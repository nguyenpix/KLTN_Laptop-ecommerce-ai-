from typing import Optional, Dict, Any
import jwt
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from app.core.config import settings
from app.core.database import get_database

security = HTTPBearer(auto_error=False)

def decode_jwt(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except Exception:
        return None

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_jwt(token)
    if not payload:
        return None
    
    user_id = payload.get("userId") or payload.get("id") or payload.get("_id")
    if not user_id:
        return None
    
    try:
        db = get_database()
        user = db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
        if user:
            user["_id"] = str(user["_id"])
            user["id"] = str(user["_id"])
            return user
    except Exception:
        pass
    
    return {"_id": str(user_id), "id": str(user_id)}

async def get_current_user_required(
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> Dict[str, Any]:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or are invalid."
        )
    return user
