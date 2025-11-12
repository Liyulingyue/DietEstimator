"""
API请求和响应数据模型
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union
from enum import Enum

class AnalysisMethod(str, Enum):
    """分析方法枚举"""
    LLM_OCR_HYBRID = "llm_ocr_hybrid"  # 大模型OCR混合估算
    PURE_LLM = "pure_llm"  # 基于大模型估算
    NUTRITION_TABLE = "nutrition_table"  # 营养成分表提取
    FOOD_PORTION = "food_portion"  # 食物份量检测

class EstimateRequest(BaseModel):
    """热量估算请求模型"""
    api_key: str = Field(..., description="百度文心一言API密钥")
    method: AnalysisMethod = Field(..., description="分析方法")
    model_url: str = Field(..., description="模型API地址")
    model_name: str = Field(..., description="模型名称")
    
    class Config:
        json_encoders = {
            AnalysisMethod: lambda v: v.value
        }

class EstimateResponse(BaseModel):
    """热量估算响应模型"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    raw: Optional[Any] = Field(None, description="原始分析结果")
    error: Optional[str] = Field(None, description="错误信息")
    calories: Optional[Union[float, str]] = Field(None, description="热量值，float类型单位为大卡，str类型可能包含单位")
    food_name: Optional[str] = Field(None, description="食物名称")
    reason: Optional[str] = Field(None, description="估算依据")

class HealthCheckResponse(BaseModel):
    """健康检查响应模型"""
    status: str = Field(..., description="服务状态")
    timestamp: str = Field(..., description="时间戳")

class NutritionInfo(BaseModel):
    """营养信息模型"""
    energy: Optional[str] = Field(None, description="能量")
    protein: Optional[str] = Field(None, description="蛋白质")
    fat: Optional[str] = Field(None, description="脂肪")
    carbohydrate: Optional[str] = Field(None, description="碳水化合物")
    
class PortionInfo(BaseModel):
    """份量信息模型"""
    food_name: Optional[str] = Field(None, description="食物名称")
    portion_value: Optional[float] = Field(None, description="份量数值")
    portion_unit: Optional[str] = Field(None, description="份量单位")
    confidence: Optional[str] = Field(None, description="置信度")

class CalorieInfo(BaseModel):
    """热量信息模型"""
    calories: Optional[Union[float, str]] = Field(None, description="热量值，float类型单位为大卡，str类型可能包含单位")
    basis: Optional[str] = Field(None, description="估算依据")
    food_name: Optional[str] = Field(None, description="食物名称")


class TestConnectionRequest(BaseModel):
    """测试连接请求模型"""
    model_url: str = Field(..., description="模型API地址")
    model_name: str = Field(..., description="模型名称")
    api_key: str = Field(..., description="API密钥")


class TestConnectionResponse(BaseModel):
    """测试连接响应模型"""
    status: str = Field(..., description="测试状态")
    message: str = Field(..., description="响应消息")
    response: Optional[str] = Field(None, description="AI回复内容")


class BowelEstimateResponse(BaseModel):
    """粪便分析响应模型"""
    success: bool = Field(..., description="是否成功")
    message: str = Field(..., description="响应消息")
    raw: Optional[Any] = Field(None, description="原始分析结果")
    error: Optional[str] = Field(None, description="错误信息")
    color: Optional[str] = Field(None, description="粪便颜色")
    quantity: Optional[str] = Field(None, description="粪便份量")
    shape: Optional[str] = Field(None, description="粪便形态")
    health_comment: Optional[str] = Field(None, description="健康点评")
    analysis_basis: Optional[str] = Field(None, description="分析依据")
