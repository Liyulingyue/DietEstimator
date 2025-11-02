#!/usr/bin/env python3
"""
Run script for AIBackend FastAPI application
启动AIBackend FastAPI应用的脚本
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,  # 开发模式下启用自动重载
        log_level="info"
    )