"""
API路由集中管理模块
此模块负责将所有子模块的路由聚合在一起，对外提供统一的API入口
"""
from fastapi import APIRouter

from app.api import health, food_estimate, records, auth, connection, gallery, methods, bowel_estimate

# 创建主路由器实例
router = APIRouter()

# 包含各个子模块的路由器
router.include_router(health.router, tags=["系统"])
router.include_router(auth.router, tags=["认证"])
router.include_router(food_estimate.router, tags=["食物估算"])
router.include_router(bowel_estimate.router, tags=["粪便分析"])
router.include_router(methods.router, tags=["分析方法"])
router.include_router(records.router, tags=["饮食记录"])
router.include_router(connection.router, tags=["连接测试"])
router.include_router(gallery.router, tags=["画廊分享"])