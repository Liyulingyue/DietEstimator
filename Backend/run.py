#!/usr/bin/env python3
"""
Run script for Backend FastAPI application (Development)
启动Backend FastAPI应用的开发环境脚本
"""

import subprocess
import time
import uvicorn
import sys
import os
from alembic.config import Config
from alembic import command

def apply_migrations():
    """应用所有待处理的 Alembic 迁移"""
    try:
        # 获取 alembic.ini 的路径（与 run.py 同级）
        alembic_cfg_path = os.path.join(os.path.dirname(__file__), "alembic.ini")
        
        if not os.path.exists(alembic_cfg_path):
            print("警告: alembic.ini 文件不存在，跳过迁移应用")
            return
            
        print("正在应用数据库迁移...")
        alembic_cfg = Config(alembic_cfg_path)
        command.upgrade(alembic_cfg, "head")
        print("数据库迁移应用完成")
        
    except Exception as e:
        print(f"应用数据库迁移时出错: {e}")
        print("继续启动应用，但数据库结构可能不一致")

def main():
    try:
        # 应用数据库迁移
        apply_migrations()
        
        print("启动 FastAPI 应用...")
        # 运行 FastAPI 应用
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n正在停止服务...")
        print("服务已停止")
    except Exception as e:
        print(f"发生错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()