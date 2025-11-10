"""
API请求验证器
"""

from fastapi import Form
from app.models.schemas import EstimateRequest

def validate_estimate_request(
    api_key: str = Form(..., description="API密钥"),
    method: str = Form(..., description="分析方法"),
    model_url: str = Form(..., description="模型API地址"),
    model_name: str = Form(..., description="模型名称"),
) -> EstimateRequest:
    """验证估算请求参数"""
    return EstimateRequest(
        api_key=api_key,
        method=method,
        model_url=model_url,
        model_name=model_name
    )