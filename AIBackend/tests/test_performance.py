"""
FastAPI性能测试脚本
用于测试API的响应时间和并发性能
"""

import requests
import time
import statistics
import concurrent.futures
import json
from typing import List, Dict, Any
import os

class FastAPIPerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api/v1"

    def single_request_test(self, endpoint: str, method: str = "GET", **kwargs) -> Dict[str, Any]:
        """单次请求测试"""
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10, **kwargs)
            elif method.upper() == "POST":
                response = requests.post(f"{self.base_url}{endpoint}", timeout=10, **kwargs)

            end_time = time.time()
            response_time = end_time - start_time

            return {
                "success": True,
                "status_code": response.status_code,
                "response_time": response_time,
                "content_length": len(response.content)
            }
        except Exception as e:
            end_time = time.time()
            return {
                "success": False,
                "error": str(e),
                "response_time": end_time - start_time
            }

    def response_time_test(self, endpoint: str, num_requests: int = 10) -> Dict[str, Any]:
        """响应时间测试"""
        print(f"正在测试 {endpoint} 的响应时间 ({num_requests} 次请求)...")

        response_times = []
        success_count = 0

        for i in range(num_requests):
            result = self.single_request_test(endpoint)
            response_times.append(result["response_time"])
            if result["success"]:
                success_count += 1

            # 显示进度
            print(f"  进度: {i+1}/{num_requests}", end='\r')

        print()  # 换行

        return {
            "endpoint": endpoint,
            "total_requests": num_requests,
            "successful_requests": success_count,
            "success_rate": (success_count / num_requests) * 100,
            "avg_response_time": statistics.mean(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "median_response_time": statistics.median(response_times),
            "response_times": response_times
        }

    def concurrent_test(self, endpoint: str, num_concurrent: int = 5, num_requests: int = 20) -> Dict[str, Any]:
        """并发测试"""
        print(f"正在进行并发测试 {endpoint} ({num_concurrent} 并发, {num_requests} 总请求)...")

        def make_request():
            return self.single_request_test(endpoint)

        start_time = time.time()
        results = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]

            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                result = future.result()
                results.append(result)
                print(f"  完成: {i+1}/{num_requests}", end='\r')

        end_time = time.time()
        total_time = end_time - start_time

        print()  # 换行

        successful_results = [r for r in results if r["success"]]
        response_times = [r["response_time"] for r in successful_results]

        return {
            "endpoint": endpoint,
            "concurrent_users": num_concurrent,
            "total_requests": num_requests,
            "successful_requests": len(successful_results),
            "success_rate": (len(successful_results) / num_requests) * 100,
            "total_test_time": total_time,
            "requests_per_second": num_requests / total_time,
            "avg_response_time": statistics.mean(response_times) if response_times else 0,
            "min_response_time": min(response_times) if response_times else 0,
            "max_response_time": max(response_times) if response_times else 0
        }

    def load_test(self, endpoint: str, duration_seconds: int = 30) -> Dict[str, Any]:
        """负载测试"""
        print(f"正在进行负载测试 {endpoint} (持续 {duration_seconds} 秒)...")

        start_time = time.time()
        end_time = start_time + duration_seconds
        requests_made = 0
        successful_requests = 0
        response_times = []

        while time.time() < end_time:
            result = self.single_request_test(endpoint)
            requests_made += 1

            if result["success"]:
                successful_requests += 1
                response_times.append(result["response_time"])

            # 显示进度
            elapsed = time.time() - start_time
            print(f"  已运行: {elapsed:.1f}s/{duration_seconds}s, 请求数: {requests_made}", end='\r')

        actual_duration = time.time() - start_time
        print()  # 换行

        return {
            "endpoint": endpoint,
            "test_duration": actual_duration,
            "total_requests": requests_made,
            "successful_requests": successful_requests,
            "success_rate": (successful_requests / requests_made) * 100 if requests_made > 0 else 0,
            "requests_per_second": requests_made / actual_duration,
            "avg_response_time": statistics.mean(response_times) if response_times else 0,
            "min_response_time": min(response_times) if response_times else 0,
            "max_response_time": max(response_times) if response_times else 0
        }

    def run_performance_tests(self) -> Dict[str, Any]:
        """运行所有性能测试"""
        print("🚀 开始FastAPI性能测试...")
        print("=" * 60)

        test_results = {}

        # 测试端点列表
        endpoints = [
            "/",
            "/health",
            "/api/v1/health"
        ]

        for endpoint in endpoints:
            print(f"\n📊 测试端点: {endpoint}")
            print("-" * 40)

            # 响应时间测试
            response_time_result = self.response_time_test(endpoint, num_requests=10)
            test_results[f"{endpoint}_response_time"] = response_time_result

            print(f"✅ 平均响应时间: {response_time_result['avg_response_time']:.3f}s")
            print(f"✅ 成功率: {response_time_result['success_rate']:.1f}%")

            # 并发测试
            concurrent_result = self.concurrent_test(endpoint, num_concurrent=3, num_requests=15)
            test_results[f"{endpoint}_concurrent"] = concurrent_result

            print(f"✅ 并发测试 - 成功率: {concurrent_result['success_rate']:.1f}%")
            print(f"✅ 每秒请求数: {concurrent_result['requests_per_second']:.2f}")

            # 短期负载测试
            load_result = self.load_test(endpoint, duration_seconds=10)
            test_results[f"{endpoint}_load"] = load_result

            print(f"✅ 负载测试 - 每秒请求数: {load_result['requests_per_second']:.2f}")
            print(f"✅ 负载测试 - 成功率: {load_result['success_rate']:.1f}%")

        print("\n" + "=" * 60)
        print("🎯 性能测试完成!")

        return test_results

def main():
    """主函数"""
    print("FastAPI Diet Estimator 性能测试工具")
    print("默认测试地址: http://localhost:8000")

    base_url = os.getenv("FASTAPI_BASE_URL", "http://localhost:8000")

    tester = FastAPIPerformanceTester(base_url)
    results = tester.run_performance_tests()

    # 保存测试结果
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    results_file = f"performance_test_results_{timestamp}.json"

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📊 测试结果已保存到: {results_file}")

if __name__ == "__main__":
    main()
