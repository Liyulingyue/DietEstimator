"""
Session管理模块
提供session的创建、验证和管理功能
"""

import uuid
import time
from typing import Dict, Optional
from dataclasses import dataclass
from threading import Lock


@dataclass
class Session:
    """Session数据类"""
    session_id: str
    user_id: str
    username: str
    created_at: float
    expires_at: float
    is_active: bool = True


class SessionManager:
    """Session管理器"""

    def __init__(self, session_timeout: int = 3600 * 24 * 7):  # 默认7天
        self.sessions: Dict[str, Session] = {}
        self.session_timeout = session_timeout
        self.lock = Lock()

    def create_session(self, user_id: str, username: str) -> str:
        """创建新session"""
        with self.lock:
            # 清理过期session
            self._cleanup_expired_sessions()

            # 生成session ID
            session_id = str(uuid.uuid4())

            # 创建session
            now = time.time()
            session = Session(
                session_id=session_id,
                user_id=user_id,
                username=username,
                created_at=now,
                expires_at=now + self.session_timeout,
                is_active=True
            )

            # 存储session
            self.sessions[session_id] = session

            return session_id

    def validate_session(self, session_id: str) -> Optional[Session]:
        """验证session是否有效"""
        with self.lock:
            # 清理过期session
            self._cleanup_expired_sessions()

            session = self.sessions.get(session_id)
            if session and session.is_active and session.expires_at > time.time():
                return session
            return None

    def invalidate_session(self, session_id: str) -> bool:
        """使session失效（登出）"""
        with self.lock:
            session = self.sessions.get(session_id)
            if session:
                session.is_active = False
                return True
            return False

    def get_user_sessions(self, user_id: str) -> list[Session]:
        """获取用户的活跃session列表"""
        with self.lock:
            self._cleanup_expired_sessions()
            return [
                session for session in self.sessions.values()
                if session.user_id == user_id and session.is_active
            ]

    def _cleanup_expired_sessions(self):
        """清理过期的session"""
        now = time.time()
        expired_sessions = [
            session_id for session_id, session in self.sessions.items()
            if not session.is_active or session.expires_at <= now
        ]
        for session_id in expired_sessions:
            del self.sessions[session_id]

    def get_session_count(self) -> int:
        """获取活跃session数量"""
        with self.lock:
            self._cleanup_expired_sessions()
            return len([s for s in self.sessions.values() if s.is_active])


# 全局session管理器实例
session_manager = SessionManager()