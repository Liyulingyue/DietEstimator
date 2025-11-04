from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from typing import List, Optional
from sqlalchemy.orm import Session
import httpx
import logging
import json
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.api.auth_middleware import require_auth, optional_auth
from app.api.auth import UserInfo
from app.models.models import DietRecord
from app.models.schemas import TestConnectionRequest, TestConnectionResponse, AnalyzeRequest, AnalyzeResponse

def validate_analyze_request(
    session_id: str = Form(...),
    user_id: str = Form(...),
    method: str = Form(default="pure_llm"),
    model_url: str = Form(...),
    model_name: str = Form(...),
    api_key: str = Form(...),
    call_preference: str = Form(default="server"),
) -> AnalyzeRequest:
    """验证分析请求参数"""
    return AnalyzeRequest(
        session_id=session_id,
        user_id=user_id,
        method=method,
        model_url=model_url,
        model_name=model_name,
        api_key=api_key,
        call_preference=call_preference
    )

router = APIRouter()
logger = logging.getLogger(__name__)

def _backend_url(path: str) -> str:
    return f"{settings.AI_BACKEND_URL.rstrip('/')}{path}"

@router.post("/estimate/pure_llm")
async def proxy_pure_llm(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: str = "1"
):
    """将请求原样中转到 AI 后端的 pure_llm 接口"""
    logger.debug(f"proxy_pure_llm called with files={files}, user_id={user_id}")
    if not files:
        logger.warning("No files provided to proxy_pure_llm")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    file0 = files[0]
    content = await file0.read()
    logger.info(f"proxy_pure_llm received file: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
    url = _backend_url('/api/v1/estimate/pure_llm')
    logger.debug(f"Forwarding to AI backend: url={url}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')})
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (pure_llm)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend pure_llm response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (pure_llm): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend pure_llm returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data

@router.post("/estimate/llm_ocr_hybrid")
async def proxy_llm_ocr_hybrid(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: str = "1"
):
    """将请求原样中转到 AI 后端的 llm_ocr_hybrid 接口"""
    logger.debug(f"proxy_llm_ocr_hybrid called with files={files}, user_id={user_id}")
    if not files:
        logger.warning("No files provided to proxy_llm_ocr_hybrid")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    file0 = files[0]
    content = await file0.read()
    logger.info(f"proxy_llm_ocr_hybrid received file: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
    url = _backend_url('/api/v1/estimate/llm_ocr_hybrid')
    logger.debug(f"Forwarding to AI backend: url={url}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')})
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (llm_ocr_hybrid)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend llm_ocr_hybrid response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (llm_ocr_hybrid): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend llm_ocr_hybrid returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data

@router.post("/nutrition_table")
async def proxy_nutrition_table(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: str = "1"
):
    """将请求原样中转到 AI 后端的 nutrition_table 接口"""
    logger.debug(f"proxy_nutrition_table called with files={files}, user_id={user_id}")
    if not files:
        logger.warning("No files provided to proxy_nutrition_table")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    file0 = files[0]
    content = await file0.read()
    logger.info(f"proxy_nutrition_table received file: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
    url = _backend_url('/api/v1/nutrition_table')
    logger.debug(f"Forwarding to AI backend: url={url}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')})
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (nutrition_table)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend nutrition_table response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (nutrition_table): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend nutrition_table returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data

@router.post("/food_portion")
async def proxy_food_portion(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: str = "1"
):
    """将请求原样中转到 AI 后端的 food_portion 接口"""
    logger.debug(f"proxy_food_portion called with files={files}, user_id={user_id}")
    if not files:
        logger.warning("No files provided to proxy_food_portion")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    file0 = files[0]
    content = await file0.read()
    logger.info(f"proxy_food_portion received file: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
    url = _backend_url('/api/v1/food_portion')
    logger.debug(f"Forwarding to AI backend: url={url}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')})
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (food_portion)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend food_portion response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (food_portion): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend food_portion returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data

@router.post("/test-connection", response_model=TestConnectionResponse)
async def proxy_test_connection(
    request: TestConnectionRequest,
    current_user: Optional[UserInfo] = Depends(optional_auth),
    db: Session = Depends(get_db)
) -> TestConnectionResponse:
    """将测试连接请求中转到 AI 后端"""
    logger.debug(f"proxy_test_connection called with model_url={request.model_url}, model_name={request.model_name}, call_preference={request.call_preference}")
    logger.debug(f"Current user: {current_user.username if current_user else 'Not logged in'}")

    url = _backend_url('/api/v1/test-connection')
    logger.debug(f"Forwarding to AI backend: url={url}")

    # 准备表单数据
    data = {
        'model_url': request.model_url,
        'model_name': request.model_name,
        'api_key': request.api_key,
        'call_preference': request.call_preference  # 调用偏好参数
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                url, 
                json=data,  # 发送 JSON 数据而不是 form data
                headers={"Content-Type": "application/json"}
            )
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (test-connection)')
            return TestConnectionResponse(
                success=False,
                message="连接测试失败",
                error=str(e)
            )

        try:
            response_data = resp.json()
            logger.info(f"AI backend test-connection response: {response_data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (test-connection): %s', body)
            return TestConnectionResponse(
                success=False,
                message="AI后端返回无效响应",
                error="Non-JSON response"
            )

        if resp.status_code != 200:
            logger.error('AI backend test-connection returned error: %s', response_data)
            return TestConnectionResponse(
                success=False,
                message="连接测试失败",
                error=str(response_data)
            )

        # 成功响应
        # print(response_data)
        return TestConnectionResponse(
            success=True,
            message="连接测试成功",
            response=response_data.get("response"),
            error=None
        )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_food(
    files: List[UploadFile] = File(...),
    analyze_request: AnalyzeRequest = Depends(validate_analyze_request),
    db: Session = Depends(get_db),
) -> AnalyzeResponse:
    """
    食物分析接口 - 接收图片、会话信息和AI配置，调用AI后端进行分析，并保存记录
    
    Args:
        files: 上传的食物图片文件列表
        analyze_request: 验证后的分析请求参数
        db: 数据库会话
        
    Returns:
        分析结果，包括成功状态、消息和分析内容
    """
    logger.debug(f"analyze_food called with session_id={analyze_request.session_id}, user_id={analyze_request.user_id}, method={analyze_request.method}, model_name={analyze_request.model_name}, files count={len(files)}")
    
    if not files:
        logger.warning("No files provided to analyze_food")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    
    try:
        # 根据分析方法选择AI后端的对应接口
        ai_endpoint = {
            "pure_llm": "/api/v1/estimate/pure_llm",
            "llm_ocr_hybrid": "/api/v1/estimate/llm_ocr_hybrid",
            "nutrition_table": "/api/v1/nutrition_table",
            "food_portion": "/api/v1/food_portion",
        }.get(analyze_request.method, "/api/v1/estimate/pure_llm")
        
        # 转发到AI后端进行分析
        url = f"{settings.AI_BACKEND_URL.rstrip('/')}{ai_endpoint}"
        logger.info(f"Forwarding analysis request to AI backend: {url}")
        logger.debug(f"AI config data: model_url={analyze_request.model_url}, model_name={analyze_request.model_name}, call_preference={analyze_request.call_preference}")
        
        # 读取第一个文件进行分析
        file0 = files[0]
        content = await file0.read()
        logger.info(f"File details: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                # 准备AI配置数据
                ai_config_data = {
                    'model_url': analyze_request.model_url,
                    'model_name': analyze_request.model_name,
                    'api_key': analyze_request.api_key,
                    'call_preference': analyze_request.call_preference
                }
                
                resp = await client.post(
                    url,
                    data=ai_config_data,  # 发送AI配置数据
                    files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')}
                )
                logger.debug(f"AI backend response status={resp.status_code}")
            except Exception as e:
                logger.exception('Error forwarding to AI backend (analyze)')
                raise HTTPException(status_code=502, detail=f"AI后端连接失败: {str(e)}")
            
            try:
                ai_result = resp.json()
                logger.info(f"AI backend analysis response: {ai_result}")
            except Exception:
                body = await resp.aread()
                logger.error('Non-JSON response from AI backend (analyze): %s', body)
                raise HTTPException(status_code=502, detail='AI后端返回无效响应')
            
            if resp.status_code != 200:
                logger.error('AI backend returned error: %s', ai_result)
                raise HTTPException(status_code=resp.status_code, detail=f"AI分析失败: {ai_result.get('message', '未知错误')}")
        
        # 保存分析记录到数据库
        try:
            diet_record = DietRecord(
                user_id=analyze_request.user_id,
                image_url="",  # 暂不保存图片URL
                analysis_method=analyze_request.method,
                analysis_result=json.dumps(ai_result, ensure_ascii=False),
                ai_analysis=json.dumps(ai_result, ensure_ascii=False),
            )
            db.add(diet_record)
            db.commit()
            db.refresh(diet_record)
            logger.info(f"Diet record saved: id={diet_record.id}, user_id={analyze_request.user_id}")
        except Exception as e:
            logger.exception("Error saving diet record to database")
            db.rollback()
            # 不影响返回结果，继续返回AI的分析结果
        
        return AnalyzeResponse(
            success=True,
            message="分析完成",
            result=ai_result,
            session_id=analyze_request.session_id,
            method=analyze_request.method,
            error=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error in analyze_food")
        raise HTTPException(status_code=500, detail=f"分析过程中发生错误: {str(e)}")

