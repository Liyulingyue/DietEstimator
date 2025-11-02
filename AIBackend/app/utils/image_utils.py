"""
图片处理工具函数
"""

import io
from PIL import Image
import base64
from typing import Optional

def validate_image(image_bytes: bytes) -> bool:
    """
    验证图片格式是否有效
    
    Args:
        image_bytes: 图片字节流
        
    Returns:
        是否为有效图片
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        return True
    except Exception:
        return False

def resize_image(image_bytes: bytes, max_size: int = 1024) -> bytes:
    """
    调整图片大小
    
    Args:
        image_bytes: 原始图片字节流
        max_size: 最大尺寸
        
    Returns:
        调整后的图片字节流
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # 计算新尺寸
        width, height = image.size
        if max(width, height) > max_size:
            if width > height:
                new_width = max_size
                new_height = int(height * max_size / width)
            else:
                new_height = max_size
                new_width = int(width * max_size / height)
            
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 转换为字节流
        output = io.BytesIO()
        format = image.format or 'JPEG'
        image.save(output, format=format, quality=95)
        return output.getvalue()
        
    except Exception as e:
        print(f"图片调整失败: {e}")
        return image_bytes

def image_to_base64(image_bytes: bytes) -> str:
    """
    将图片转换为base64编码
    
    Args:
        image_bytes: 图片字节流
        
    Returns:
        base64编码字符串
    """
    return base64.b64encode(image_bytes).decode('utf-8')

def base64_to_image(base64_str: str) -> bytes:
    """
    将base64编码转换为图片字节流
    
    Args:
        base64_str: base64编码字符串
        
    Returns:
        图片字节流
    """
    return base64.b64decode(base64_str)

def get_image_info(image_bytes: bytes) -> Optional[dict]:
    """
    获取图片信息
    
    Args:
        image_bytes: 图片字节流
        
    Returns:
        图片信息字典
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return {
            "format": image.format,
            "mode": image.mode,
            "size": image.size,
            "width": image.size[0],
            "height": image.size[1]
        }
    except Exception as e:
        print(f"获取图片信息失败: {e}")
        return None
