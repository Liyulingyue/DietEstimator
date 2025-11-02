"""
FastAPI连通性测试脚本
用于测试Diet Estimator API的各个端点
"""

import requests
import json
import time
from typing import Dict, Any
import os

class FastAPIConnectivityTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api/v1"

    def test_server_running(self) -> Dict[str, Any]:
        """测试服务器是否正在运行"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            return {
                "status": "success" if response.status_code == 200 else "failed",
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text,
                "response_time": response.elapsed.total_seconds()
            }
        except requests.exceptions.ConnectionError:
            return {"status": "failed", "error": "无法连接到服务器"}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def test_health_endpoint(self) -> Dict[str, Any]:
        """测试健康检查端点"""
        try:
            # 测试根路径健康检查
            root_response = requests.get(f"{self.base_url}/health", timeout=5)

            # 测试API健康检查
            api_response = requests.get(f"{self.api_base}/health", timeout=5)

            return {
                "root_health": {
                    "status": "success" if root_response.status_code == 200 else "failed",
                    "status_code": root_response.status_code,
                    "response": root_response.json() if root_response.status_code == 200 else root_response.text
                },
                "api_health": {
                    "status": "success" if api_response.status_code == 200 else "failed",
                    "status_code": api_response.status_code,
                    "response": api_response.json() if api_response.status_code == 200 else api_response.text
                }
            }
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def test_estimate_endpoint_structure(self) -> Dict[str, Any]:
        """测试估算端点的结构（不需要真实数据）"""
        try:
            # 发送一个不完整的请求来测试端点是否存在
            response = requests.post(f"{self.api_base}/estimate", timeout=5)

            return {
                "status": "endpoint_exists" if response.status_code in [400, 422] else "unknown",
                "status_code": response.status_code,
                "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
            }
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def test_cors_headers(self) -> Dict[str, Any]:
        """测试CORS头信息"""
        try:
            response = requests.options(f"{self.base_url}/", timeout=5)
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }

            return {
                "status": "success",
                "cors_headers": cors_headers,
                "status_code": response.status_code
            }
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    def run_all_tests(self) -> Dict[str, Any]:
        """运行所有连通性测试"""
        print("🚀 开始FastAPI连通性测试...")
        print("=" * 50)

        results = {}

        # 测试服务器运行状态
        print("1. 测试服务器运行状态...")
        server_result = self.test_server_running()
        results["server_running"] = server_result
        if server_result["status"] == "success":
            print(f"   ✅ 服务器运行正常 (响应时间: {server_result['response_time']:.3f}s)")
        else:
            print(f"   ❌ 服务器连接失败: {server_result.get('error', '未知错误')}")
            return results

        # 测试健康检查端点
        print("\n2. 测试健康检查端点...")
        health_result = self.test_health_endpoint()
        results["health_check"] = health_result
        if health_result.get("root_health", {}).get("status") == "success":
            print("   ✅ 根路径健康检查正常")
        else:
            print("   ❌ 根路径健康检查失败")

        if health_result.get("api_health", {}).get("status") == "success":
            print("   ✅ API健康检查正常")
        else:
            print("   ❌ API健康检查失败")

        # 测试估算端点结构
        print("\n3. 测试估算端点结构...")
        estimate_result = self.test_estimate_endpoint_structure()
        results["estimate_endpoint"] = estimate_result
        if estimate_result["status"] == "endpoint_exists":
            print("   ✅ 估算端点存在且可访问")
        else:
            print(f"   ❌ 估算端点测试失败: {estimate_result.get('error', '未知错误')}")

        # 测试CORS头信息
        print("\n4. 测试CORS配置...")
        cors_result = self.test_cors_headers()
        results["cors"] = cors_result
        if cors_result["status"] == "success":
            print("   ✅ CORS配置正常")
            if cors_result["cors_headers"]["Access-Control-Allow-Origin"]:
                print(f"   📝 允许的源: {cors_result['cors_headers']['Access-Control-Allow-Origin']}")
        else:
            print(f"   ❌ CORS测试失败: {cors_result.get('error', '未知错误')}")

        print("\n" + "=" * 50)
        print("🎯 连通性测试完成!")

        return results

def main():
    """主函数"""
    print("FastAPI Diet Estimator 连通性测试工具")
    print("默认测试地址: http://localhost:8000")

    # 可以通过环境变量自定义测试地址
    base_url = os.getenv("FASTAPI_BASE_URL", "http://localhost:8000")

    tester = FastAPIConnectivityTester(base_url)
    results = tester.run_all_tests()

    # 保存测试结果
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    results_file = f"connectivity_test_results_{timestamp}.json"

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📊 测试结果已保存到: {results_file}")

if __name__ == "__main__":
    main()
