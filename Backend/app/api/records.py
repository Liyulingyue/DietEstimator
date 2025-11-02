from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from typing import List
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import DietRecord
from app.models.schemas import DietRecordResponse, DietRecordRequest

router = APIRouter()


@router.post("/records/add", response_model=DietRecordResponse)
async def add_user_record(
    user_id: str = Form(...),
    analysis_result: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    新增用户饮食记录
    参数：
        user_id: 用户ID
        analysis_result: 大模型分析结果
        file: 上传的图片文件
    返回：
        DietRecordResponse: 创建的记录信息
    """
    try:
        # 暂时使用固定的图片路径，后续可以实现实际的图片存储逻辑
        image_url = "-1"
        
        # 创建新的饮食记录
        db_record = DietRecord(
            user_id=user_id,
            image_url=image_url,
            analysis_result=analysis_result,
            analysis_method="pure_llm"  # 设置默认的分析方法
        )
        
        # 保存到数据库
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        
        return db_record
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建记录失败: {str(e)}")


@router.get("/records/{user_id}", response_model=List[DietRecordResponse])
async def get_user_records(
    user_id: str,
    page: int = -1,
    limit: int = -1,
    db: Session = Depends(get_db)
):
    """
    获取用户的饮食记录
    参数：
        user_id: 用户ID
        page: 页码（从1开始），-1表示获取全部数据
        limit: 每页记录数，0或-1表示获取全部数据
    返回：
        List[DietRecordResponse]: 饮食记录列表，按创建时间降序排序
    """
    # 创建基础查询
    query = db.query(DietRecord)\
        .filter(DietRecord.user_id == user_id)\
        .order_by(DietRecord.created_at.desc())
    
    # 判断是否需要分页
    if page > 0 and limit > 0:
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
    
    # 执行查询
    records = query.all()
    
    # 确保 analysis_method 有默认值
    for record in records:
        if record.analysis_method is None:
            record.analysis_method = ""
    
    return records


@router.delete("/records/{user_id}/{record_id}")
async def delete_user_record(
    user_id: str,
    record_id: int,
    db: Session = Depends(get_db)
):
    """
    删除指定的用户饮食记录
    参数：
        user_id: 用户ID（安全验证）
        record_id: 记录ID
    返回：
        dict: 删除结果信息
    """
    try:
        # 查找指定的记录，同时验证用户ID和记录ID
        record = db.query(DietRecord).filter(
            DietRecord.id == record_id,
            DietRecord.user_id == user_id
        ).first()
        
        # 检查记录是否存在
        if not record:
            raise HTTPException(
                status_code=404, 
                detail=f"未找到用户 {user_id} 的记录 ID {record_id}"
            )
        
        # 删除记录
        db.delete(record)
        db.commit()
        
        return {
            "message": "记录删除成功",
            "deleted_record_id": record_id,
            "user_id": user_id
        }
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"删除记录失败: {str(e)}"
        )