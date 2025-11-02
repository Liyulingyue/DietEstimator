import json
from typing import List, Dict
import openai
import base64
import requests
import traceback
from Tools.prompt_helper import (
    prompt_nutrition_table, 
    prompt_net_content, 
    extract_json_from_model, 
    get_prompt_nutrition_energy, 
    get_prompt_nutrition_net_content, 
    get_prompt_nutrition_estimate, 
    extract_json_from_string, 
    get_prompt_nutrition_calculate,
    get_prompt_single_image_analysis,
    get_prompt_multi_image_analysis,
    get_prompt_nutrition_analysis,
    get_prompt_portion_check,
    get_prompt_portion_analysis
)
from Tools.ocr_utils import extract_text_from_image

OPENAI_API_URL = "https://aistudio.baidu.com/llm/lmapi/v3"
# ERNIE-4.5-VL-28B-A3B: 图片理解模型
# ERNIE-4.5-21B-A3B: 文本对话模型

def get_openai_response(messages, model, image_path=None, api_key=None):
    print(f"[model_api] get_openai_response called with model={model}, image_path={image_path}, api_key={api_key}")
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
        print(f"[model_api] API request failed: {e}")
        return "API请求失败"

def check_nutrition_table(img_path, api_key=None):
    """
    检查图片是否包含营养成分表
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        bool: True表示包含营养成分表，False表示不包含
    """
    print(f"[model_api] check_nutrition_table called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = prompt_nutrition_table()
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in check_nutrition_table")
            return False
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in check_nutrition_table result")
            return False
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        is_contained = json_data.get("是否包含营养成分表", 0)
        bool_contained = is_contained == 1 or is_contained == "1"
        
        return bool_contained
        
    except Exception as e:
        print(f"[model_api] Error in check_nutrition_table: {e}")
        return False

def analyze_nutrition_info(img_path, ocr_text, api_key=None):
    """
    根据OCR文本和图片分析营养成分表信息
    
    Args:
        img_path: 图片路径
        ocr_text: OCR识别出的文本
        api_key: API密钥
    
    Returns:
        dict: 包含分析状态和结果的字典
    """
    print(f"[model_api] analyze_nutrition_info called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 获取提示词
        prompt = get_prompt_nutrition_analysis(ocr_text)
        messages = [{"role": "user", "content": prompt}]
        
        # 调用大模型
        response = get_openai_response(
            messages=messages,
            model="ERNIE-4.5-VL-28B-A3B",
            image_path=img_path,
            api_key=api_key
        )
        
        if response == "API请求失败":
            return {"状态": "失败", "错误信息": "API请求失败"}
            
        # 解析结果
        json_str = extract_json_from_string(response)
        if not json_str:
            return {"状态": "失败", "错误信息": "结果解析失败"}
            
        data = json.loads(json_str)
        return {
            "状态": "成功",
            "分析结果": data
        }
        
    except Exception as e:
        print(f"[model_api] Error in analyze_nutrition_info: {e}")
        return {"状态": "失败", "错误信息": str(e)}

def check_food_weight(img_path, api_key=None):
    """
    检查图片是否包含食物重量信息
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        bool: True表示包含食物重量信息，False表示不包含
    """
    print(f"[model_api] check_food_weight called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = prompt_weight_check()
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in check_food_weight")
            return False
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in check_food_weight result")
            return False
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        has_weight = json_data.get("是否包含重量信息", 0)
        return has_weight == 1 or has_weight == "1"
        
    except Exception as e:
        print(f"[model_api] Error in check_food_weight: {e}")
        return False

def analyze_food_weight(img_path, ocr_text, api_key=None):
    """
    根据OCR文本和图片分析食物重量信息
    
    Args:
        img_path: 图片路径
        ocr_text: OCR识别出的文本
        api_key: API密钥
    
    Returns:
        dict: 包含分析状态和结果的字典
    """
    print(f"[model_api] analyze_food_weight called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 获取提示词
        prompt = get_prompt_weight_analysis(ocr_text)
        messages = [{"role": "user", "content": prompt}]
        
        # 调用大模型
        response = get_openai_response(
            messages=messages,
            model="ERNIE-4.5-VL-28B-A3B",
            image_path=img_path,
            api_key=api_key
        )
        
        if response == "API请求失败":
            return {"状态": "失败", "错误信息": "API请求失败"}
            
        # 解析结果
        json_str = extract_json_from_string(response)
        if not json_str:
            return {"状态": "失败", "错误信息": "结果解析失败"}
            
        data = json.loads(json_str)
        return {
            "状态": "成功",
            "分析结果": data
        }
        
    except Exception as e:
        print(f"[model_api] Error in analyze_food_weight: {e}")
        return {"状态": "失败", "错误信息": str(e)}

def check_food_portion(img_path, api_key=None):
    """
    检查图片是否包含食物份量信息
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        dict: 包含检查结果的字典，包括是否包含份量信息、份量类型等
    """
    print(f"[model_api] check_food_portion called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_portion_check()
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in check_food_portion")
            return {"是否包含份量信息": False, "份量类型": "未知", "解释": "API请求失败"}
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in check_food_portion result")
            return {"是否包含份量信息": False, "份量类型": "未知", "解释": "结果解析失败"}
        
        json_data = json.loads(json_str)
        return json_data
        
    except Exception as e:
        print(f"[model_api] Error in check_food_portion: {e}")
        return {"是否包含份量信息": False, "份量类型": "未知", "解释": str(e)}

def analyze_food_portion(img_path, ocr_text, api_key=None):
    """
    根据OCR文本和图片分析食物份量信息
    
    Args:
        img_path: 图片路径
        ocr_text: OCR识别出的文本
        api_key: API密钥
    
    Returns:
        dict: 包含分析状态和结果的字典
    """
    print(f"[model_api] analyze_food_portion called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 获取提示词
        prompt = get_prompt_portion_analysis(ocr_text)
        messages = [{"role": "user", "content": prompt}]
        
        # 调用大模型
        response = get_openai_response(
            messages=messages,
            model="ERNIE-4.5-VL-28B-A3B",
            image_path=img_path,
            api_key=api_key
        )
        
        if response == "API请求失败":
            return {"状态": "失败", "错误信息": "API请求失败"}
            
        # 解析结果
        json_str = extract_json_from_string(response)
        if not json_str:
            return {"状态": "失败", "错误信息": "结果解析失败"}
            
        data = json.loads(json_str)
        return {
            "状态": "成功",
            "分析结果": data
        }
        
    except Exception as e:
        print(f"[model_api] Error in analyze_food_portion: {e}")
        return {"状态": "失败", "错误信息": str(e)}

def check_net_content(img_path, api_key=None):
    """
    检查图片是否包含净含量信息
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        bool: True表示包含净含量信息，False表示不包含
    """
    print(f"[model_api] check_net_content called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = prompt_net_content()
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in check_net_content")
            return False
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in check_net_content result")
            return False
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        is_contained = json_data.get("是否包含净含量信息", 0)
        bool_contained = is_contained == 1 or is_contained == "1"
        
        return bool_contained
        
    except Exception as e:
        print(f"[model_api] Error in check_net_content: {e}")
        return False
    result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
    json_str = extract_json_from_string(result)
    json_data = json.loads(json_str) if json_str else {}
    is_contained = json_data.get("是否包含净含量信息", 0)
    bool_contained = is_contained == 1 or is_contained == "1"

    return bool_contained

def get_energy(nutrition_text, api_key=None):
    """
    从营养成分表文本中提取能量信息
    
    Args:
        nutrition_text: 营养成分表文本
        api_key: API密钥
    
    Returns:
        float: 能量值，失败时返回-1
    """
    print(f"[model_api] get_energy called with nutrition_text={nutrition_text}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_nutrition_energy(nutrition_text)
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-21B-A3B", api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in get_energy")
            return -1
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in get_energy result")
            return -1
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        energy = json_data.get("能量", -1)
        return energy
        
    except Exception as e:
        print(f"[model_api] Error in get_energy: {e}")
        return -1

def get_net_content(net_content_text, api_key=None):
    """
    从净含量文本中提取净含量信息
    
    Args:
        net_content_text: 净含量文本
        api_key: API密钥
    
    Returns:
        float: 净含量值，失败时返回-1
    """
    print(f"[model_api] get_net_content called with net_content_text={net_content_text}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_nutrition_net_content(net_content_text)
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-21B-A3B", api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in get_net_content")
            return -1
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in get_net_content result")
            return -1
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        net_content = json_data.get("净含量", -1)
        return net_content
        
    except Exception as e:
        print(f"[model_api] Error in get_net_content: {e}")
        return -1

def estimate_calories(img_path, api_key=None):
    """
    根据图片内容估算食物热量
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        float: 热量值，失败时返回-1
    """
    print(f"[model_api] estimate_calories called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_nutrition_estimate("图片内容见上传")
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-VL-28B-A3B", image_path=img_path, api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in estimate_calories")
            return -1
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in estimate_calories result")
            return -1
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        calories = json_data.get("热量", -1)
        return calories
        
    except Exception as e:
        print(f"[model_api] Error in estimate_calories: {e}")
        return -1

def calculate_nutrition(energy, net_content, api_key=None):
    """
    使用大模型计算营养信息
    
    Args:
        energy: 能量值 (kcal/100g)
        net_content: 净含量 (g)
        api_key: API密钥
    
    Returns:
        dict: 包含总热量、计算过程等信息的字典
    """
    print(f"[model_api] calculate_nutrition called with energy={energy}, net_content={net_content}, api_key={api_key}")
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_nutrition_calculate(energy, net_content)
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(messages, model="ERNIE-4.5-21B-A3B", api_key=api_key)
        
        if result == "API请求失败":
            print(f"[model_api] API request failed in calculate_nutrition")
            return {
                "总热量": -1,
                "计算过程": "API请求失败",
                "数据来源": "API调用失败"
            }
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in calculate_nutrition result")
            return {
                "总热量": -1,
                "计算过程": "未找到有效的JSON响应",
                "数据来源": "API响应解析失败"
            }
        
        json_data = json.loads(json_str)
        
        # 5. 输出
        return {
            "总热量": json_data.get("总热量", -1),
            "计算过程": json_data.get("计算过程", "计算失败"),
            "数据来源": json_data.get("数据来源", "未知")
        }
        
    except json.JSONDecodeError as e:
        print(f"[model_api] JSON decode error in calculate_nutrition: {e}")
        return {
            "总热量": -1,
            "计算过程": f"JSON解析错误: {e}",
            "数据来源": "解析失败"
        }
    except Exception as e:
        print(f"[model_api] Error in calculate_nutrition: {e}")
        return {
            "总热量": -1,
            "计算过程": f"计算过程中出错: {e}",
            "数据来源": "函数执行失败"
        }


def analyze_single_image_calories(img_path: str, api_key: str = None) -> dict:
    """
    分析单张图片的热量信息
    
    Args:
        img_path: 图片路径
        api_key: API密钥
        
    Returns:
        dict: 包含热量和估算依据的字典
        {
            "热量": float,
            "估算依据": str,
            "状态": str,  # "成功" 或 "失败"
            "错误信息": str  # 仅在失败时存在
        }
    """
    print(f"[model_api] analyze_single_image_calories called with img_path={img_path}")
    
    # 默认返回结构
    result_dict = {
        "热量": -1,
        "估算依据": "",
        "状态": "失败",
        "错误信息": ""
    }
    
    try:
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_single_image_analysis()
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(
            messages, 
            model="ERNIE-4.5-VL-28B-A3B", 
            image_path=img_path, 
            api_key=api_key
        )
        
        if result == "API请求失败":
            result_dict["估算依据"] = "API请求失败"
            result_dict["错误信息"] = "API请求失败"
            return result_dict.copy()
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in analyze_single_image_calories result: {result}")
            result_dict["估算依据"] = "未找到有效的JSON响应"
            result_dict["错误信息"] = "未找到有效的JSON响应"
            return result_dict.copy()
        
        json_data = json.loads(json_str)
        
        # 5. 输出 - 成功情况
        result_dict["热量"] = json_data.get("热量", -1)
        result_dict["估算依据"] = json_data.get("估算依据", "未提供估算依据")
        result_dict["状态"] = "成功"
        result_dict["错误信息"] = ""
        return result_dict.copy()
        
    except json.JSONDecodeError as e:
        traceback.print_exc()
        print(f"[model_api] JSON decode error in analyze_single_image_calories: {e}")
        result_dict["估算依据"] = f"JSON解析错误: {e}"
        result_dict["错误信息"] = f"JSON解析错误: {e}"
        return result_dict.copy()
        
    except Exception as e:
        print(f"[model_api] Error in analyze_single_image_calories: {e}")
        result_dict["估算依据"] = f"分析过程中出错: {e}"
        result_dict["错误信息"] = str(e)
        return result_dict.copy()


def summarize_multi_image_calories(single_useful_results: List[tuple], api_key: str = None) -> Dict[str, any]:
    """
    对多张图片的单独分析结果进行综合分析
    
    Args:
        single_useful_results: 单图分析结果列表，每个元素为 (index, calories, reason) 元组
        api_key: API密钥
        
    Returns:
        dict: 包含总热量、估算依据等信息的字典
        {
            "总热量": float,
            "估算依据": str,
            "状态": str,  # "成功" 或 "失败"
            "错误信息": str  # 仅在失败时存在
        }
    """
    print(f"[model_api] summarize_multi_image_calories called with {len(single_useful_results)} results")
    
    # 默认返回结构
    result_dict = {
        "总热量": -1,
        "估算依据": "",
        "状态": "失败",
        "错误信息": ""
    }
    
    if not single_useful_results:
        result_dict["估算依据"] = "未提供有效的分析结果"
        result_dict["错误信息"] = "分析结果列表为空"
        return result_dict.copy()
    
    try:
        # 转换输入格式为标准格式，便于使用现有的prompt函数
        analysis_results = []
        for index, calories, reason in single_useful_results:
            analysis_results.append({
                "热量": calories,
                "估算依据": reason
            })
        
        # 1. 从prompt_helper获取提示词
        prompt = get_prompt_multi_image_analysis(analysis_results)
        
        # 2. 组装大模型输入信息
        messages = [{"role": "user", "content": prompt}]
        
        # 3. 调用大模型
        result = get_openai_response(
            messages, 
            model="ERNIE-4.5-21B-A3B", 
            api_key=api_key
        )
        
        if result == "API请求失败":
            # 备用方案：返回平均值
            calories_list = [calories for _, calories, _ in single_useful_results if isinstance(calories, (int, float)) and calories > 0]
            if calories_list:
                avg_calories = sum(calories_list) / len(calories_list)
                result_dict["总热量"] = round(avg_calories, 2)
                result_dict["估算依据"] = f"综合分析API失败，使用{len(calories_list)}张图片的平均热量"
                result_dict["状态"] = "部分成功"
                result_dict["错误信息"] = "综合分析API失败，使用备用计算方法"
            else:
                result_dict["估算依据"] = "综合分析失败且无有效热量数据"
                result_dict["错误信息"] = "综合分析失败且无有效热量数据"
            return result_dict.copy()
        
        # 4. 解析大模型输出为json格式
        json_str = extract_json_from_string(result)
        if not json_str:
            print(f"[model_api] No JSON found in summarize_multi_image_calories result: {result}")
            # 备用方案：使用最大值
            calories_list = [calories for _, calories, _ in single_useful_results if isinstance(calories, (int, float)) and calories > 0]
            if calories_list:
                max_calories = max(calories_list)
                result_dict["总热量"] = max_calories
                result_dict["估算依据"] = f"综合分析未返回有效JSON，使用单图分析的最大值：{max_calories}大卡"
                result_dict["状态"] = "部分成功"
                result_dict["错误信息"] = "综合分析未返回有效JSON"
            else:
                result_dict["估算依据"] = "综合分析未返回有效JSON且无有效热量数据"
                result_dict["错误信息"] = "未找到有效的JSON响应"
            return result_dict.copy()
        
        json_data = json.loads(json_str)
        
        # 5. 输出 - 成功情况
        result_dict["总热量"] = json_data.get("总热量", -1)
        result_dict["估算依据"] = json_data.get("估算依据", "未提供估算依据")
        result_dict["状态"] = "成功"
        result_dict["错误信息"] = ""
        return result_dict.copy()
        
    except json.JSONDecodeError as e:
        print(f"[model_api] JSON decode error in summarize_multi_image_calories: {e}")
        # 备用方案：使用最大值
        calories_list = [calories for _, calories, _ in single_useful_results if isinstance(calories, (int, float)) and calories > 0]
        if calories_list:
            max_calories = max(calories_list)
            result_dict["总热量"] = max_calories
            result_dict["估算依据"] = f"综合分析JSON解析失败，使用单图分析的最大值：{max_calories}大卡"
            result_dict["状态"] = "部分成功"
            result_dict["错误信息"] = f"综合分析JSON解析失败: {e}"
        else:
            result_dict["估算依据"] = "综合分析JSON解析失败且无有效热量数据"
            result_dict["错误信息"] = f"JSON解析失败: {e}"
        return result_dict.copy()
                
    except Exception as e:
        print(f"[model_api] Error in summarize_multi_image_calories: {e}")
        result_dict["估算依据"] = f"综合分析过程中出错: {e}"
        result_dict["错误信息"] = str(e)
        return result_dict.copy()

def analyze_nutrition_table(img_path, api_key=None):
    """
    通过LLM+OCR+LLM的方式分析营养成分表
    
    Args:
        img_path: 图片路径
        api_key: API密钥
    
    Returns:
        dict: 包含解析后的营养成分表信息的字典
    """
    print(f"[model_api] analyze_nutrition_table called with img_path={img_path}, api_key={api_key}")
    
    try:
        # 1. 检查是否包含营养成分表
        if not check_nutrition_table(img_path, api_key):
            return {"error": "图片中未检测到营养成分表"}
        
        # 2. OCR提取文字
        ocr_text = extract_text_from_image(img_path)
        if not ocr_text:
            return {"error": "OCR提取文字失败"}
        
        # 3. 使用LLM解析结构化信息
        messages = [{
            "role": "user",
            "content": f"""请将下面的OCR文字转换为结构化的营养成分表信息，返回JSON格式：
            OCR文字内容：
            {ocr_text}
            
            请仔细分析文字内容，提取营养成分表中的营养素信息，包括但不限于：
            - 每份含量
            - 能量/热量(kJ和kcal)
            - 蛋白质
            - 脂肪
            - 碳水化合物
            - 钠
            等标准营养成分。返回格式应为JSON，键为营养素名称，值为其含量（包含数值和单位）。
            """
        }]
        
        result = get_openai_response(messages, model="ERNIE-4.5-21B-A3B", api_key=api_key)
        if result == "API请求失败":
            return {"error": "API请求失败"}
        
        # 4. 提取JSON数据
        json_str = extract_json_from_string(result)
        if not json_str:
            return {"error": "解析LLM输出失败"}
        
        nutrition_data = json.loads(json_str)
        return nutrition_data
        
    except Exception as e:
        print(f"[model_api] Error in analyze_nutrition_table: {e}")
        return {"error": f"分析过程出错: {str(e)}"}