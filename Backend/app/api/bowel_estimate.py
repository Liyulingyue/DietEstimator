from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from typing import List, Optional
from sqlalchemy.orm import Session
import httpx
import logging
import json
import time

from app.core.database import get_db
from app.core.config import settings
from app.api.auth_middleware import require_auth, optional_auth, get_current_user
from app.api.auth import UserInfo
from app.models.models import DietRecord, User
from app.models.schemas import AnalyzeRequest, BowelAnalyzeResponse

router = APIRouter(prefix="/bowel_estimate", tags=["bowel_estimate"])
logger = logging.getLogger(__name__)

def _backend_url(path: str) -> str:
    return f"{settings.AI_BACKEND_URL.rstrip('/')}{path}"

def validate_bowel_analyze_request(
    session_id: Optional[str] = Form(default=""),
    user_id: Optional[str] = Form(default=""),
    method: str = Form(default="pure_llm"),
    model_url: Optional[str] = Form(default=""),
    model_name: Optional[str] = Form(default=""),
    api_key: Optional[str] = Form(default=""),
    call_preference: str = Form(default="server"),
) -> AnalyzeRequest:
    """验证粪便分析请求参数"""
    return AnalyzeRequest(
        session_id=session_id,
        user_id=user_id,
        method=method,
        model_url=model_url,
        model_name=model_name,
        api_key=api_key,
        call_preference=call_preference
    )

@router.post("/analyze", response_model=BowelAnalyzeResponse)
async def analyze_bowel(
    files: List[UploadFile] = File(...),
    analyze_request: AnalyzeRequest = Depends(validate_bowel_analyze_request),
    db: Session = Depends(get_db),
) -> BowelAnalyzeResponse:
    """
    粪便分析接口 - 接收图片、会话信息和AI配置，调用AI后端进行分析

    Args:
        files: 上传的粪便图片文件列表
        analyze_request: 验证后的分析请求参数
        db: 数据库会话

    Returns:
        分析结果，包括成功状态、消息和分析内容
    """
    logger.debug(f"analyze_bowel called with session_id={analyze_request.session_id}, user_id={analyze_request.user_id}, method={analyze_request.method}, model_name={analyze_request.model_name}, files count={len(files)}")

    if not files:
        logger.warning("No files provided to analyze_bowel")
        raise HTTPException(status_code=400, detail="未提供图片文件")

    try:
        # 基于Session进行会话有效性判断
        session_id = analyze_request.session_id or ""
        current_user = get_current_user(session_id)

        call_preference = (analyze_request.call_preference or "server").lower()

        # 如果会话有效且用户有足够的服务调用点，并且明确选择服务器优先，则使用服务器配置
        use_server_config = (
            call_preference == "server" and
            current_user is not None and
            current_user.is_logged_in and
            current_user.server_credits > 0
        )

        if call_preference == "server" and not use_server_config:
            if current_user and current_user.is_logged_in:
                logger.warning(
                    "用户 %s 选择服务器模式但调用点不足 (剩余: %s)，将自动切换到自定义配置",
                    current_user.username,
                    current_user.server_credits
                )
            else:
                logger.info("未检测到有效会话，服务器模式将自动退回到自定义模式")
            call_preference = "custom"

        if not session_id:
            session_id = f"guest-{int(time.time() * 1000)}"
            logger.debug("生成游客会话ID: %s", session_id)

        user_id = analyze_request.user_id or (current_user.user_id if current_user else "guest")

        analyze_request.session_id = session_id
        analyze_request.user_id = user_id

        # 根据条件选择AI配置
        if use_server_config:
            model_url = settings.MODEL_URL
            model_name = settings.MODEL_NAME
            api_key = settings.MODEL_KEY
            logger.info(f"用户 {current_user.username} 使用服务器配置 (剩余调用点: {current_user.server_credits})")
        else:
            model_url = analyze_request.model_url
            model_name = analyze_request.model_name
            api_key = analyze_request.api_key
            if current_user and current_user.is_logged_in:
                logger.info(f"用户 {current_user.username} 使用自定义配置")
            else:
                logger.info("使用自定义配置（会话无效）")

            if call_preference == "custom":
                missing_fields = [
                    field_name
                    for field_name, value in {
                        "model_url": model_url,
                        "model_name": model_name,
                        "api_key": api_key
                    }.items()
                    if not value
                ]
                if missing_fields:
                    logger.error("自定义配置缺少必要参数: %s", ", ".join(missing_fields))
                    raise HTTPException(
                        status_code=400,
                        detail=f"自定义配置缺少必要参数: {', '.join(missing_fields)}"
                    )

        # 粪便分析目前只支持pure_llm方法
        if analyze_request.method != "pure_llm":
            logger.warning(f"Unsupported method for bowel analysis: {analyze_request.method}, defaulting to pure_llm")
            analyze_request.method = "pure_llm"

        # AI后端粪便分析接口
        ai_endpoint = "/api/v1/bowel-estimate/pure-llm"

        # 转发到AI后端进行分析
        url = f"{settings.AI_BACKEND_URL.rstrip('/')}{ai_endpoint}"
        logger.info(f"Forwarding bowel analysis request to AI backend: {url}")

        logger.debug(f"AI config data: model_url={model_url}, model_name={model_name}")

        # 读取第一个文件进行分析
        file0 = files[0]
        content = await file0.read()
        logger.info(f"File details: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                # 准备AI配置数据
                ai_config_data = {
                    'model_url': model_url,
                    'model_name': model_name,
                    'api_key': api_key,
                    'method': analyze_request.method,
                    'call_preference': call_preference
                }

                resp = await client.post(
                    url,
                    data=ai_config_data,  # 发送AI配置数据
                    files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')}
                )
                logger.debug(f"AI backend response status={resp.status_code}")
            except Exception as e:
                logger.exception('Error forwarding to AI backend (bowel analyze)')
                raise HTTPException(status_code=502, detail=f"AI后端连接失败: {str(e)}")

            try:
                ai_result = resp.json()
                logger.info(f"AI backend bowel analysis response: {ai_result}")
            except Exception:
                body = await resp.aread()
                logger.error('Non-JSON response from AI backend (bowel analyze): %s', body)
                raise HTTPException(status_code=502, detail='AI后端返回无效响应')

            if resp.status_code != 200:
                logger.error('AI backend returned error: %s', ai_result)
                raise HTTPException(status_code=resp.status_code, detail=f"AI分析失败: {ai_result.get('message', '未知错误')}")

        # 分析成功，如果使用了服务器配置则扣除调用点
        if use_server_config:
            # 更新数据库中的调用点
            user = db.query(User).filter(User.id == int(current_user.user_id)).first()
            if user:
                user.server_credits -= 1
                db.commit()
                logger.info(f"用户 {current_user.username} 消耗1个服务器调用点，剩余: {user.server_credits}")
            else:
                logger.error(f"扣除调用点时未找到用户 {current_user.user_id}")

        # 从AI结果中提取关键字段
        color = ai_result.get('color')
        quantity = ai_result.get('quantity')
        shape = ai_result.get('shape')
        health_comment = ai_result.get('health_comment')
        analysis_basis = ai_result.get('analysis_basis')

        return BowelAnalyzeResponse(
            success=True,
            message="分析完成",
            result=ai_result,
            session_id=session_id,
            method=analyze_request.method,
            error=None,
            color=color,
            quantity=quantity,
            shape=shape,
            health_comment=health_comment,
            analysis_basis=analysis_basis
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error in analyze_bowel")
        raise HTTPException(status_code=500, detail=f"分析过程中发生错误: {str(e)}")

@router.post("/pure_llm")
async def proxy_bowel_pure_llm(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    user_id: str = "1"
):
    """将请求原样中转到 AI 后端的粪便 pure_llm 接口"""
    logger.debug(f"proxy_bowel_pure_llm called with files={files}, user_id={user_id}")
    if not files:
        logger.warning("No files provided to proxy_bowel_pure_llm")
        raise HTTPException(status_code=400, detail="未提供图片文件")
    file0 = files[0]
    content = await file0.read()
    logger.info(f"proxy_bowel_pure_llm received file: name={file0.filename}, content_type={file0.content_type}, size={len(content)}")
    url = _backend_url('/api/v1/bowel-estimate/pure-llm')
    logger.debug(f"Forwarding to AI backend: url={url}")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, files={'files': (file0.filename or 'image.jpg', content, file0.content_type or 'image/jpeg')})
            logger.debug(f"AI backend response status={resp.status_code}")
        except Exception as e:
            logger.exception('Error forwarding to AI backend (bowel pure_llm)')
            raise HTTPException(status_code=502, detail=str(e))
        try:
            data = resp.json()
            logger.info(f"AI backend bowel pure_llm response: {data}")
        except Exception:
            body = await resp.aread()
            logger.error('Non-JSON response from AI backend (bowel pure_llm): %s', body)
            raise HTTPException(status_code=502, detail='Invalid response from AI backend')
        if resp.status_code != 200:
            logger.error('AI backend bowel pure_llm returned error: %s', data)
            raise HTTPException(status_code=resp.status_code, detail=data)
        return data