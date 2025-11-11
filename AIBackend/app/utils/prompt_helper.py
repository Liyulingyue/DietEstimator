
def get_prompt_portion_check() -> str:
    """
    生成检查食物份量信息存在的提示词
    
    Returns:
        str: 提示词
    """
    example_response = {
        "是否包含份量信息": "bool，图片中是否包含食物的份量信息",
        "份量类型": "str，'重量'或'体积'，如果没有份量信息则为'未知'",
        "说明": "str，判断依据和相关说明"
    }
    
    prompt = f"""请仔细观察图片，判断其中是否包含食物的份量信息（如重量、体积等）。请将分析结果以JSON格式返回。

规则说明：
1. 食品包装上标注的净含量、规格、净重等都属于份量信息
2. 常见的重量单位包括：g/克、kg/千克、mg/毫克等
3. 常见的体积单位包括：ml/毫升、L/升等

注意事项：
1. 仅判断份量信息是否存在，不需要读取具体数值
2. 输出必须为标准JSON格式，所有key都用双引号包裹
3. 使用```json包裹输出内容
4. 不要在输出的json中增加注释

输出格式示例：
{example_response}
"""
    return prompt

def get_prompt_portion_analysis(ocr_text: str) -> str:
    """
    生成分析食物份量信息的提示词
    
    Args:
        ocr_text: OCR识别出的文本内容
        
    Returns:
        str: 提示词
    """
    example_response = {
        "食物名称": "str，识别出的食物名称",
        "份量数值": "float，标准化后的数值",
        "份量单位": "str，标准化后的单位（克/毫升）",
        "原始数值": "str，原始标注的数值",
        "原始单位": "str，原始标注的单位",
        "份量类型": "str，'重量'或'体积'",
        "置信度": "float，0-1之间的数值，表示分析结果的可信度",
        "说明": "str，解析过程的说明和注意事项"
    }
    
    prompt = f"""请分析以下OCR文本中的食物份量信息。请将分析结果以JSON格式返回。

OCR识别文本内容：
{ocr_text}

规则说明：
1. 需要智能提取产品名称和对应的份量信息
2. 将原始份量统一转换为克（重量）或毫升（体积）
3. 需要同时保留原始标注的数值和单位
4. 置信度根据信息的完整性和准确性评估

注意事项：
1. 输出必须为标准JSON格式，所有key都用双引号包裹
2. 使用```json包裹输出内容
3. 不要在输出的json中增加注释
4. 份量类型只能是"重量"或"体积"

输出格式示例：
{example_response}
"""
    return prompt

def extract_json_from_string(text: str) -> str:
    begin_str = "```json"
    end_str = "```"
    start_index = text.find(begin_str)
    if start_index != -1:
        start_index += len(begin_str)
        end_index = text.rfind(end_str)
        if end_index > start_index:
            return text[start_index:end_index].strip()
    start_index = text.find('{')
    end_index = text.rfind('}')
    if start_index != -1 and end_index > start_index:
        return text[start_index:end_index+1].strip()
    return ""


def get_prompt_nutrition_analysis(ocr_text: str) -> str:
    """
    生成分析营养成分表的提示词
    
    Args:
        ocr_text: OCR识别出的文本内容
        
    Returns:
        str: 提示词
    """
    example_response = {
        "能量": "str，每单位含有的能量，例如1000千焦、300大卡",
        "蛋白质": "str，每单位含有的蛋白质，例如20克、15克",
        "脂肪": "str，每单位含有的脂肪，例如10克、5克",
        "碳水化合物": "str，每单位含有的碳水化合物，例如30克、25克",
        "钠": "str，每单位含有的钠含量，例如200毫克、150毫克",
        "单位": "str，营养表中数值对应的份数，例如100g，100ml，每份"
    }
    
    prompt = f"""请分析以下营养成分表的文本内容，提取关键营养信息。请将结果以JSON格式返回。

OCR识别文本内容：
{ocr_text}

请注意：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

期望的返回格式示例：
{example_response}
"""
    return prompt

def prompt_weight_check():
    """
    生成检查食物重量信息的提示词
    """
    example_dict = {
        "是否包含重量信息": "int，1表示包含，0表示不包含",
        "解释": "str，说明判断依据"
    }
    
    return f"""请判断图片中是否包含食物的重量信息。重量信息可能以克(g)、千克(kg)等单位表示。

请以JSON格式回复，格式要求如下：
{example_dict}

例如：
{{
    "是否包含重量信息": 1,
    "解释": "图片中显示食物重量为250g"
}}"""

def get_prompt_weight_analysis(ocr_text: str) -> str:
    """
    生成分析食物重量的提示词
    
    Args:
        ocr_text: OCR识别出的文本内容
        
    Returns:
        str: 提示词
    """
    example_response = {
        "食物名称": "str, 食物的名称",
        "重量": "float, 统一转换为克(g)的重量",
        "原始单位": "str, 原始标注的单位(g/kg等)",
        "置信度": "str, 高/中/低，表示对重量识别的确信程度",
        "说明": "str, 解释重量判断的依据"
    }
    
    prompt = f"""请分析以下文本中包含的食物重量信息。

文本内容：
{ocr_text}

请注意：
1. 重量需要统一转换为克(g)
2. 如果看到千克(kg)，请转换为克
3. 如果有多个重量信息，请选择最可能是单份食物的重量
4. 如果不确定，请在说明中注明原因

请以JSON格式返回结果，格式示例：
{example_response}"""
    return prompt

def prompt_portion_check():
    """
    生成检查食物份量信息的提示词
    """
    example_dict = {
        "是否包含份量信息": "int，1表示包含，0表示不包含",
        "份量类型": "str，'重量'表示克/千克，'体积'表示毫升/升，'未知'表示无法确定",
        "解释": "str，说明判断依据"
    }
    
    return f"""请判断图片中是否包含食物的份量信息。份量信息可能以下列形式出现：
1. 重量单位：克(g)、千克(kg)等
2. 体积单位：毫升(ml/mL)、升(L)等
3. 净含量标注
4. 规格信息

请以JSON格式回复，格式要求如下：
{example_dict}

例如：
{{
    "是否包含份量信息": 1,
    "份量类型": "体积",
    "解释": "图片中显示饮料容量为500ml"
}}"""

def get_prompt_portion_analysis(ocr_text: str) -> str:
    """
    生成分析食物份量的提示词
    
    Args:
        ocr_text: OCR识别出的文本内容
        
    Returns:
        str: 提示词
    """
    example_response = {
        "食物名称": "str, 食物的名称",
        "份量数值": "float, 转换后的数值",
        "份量单位": "str, 统一后的单位(g或ml)",
        "原始数值": "float, 原始标注的数值",
        "原始单位": "str, 原始标注的单位(g/kg/ml/L等)",
        "份量类型": "str, 重量/体积",
        "置信度": "str, 高/中/低，表示对份量识别的确信程度",
        "说明": "str, 解释份量判断的依据"
    }
    
    prompt = f"""请分析以下文本中包含的食物份量信息。

文本内容：
{ocr_text}

请注意：
1. 如果是重量单位：
   - 克(g)保持不变
   - 千克(kg)转换为克(g)
2. 如果是体积单位：
   - 毫升(ml/mL)保持不变
   - 升(L)转换为毫升(ml)
3. 如果有多个份量信息，请选择最可能是单份食物的份量
4. 如果不确定，请在说明中注明原因

请以JSON格式返回结果，格式示例：
{example_response}"""
    return prompt

def prompt_nutrition_table():
    example_dict = {
        "是否包含营养成分表": "int，1表示包含，0表示不包含",
        "原因": "str，简要说明"
    }
    prompt = f"""
请判断图片中是否包含完整的营养成分表。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

输出要求为json：
{example_dict}
"""
    return prompt

def prompt_net_content():
    example_dict = {
        "是否包含净含量信息": "int,1表示包含，0表示不包含",
        "原因": "str，简要说明"
    }
    prompt = f"""
请判断图片中是否包含完整的净含量信息。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

输出要求为json：
{example_dict}
"""
    return prompt

# extract_json_from_model 和 extract_json_from_string 功能相同，统一使用 extract_json_from_string
def extract_json_from_model(content: str) -> str:
    return extract_json_from_string(content)

def get_prompt_nutrition_energy(nutrition_text):
    example_dict = {
        "能量": "float，单位kcal，只返回数字",
        "原文": "str，能量字段的原始文本"
    }
    prompt = f"""
请从以下营养成分表文本中提取能量信息。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

输出要求为json：
{example_dict}

营养成分表文本如下：
{nutrition_text}
"""
    return prompt

def get_prompt_nutrition_net_content(net_content_text):
    example_dict = {
        "净含量": "float，单位g，只返回数字",
        "原文": "str，净含量字段的原始文本"
    }
    prompt = f"""
请从以下文本中提取净含量信息。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

输出要求为json：
{example_dict}

净含量文本如下：
{net_content_text}
"""
    return prompt

def get_prompt_nutrition_estimate(img_desc):
    example_dict = {
        "热量": "float，单位大卡，只返回数字",
        "估算依据": "str，估算理由简述"
    }
    prompt = f"""
请根据图片内容估算食物热量。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。

输出要求为json：
{example_dict}

图片内容描述如下：
{img_desc}
"""
    return prompt

def get_prompt_nutrition_calculate(energy, net_content):
    """生成营养计算的prompt"""
    example_dict = {
        "总热量": "float，计算出的总热量，单位大卡",
        "计算过程": "str，详细的计算步骤说明",
        "数据来源": "str，说明使用的原始数据"
    }
    
    if net_content and net_content != -1:
        prompt = f"""
请根据以下营养信息计算食物的总热量。

能量信息：{energy} kcal/100g
净含量信息：{net_content} g

请进行准确的热量计算，计算公式为：总热量 = (能量密度 × 净含量) / 100

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。
4. 计算过程要详细说明每一步。

输出要求为json：
{example_dict}
"""
    else:
        prompt = f"""
请根据以下营养信息分析食物热量。

能量信息：{energy} kcal（单位待确认）

由于没有净含量信息，请分析这个能量值可能代表的含义（每100g、每份、每包装等），并给出合理的热量估算。

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json包裹输出内容。
3. 不要在输出的json中增加注释。
4. 计算过程要详细说明分析思路。

输出要求为json：
{example_dict}
"""
    return prompt


def get_prompt_single_image_analysis():
    """生成单张图片热量分析的prompt"""
    example_dict = {
        "食物名称": "str，识别出的食物名称",
        "热量": "str，估算的热量值",
        "估算依据": "str，详细的估算理由和分析过程"
    }
    
    prompt = f"""
请根据图片内容详细分析食物的热量。

分析要求：
1. 识别图片中的食物类型、分量、重量等信息
2. 根据食物的营养密度、烹饪方式、分量大小等因素进行热量估算
3. 如果图片包含营养成分表，优先使用营养成分表信息计算
4. 如果图片包含净含量信息，结合净含量进行准确计算
5. 提供详细的估算依据和分析过程
6. 热量信息需要带单位，通常为千焦或大卡，也可以是其他的单位

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json```包裹输出内容。
3. 不要在输出的json中增加注释。
4. 估算依据要详细说明分析思路和计算过程。

输出要求为json：
{example_dict}
"""
    return prompt


def get_prompt_multi_image_analysis(analysis_results):
    """生成多张图片综合分析的prompt"""
    example_dict = {
        "食物名称": "str，综合分析后的食物名称",
        "热量": "float，综合分析后的热量，单位大卡",
        "估算依据": "str，综合分析的理由和计算过程"
    }
    
    # 构建分析结果文本
    results_text = ""
    for i, result in enumerate(analysis_results, 1):
        # result格式: (图片序号, 食物名称, 热量, 依据)
        if len(result) >= 4:
            _, food_name, calories, reason = result
            results_text += f"图片{i}分析结果：\n"
            results_text += f"  食物名称：{food_name}\n"
            results_text += f"  热量：{calories} 大卡\n"
            results_text += f"  估算依据：{reason}\n\n"
        else:
            # 兼容旧格式
            results_text += f"图片{i}分析结果：\n"
            results_text += f"  热量：{result[1] if len(result) > 1 else '未知'} 大卡\n"
            results_text += f"  估算依据：{result[2] if len(result) > 2 else '无'}\n\n"
    
    prompt = f"""
请基于以下多张图片的分析结果，给出该食物的综合热量估算。

多张图片分析结果：
{results_text}

综合分析要求：
1. 这些图片都在描述同一个食物的不同角度或信息
2. 需要综合考虑所有图片的信息，避免重复计算
3. 如果有营养成分表信息，优先使用最准确的数据
4. 如果有分量或包装信息，结合实际情况计算
5. 给出最终的综合热量估算和详细的分析依据

规则如下：
1. 输出必须为标准JSON格式，所有key都用双引号包裹，不能有语法错误。
2. 使用```json```包裹输出内容。
3. 不要在输出的json中增加注释。
4. 估算依据要详细说明综合分析的思路和计算过程。

输出要求为json：
{example_dict}
"""
    return prompt
