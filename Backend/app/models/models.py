from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    server_credits = Column(Float, default=100.0)  # 服务器调用点，默认100点
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True)  # UUID长度
    user_id = Column(String(255), index=True)
    username = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), index=True)
    is_active = Column(Integer, default=1)  # 1=active, 0=inactive
    ip_address = Column(String(45))  # 支持IPv6
    user_agent = Column(Text)


class GalleryShare(Base):
    __tablename__ = "gallery_shares"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=True, index=True)  # 可为空，表示匿名用户
    image_base64 = Column(Text)  # 图片的base64字符串
    analysis_result = Column(Text)  # AI分析结果，JSON格式
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DietRecord(Base):
    __tablename__ = "diet_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), index=True)  # 使用定长字符串，足够存储用户ID
    image_url = Column(String(255))
    analysis_result = Column(Text)  # AI分析结果，JSON格式
    analysis_method = Column(String(50), default="pure_llm")  # 分析方法
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
