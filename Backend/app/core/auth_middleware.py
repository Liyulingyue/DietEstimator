"""
认证中间件和依赖
提供session验证和API保护功能
注意：此文件已废弃，请使用 app/api/auth_middleware.py
"""

from fastapi import HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from typing import Optional
from pydantic import BaseModel
from app.core.database_session import db_session_manager


class UserInfo(BaseModel):
    """用户信息模型"""
    user_id: str
    username: str
    is_logged_in: bool
    server_credits: float = 0.0


def require_auth(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")):
    """需要认证的依赖注入 - 从 HTTP Header 读取 session"""
    if not x_session_id:
        raise HTTPException(
            status_code=401,
            detail="未登录，请先登录"
        )

    session = db_session_manager.validate_session(x_session_id)
    if not session:
        raise HTTPException(
            status_code=401,
            detail="session已过期，请重新登录"
        )

    return UserInfo(
        user_id=session.user_id,
        username=session.username,
        is_logged_in=True
    )


def optional_auth(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")) -> Optional[UserInfo]:
    """可选认证的依赖注入 - 从 HTTP Header 读取 session"""
    if not x_session_id:
        return None

    session = db_session_manager.validate_session(x_session_id)
    if not session:
        return None

    return UserInfo(
        user_id=session.user_id,
        username=session.username,
        is_logged_in=True
    )