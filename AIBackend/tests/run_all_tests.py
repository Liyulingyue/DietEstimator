"""
FastAPI测试套件主运行脚本
整合所有测试功能，提供统一的测试入口
"""

import os
import sys
import time
import json
import argparse
from typing import Dict, Any

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from test_connectivity import FastAPIConnectivityTester
from test_performance import FastAPIPerformanceTester
from test_functional import FastAPIFunctionalTester

class FastAPITestSuite:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.connectivity_tester = FastAPIConnectivityTester(base_url)
        self.performance_tester = FastAPIPerformanceTester(base_url)
        self.functional_tester = FastAPIFunctionalTester(base_url)

    def run_connectivity_tests(self) -> Dict[str, Any]:
        """运行连通性测试"""
        print("🔗 开始连通性测试...")
        return self.connectivity_tester.run_all_tests()

    def run_performance_tests(self) -> Dict[str, Any]:
        """运行性能测试"""
        print("\n⚡ 开始性能测试...")
        return self.performance_tester.run_performance_tests()

    def run_functional_tests(self) -> Dict[str, Any]:
        """运行功能测试"""
        print("\n🛠️ 开始功能测试...")
        return self.functional_tester.run_functional_tests()

    def run_all_tests(self, skip_performance: bool = False) -> Dict[str, Any]:
        """运行所有测试"""
        print("🚀 FastAPI Diet Estimator 完整测试套件")
        print(f"测试目标: {self.base_url}")
        print("=" * 70)

        all_results = {
            "test_suite_info": {
                "target_url": self.base_url,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "test_version": "1.0.0"
            }
        }

        # 1. 连通性测试
        try:
            connectivity_results = self.run_connectivity_tests()
            all_results["connectivity"] = connectivity_results

            # 检查服务器是否可用，如果不可用就停止后续测试
            if not connectivity_results.get("server_running", {}).get("status") == "success":
                print("\n❌ 服务器不可用，停止后续测试")
                return all_results

        except Exception as e:
            print(f"\n❌ 连通性测试失败: {e}")
            all_results["connectivity"] = {"error": str(e)}
            return all_results

        # 2. 功能测试
        try:
            functional_results = self.run_functional_tests()
            all_results["functional"] = functional_results
        except Exception as e:
            print(f"\n❌ 功能测试失败: {e}")
            all_results["functional"] = {"error": str(e)}

        # 3. 性能测试（可选）
        if not skip_performance:
            try:
                performance_results = self.run_performance_tests()
                all_results["performance"] = performance_results
            except Exception as e:
                print(f"\n❌ 性能测试失败: {e}")
                all_results["performance"] = {"error": str(e)}
        else:
            print("\n⏭️ 跳过性能测试")

        print("\n" + "=" * 70)
        print("🎯 所有测试完成!")

        return all_results

    def generate_test_report(self, results: Dict[str, Any]) -> str:
        """生成测试报告"""
        report_lines = []
        report_lines.append("# FastAPI Diet Estimator 测试报告")
        report_lines.append(f"**测试时间**: {results.get('test_suite_info', {}).get('timestamp', 'Unknown')}")
        report_lines.append(f"**测试目标**: {results.get('test_suite_info', {}).get('target_url', 'Unknown')}")
        report_lines.append("")

        # 连通性测试报告
        if "connectivity" in results:
            report_lines.append("## 连通性测试结果")
            conn_results = results["connectivity"]

            if conn_results.get("server_running", {}).get("status") == "success":
                response_time = conn_results["server_running"].get("response_time", 0)
                report_lines.append(f"✅ **服务器状态**: 正常运行 (响应时间: {response_time:.3f}s)")
            else:
                report_lines.append("❌ **服务器状态**: 连接失败")

            # 健康检查
            health_check = conn_results.get("health_check", {})
            root_health = health_check.get("root_health", {}).get("status") == "success"
            api_health = health_check.get("api_health", {}).get("status") == "success"

            report_lines.append(f"{'✅' if root_health else '❌'} **根路径健康检查**: {'通过' if root_health else '失败'}")
            report_lines.append(f"{'✅' if api_health else '❌'} **API健康检查**: {'通过' if api_health else '失败'}")
            report_lines.append("")

        # 功能测试报告
        if "functional" in results:
            report_lines.append("## 功能测试结果")
            func_results = results["functional"]

            # API文档测试
            docs_results = func_results.get("api_documentation", {})
            docs_accessible = docs_results.get("docs", {}).get("accessible", False)
            openapi_accessible = docs_results.get("openapi_json", {}).get("accessible", False)

            report_lines.append(f"{'✅' if docs_accessible else '❌'} **Swagger UI**: {'可访问' if docs_accessible else '不可访问'}")
            report_lines.append(f"{'✅' if openapi_accessible else '❌'} **OpenAPI JSON**: {'可访问' if openapi_accessible else '不可访问'}")

            # 支持的方法测试
            methods_results = func_results.get("supported_methods", {})
            for method, result in methods_results.items():
                if "error" not in result:
                    accepted = result.get("accepted", False)
                    status_code = result.get("status_code", "N/A")
                    report_lines.append(f"{'✅' if accepted else '❌'} **{method}**: HTTP {status_code}")

            report_lines.append("")

        # 性能测试报告
        if "performance" in results:
            report_lines.append("## 性能测试结果")
            perf_results = results["performance"]

            # 提取关键性能指标
            endpoints = ["/", "/health", "/api/v1/health"]
            for endpoint in endpoints:
                response_key = f"{endpoint}_response_time"
                if response_key in perf_results:
                    data = perf_results[response_key]
                    avg_time = data.get("avg_response_time", 0)
                    success_rate = data.get("success_rate", 0)
                    report_lines.append(f"**{endpoint}**: 平均响应时间 {avg_time:.3f}s, 成功率 {success_rate:.1f}%")

            report_lines.append("")

        return "\n".join(report_lines)

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="FastAPI Diet Estimator 测试套件")
    parser.add_argument("--url", default="http://localhost:8000", help="FastAPI服务器URL")
    parser.add_argument("--connectivity-only", action="store_true", help="仅运行连通性测试")
    parser.add_argument("--functional-only", action="store_true", help="仅运行功能测试")
    parser.add_argument("--performance-only", action="store_true", help="仅运行性能测试")
    parser.add_argument("--skip-performance", action="store_true", help="跳过性能测试")
    parser.add_argument("--output-dir", default=".", help="测试结果输出目录")

    args = parser.parse_args()

    # 创建输出目录
    if not os.path.exists(args.output_dir):
        os.makedirs(args.output_dir)

    # 初始化测试套件
    test_suite = FastAPITestSuite(args.url)

    # 根据参数运行相应的测试
    if args.connectivity_only:
        results = {"connectivity": test_suite.run_connectivity_tests()}
    elif args.functional_only:
        results = {"functional": test_suite.run_functional_tests()}
    elif args.performance_only:
        results = {"performance": test_suite.run_performance_tests()}
    else:
        results = test_suite.run_all_tests(skip_performance=args.skip_performance)

    # 保存测试结果
    timestamp = time.strftime("%Y%m%d_%H%M%S")

    # JSON格式结果
    json_file = os.path.join(args.output_dir, f"test_results_{timestamp}.json")
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Markdown格式报告
    report_content = test_suite.generate_test_report(results)
    report_file = os.path.join(args.output_dir, f"test_report_{timestamp}.md")
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report_content)

    print(f"\n📊 测试结果已保存:")
    print(f"  - JSON详细结果: {json_file}")
    print(f"  - Markdown报告: {report_file}")

if __name__ == "__main__":
    main()
