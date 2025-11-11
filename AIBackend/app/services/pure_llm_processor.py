"""
纯LLM热量估算处理器
直接调用llm_helper函数，绕开service层
"""

from typing import List, Dict, Any
import tempfile
import os

from ..utils.llm_helper import get_llm_answer, get_vl_llm_answer, parse_json_result
from ..utils.prompt_helper import get_prompt_single_image_analysis, get_prompt_multi_image_analysis


def process_pure_llm(image_files: List[bytes], api_key: str, model_url: str, model_name: str) -> Dict[str, Any]:
    """
    纯LLM方案处理图片分析

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
        # 创建临时文件
        temp_files = []
        for image_bytes in image_files:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            temp_file.write(image_bytes)
            temp_file.flush()
            temp_files.append(temp_file.name)
            temp_file.close()

        # 单张图片进行推理
        single_results = []
        for i, file_path in enumerate(temp_files):
            result = _analyze_single_image_calories(file_path, api_key, model_url, model_name)
            single_results.append(result)

        # 筛选出有效的结果
        single_useful_results = []
        unuseful_results = []
        for i, result in enumerate(single_results):
            if result.get("状态") == "成功":
                food_name = result.get("食物名称", "未知食物")
                calories = result.get("热量", "未知")
                reason = result.get("估算依据", "无说明")
                single_useful_results.append((i + 1, food_name, calories, reason))
            else:
                error_msg = result.get("错误信息", "未知错误")
                unuseful_results.append((i + 1, error_msg))

        # 清理临时文件
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass

        # 生成结构化输出结果
        if len(single_useful_results) == 0:
            return {"error": "没有有效图片"}
        elif len(single_useful_results) == 1:
            (index, food_name, calories, reason) = single_useful_results[0]
            return {
                "food_name": food_name,
                "calories": calories,
                "estimation_basis": reason
            }
        else:
            # 多张图片的情况，综合分析
            result = _summarize_multi_image_calories(single_useful_results, api_key, model_url, model_name)
            if result.get("状态") == "成功":
                total_calories = result.get("总热量", "未知")
                total_reason = result.get("估算依据", "无说明")
                # 使用综合分析返回的食物名称
                food_name = result.get("食物名称", "多种食物")
                return {
                    "food_name": food_name,
                    "calories": total_calories,
                    "estimation_basis": total_reason
                }
            else:
                error_msg = result.get("错误信息", "未知错误")
                return {"error": f"综合分析失败: {error_msg}"}

    except Exception as e:
        return {"error": f"处理出错: {str(e)}"}


def _analyze_single_image_calories(image_path: str, api_key: str, model_url: str = None, model_name: str = None) -> Dict:
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
        response = get_vl_llm_answer(prompt, image_path, api_key, model_url, model_name)

        # 解析JSON响应
        result = parse_json_result(response)

        if result and "热量" in result:
            return {
                "状态": "成功",
                "食物名称": result.get("食物名称", "未知食物"),
                "热量": result["热量"],
                "估算依据": result.get("估算依据", "")
            }
        else:
            return {"状态": "失败", "错误信息": "无法分析图片热量"}

    except Exception as e:
        print(f"[PureLLMProcessor] Analyze single image calories failed: {e}")
        return {"状态": "失败", "错误信息": str(e)}


def _summarize_multi_image_calories(single_results: List[tuple], api_key: str, model_url: str = None, model_name: str = None) -> Dict:
    """
    综合多张图片的热量分析

    Args:
        single_results: 单张图片分析结果列表，格式为[(图片序号, 食物名称, 热量, 依据), ...]
        api_key: API密钥

    Returns:
        综合分析结果
    """
    try:
        prompt = get_prompt_multi_image_analysis(single_results)
        response = get_llm_answer(prompt, api_key, model_url, model_name)

        # 解析JSON响应
        result = parse_json_result(response)

        if result and "热量" in result:
            return {"状态": "成功", "食物名称": result.get("食物名称", "多种食物"), "热量": result["热量"], "估算依据": result.get("估算依据", "")}
        else:
            return {"状态": "失败", "错误信息": "无法综合分析多张图片"}

    except Exception as e:
        print(f"[PureLLMProcessor] Summarize multi image calories failed: {e}")
        return {"状态": "失败", "错误信息": str(e)}