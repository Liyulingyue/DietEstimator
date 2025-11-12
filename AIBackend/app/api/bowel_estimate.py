"""
粪便分析相关端点
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List

from app.models.schemas import (
    BowelEstimateResponse,
    AnalysisMethod,
    EstimateRequest,
)
from app.services.pure_bowel_processor import process_pure_bowel
from app.utils.validators import validate_estimate_request

router = APIRouter(prefix="/bowel-estimate", tags=["bowel-estimate"])

async def _validate_and_read_files(files: List[UploadFile], api_key: str):
    """验证文件和API密钥，读取图片字节流"""
    # 验证文件
    if not files:
        raise HTTPException(status_code=400, detail="请上传至少一张图片")

    # 使用请求中的API密钥
    if not api_key or api_key.strip() == "":
        raise HTTPException(status_code=400, detail="API密钥不能为空")

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

    return image_bytes_list

def _create_bowel_response(success: bool, message: str, result: any = None, error: str = None) -> BowelEstimateResponse:
    """创建结构化的BowelEstimateResponse"""
    if success and result is not None:
        # pure_bowel返回的结构化结果
        if isinstance(result, dict):
            return BowelEstimateResponse(
                success=True,
                message=message,
                raw=result,
                color=result.get("color"),
                quantity=result.get("quantity"),
                shape=result.get("shape"),
                health_comment=result.get("health_comment"),
                analysis_basis=result.get("analysis_basis")
            )
        else:
            # 其他方法返回的字符串结果
            return BowelEstimateResponse(
                success=True,
                message=message,
                raw=result
            )
    else:
        # 处理失败的响应
        return BowelEstimateResponse(
            success=False,
            message=message,
            error=error
        )

@router.post("", response_model=BowelEstimateResponse)
async def bowel_estimate(
    files: List[UploadFile] = File(..., description="要分析的粪便图片文件"),
    request: EstimateRequest = Depends(validate_estimate_request)
):
    """
    粪便健康分析接口
    
    Args:
        files: 上传的图片文件列表
        request: 分析请求参数
        
    Returns:
        分析结果
    """
    try:
        # 验证分析方法
        if request.method not in [e.value for e in AnalysisMethod]:
            raise HTTPException(
                status_code=400, 
                detail=f"无效的分析方法: {request.method}. 支持的方法: {[e.value for e in AnalysisMethod]}"
            )
        
        # 验证文件
        if not files:
            raise HTTPException(status_code=400, detail="请上传至少一张图片")
        
        # 使用请求中的API密钥
        api_key = request.api_key
        if not api_key or api_key.strip() == "":
            raise HTTPException(status_code=400, detail="API密钥不能为空")
        
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
        if request.method == AnalysisMethod.PURE_LLM.value:
            result = process_pure_bowel(image_bytes_list, request.api_key, request.model_url, request.model_name)
            # 处理pure_bowel的结构化返回
            if isinstance(result, dict) and "error" in result:
                return BowelEstimateResponse(
                    success=False,
                    message="分析失败",
                    error=result["error"]
                )
        else:
            raise HTTPException(status_code=400, detail="粪便分析目前仅支持pure_llm方法")
        
        return _create_bowel_response(True, "分析完成", result)
        
    except HTTPException:
        raise
    except Exception as e:
        return _create_bowel_response(False, "分析失败", error=str(e))

@router.post("/pure-llm", response_model=BowelEstimateResponse)
async def bowel_estimate_pure_llm(
    files: List[UploadFile] = File(..., description="要分析的粪便图片文件"),
    request: EstimateRequest = Depends(validate_estimate_request)
):
    """
    基于大模型的粪便分析

    适用场景：所有类型的粪便健康状况分析
    """
    try:
        image_bytes_list = await _validate_and_read_files(files, request.api_key)

        # 直接调用纯LLM处理
        result = process_pure_bowel(image_bytes_list, request.api_key, request.model_url, request.model_name)

        # 处理结构化返回
        if isinstance(result, dict) and "error" in result:
            return _create_bowel_response(False, "分析失败", error=result["error"])

        return _create_bowel_response(True, "分析完成", result)
    except HTTPException:
        raise
    except Exception as e:
        return _create_bowel_response(False, "分析失败", error=str(e))