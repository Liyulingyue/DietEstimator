from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.database_session import db_session_manager
from app.models.models import User


class UserInfo(BaseModel):
    """用户信息模型"""
    user_id: str
    username: str
    is_logged_in: bool
    server_credits: float = 0.0


def get_current_user(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")) -> Optional[UserInfo]:
    """获取当前用户信息（依赖注入）- 从 HTTP Header 读取 session"""
    if not x_session_id:
        return None

    session = db_session_manager.validate_session(x_session_id)
    if not session:
        return None

    # 从数据库获取用户的服务器调用点信息
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == int(session.user_id)).first()
        server_credits = user.server_credits if user else 0.0

    return UserInfo(
        user_id=session.user_id,
        username=session.username,
        is_logged_in=True,
        server_credits=server_credits
    )


def require_auth(current_user: Optional[UserInfo] = Depends(get_current_user)) -> UserInfo:
    """需要认证的依赖注入"""
    if not current_user or not current_user.is_logged_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="需要登录才能访问此资源",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


# 为兼容性提供别名
optional_auth = get_current_user