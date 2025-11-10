"""
LLM助手模块
封装大模型调用能力的核心函数
"""

import json
from typing import List, Dict, Optional, Any
import openai
import base64
import tempfile
import os

# 导入prompt_helper（使用相对导入）
from ..utils.prompt_helper import extract_json_from_string

def get_llm_answer(prompt: str, api_key: str, model_url: str = None, model_name: str = None) -> str:
    """
    获取纯文本LLM回答

    Args:
        prompt: 提示词
        api_key: API密钥
        model_url: 模型URL（可选）
        model_name: 模型名称（可选）

    Returns:
        LLM响应文本
    """
    try:
        client = openai.OpenAI(
            api_key=api_key,
            base_url=model_url
        )

        messages = [{"role": "user", "content": prompt}]

        response = client.chat.completions.create(
            model=model_name,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLMHelper] Text LLM request failed: {e}")
        return "API请求失败"

def get_vl_llm_answer(prompt: str, image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> str:
    """
    获取视觉语言模型回答

    Args:
        prompt: 提示词
        image_path: 图片路径
        api_key: API密钥
        model_url: 模型URL（可选）
        model_name: 模型名称（可选）

    Returns:
        视觉LLM响应文本
    """
    try:
        client = openai.OpenAI(
            api_key=api_key,
            base_url=model_url
        )

        # 读取图片并转换为base64
        with open(image_path, "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode()

        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
            ]
        }]

        response = client.chat.completions.create(
            model=model_name,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[LLMHelper] Vision LLM request failed: {e}")
        return "API请求失败"

def get_vl_llm_answer_from_bytes(prompt: str, image_bytes: bytes, api_key: str, model_url: str = None, model_name: str = None) -> str:
    """
    从图片字节流获取视觉语言模型回答

    Args:
        prompt: 提示词
        image_bytes: 图片字节流
        api_key: API密钥
        model_url: 模型URL（可选）
        model_name: 模型名称（可选）

    Returns:
        视觉LLM响应文本
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_file.flush()

            result = get_vl_llm_answer(prompt, temp_file.name, api_key, model_url, model_name)

            # 清理临时文件
            os.unlink(temp_file.name)

            return result
    except Exception as e:
        print(f"[LLMHelper] Image bytes processing failed: {e}")
        return "图片处理失败"

def parse_json_result(response: str) -> Dict[str, Any]:
    """
    安全地解析JSON响应

    Args:
        response: API响应字符串

    Returns:
        解析后的字典对象
    """
    try:
        # 首先提取JSON字符串
        json_str = extract_json_from_string(response)
        if not json_str:
            print(f"[LLMHelper] No JSON found in response: {response}")
            return {}

        # 然后解析为字典
        result = json.loads(json_str)
        return result if isinstance(result, dict) else {}

    except json.JSONDecodeError as e:
        print(f"[LLMHelper] JSON decode error: {e}, response: {response}")
        return {}
    except Exception as e:
        print(f"[LLMHelper] JSON parse error: {e}, response: {response}")
        return {}