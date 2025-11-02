"""
FastAPI路由端点
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List
from datetime import datetime
import json

from app.models.schemas import (
    EstimateResponse, 
    HealthCheckResponse, 
    AnalysisMethod
)
from app.services.estimator import estimator_service
from app.services.llm_service import llm_service

router = APIRouter()

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """健康检查端点"""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.now().isoformat()
    )

@router.post("/estimate", response_model=EstimateResponse)
async def estimate_calories(
    files: List[UploadFile] = File(..., description="要分析的食物图片文件"),
    method: str = Form(..., description="分析方法：llm_ocr_hybrid/pure_llm/nutrition_table/food_portion")
):
    """
    食物热量估算接口
    
    Args:
        files: 上传的图片文件列表
        method: 分析方法
        
    Returns:
        分析结果
    """
    try:
        # 验证分析方法
        if method not in [e.value for e in AnalysisMethod]:
            raise HTTPException(
                status_code=400, 
                detail=f"无效的分析方法: {method}. 支持的方法: {[e.value for e in AnalysisMethod]}"
            )
        
        # 验证文件
        if not files:
            raise HTTPException(status_code=400, detail="请上传至少一张图片")
        
        # 读取API密钥
        from app.config import API_KEY
        api_key = API_KEY
        if not api_key or api_key.strip() == "":
            raise HTTPException(status_code=500, detail="API密钥未配置")
        
        # 验证文件类型
        for file in files:
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400, 
                    detail=f"文件 {file.filename} 不是有效的图片格式"
                )
        
        # 读取图片字节流
        image_bytes_list = []
        for file in files:
            content = await file.read()
            if len(content) == 0:
                raise HTTPException(
                    status_code=400, 
                    detail=f"文件 {file.filename} 为空"
                )
            image_bytes_list.append(content)
        
        # 根据方法调用相应的服务
        if method == AnalysisMethod.LLM_OCR_HYBRID.value:
            result = estimator_service.process_llm_ocr_hybrid(image_bytes_list, api_key)
        elif method == AnalysisMethod.PURE_LLM.value:
            result = estimator_service.process_pure_llm(image_bytes_list, api_key)
        elif method == AnalysisMethod.NUTRITION_TABLE.value:
            result = estimator_service.process_nutrition_table(image_bytes_list, api_key)
        elif method == AnalysisMethod.FOOD_PORTION.value:
            result = estimator_service.process_food_portion(image_bytes_list, api_key)
        else:
            raise HTTPException(status_code=400, detail="不支持的分析方法")
        
        return EstimateResponse(
            success=True,
            message="分析完成",
            result=result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return EstimateResponse(
            success=False,
            message="分析失败",
            error=str(e)
        )

@router.post("/estimate/llm_ocr_hybrid", response_model=EstimateResponse)
async def estimate_llm_ocr_hybrid(
    files: List[UploadFile] = File(..., description="要分析的食物图片文件")
):
    """
    大模型OCR混合估算
    
    适用场景：有营养标签的包装食品热量计算
    """
    return await estimate_calories(files, AnalysisMethod.LLM_OCR_HYBRID.value)

@router.post("/estimate/pure_llm", response_model=EstimateResponse)
async def estimate_pure_llm(
    files: List[UploadFile] = File(..., description="要分析的食物图片文件")
):
    """
    基于大模型估算
    
    适用场景：所有类型食物（新鲜食材、自制食品、包装食品等）
    """
    return await estimate_calories(files, AnalysisMethod.PURE_LLM.value)

@router.post("/estimate/nutrition-table", response_model=EstimateResponse)
async def estimate_nutrition_table(
    files: List[UploadFile] = File(..., description="要分析的食物图片文件")
):
    """
    营养成分表提取
    
    适用场景：需要详细营养成分信息的包装食品
    """
    return await estimate_calories(files, AnalysisMethod.NUTRITION_TABLE.value)

@router.post("/estimate/food-portion", response_model=EstimateResponse)
async def estimate_food_portion(
    files: List[UploadFile] = File(..., description="要分析的食物图片文件")
):
    """
    食物份量检测
    
    适用场景：需要准确份量信息的包装食品或标签
    """
    return await estimate_calories(files, AnalysisMethod.FOOD_PORTION.value)

@router.get("/methods")
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

@router.post("/test-connection")
async def test_ai_connection(
    model_url: str = Form(..., description="模型API地址"),
    model_name: str = Form(..., description="模型名称"),
    api_key: str = Form(..., description="API密钥")
):
    """
    测试AI连接连通性
    
    Args:
        model_url: 模型API地址
        model_name: 模型名称
        api_key: API密钥
        
    Returns:
        测试结果
    """
    try:
        result = llm_service.test_ai_connection(model_url, model_name, api_key)
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": f"测试过程中发生错误: {str(e)}"
        }
