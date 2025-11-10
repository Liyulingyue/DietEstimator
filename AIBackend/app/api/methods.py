"""
分析方法相关端点
"""

from fastapi import APIRouter
from app.models.schemas import AnalysisMethod

router = APIRouter(prefix="/methods", tags=["methods"])

@router.get("")
async def get_available_methods():
    """
    获取可用的分析方法
    """
    methods = []
    for method in AnalysisMethod:
        if method == AnalysisMethod.LLM_OCR_HYBRID:
            description = "大模型OCR混合估算 - 适用于有营养标签的包装食品"
        elif method == AnalysisMethod.PURE_LLM:
            description = "基于大模型估算 - 适用于所有类型食物"
        elif method == AnalysisMethod.NUTRITION_TABLE:
            description = "营养成分表提取 - 获取详细营养成分信息"
        elif method == AnalysisMethod.FOOD_PORTION:
            description = "食物份量检测 - 获取准确份量信息"
        else:
            description = "未知方法"
            
        methods.append({
            "value": method.value,
            "name": method.name,
            "description": description
        })
    
    return {
        "methods": methods,
        "total": len(methods)
    }