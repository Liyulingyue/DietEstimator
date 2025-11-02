"""
测试配置文件
用于配置各种测试参数
"""

import os
from typing import Dict, Any

# 默认测试配置
DEFAULT_CONFIG = {
    # 服务器配置
    "server": {
        "base_url": "http://localhost:8000",
        "timeout": 30,
        "retry_attempts": 3
    },

    # 连通性测试配置
    "connectivity": {
        "test_endpoints": [
            "/",
            "/health",
            "/api/v1/health"
        ],
        "expected_status_codes": {
            "/": 200,
            "/health": 200,
            "/api/v1/health": 200
        }
    },

    # 性能测试配置
    "performance": {
        "response_time_test": {
            "num_requests": 10,
            "max_acceptable_time": 5.0  # 秒
        },
        "concurrent_test": {
            "num_concurrent": 5,
            "total_requests": 20,
            "max_acceptable_time": 10.0  # 秒
        },
        "load_test": {
            "duration_seconds": 30,
            "min_requests_per_second": 1.0
        }
    },

    # 功能测试配置
    "functional": {
        "test_image_sizes": [
            (100, 100),    # 小图片
            (500, 500),    # 中等图片
            (1000, 1000)   # 大图片
        ],
        "supported_methods": [
            "llm_ocr_hybrid",
            "pure_llm",
            "nutrition_table",
            "food_portion"
        ],
        "test_file_types": [
            "image/jpeg",
            "image/png",
            "text/plain"  # 用于测试错误处理
        ]
    }
}

class TestConfig:
    """测试配置管理器"""

    def __init__(self, config_file: str = None):
        self.config = DEFAULT_CONFIG.copy()

        # 从环境变量读取配置
        self._load_from_env()

        # 从配置文件读取（如果提供）
        if config_file and os.path.exists(config_file):
            self._load_from_file(config_file)

    def _load_from_env(self):
        """从环境变量加载配置"""
        # 服务器配置
        if os.getenv("FASTAPI_BASE_URL"):
            self.config["server"]["base_url"] = os.getenv("FASTAPI_BASE_URL")

        if os.getenv("FASTAPI_TIMEOUT"):
            try:
                self.config["server"]["timeout"] = int(os.getenv("FASTAPI_TIMEOUT"))
            except ValueError:
                pass

        # 性能测试配置
        if os.getenv("PERFORMANCE_NUM_REQUESTS"):
            try:
                self.config["performance"]["response_time_test"]["num_requests"] = int(
                    os.getenv("PERFORMANCE_NUM_REQUESTS")
                )
            except ValueError:
                pass

        if os.getenv("PERFORMANCE_CONCURRENT_USERS"):
            try:
                self.config["performance"]["concurrent_test"]["num_concurrent"] = int(
                    os.getenv("PERFORMANCE_CONCURRENT_USERS")
                )
            except ValueError:
                pass

    def _load_from_file(self, config_file: str):
        """从JSON文件加载配置"""
        try:
            import json
            with open(config_file, 'r', encoding='utf-8') as f:
                file_config = json.load(f)
                self._deep_update(self.config, file_config)
        except Exception as e:
            print(f"警告: 无法加载配置文件 {config_file}: {e}")

    def _deep_update(self, base_dict: Dict, update_dict: Dict):
        """深度更新字典"""
        for key, value in update_dict.items():
            if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                self._deep_update(base_dict[key], value)
            else:
                base_dict[key] = value

    def get(self, *keys):
        """获取配置值"""
        result = self.config
        for key in keys:
            if isinstance(result, dict) and key in result:
                result = result[key]
            else:
                return None
        return result

    def get_server_config(self) -> Dict[str, Any]:
        """获取服务器配置"""
        return self.config["server"]

    def get_connectivity_config(self) -> Dict[str, Any]:
        """获取连通性测试配置"""
        return self.config["connectivity"]

    def get_performance_config(self) -> Dict[str, Any]:
        """获取性能测试配置"""
        return self.config["performance"]

    def get_functional_config(self) -> Dict[str, Any]:
        """获取功能测试配置"""
        return self.config["functional"]

# 创建全局配置实例
test_config = TestConfig()

# 导出常用配置
BASE_URL = test_config.get("server", "base_url")
TIMEOUT = test_config.get("server", "timeout")
SUPPORTED_METHODS = test_config.get("functional", "supported_methods")
