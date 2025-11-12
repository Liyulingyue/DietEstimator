"""
认证API模块
提供登录、登出和session管理相关的API
"""

from fastapi import APIRouter, HTTPException, Depends, Response, Cookie, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import logging
import hashlib

from app.core.database import get_db, SessionLocal
from app.core.database_session import db_session_manager
from app.models.models import User
from app.api.auth_middleware import UserInfo, get_current_user, require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

# 密码哈希上下文 - 使用 argon2
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)


class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """登录响应模型"""
    success: bool
    message: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    session_id: Optional[str] = None


def _truncate_password(password: str, max_bytes: int = 72) -> str:
    """
    将密码截断到指定字节数
    argon2 理论上支持非常长的密码，但为了安全起见还是限制一下
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) <= max_bytes:
        return password
    
    # 截断到 max_bytes，并确保不会在多字节字符中间截断
    truncated_bytes = password_bytes[:max_bytes]
    # 尝试解码，如果失败则逐个字节回退
    for i in range(len(truncated_bytes), 0, -1):
        try:
            return truncated_bytes[:i].decode('utf-8')
        except UnicodeDecodeError:
            continue
    return password  # 极端情况下返回原始密码


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    try:
        truncated = _truncate_password(plain_password)
        return pwd_context.verify(truncated, hashed_password)
    except Exception as e:
        logger.debug(f"验证密码时发生错误: {e}")
        return False


def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    truncated = _truncate_password(password)
    return pwd_context.hash(truncated)


def authenticate_user(db: Session, username: str, password: str) -> tuple[User, bool]:
    """
    认证用户，如果用户不存在则自动创建
    返回: (User对象, 是否新创建的用户)
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # 用户不存在，自动创建新用户
        logger.info(f"用户 {username} 不存在，自动创建新用户")
        try:
            hashed_password = get_password_hash(password)
            new_user = User(
                username=username,
                email=f"{username}@example.com",  # 临时email
                hashed_password=hashed_password,
                server_credits=100.0  # 新用户默认100个服务器调用点
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info(f"新用户 {username} 创建成功，ID: {new_user.id}")
            return new_user, True  # 返回新用户和True标记
        except Exception as e:
            db.rollback()
            logger.error(f"创建新用户失败: {e}")
            raise

    # 用户存在，验证密码
    if not verify_password(password, user.hashed_password):
        return None, False
    return user, False  # 返回现有用户和False标记


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    response: Response,
    req: Request,
    db: Session = Depends(get_db)
):
    """用户登录（支持自动注册）"""
    try:
        # 从数据库验证用户，如果不存在则自动创建
        user, is_new_user = authenticate_user(db, request.username, request.password)
        if not user:
            logger.warning(f"用户 {request.username} 密码验证失败")
            raise HTTPException(status_code=401, detail="密码错误")

        # 获取客户端信息
        client_ip = req.client.host if req.client else ""
        user_agent = req.headers.get("user-agent", "")

        # 创建数据库session
        session_id = db_session_manager.create_session(
            user_id=str(user.id),
            username=user.username,
            ip_address=client_ip,
            user_agent=user_agent
        )

        # 设置session cookie
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,  # 防止JavaScript访问
            secure=False,   # 开发环境使用false，生产环境使用true
            samesite="lax",
            max_age=3600 * 24 * 7  # 7天
        )

        # 根据是否新用户生成不同的提示信息
        if is_new_user:
            login_message = "欢迎加入！新账号已自动创建并登录成功。"
        else:
            login_message = "欢迎回来！"

        logger.info(f"用户 {request.username} 登录成功（{'新用户' if is_new_user else '现有用户'}），session_id: {session_id}")

        return LoginResponse(
            success=True,
            message=f"登录成功。{login_message}",
            user_id=str(user.id),
            username=user.username,
            session_id=session_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"登录过程中发生错误: {e}")
        raise HTTPException(status_code=500, detail="登录失败，请稍后重试")


@router.post("/logout")
async def logout(
    response: Response,
    session_id: Optional[str] = Cookie(None, alias="session_id")
):
    """用户登出"""
    try:
        if session_id:
            db_session_manager.invalidate_session(session_id)
            logger.info(f"session {session_id} 已失效")

        # 清除session cookie
        response.delete_cookie(
            key="session_id",
            httponly=True,
            secure=False,
            samesite="lax"
        )

        return {"success": True, "message": "登出成功"}

    except Exception as e:
        logger.error(f"登出过程中发生错误: {e}")
        raise HTTPException(status_code=500, detail="登出失败，请稍后重试")


@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: Optional[UserInfo] = Depends(get_current_user)):
    """获取当前用户信息"""
    if not current_user:
        return UserInfo(user_id="", username="", is_logged_in=False)

    return current_user


@router.get("/session/status")
async def get_session_status(current_user: Optional[UserInfo] = Depends(get_current_user)):
    """获取session状态"""
    if current_user:
        session_count = db_session_manager.get_user_session_count(current_user.user_id)
        return {
            "is_logged_in": True,
            "user_id": current_user.user_id,
            "username": current_user.username,
            "user_session_count": session_count,
            "total_session_count": db_session_manager.get_session_count()
        }
    else:
        return {
            "is_logged_in": False,
            "total_session_count": db_session_manager.get_session_count()
        }


@router.post("/consume-credits")
async def consume_server_credits(
    credits_to_consume: float,
    current_user: UserInfo = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    消耗服务器调用点

    TODO: 在使用服务器资源时调用此API来扣除调用点
    例如：在AI估算时，如果用户选择使用服务器资源，则扣除相应点数

    参数:
        credits_to_consume: 要消耗的调用点数量（float）
    返回:
        剩余调用点数量
    """
    try:
        # 获取用户
        user = db.query(User).filter(User.id == int(current_user.user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        # 检查是否有足够的调用点
        if user.server_credits < credits_to_consume:
            raise HTTPException(
                status_code=402,  # Payment Required
                detail=f"服务器调用点不足。当前剩余: {user.server_credits}，需要: {credits_to_consume}"
            )

        # 扣除调用点
        user.server_credits -= credits_to_consume
        db.commit()

        logger.info(f"用户 {current_user.username} 消耗了 {credits_to_consume} 个服务器调用点，剩余: {user.server_credits}")

        return {
            "success": True,
            "message": f"成功消耗 {credits_to_consume} 个调用点",
            "remaining_credits": user.server_credits
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"消耗调用点时发生错误: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="操作失败，请稍后重试")


@router.get("/credits")
async def get_server_credits(
    current_user: UserInfo = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """获取当前用户的服务器调用点余额"""
    try:
        user = db.query(User).filter(User.id == int(current_user.user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")

        return {
            "username": user.username,
            "server_credits": user.server_credits,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取调用点信息时发生错误: {e}")
        raise HTTPException(status_code=500, detail="获取信息失败，请稍后重试")