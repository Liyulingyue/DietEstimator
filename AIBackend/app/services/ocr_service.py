"""
PaddleOCR服务封装
"""

from paddleocr import PaddleOCR
import tempfile
import os
from typing import List

class OCRService:
    def __init__(self, lang='ch'):
        """
        初始化OCR服务
        
        Args:
            lang: 语言模式，默认为中文
        """
        self.ocr = PaddleOCR(lang=lang, use_angle_cls=True)

    def recognize_text(self, image_path: str) -> str:
        """
        识别给定图片中的文字并返回结果

        Args:
            image_path: 图片文件路径
            
        Returns:
            识别到的文字信息
        """
        try:
            result = self.ocr.ocr(image_path, cls=True)
            if not result or not result[0]:
                return ""
            
            text_results = []
            for line in result[0]:
                if line and len(line) >= 2:
                    text_results.append(line[1][0])  # 提取识别到的文字
            
            return "\n".join(text_results)
        except Exception as e:
            print(f"OCR识别失败: {e}")
            return ""

    def recognize_text_from_bytes(self, image_bytes: bytes) -> str:
        """
        识别给定图片字节流中的文字并返回结果

        Args:
            image_bytes: 图片字节流
            
        Returns:
            识别到的文字信息
        """
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_bytes)
                temp_file.flush()
                
                result = self.recognize_text(temp_file.name)
                
                # 清理临时文件
                os.unlink(temp_file.name)
                
                return result
        except Exception as e:
            print(f"OCR识别失败: {e}")
            return ""

# 全局OCR服务实例
ocr_service = OCRService()
