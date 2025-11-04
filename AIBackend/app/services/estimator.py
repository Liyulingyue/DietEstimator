"""
热量估算核心服务
整合OCR和LLM服务，提供完整的食物热量分析功能
"""

from typing import List, Dict, Any, Tuple
import tempfile
import os
from .ocr_service import ocr_service
from .llm_service import llm_service

class DietEstimatorService:
    """饮食热量估算服务"""
    
    def __init__(self):
        self.ocr_service = ocr_service
        self.llm_service = llm_service
    
    def process_llm_ocr_hybrid(self, image_files: List[bytes], api_key: str, model_url: str = None, model_name: str = None, call_preference: str = "server") -> str:
        """
        LLM+OCR混合方案处理热量估算
        
        Args:
            image_files: 图片字节流列表
            api_key: API密钥
            
        Returns:
            分析结果字符串
        """
        if not image_files or len(image_files) == 0:
            return "请先上传图片"
        
        if not api_key or api_key.strip() == "":
            return "请输入API Key"
        
        # 初始化图片信息列表
        image_infos = []
        
        # 第一阶段：检查每张图片是否包含营养成分表
        for i, image_bytes in enumerate(image_files):
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(image_bytes)
                    temp_file.flush()
                    
                    contains_nutrition = self.llm_service.check_nutrition_table(temp_file.name, api_key, model_url, model_name, call_preference)
                    image_infos.append({
                        "图片序号": i + 1,
                        "图片路径": temp_file.name,
                        "是否包含营养成分表": contains_nutrition,
                        "推理状态": "待确定",
                        "状态": "检测到营养成分表" if contains_nutrition else "未检测到营养成分表"
                    })
                    
            except Exception as e:
                image_infos.append({
                    "图片序号": i + 1,
                    "图片路径": None,
                    "是否包含营养成分表": False,
                    "推理状态": "大模型推理",
                    "状态": f"检查营养成分表失败: {str(e)}"
                })
        
        # 第二阶段：对包含营养成分表的图片检查是否包含分量信息
        for info in image_infos:
            if not info["是否包含营养成分表"] or not info["图片路径"]:
                info["推理状态"] = "大模型推理"
                continue
                
            try:
                portion_info = self.llm_service.check_food_portion(info["图片路径"], api_key, model_url, model_name, call_preference)
                info["是否包含分量信息"] = portion_info["是否包含份量信息"]
                info["份量类型"] = portion_info["份量类型"]
                
                # 决定推理状态
                if info["是否包含分量信息"]:
                    info["推理状态"] = "混合推理"
                    info["状态"] = f"检测到营养成分表和{portion_info['份量类型']}信息"
                else:
                    info["推理状态"] = "大模型推理"
                    info["状态"] = "检测到营养成分表但无分量信息"
                    
            except Exception as e:
                info["推理状态"] = "大模型推理"
                info["状态"] = f"检查分量信息失败: {str(e)}"
        
        # 第三阶段：根据推理状态分别处理
        useful_results = []
        
        for info in image_infos:
            try:
                if info["推理状态"] == "混合推理" and info["图片路径"]:
                    # 混合推理：OCR + LLM
                    ocr_text = self.ocr_service.recognize_text(info["图片路径"])
                    if not ocr_text:
                        info["状态"] = "OCR提取失败"
                        continue
                    
                    # 提取营养成分信息
                    nutrition_result = self.llm_service.analyze_nutrition_info(info["图片路径"], ocr_text, api_key, model_url, model_name, call_preference)
                    if nutrition_result["状态"] != "成功":
                        info["状态"] = f"营养成分分析失败: {nutrition_result['错误信息']}"
                        continue
                    
                    # 提取分量信息
                    portion_result = self.llm_service.analyze_food_portion(info["图片路径"], ocr_text, api_key, model_url, model_name, call_preference)
                    if portion_result["状态"] != "成功":
                        info["状态"] = f"分量信息分析失败: {portion_result['错误信息']}"
                        continue
                    
                    # 基于营养成分和分量信息计算热量
                    nutrition_info = nutrition_result["分析结果"]
                    portion_info = portion_result["分析结果"]
                    
                    # 从营养成分中提取能量信息
                    energy_kcal = None
                    for key, value in nutrition_info.items():
                        if "能量" in key or "热量" in key or "卡路里" in key:
                            import re
                            numbers = re.findall(r'\d+\.?\d*', str(value))
                            if numbers:
                                energy_kcal = float(numbers[0])
                                break
                    
                    if energy_kcal is None:
                        info["状态"] = "未能从营养成分表中提取到能量信息"
                        continue
                    
                    # 从分量信息中提取净含量
                    portion_value = portion_info.get("份量数值", 0)
                    if not portion_value or portion_value == 0:
                        info["状态"] = "未能从分量信息中提取到有效数值"
                        continue
                    
                    # 计算热量
                    try:
                        calculated_calories = (energy_kcal * float(portion_value)) / 100
                        food_name = portion_info.get("食物名称", "未知食物")
                        reason = f"基于营养成分表能量 {energy_kcal}大卡/100g 和实际分量 {portion_value}{portion_info.get('份量单位', 'g')} 计算得出"
                        
                        useful_results.append((info["图片序号"], calculated_calories, reason))
                        info.update({
                            "热量": calculated_calories,
                            "计算依据": reason,
                            "分析是否成功": True,
                            "状态": "混合推理完成"
                        })
                        
                    except Exception as calc_e:
                        info["状态"] = f"热量计算失败: {str(calc_e)}"
                        
                else:
                    # 大模型推理
                    if info["图片路径"]:
                        result = self.llm_service.analyze_single_image_calories(info["图片路径"], api_key, model_url, model_name, call_preference)
                        
                        if result.get("状态") == "成功":
                            calories = result.get("热量", "未知")
                            reason = result.get("估算依据", "无说明")
                            useful_results.append((info["图片序号"], calories, reason))
                            info.update({
                                "热量": calories,
                                "计算依据": reason,
                                "分析是否成功": True,
                                "状态": "大模型推理完成"
                            })
                        else:
                            error_msg = result.get("错误信息", "未知错误")
                            info.update({
                                "分析是否成功": False,
                                "状态": f"大模型推理失败: {error_msg}"
                            })
                    
            except Exception as e:
                info.update({
                    "分析是否成功": False,
                    "状态": f"处理失败: {str(e)}"
                })
        
        # 清理临时文件
        for info in image_infos:
            if info["图片路径"] and os.path.exists(info["图片路径"]):
                try:
                    os.unlink(info["图片路径"])
                except:
                    pass
        
        # 第四阶段：生成最终结果
        successful_results = [info for info in image_infos if info.get("分析是否成功", False)]
        failed_results = [info for info in image_infos if not info.get("分析是否成功", False)]
        
        output_parts = []
        
        if len(successful_results) == 0:
            output_parts.append("❌ 没有成功分析的图片")
        elif len(successful_results) == 1:
            result = successful_results[0]
            output_parts.append(f"✅ 热量: {result['热量']} 大卡\n\n📝 计算依据:\n{result['计算依据']}")
        else:
            try:
                summary_result = self.llm_service.summarize_multi_image_calories(useful_results, api_key, model_url, model_name, call_preference)
                if summary_result.get("状态") == "成功":
                    total_calories = summary_result.get("总热量", "未知")
                    total_reason = summary_result.get("估算依据", "无说明")
                    output_parts.append(f"✅ 总热量: {total_calories} 大卡\n\n📝 综合计算依据:\n{total_reason}")
                else:
                    error_msg = summary_result.get("错误信息", "未知错误")
                    output_parts.append(f"❌ 综合分析失败: {error_msg}")
            except Exception as e:
                output_parts.append(f"❌ 综合分析出错: {str(e)}")
        
        # 添加失败图片的信息
        if failed_results:
            output_parts.append("\n📝 以下图片分析失败:")
            for result in failed_results:
                output_parts.append(f"\n🖼️ 图片 {result['图片序号']}: {result['状态']}")
        
        return "\n".join(output_parts)
    
    def process_pure_llm(self, image_files: List[bytes], api_key: str, model_url: str = None, model_name: str = None, call_preference: str = "server") -> str:
        """
        纯LLM方案处理图片分析
        
        Args:
            image_files: 图片字节流列表
            api_key: API密钥
            
        Returns:
            分析结果字符串
        """
        if not image_files or len(image_files) == 0:
            return "请先上传图片"
        
        if not api_key or api_key.strip() == "":
            return "请输入API Key"
        
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
                result = self.llm_service.analyze_single_image_calories(file_path, api_key, model_url, model_name, call_preference)
                single_results.append(result)
            
            # 筛选出有效的结果
            single_useful_results = []
            unuseful_results = []
            for i, result in enumerate(single_results):
                if result.get("状态") == "成功":
                    calories = result.get("热量", "未知")
                    reason = result.get("估算依据", "无说明")
                    single_useful_results.append((i + 1, calories, reason))
                else:
                    error_msg = result.get("错误信息", "未知错误")
                    unuseful_results.append((i + 1, error_msg))
            
            # 清理临时文件
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except:
                    pass
            
            # 生成输出结果
            if len(single_useful_results) == 0:
                output = "❌ 没有有效图片:\n"
            elif len(single_useful_results) == 1:
                (index, calories, reason) = single_useful_results[0]
                output = f"✅ 热量: {calories} \n\n📝 估算依据:\n{reason}"
            else:
                result = self.llm_service.summarize_multi_image_calories(single_useful_results, api_key, model_url, model_name, call_preference)
                if result.get("状态") == "成功":
                    total_calories = result.get("总热量", "未知")
                    total_reason = result.get("估算依据", "无说明")
                    output = f"✅ 总热量: {total_calories} \n\n📝 综合估算依据:\n{total_reason}\n\n"
                else:
                    error_msg = result.get("错误信息", "未知错误")
                    return f"❌ 综合分析失败: {error_msg}"
            
            if len(unuseful_results) > 0:
                output += "\n📝 以下图片无法识别:\n"
                for i, (index, error_msg) in enumerate(unuseful_results):
                    output += f"\n🖼️ 图片 {index}: {error_msg}\n"
            
            return output
            
        except Exception as e:
            return f"❌ 处理出错: {str(e)}"
    
    def process_nutrition_table(self, image_files: List[bytes], api_key: str, model_url: str = None, model_name: str = None, call_preference: str = "server") -> str:
        """
        营养成分表提取处理
        
        Args:
            image_files: 图片字节流列表
            api_key: API密钥
            
        Returns:
            分析结果字符串
        """
        if not image_files or len(image_files) == 0:
            return "请先上传图片"
        
        if not api_key or api_key.strip() == "":
            return "请输入API Key"
        
        # 初始化图片信息列表
        image_infos = []
        
        # 第一阶段：检查每张图片是否包含营养成分表
        for i, image_bytes in enumerate(image_files):
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(image_bytes)
                    temp_file.flush()
                    
                    contains_table = self.llm_service.check_nutrition_table(temp_file.name, api_key, model_url, model_name, call_preference)
                    image_infos.append({
                        "图片路径": temp_file.name,
                        "图片序号": i + 1,
                        "是否包含营养成分表": contains_table,
                        "状态": "未检测到营养成分表" if not contains_table else "检测到营养成分表"
                    })
                    
            except Exception as e:
                image_infos.append({
                    "图片路径": None,
                    "图片序号": i + 1,
                    "是否包含营养成分表": False,
                    "状态": f"检查营养成分表失败: {str(e)}"
                })
        
        # 第二阶段：对包含营养成分表的图片进行OCR
        for info in image_infos:
            if not info["是否包含营养成分表"] or not info["图片路径"]:
                continue
                
            try:
                ocr_text = self.ocr_service.recognize_text(info["图片路径"])
                info.update({
                    "OCR文本": ocr_text,
                    "OCR是否成功": bool(ocr_text),
                    "状态": "OCR完成"
                })
            except Exception as e:
                info.update({
                    "OCR是否成功": False,
                    "状态": f"OCR失败: {str(e)}"
                })
        
        # 第三阶段：对成功提取文本的图片进行分析
        for info in image_infos:
            if not info.get("是否包含营养成分表") or not info.get("OCR是否成功", False):
                continue
                
            try:
                result = self.llm_service.analyze_nutrition_info(info["图片路径"], info["OCR文本"], api_key, model_url, model_name, call_preference)
                
                if result["状态"] == "成功":
                    info.update({
                        "分析结果": result["分析结果"],
                        "分析是否成功": True,
                        "状态": "分析完成"
                    })
                else:
                    info.update({
                        "分析是否成功": False,
                        "状态": result["错误信息"]
                    })
                
            except Exception as e:
                info.update({
                    "分析是否成功": False,
                    "状态": f"分析失败: {str(e)}"
                })
        
        # 清理临时文件
        for info in image_infos:
            if info["图片路径"] and os.path.exists(info["图片路径"]):
                try:
                    os.unlink(info["图片路径"])
                except:
                    pass
        
        # 生成最终输出
        results = []
        for info in image_infos:
            if info.get("分析是否成功", False):
                formatted_result = [f"🖼️ 图片 {info['图片序号']}:\n营养成分表信息："]
                for nutrient, value in info["分析结果"].items():
                    formatted_result.append(f"- {nutrient}: {value}")
                results.append("\n".join(formatted_result))
            else:
                results.append(f"🖼️ 图片 {info['图片序号']}: ❌ {info['状态']}")
        
        return "\n\n".join(results)
    
    def process_food_portion(self, image_files: List[bytes], api_key: str, model_url: str = None, model_name: str = None, call_preference: str = "server") -> str:
        """
        食物份量检测处理
        
        Args:
            image_files: 图片字节流列表
            api_key: API密钥
            
        Returns:
            分析结果字符串
        """
        if not image_files or len(image_files) == 0:
            return "请先上传图片"
        
        if not api_key or api_key.strip() == "":
            return "请输入API Key"
        
        # 初始化图片信息列表
        image_infos = []
        
        # 第一阶段：检查每张图片是否包含份量信息
        for i, image_bytes in enumerate(image_files):
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(image_bytes)
                    temp_file.flush()
                    
                    portion_info = self.llm_service.check_food_portion(temp_file.name, api_key, model_url, model_name, call_preference)
                    image_infos.append({
                        "图片路径": temp_file.name,
                        "图片序号": i + 1,
                        "是否包含份量信息": portion_info["是否包含份量信息"],
                        "份量类型": portion_info["份量类型"],
                        "状态": f"{'检测到' + portion_info['份量类型'] + '信息' if portion_info['是否包含份量信息'] else '未检测到份量信息'}"
                    })
                    
            except Exception as e:
                image_infos.append({
                    "图片路径": None,
                    "图片序号": i + 1,
                    "是否包含份量信息": False,
                    "份量类型": "未知",
                    "状态": f"检查份量信息失败: {str(e)}"
                })
        
        # 第二阶段：对包含份量信息的图片进行OCR
        for info in image_infos:
            if not info["是否包含份量信息"] or not info["图片路径"]:
                continue
                
            try:
                ocr_text = self.ocr_service.recognize_text(info["图片路径"])
                info.update({
                    "OCR文本": ocr_text,
                    "OCR是否成功": bool(ocr_text),
                    "状态": "OCR完成"
                })
            except Exception as e:
                info.update({
                    "OCR是否成功": False,
                    "状态": f"OCR失败: {str(e)}"
                })
        
        # 第三阶段：对成功提取文本的图片进行分析
        for info in image_infos:
            if not info.get("是否包含份量信息") or not info.get("OCR是否成功", False):
                continue
                
            try:
                result = self.llm_service.analyze_food_portion(info["图片路径"], info["OCR文本"], api_key, model_url, model_name, call_preference)
                
                if result["状态"] == "成功":
                    info.update({
                        "分析结果": result["分析结果"],
                        "分析是否成功": True,
                        "状态": "分析完成"
                    })
                else:
                    info.update({
                        "分析是否成功": False,
                        "状态": result["错误信息"]
                    })
                
            except Exception as e:
                info.update({
                    "分析是否成功": False,
                    "状态": f"分析失败: {str(e)}"
                })
        
        # 清理临时文件
        for info in image_infos:
            if info["图片路径"] and os.path.exists(info["图片路径"]):
                try:
                    os.unlink(info["图片路径"])
                except:
                    pass
        
        # 生成最终输出
        results = []
        for info in image_infos:
            if info.get("分析是否成功", False):
                result = info.get("分析结果", {})
                if isinstance(result, dict):
                    unit_emoji = "⚖️" if result.get("份量类型") == "重量" else "🧪"
                    results.append(
                        f"🖼️ 图片 {info['图片序号']}:\n"
                        f"🍽️ 食物名称: {result.get('食物名称', '未知')}\n"
                        f"{unit_emoji} 份量: {result.get('份量数值', '未知')}{result.get('份量单位', '')}\n"
                        f"📝 原始标注: {result.get('原始数值', '未知')}{result.get('原始单位', '')}\n"
                        f"✨ 置信度: {result.get('置信度', '未知')}\n"
                        f"📌 说明: {result.get('说明', '无')}"
                    )
            else:
                results.append(f"🖼️ 图片 {info['图片序号']}: ❌ {info['状态']}")
        
        return "\n\n".join(results)

# 全局估算器服务实例
estimator_service = DietEstimatorService()
