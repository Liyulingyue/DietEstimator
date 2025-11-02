from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DietRecord(Base):
    __tablename__ = "diet_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), index=True)  # 使用定长字符串，足够存储用户ID
    image_url = Column(String(255))
    analysis_result = Column(Text)
    analysis_method = Column(String(50), default="pure_llm")  # 添加分析方法字段
    food_description = Column(Text)  # Retaining existing field
    calorie_estimate = Column(Integer)  # Retaining existing field
    ai_analysis = Column(Text)  # Retaining existing field
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
