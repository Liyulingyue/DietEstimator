"""
FastAPI API端点功能测试脚本
测试具体的API功能和数据验证
"""

import requests
import json
import base64
import io
from PIL import Image
import os
from typing import Dict, Any, Optional

class FastAPIFunctionalTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api/v1"

    def create_test_image(self, width: int = 100, height: int = 100) -> bytes:
        """创建测试用的图片"""
        img = Image.new('RGB', (width, height), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        return img_bytes.getvalue()

    def test_estimate_endpoint_validation(self) -> Dict[str, Any]:
        """测试估算端点的参数验证"""
        results = {}

        # 测试1: 空请求
        print("  测试空请求...")
        try:
            response = requests.post(f"{self.api_base}/estimate", timeout=10)
            results["empty_request"] = {
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
            }
        except Exception as e:
            results["empty_request"] = {"error": str(e)}

        # 测试2: 缺少必要参数
        print("  测试缺少参数...")
        try:
            response = requests.post(
                f"{self.api_base}/estimate",
                data={"method": "pure_llm"},
                timeout=10
            )
            results["missing_files"] = {
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
            }
        except Exception as e:
            results["missing_files"] = {"error": str(e)}

        # 测试3: 无效的分析方法
        print("  测试无效分析方法...")
        test_image = self.create_test_image()
        try:
            response = requests.post(
                f"{self.api_base}/estimate",
                files={"files": ("test.jpg", test_image, "image/jpeg")},
                data={
                    "api_key": "test_key",
                    "method": "invalid_method"
                },
                timeout=10
            )
            results["invalid_method"] = {
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
            }
        except Exception as e:
            results["invalid_method"] = {"error": str(e)}

        # 测试4: 有效的请求结构（不包含真实API密钥）
        print("  测试有效请求结构...")
        try:
            response = requests.post(
                f"{self.api_base}/estimate",
                files={"files": ("test.jpg", test_image, "image/jpeg")},
                data={
                    "api_key": "test_api_key_placeholder",
                    "method": "pure_llm"
                },
                timeout=15
            )
            results["valid_structure"] = {
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200],
                "content_type": response.headers.get('content-type')
            }
        except Exception as e:
            results["valid_structure"] = {"error": str(e)}

        return results

    def test_supported_methods(self) -> Dict[str, Any]:
        """测试支持的分析方法"""
        methods = [
            "llm_ocr_hybrid",
            "pure_llm",
            "nutrition_table",
            "food_portion"
        ]

        results = {}
        test_image = self.create_test_image()

        for method in methods:
            print(f"  测试方法: {method}")
            try:
                response = requests.post(
                    f"{self.api_base}/estimate",
                    files={"files": ("test.jpg", test_image, "image/jpeg")},
                    data={
                        "api_key": "test_api_key_placeholder",
                        "method": method
                    },
                    timeout=15
                )
                results[method] = {
                    "status_code": response.status_code,
                    "accepted": response.status_code not in [400, 404],
                    "response_preview": str(response.text)[:100] if response.text else "Empty response"
                }
            except Exception as e:
                results[method] = {"error": str(e)}

        return results

    def test_file_upload_limits(self) -> Dict[str, Any]:
        """测试文件上传限制"""
        results = {}

        # 测试1: 多个文件
        print("  测试多文件上传...")
        test_image1 = self.create_test_image(50, 50)
        test_image2 = self.create_test_image(60, 60)

        try:
            files = [
                ("files", ("test1.jpg", test_image1, "image/jpeg")),
                ("files", ("test2.jpg", test_image2, "image/jpeg"))
            ]
            response = requests.post(
                f"{self.api_base}/estimate",
                files=files,
                data={
                    "api_key": "test_api_key_placeholder",
                    "method": "pure_llm"
                },
                timeout=15
            )
            results["multiple_files"] = {
                "status_code": response.status_code,
                "response_preview": str(response.text)[:100]
            }
        except Exception as e:
            results["multiple_files"] = {"error": str(e)}

        # 测试2: 大文件（模拟）
        print("  测试大文件上传...")
        large_image = self.create_test_image(1000, 1000)

        try:
            response = requests.post(
                f"{self.api_base}/estimate",
                files={"files": ("large_test.jpg", large_image, "image/jpeg")},
                data={
                    "api_key": "test_api_key_placeholder",
                    "method": "pure_llm"
                },
                timeout=20
            )
            results["large_file"] = {
                "status_code": response.status_code,
                "file_size": len(large_image),
                "response_preview": str(response.text)[:100]
            }
        except Exception as e:
            results["large_file"] = {"error": str(e)}

        # 测试3: 非图片文件
        print("  测试非图片文件...")
        text_content = b"This is not an image file"

        try:
            response = requests.post(
                f"{self.api_base}/estimate",
                files={"files": ("test.txt", text_content, "text/plain")},
                data={
                    "api_key": "test_api_key_placeholder",
                    "method": "pure_llm"
                },
                timeout=15
            )
            results["non_image_file"] = {
                "status_code": response.status_code,
                "response_preview": str(response.text)[:100]
            }
        except Exception as e:
            results["non_image_file"] = {"error": str(e)}

        return results

    def test_api_documentation(self) -> Dict[str, Any]:
        """测试API文档端点"""
        results = {}

        # 测试OpenAPI文档
        print("  测试OpenAPI文档...")
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            results["docs"] = {
                "status_code": response.status_code,
                "content_type": response.headers.get('content-type'),
                "accessible": response.status_code == 200
            }
        except Exception as e:
            results["docs"] = {"error": str(e)}

        # 测试OpenAPI JSON
        print("  测试OpenAPI JSON...")
        try:
            response = requests.get(f"{self.base_url}/openapi.json", timeout=10)
            results["openapi_json"] = {
                "status_code": response.status_code,
                "content_type": response.headers.get('content-type'),
                "is_json": response.headers.get('content-type', '').startswith('application/json'),
                "accessible": response.status_code == 200
            }

            if response.status_code == 200:
                try:
                    openapi_data = response.json()
                    results["openapi_json"]["title"] = openapi_data.get("info", {}).get("title")
                    results["openapi_json"]["version"] = openapi_data.get("info", {}).get("version")
                    results["openapi_json"]["paths_count"] = len(openapi_data.get("paths", {}))
                except:
                    results["openapi_json"]["parse_error"] = "无法解析JSON"

        except Exception as e:
            results["openapi_json"] = {"error": str(e)}

        return results

    def run_functional_tests(self) -> Dict[str, Any]:
        """运行所有功能测试"""
        print("🚀 开始FastAPI功能测试...")
        print("=" * 60)

        all_results = {}

        # 测试端点参数验证
        print("\n📋 测试端点参数验证...")
        validation_results = self.test_estimate_endpoint_validation()
        all_results["endpoint_validation"] = validation_results

        # 显示验证测试结果
        if "empty_request" in validation_results:
            status = validation_results["empty_request"].get("status_code", "Error")
            print(f"  ✅ 空请求测试: HTTP {status}")

        if "invalid_method" in validation_results:
            status = validation_results["invalid_method"].get("status_code", "Error")
            print(f"  ✅ 无效方法测试: HTTP {status}")

        # 测试支持的方法
        print("\n🔧 测试支持的分析方法...")
        methods_results = self.test_supported_methods()
        all_results["supported_methods"] = methods_results

        for method, result in methods_results.items():
            if "error" not in result:
                accepted = "✅" if result.get("accepted", False) else "❌"
                print(f"  {accepted} {method}: HTTP {result.get('status_code', 'N/A')}")

        # 测试文件上传
        print("\n📁 测试文件上传功能...")
        upload_results = self.test_file_upload_limits()
        all_results["file_upload"] = upload_results

        for test_name, result in upload_results.items():
            if "error" not in result:
                status = result.get("status_code", "Error")
                print(f"  ✅ {test_name}: HTTP {status}")

        # 测试API文档
        print("\n📚 测试API文档...")
        docs_results = self.test_api_documentation()
        all_results["api_documentation"] = docs_results

        if docs_results.get("docs", {}).get("accessible", False):
            print("  ✅ Swagger UI 可访问")
        else:
            print("  ❌ Swagger UI 不可访问")

        if docs_results.get("openapi_json", {}).get("accessible", False):
            title = docs_results["openapi_json"].get("title", "Unknown")
            version = docs_results["openapi_json"].get("version", "Unknown")
            paths = docs_results["openapi_json"].get("paths_count", 0)
            print(f"  ✅ OpenAPI JSON 可访问: {title} v{version} ({paths} 个端点)")
        else:
            print("  ❌ OpenAPI JSON 不可访问")

        print("\n" + "=" * 60)
        print("🎯 功能测试完成!")

        return all_results

def main():
    """主函数"""
    print("FastAPI Diet Estimator 功能测试工具")
    print("默认测试地址: http://localhost:8000")

    base_url = os.getenv("FASTAPI_BASE_URL", "http://localhost:8000")

    tester = FastAPIFunctionalTester(base_url)
    results = tester.run_functional_tests()

    # 保存测试结果
    import time
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    results_file = f"functional_test_results_{timestamp}.json"

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📊 测试结果已保存到: {results_file}")

if __name__ == "__main__":
    main()
