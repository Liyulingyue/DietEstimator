from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
import httpx
import logging

from app.core.database import get_db
from app.core.config import settings

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
