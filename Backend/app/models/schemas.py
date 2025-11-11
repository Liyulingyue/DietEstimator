from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from enum import Enum


class AnalysisMethod(str, Enum):
    """分析方法枚举"""
    LLM_OCR_HYBRID = "llm_ocr_hybrid"  # 大模型OCR混合估算
    PURE_LLM = "pure_llm"  # 基于大模型估算
    NUTRITION_TABLE = "nutrition_table"  # 营养成分表提取
    FOOD_PORTION = "food_portion"  # 食物份量检测


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
    model_url: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    call_preference: str = "server"  # 调用偏好，默认为server


class TestConnectionRequest(AIConfig):
    """测试连接请求模型"""
    model_url: str
    model_name: str
    api_key: str

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
    session_id: Optional[str] = None
    user_id: Optional[str] = None
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
    session_id: Optional[str] = None
    method: str
    error: Optional[str] = None
    food_name: Optional[str] = None
    calories: Optional[str] = None
    estimation_basis: Optional[str] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "success": True,
            "message": "分析完成",
            "result": {
                "food_name": "汉堡",
                "calories": "约为1200大卡（或5024千焦）",
                "estimation_basis": "识别出图片中的食物为一个汉堡..."
            },
            "session_id": "abc123",
            "method": "pure_llm",
            "error": None,
            "food_name": "汉堡",
            "calories": "约为1200大卡（或5024千焦）",
            "estimation_basis": "识别出图片中的食物为一个汉堡..."
        }
    })


class GalleryShareBase(BaseModel):
    user_id: Optional[str] = None  # 可为空，表示匿名用户
    image_base64: str
    analysis_result: str  # JSON格式的分析结果


class GalleryShareCreate(GalleryShareBase):
    pass


class GalleryShareResponse(GalleryShareBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GalleryShareListResponse(BaseModel):
    shares: List[GalleryShareResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)

