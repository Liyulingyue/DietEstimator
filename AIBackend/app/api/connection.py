"""
连接测试相关端点
"""

from fastapi import APIRouter
from app.models.schemas import TestConnectionRequest, TestConnectionResponse
from app.services.llm_service import llm_service
import openai

router = APIRouter(prefix="/connection", tags=["connection"])

def test_connection(model_url: str, model_name: str, api_key: str) -> dict:
    """
    测试AI连接连通性

    Args:
        model_url: 模型API地址
        model_name: 模型名称
        api_key: API密钥

    Returns:
        测试结果
    """
    try:
        # 创建OpenAI客户端
        client = openai.OpenAI(
            api_key=api_key,
            base_url=model_url
        )

        # 发送简单的测试消息
        messages = [{"role": "user", "content": "hi"}]

        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=10  # 限制响应长度
        )

        # 检查响应是否成功
        if response.choices and len(response.choices) > 0:
            content = response.choices[0].message.content
            return {
                "status": "success",
                "message": "AI连接测试成功",
                "response": content.strip() if content else "无响应内容"
            }
        else:
            return {
                "status": "error",
                "message": "AI响应为空"
            }

    except openai.AuthenticationError:
        return {
            "status": "error",
            "message": "API密钥无效或认证失败"
        }
    except openai.NotFoundError:
        return {
            "status": "error",
            "message": "模型不存在或API地址错误"
        }
    except openai.RateLimitError:
        return {
            "status": "error",
            "message": "请求频率过高，请稍后再试"
        }
    except openai.APIConnectionError:
        return {
            "status": "error",
            "message": "无法连接到API服务器"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"连接测试失败: {str(e)}"
        }

@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_ai_connection(
    request: TestConnectionRequest
) -> TestConnectionResponse:
    """
    测试AI连接连通性

    Args:
        request: 测试连接请求

    Returns:
        测试结果
    """
    try:
        result = test_connection(request.model_url, request.model_name, request.api_key)
        return TestConnectionResponse(**result)
    except Exception as e:
        return TestConnectionResponse(
            status="error",
            message=f"测试过程中发生错误: {str(e)}",
            response=None
        )