"""
健康检查相关端点
"""

from fastapi import APIRouter
from datetime import datetime

from app.models.schemas import HealthCheckResponse

router = APIRouter(prefix="/health", tags=["health"])

@router.get("", response_model=HealthCheckResponse)
async def health_check():
    """健康检查端点"""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )