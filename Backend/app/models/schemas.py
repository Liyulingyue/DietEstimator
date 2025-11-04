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


class AIConfig(BaseModel):
    """AI配置基础模型"""
    model_url: str
    model_name: str
    api_key: str
    call_preference: str = "server"  # 调用偏好，默认为server


class TestConnectionRequest(AIConfig):
    """测试连接请求模型"""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "model_url": "https://api.openai.com/v1",
            "model_name": "gpt-3.5-turbo",
            "api_key": "sk-...",
            "call_preference": "server"
        }
    })


class TestConnectionResponse(BaseModel):
    """测试连接响应模型"""
    success: bool
    message: str
    response: Optional[str] = None
    error: Optional[str] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "success": True,
            "message": "连接测试成功",
            "response": "AI模型连接成功，返回测试响应内容",
            "error": None
        }
    })


class AnalyzeRequest(AIConfig):
    """食物分析请求模型"""
    session_id: str
    user_id: str
    method: str = "pure_llm"

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "session_id": "abc123",
            "user_id": "user123",
            "method": "pure_llm",
            "model_url": "https://api.openai.com/v1",
            "model_name": "gpt-3.5-turbo",
            "api_key": "sk-...",
            "call_preference": "server"
        }
    })


class AnalyzeResponse(BaseModel):
    """食物分析响应模型"""
    success: bool
    message: str
    result: Optional[dict] = None
    session_id: str
    method: str
    error: Optional[str] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "success": True,
            "message": "分析完成",
            "result": {
                "food_description": "一份蔬菜沙拉",
                "calories": 150,
                "nutrition_info": {
                    "protein": "5g",
                    "fat": "8g",
                    "carbohydrate": "12g"
                }
            },
            "session_id": "abc123",
            "method": "pure_llm",
            "error": None
        }
    })

