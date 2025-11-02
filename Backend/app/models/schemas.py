from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


class HealthResponse(BaseModel):
    status: str
    timestamp: str


class DietRecordBase(BaseModel):
    image_url: str
    food_description: Optional[str] = None
    calorie_estimate: Optional[float] = None
    nutrition_info: Optional[dict] = None
    analysis_method: Optional[str] = ""  # 设为可选字段，默认值为空字符串


class DietRecordCreate(DietRecordBase):
    user_id: str
    raw_response: str


class DietRecordResponse(DietRecordBase):
    id: int
    user_id: str
    analysis_result: str
    analysis_method: Optional[str] = ""  # 可选字段，设置默认值
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)  # 新版本中 orm_mode 改名为 from_attributes


class EstimateRequest(BaseModel):
    image_base64: str
    method: str = "pure_llm"


class DietRecordRequest(BaseModel):
    """饮食记录创建请求模型"""
    user_id: str
    analysis_result: str
    
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "user_id": 1,
            "analysis_result": "这是一份分析结果"
        }
    })

