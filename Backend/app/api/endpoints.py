"""
API路由集中管理模块
此模块负责将所有子模块的路由聚合在一起，对外提供统一的API入口
"""
from fastapi import APIRouter

from app.api import health, ai_estimate, records, auth, connection

# 创建主路由器实例
router = APIRouter()

# 包含各个子模块的路由器
router.include_router(health.router, prefix="", tags=["系统"])
router.include_router(auth.router, prefix="/auth", tags=["认证"])
router.include_router(ai_estimate.router, prefix="/ai", tags=["AI估算"])
router.include_router(records.router, prefix="/records", tags=["饮食记录"])
router.include_router(connection.router, prefix="/connection", tags=["连接测试"])