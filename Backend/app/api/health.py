from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])

@router.get("", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )
