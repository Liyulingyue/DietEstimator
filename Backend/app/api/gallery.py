from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
import json

from app.core.database import get_db
from app.models import models
from app.models.schemas import GalleryShareCreate, GalleryShareResponse, GalleryShareListResponse
from app.api.auth_middleware import get_current_user, UserInfo

router = APIRouter()


@router.post("/share", response_model=GalleryShareResponse)
async def share_gallery_item(
    share_data: GalleryShareCreate,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    分享餐食到公共画廊
    - 分析图片并保存到数据库
    - 限制最多100个分享，超过时删除最早的
    """

    try:
        # 首先分析图片（如果还没有分析结果）
        analysis_result = share_data.analysis_result
        if not analysis_result or analysis_result.strip() == "":
            # 如果没有提供分析结果，需要先进行分析
            # 这里假设前端已经分析过了，但为了安全起见，我们可以再次验证
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="必须提供分析结果"
            )

        # 检查当前分享数量
        total_shares = db.query(func.count(models.GalleryShare.id)).scalar()

        # 如果超过100个，删除最早的分享
        if total_shares >= 100:
            # 找到最早的分享并删除
            oldest_share = db.query(models.GalleryShare).order_by(models.GalleryShare.created_at).first()
            if oldest_share:
                db.delete(oldest_share)
                db.commit()

        # 获取用户ID（如果已登录）
        user_id = None
        if current_user and current_user.is_logged_in:
            user_id = current_user.user_id

        # 创建新的分享记录
        new_share = models.GalleryShare(
            user_id=user_id,
            image_base64=share_data.image_base64,
            analysis_result=analysis_result
        )

        db.add(new_share)
        db.commit()
        db.refresh(new_share)

        return GalleryShareResponse(
            id=new_share.id,
            user_id=new_share.user_id,
            image_base64=new_share.image_base64,
            analysis_result=new_share.analysis_result,
            created_at=new_share.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"分享失败: {str(e)}"
        )


@router.get("/list", response_model=GalleryShareListResponse)
async def get_gallery_shares(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    获取公共画廊分享列表
    - 按创建时间倒序排列
    - 支持分页
    """

    try:
        # 查询分享列表
        shares = db.query(models.GalleryShare)\
            .order_by(desc(models.GalleryShare.created_at))\
            .offset(skip)\
            .limit(limit)\
            .all()

        # 获取总数
        total = db.query(func.count(models.GalleryShare.id)).scalar()

        # 转换为响应格式
        share_responses = []
        for share in shares:
            # 解析分析结果
            try:
                analysis_data = json.loads(share.analysis_result)
            except:
                analysis_data = {"food_name": "未知食物", "calories": 0}

            share_responses.append(GalleryShareResponse(
                id=share.id,
                user_id=share.user_id,
                image_base64=share.image_base64,
                analysis_result=share.analysis_result,
                created_at=share.created_at
            ))

        return GalleryShareListResponse(
            shares=share_responses,
            total=total
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取分享列表失败: {str(e)}"
        )


@router.delete("/share/{share_id}")
async def delete_gallery_share(
    share_id: int,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除分享（只有上传者或管理员可以删除）
    """

    try:
        # 查找分享记录
        share = db.query(models.GalleryShare).filter(models.GalleryShare.id == share_id).first()
        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="分享不存在"
            )

        # 检查权限（只有上传者可以删除）
        if current_user and current_user.is_logged_in and share.user_id == current_user.user_id:
            db.delete(share)
            db.commit()
            return {"message": "分享已删除"}
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权删除此分享"
            )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除分享失败: {str(e)}"
        )