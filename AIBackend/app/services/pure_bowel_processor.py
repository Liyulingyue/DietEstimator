"""
纯LLM粪便分析处理器
直接调用llm_helper函数，绕开service层
"""

from typing import List, Dict, Any
import tempfile
import os

from ..utils.llm_helper import get_llm_answer, get_vl_llm_answer, parse_json_result
from ..utils.prompt_helper import get_prompt_bowel_single_image_analysis


def process_pure_bowel(image_files: List[bytes], api_key: str, model_url: str, model_name: str) -> Dict[str, Any]:
    """
    纯LLM方案处理粪便图片分析
    注意：排便识别只需要一张图片，接口允许上传多张但只分析第一张

    Args:
        image_files: 图片字节流列表
        api_key: API密钥

    Returns:
        结构化分析结果字典
    """
    if not image_files or len(image_files) == 0:
        return {"error": "请先上传图片"}

    if not api_key or api_key.strip() == "":
        return {"error": "请输入API Key"}

    try:
        # 只处理第一张图片
        first_image_bytes = image_files[0]
        
        # 创建临时文件
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        temp_file.write(first_image_bytes)
        temp_file.flush()
        temp_file_path = temp_file.name
        temp_file.close()

        # 分析单张图片
        result = _analyze_single_bowel_image(temp_file_path, api_key, model_url, model_name)

        # 清理临时文件
        try:
            os.unlink(temp_file_path)
        except:
            pass

        # 处理分析结果
        if result.get("状态") == "成功":
            return {
                "color": result.get("颜色", "未知"),
                "quantity": result.get("份量", "未知"),
                "shape": result.get("形态", "未知"),
                "health_comment": result.get("健康点评", ""),
                "analysis_basis": result.get("分析依据", "")
            }
        else:
            error_msg = result.get("错误信息", "未知错误")
            return {"error": f"分析失败: {error_msg}"}

    except Exception as e:
        return {"error": f"处理出错: {str(e)}"}


def _analyze_single_bowel_image(image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> Dict:
    """
    分析单张粪便图片

    Args:
        image_path: 图片路径
        api_key: API密钥

    Returns:
        粪便分析结果
    """
    try:
        prompt = get_prompt_bowel_single_image_analysis()
        response = get_vl_llm_answer(prompt, image_path, api_key, model_url, model_name)

        # 解析JSON响应
        result = parse_json_result(response)

        if result and "颜色" in result:
            return {
                "状态": "成功",
                "颜色": result.get("颜色", "未知"),
                "份量": result.get("份量", "未知"),
                "形态": result.get("形态", "未知"),
                "健康点评": result.get("健康点评", ""),
                "分析依据": result.get("分析依据", "")
            }
        else:
            return {"状态": "失败", "错误信息": "无法分析粪便图片"}

    except Exception as e:
        print(f"[PureBowelProcessor] Analyze single bowel image failed: {e}")
        return {"状态": "失败", "错误信息": str(e)}