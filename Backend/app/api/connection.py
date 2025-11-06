"""
连接测试API模块
提供AI连接测试相关的API
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import httpx
import logging

from app.core.database import get_db
from app.core.config import settings
from app.api.auth_middleware import optional_auth, UserInfo
from app.models.schemas import TestConnectionRequest, TestConnectionResponse

logger = logging.getLogger(__name__)

router = APIRouter()

def _backend_url(path: str) -> str:
    return f"{settings.AI_BACKEND_URL.rstrip('/')}{path}"

@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(
    request: TestConnectionRequest,
    current_user: Optional[UserInfo] = Depends(optional_auth),
    db: Session = Depends(get_db)
) -> TestConnectionResponse:
    """测试AI连接连通性"""
    logger.debug(f"test_connection called with model_url={request.model_url}, model_name={request.model_name}, call_preference={request.call_preference}")
    logger.debug(f"Current user: {current_user.username if current_user else 'Not logged in'}")

    # 测试连接始终使用用户提供的配置
    model_url = request.model_url
    model_name = request.model_name
    api_key = request.api_key

    url = _backend_url('/api/v1/test-connection')
    logger.debug(f"Forwarding to AI backend: url={url}")

    # 准备表单数据
    data = {
        'model_url': model_url,
        'model_name': model_name,
        'api_key': api_key
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                url,
                json=data,  # 发送 JSON 数据而不是 form data
                headers={"Content-Type": "application/json"}
            )
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (test-connection)')
            return TestConnectionResponse(
                success=False,
                message="连接测试失败",
                error=str(e)
            )

        try:
            response_data = resp.json()
            logger.info(f"AI backend test-connection response: {response_data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (test-connection): %s', body)
            return TestConnectionResponse(
                success=False,
                message="AI后端返回无效响应",
                error="Non-JSON response"
            )

        if resp.status_code != 200:
            logger.error('AI backend test-connection returned error: %s', response_data)
            return TestConnectionResponse(
                success=False,
                message="连接测试失败",
                error=str(response_data)
            )

        # 成功响应
        return TestConnectionResponse(
            success=True,
            message="连接测试成功",
            response=response_data.get("response"),
            error=None
        )