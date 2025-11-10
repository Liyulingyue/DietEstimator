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
        reload=False, # Disable auto-reload for production
        log_level="info"
    )