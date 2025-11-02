"""
LLM服务封装
基于百度文心一言API的语言模型服务
"""

import json
from typing import List, Dict, Optional
import openai
import base64
import tempfile
import os

# 导入prompt_helper（使用相对导入）
from ..utils.prompt_helper import (
    get_prompt_single_image_analysis,
    get_prompt_multi_image_analysis,
    get_prompt_nutrition_analysis,
    get_prompt_portion_check,
    get_prompt_portion_analysis,
    extract_json_from_string
)

OPENAI_API_URL = "https://aistudio.baidu.com/llm/lmapi/v3"
# ERNIE-4.5-VL-28B-A3B: 图片理解模型
# ERNIE-4.5-21B-A3B: 文本对话模型

class LLMService:
    def __init__(self):
        self.vision_model = "ERNIE-4.5-VL-28B-A3B"
        self.text_model = "ERNIE-4.5-21B-A3B"
    
    def _safe_json_parse(self, response: str) -> dict:
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
                print(f"[LLMService] No JSON found in response: {response}")
                return {}
            
            # 然后解析为字典
            result = json.loads(json_str)
            return result if isinstance(result, dict) else {}
            
        except json.JSONDecodeError as e:
            print(f"[LLMService] JSON decode error: {e}, response: {response}")
            return {}
        except Exception as e:
            print(f"[LLMService] JSON parse error: {e}, response: {response}")
            return {}
    
    def get_openai_response(self, messages: List[Dict], model: str, image_path: Optional[str] = None, api_key: str = None) -> str:
        """
        调用OpenAI兼容的API获取响应
        
        Args:
            messages: 消息列表
            model: 模型名称
            image_path: 图片路径（可选）
            api_key: API密钥
            
        Returns:
            模型响应文本
        """
        try:
            client = openai.OpenAI(
                api_key=api_key,
                base_url=OPENAI_API_URL
            )
            
            if image_path:
                with open(image_path, "rb") as f:
                    img_base64 = base64.b64encode(f.read()).decode()
                messages[0]["content"] = [
                    {"type": "text", "text": messages[0]["content"]},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}}
                ]
            
            response = client.chat.completions.create(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLMService] API request failed: {e}")
            return "API请求失败"
    
    def get_openai_response_from_bytes(self, messages: List[Dict], model: str, image_bytes: bytes, api_key: str = None) -> str:
        """
        从图片字节流调用API获取响应
        
        Args:
            messages: 消息列表
            model: 模型名称
            image_bytes: 图片字节流
            api_key: API密钥
            
        Returns:
            模型响应文本
        """
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_bytes)
                temp_file.flush()
                
                result = self.get_openai_response(messages, model, temp_file.name, api_key)
                
                # 清理临时文件
                os.unlink(temp_file.name)
                
                return result
        except Exception as e:
            print(f"[LLMService] Image bytes processing failed: {e}")
            return "图片处理失败"
    
    def check_nutrition_table(self, image_path: str, api_key: str) -> bool:
        """
        检查图片中是否包含营养成分表
        
        Args:
            image_path: 图片路径
            api_key: API密钥
            
        Returns:
            是否包含营养成分表
        """
        try:
            prompt = """请判断这张图片中是否包含营养成分表或营养标签。

            请严格按照以下JSON格式返回：
            {"是否包含营养成分表": true/false}

            注意：
            - 只有包含明确的营养成分表（如能量、蛋白质、脂肪、碳水化合物等营养信息）才返回true
            - 普通的产品信息、价格标签、配料表等不算营养成分表
            """
            
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.vision_model, image_path, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            return result.get("是否包含营养成分表", False)
            
        except Exception as e:
            print(f"[LLMService] Check nutrition table failed: {e}")
            return False
    
    def check_food_portion(self, image_path: str, api_key: str) -> Dict:
        """
        检查图片中是否包含食物份量信息
        
        Args:
            image_path: 图片路径
            api_key: API密钥
            
        Returns:
            包含份量检测结果的字典
        """
        try:
            prompt = get_prompt_portion_check()
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.vision_model, image_path, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            return {
                "是否包含份量信息": result.get("是否包含份量信息", False),
                "份量类型": result.get("份量类型", "未知")
            }
            
        except Exception as e:
            print(f"[LLMService] Check food portion failed: {e}")
            return {"是否包含份量信息": False, "份量类型": "未知"}
    
    def analyze_nutrition_info(self, image_path: str, ocr_text: str, api_key: str) -> Dict:
        """
        分析营养成分信息
        
        Args:
            image_path: 图片路径
            ocr_text: OCR提取的文本
            api_key: API密钥
            
        Returns:
            营养分析结果
        """
        try:
            prompt = get_prompt_nutrition_analysis(ocr_text)
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.text_model, None, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            
            if result:
                return {"状态": "成功", "分析结果": result}
            else:
                return {"状态": "失败", "错误信息": "无法解析营养成分信息"}
                
        except Exception as e:
            print(f"[LLMService] Analyze nutrition info failed: {e}")
            return {"状态": "失败", "错误信息": str(e)}
    
    def analyze_food_portion(self, image_path: str, ocr_text: str, api_key: str) -> Dict:
        """
        分析食物份量信息
        
        Args:
            image_path: 图片路径
            ocr_text: OCR提取的文本
            api_key: API密钥
            
        Returns:
            份量分析结果
        """
        try:
            prompt = get_prompt_portion_analysis(ocr_text)
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.text_model, None, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            
            if result:
                return {"状态": "成功", "分析结果": result}
            else:
                return {"状态": "失败", "错误信息": "无法解析份量信息"}
                
        except Exception as e:
            print(f"[LLMService] Analyze food portion failed: {e}")
            return {"状态": "失败", "错误信息": str(e)}
    
    def analyze_single_image_calories(self, image_path: str, api_key: str) -> Dict:
        """
        分析单张图片的热量
        
        Args:
            image_path: 图片路径
            api_key: API密钥
            
        Returns:
            热量分析结果
        """
        try:
            prompt = get_prompt_single_image_analysis()
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.vision_model, image_path, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            
            if result and "热量" in result:
                return {"状态": "成功", "热量": result["热量"], "估算依据": result.get("估算依据", "")}
            else:
                return {"状态": "失败", "错误信息": "无法分析图片热量"}
                
        except Exception as e:
            print(f"[LLMService] Analyze single image calories failed: {e}")
            return {"状态": "失败", "错误信息": str(e)}
    
    def summarize_multi_image_calories(self, single_results: List[tuple], api_key: str) -> Dict:
        """
        综合多张图片的热量分析
        
        Args:
            single_results: 单张图片分析结果列表，格式为[(图片序号, 热量, 依据), ...]
            api_key: API密钥
            
        Returns:
            综合分析结果
        """
        try:
            prompt = get_prompt_multi_image_analysis(single_results)
            messages = [{"role": "user", "content": prompt}]
            response = self.get_openai_response(messages, self.text_model, None, api_key)
            
            # 解析JSON响应
            result = self._safe_json_parse(response)
            
            if result and "总热量" in result:
                return {"状态": "成功", "总热量": result["总热量"], "估算依据": result.get("估算依据", "")}
            else:
                return {"状态": "失败", "错误信息": "无法综合分析多张图片"}
                
        except Exception as e:
            print(f"[LLMService] Summarize multi image calories failed: {e}")
            return {"状态": "失败", "错误信息": str(e)}

# 全局LLM服务实例
llm_service = LLMService()
