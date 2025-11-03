"""
数据库Session管理模块
提供基于数据库的session管理功能，支持分布式部署和持久化
"""

import uuid
import time
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.core.database import SessionLocal
from app.models.models import Session as DBSession


class DatabaseSessionManager:
    """基于数据库的Session管理器"""

    def __init__(self, session_timeout: int = 3600 * 24 * 7):  # 默认7天
        self.session_timeout = session_timeout

    def create_session(self, user_id: str, username: str, ip_address: str = "", user_agent: str = "") -> str:
        """创建新session"""
        with SessionLocal() as db:
            # 清理过期session
            self._cleanup_expired_sessions(db)

            # 生成session ID
            session_id = str(uuid.uuid4())

            # 创建数据库session记录
            expires_at = datetime.utcnow() + timedelta(seconds=self.session_timeout)
            db_session = DBSession(
                session_id=session_id,
                user_id=user_id,
                username=username,
                expires_at=expires_at,
                is_active=1,
                ip_address=ip_address,
                user_agent=user_agent
            )

            db.add(db_session)
            db.commit()

            return session_id

    def validate_session(self, session_id: str) -> Optional[DBSession]:
        """验证session是否有效"""
        with SessionLocal() as db:
            # 清理过期session
            self._cleanup_expired_sessions(db)

            # 查询session
            session = db.query(DBSession).filter(
                and_(
                    DBSession.session_id == session_id,
                    DBSession.is_active == 1,
                    DBSession.expires_at > datetime.utcnow()
                )
            ).first()

            return session

    def invalidate_session(self, session_id: str) -> bool:
        """使session失效（登出）"""
        with SessionLocal() as db:
            session = db.query(DBSession).filter(DBSession.session_id == session_id).first()
            if session:
                session.is_active = 0
                db.commit()
                return True
            return False

    def invalidate_user_sessions(self, user_id: str) -> int:
        """使指定用户的所有session失效"""
        with SessionLocal() as db:
            result = db.query(DBSession).filter(
                and_(
                    DBSession.user_id == user_id,
                    DBSession.is_active == 1
                )
            ).update({"is_active": 0})
            db.commit()
            return result

    def get_user_sessions(self, user_id: str) -> List[DBSession]:
        """获取用户的活跃session列表"""
        with SessionLocal() as db:
            self._cleanup_expired_sessions(db)
            return db.query(DBSession).filter(
                and_(
                    DBSession.user_id == user_id,
                    DBSession.is_active == 1,
                    DBSession.expires_at > datetime.utcnow()
                )
            ).all()

    def extend_session(self, session_id: str, additional_seconds: int = 3600) -> bool:
        """延长session过期时间"""
        with SessionLocal() as db:
            session = db.query(DBSession).filter(
                and_(
                    DBSession.session_id == session_id,
                    DBSession.is_active == 1
                )
            ).first()

            if session:
                session.expires_at = datetime.utcnow() + timedelta(seconds=additional_seconds)
                db.commit()
                return True
            return False

    def _cleanup_expired_sessions(self, db: Session):
        """清理过期的session"""
        expired_count = db.query(DBSession).filter(
            or_(
                DBSession.is_active == 0,
                DBSession.expires_at <= datetime.utcnow()
            )
        ).delete()
        if expired_count > 0:
            db.commit()

    def get_session_count(self) -> int:
        """获取活跃session数量"""
        with SessionLocal() as db:
            self._cleanup_expired_sessions(db)
            return db.query(func.count(DBSession.id)).filter(
                and_(
                    DBSession.is_active == 1,
                    DBSession.expires_at > datetime.utcnow()
                )
            ).scalar()

    def get_user_session_count(self, user_id: str) -> int:
        """获取用户的活跃session数量"""
        with SessionLocal() as db:
            return db.query(func.count(DBSession.id)).filter(
                and_(
                    DBSession.user_id == user_id,
                    DBSession.is_active == 1,
                    DBSession.expires_at > datetime.utcnow()
                )
            ).scalar()


# 全局数据库session管理器实例
db_session_manager = DatabaseSessionManager()