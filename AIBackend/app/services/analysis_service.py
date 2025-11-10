"""
食物分析服务
专门处理各种食物分析方法，解耦自llm_service
"""

from typing import List, Dict, Any, Optional
import tempfile
import os
from .llm_service import llm_service
from .ocr_service import ocr_service

class FoodAnalysisService:
    """食物分析服务"""

    def __init__(self):
        self.llm_service = llm_service
        self.ocr_service = ocr_service

    def analyze_single_image(self, image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> Dict[str, Any]:
        """
        单图片食物分析

        Args:
            image_path: 图片路径
            api_key: API密钥
            model_url: 模型URL（可选）
            model_name: 模型名称（可选）

        Returns:
            分析结果字典
        """
        return self.llm_service.analyze_single_image(image_path, api_key, model_url, model_name)

    def analyze_multi_images(self, image_paths: List[str], api_key: str, model_url: str = None, model_name: str = None) -> Dict[str, Any]:
        """
        多图片食物分析

        Args:
            image_paths: 图片路径列表
            api_key: API密钥
            model_url: 模型URL（可选）
            model_name: 模型名称（可选）

        Returns:
            分析结果字典
        """
        return self.llm_service.analyze_multi_images(image_paths, api_key, model_url, model_name)

    def analyze_nutrition_table(self, image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> Dict[str, Any]:
        """
        营养成分表分析

        Args:
            image_path: 图片路径
            api_key: API密钥
            model_url: 模型URL（可选）
            model_name: 模型名称（可选）

        Returns:
            分析结果字典
        """
        return self.llm_service.analyze_nutrition_table(image_path, api_key, model_url, model_name)

    def check_portion_size(self, image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> Dict[str, Any]:
        """
        食物份量检测

        Args:
            image_path: 图片路径
            api_key: API密钥
            model_url: 模型URL（可选）
            model_name: 模型名称（可选）

        Returns:
            份量检测结果字典
        """
        return self.llm_service.check_portion_size(image_path, api_key, model_url, model_name)

    def check_nutrition_table(self, image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> bool:
        """
        检查图片是否包含营养成分表

        Args:
            image_path: 图片路径
            api_key: API密钥
            model_url: 模型URL（可选）
            model_name: 模型名称（可选）

        Returns:
            是否包含营养成分表
        """
        return self.llm_service.check_nutrition_table(image_path, api_key, model_url, model_name)

    def extract_text_with_ocr(self, image_path: str) -> str:
        """
        使用OCR提取图片中的文字

        Args:
            image_path: 图片路径

        Returns:
            提取的文字内容
        """
        return self.ocr_service.recognize_text(image_path)

# 创建全局实例
food_analysis_service = FoodAnalysisService()