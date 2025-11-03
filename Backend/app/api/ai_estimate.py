from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from typing import List, Optional
from sqlalchemy.orm import Session
import httpx
import logging
import json

from app.core.database import get_db
from app.core.config import settings
from app.api.auth_middleware import require_auth, optional_auth
from app.api.auth import UserInfo
from app.models.models import DietRecord

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

@router.post("/test-connection")
async def proxy_test_connection(
    model_url: str = Form(...),
    model_name: str = Form(...),
    api_key: str = Form(...),
    current_user: Optional[UserInfo] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """将测试连接请求中转到 AI 后端"""
    logger.debug(f"proxy_test_connection called with model_url={model_url}, model_name={model_name}")
    logger.debug(f"Current user: {current_user.username if current_user else 'Not logged in'}")

    url = _backend_url('/api/v1/test-connection')
    logger.debug(f"Forwarding to AI backend: url={url}")
    
    # 准备表单数据
    data = {
        'model_url': model_url,
        'model_name': model_name,
        'api_key': api_key
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, data=data)
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (test-connection)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend test-connection response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (test-connection): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend test-connection returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data


@router.post("/analyze")
async def analyze_food(
    files: List[UploadFile] = File(...),
    session_id: str = Form(...),
    user_id: str = Form(...),
    method: str = Form(default="pure_llm"),
    db: Session = Depends(get_db),
):
    """
    食物分析接口 - 接收图片、会话信息和AI配置，调用AI后端进行分析，并保存记录
    
    Args:
        files: 上传的食物图片文件列表
        session_id: 用户会话ID
        user_id: 用户ID
        method: 分析方法（pure_llm, llm_ocr_hybrid, nutrition_table, food_portion）
        db: 数据库会话
        
    Returns:
        分析结果，包括成功状态、消息和分析内容
    """
    logger.debug(f"analyze_food called with session_id={session_id}, user_id={user_id}, method={method}, files count={len(files)}")
    
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
        }.get(method, "/api/v1/estimate/pure_llm")
        
        # 转发到AI后端进行分析
        url = f"{settings.AI_BACKEND_URL.rstrip('/')}{ai_endpoint}"
        logger.info(f"Forwarding analysis request to AI backend: {url}")
        
        # 读取第一个文件进行分析
        file0 = files[0]
        content = await file0.read()
        logger.info(f"File details: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                resp = await client.post(
                    url,
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
                user_id=user_id,
                image_url="",  # 暂不保存图片URL
                analysis_method=method,
                analysis_result=json.dumps(ai_result, ensure_ascii=False),
                ai_analysis=json.dumps(ai_result, ensure_ascii=False),
            )
            db.add(diet_record)
            db.commit()
            db.refresh(diet_record)
            logger.info(f"Diet record saved: id={diet_record.id}, user_id={user_id}")
        except Exception as e:
            logger.exception("Error saving diet record to database")
            db.rollback()
            # 不影响返回结果，继续返回AI的分析结果
        
        return {
            "success": True,
            "message": "分析完成",
            "result": ai_result,
            "session_id": session_id,
            "method": method,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error in analyze_food")
        raise HTTPException(status_code=500, detail=f"分析过程中发生错误: {str(e)}")

