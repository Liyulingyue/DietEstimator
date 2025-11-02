"""
Gradio用户界面模块
专注于UI设计和界面布局，所有业务逻辑在gradio_backend.py中实现
"""

import gradio as gr
from Tools.gradio_backend import (
    process_llm_ocr,
    process_pure_llm,
    process_nutrition_table,
    process_food_portion,
    update_gallery_preview,
    clear_images
)

# ========== 主界面函数 ==========

def launch_ui():
    """启动Gradio用户界面"""
    print("[gradio_ui] launch_ui called")
    
    with gr.Blocks(theme=gr.themes.Soft(), title="饮食热量评估器") as demo:
        # 页面标题
        gr.Markdown("# 🍽️ 饮食热量评估器")
        
        # 功能说明
        gr.Markdown("""
        ## 📖 使用说明
        
        上传食物图片，AI将为您分析这顿饭的热量。您可以上传**单张或多张图片**，但这些图片必须是**同一个食物**。
        
        **使用场景举例：**
        - 🥪 拍摄包装袋的正反面
        - 🍎 从不同角度拍摄食物
        - 📦 拍摄食物包装和内容物
        
        ## 🔬 分析方案说明
        
        **大模型OCR混合估算：** 通过OCR提取图片中的营养标签信息，结合大模型分析计算热量。适合有营养标签的包装食品。
        
        **基于大模型估算：** 大模型直接通过图片视觉内容识别食物并估算热量。适合所有类型的食物，包括新鲜食材和自制食品。
        """)
        
        # 公共区域
        # 图片上传
        image_input = gr.File(
            label="📷 上传食物图片（支持多选）",
            file_count="multiple",
            file_types=["image"],
            interactive=True
        )
        
        # 图片预览
        image_gallery = gr.Gallery(
            label="📸 图片预览",
            show_label=True,
            elem_id="gallery",
            columns=4,
            rows=2,
            object_fit="contain",
            height=300,
            allow_preview=True,
            interactive=False,
            visible=False
        )
        
        # API Key和清空按钮
        with gr.Row():
            api_key_input = gr.Textbox(
                label="🔑 API Key", 
                value="", 
                type="password", 
                placeholder="请输入百度文心一言API Key",
                scale=3
            )
            clear_btn = gr.Button("🗑️ 清空图片", variant="secondary", scale=1)
        
        # 分析方案选择
        with gr.Tabs():
            # 大模型OCR混合估算热量
            with gr.TabItem("� 大模型OCR混合估算"):
                gr.Markdown("""
                **适用场景：** 有营养标签的包装食品
                **分析流程：** OCR识别营养标签 → AI解析营养信息 → 计算热量
                **优势：** 准确度高，基于真实营养标签数据
                """)
                
                with gr.Row():
                    llm_ocr_btn = gr.Button("🚀 开始分析", variant="primary", size="lg")
                
                llm_ocr_output = gr.Textbox(
                    label="📊 分析结果",
                    lines=8,
                    placeholder="营养标签分析结果将在这里显示...",
                    interactive=False
                )
            
            # 基于大模型估算热量
            with gr.TabItem("🤖 大模型估算热量"):
                gr.Markdown("""
                **适用场景：** 所有类型食物（新鲜食材、自制食品、包装食品）
                **分析流程：** AI直接通过视觉识别食物 → 估算热量
                **优势：** 适用范围广，可分析无营养标签食物
                """)
                
                with gr.Row():
                    pure_llm_btn = gr.Button("🎯 开始分析", variant="primary", size="lg")
                
                pure_llm_output = gr.Textbox(
                    label="📊 分析结果",
                    lines=8,
                    placeholder="视觉识别分析结果将在这里显示...",
                    interactive=False
                )
                
            # 食物份量检测
            with gr.TabItem("📏 食物份量检测"):
                gr.Markdown("""
                **适用场景：** 包含食物份量信息的包装或标签
                **分析流程：** AI识别份量信息 → OCR提取文字 → AI分析具体数值
                **优势：** 支持多种份量单位：
                - ⚖️ 重量单位：克(g)、千克(kg)
                - 🧪 体积单位：毫升(ml)、升(L)
                """)
                
                with gr.Row():
                    portion_btn = gr.Button("📏 检测份量", variant="primary", size="lg")
                
                portion_output = gr.Textbox(
                    label="📊 分析结果",
                    lines=8,
                    placeholder="份量分析结果将在这里显示...",
                    interactive=False
                )


            # LLM+OCR+LLM 营养成分表提取方案
            with gr.TabItem("📋 营养成分表提取"):
                gr.Markdown("""
                **适用场景：** 带有营养成分表的包装食品
                **分析流程：** LLM识别是否存在营养成分表 → OCR提取文字 → LLM结构化解析营养信息
                **优势：** 提供完整的营养成分信息，不仅限于热量
                """)
                
                with gr.Row():
                    nutrition_btn = gr.Button("📊 开始提取", variant="primary", size="lg")
                
                nutrition_output = gr.Textbox(
                    label="📋 分析结果",
                    lines=12,
                    placeholder="营养成分表分析结果将在这里显示...",
                    interactive=False
                )
        
        # 事件绑定
        
        # 图片上传事件
        image_input.change(
            update_gallery_preview,
            inputs=image_input,
            outputs=image_gallery
        )
        
        # 清空图片事件
        clear_btn.click(
            clear_images,
            outputs=[image_input, image_gallery]
        )
        
        # 食物份量检测事件
        portion_btn.click(
            process_food_portion,
            inputs=[image_input, api_key_input],
            outputs=portion_output
        )
        
        # LLM+OCR分析事件
        llm_ocr_btn.click(
            process_llm_ocr,
            inputs=[image_input, api_key_input],
            outputs=llm_ocr_output
        )
        
        # 纯LLM分析事件
        pure_llm_btn.click(
            process_pure_llm,
            inputs=[image_input, api_key_input],
            outputs=pure_llm_output
        )

        # 营养成分表提取事件
        nutrition_btn.click(
            process_nutrition_table,
            inputs=[image_input, api_key_input],
            outputs=nutrition_output
        )
    
    demo.launch(share=False, server_name="0.0.0.0", server_port=7860)

if __name__ == "__main__":
    launch_ui()
