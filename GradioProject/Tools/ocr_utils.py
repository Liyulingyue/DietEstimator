from paddleocr import PaddleOCR
ocr = PaddleOCR()

def extract_text_from_image(img_path, region=None):
    """
    从图片中提取文字
    
    Args:
        img_path: 图片路径
        region: 可选的区域参数，用于后续扩展定位区域
        
    Returns:
        str: 识别出的文本
    """
    print(f"[ocr_utils] extract_text_from_image called with img_path={img_path}, region={region}")
    # region可用于后续扩展定位区域
    result = ocr.ocr(img_path)
    text = '\n'.join(result[0]['rec_texts'])
    return text
