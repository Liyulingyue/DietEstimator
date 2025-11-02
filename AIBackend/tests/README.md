# FastAPI 连通性测试套件

这个文件夹包含了用于测试 Diet Estimator FastAPI 后端的完整测试套件。

## 文件结构

```
tests/
├── README.md                 # 本文档
├── test_config.py           # 测试配置管理
├── test_connectivity.py     # 连通性测试
├── test_performance.py      # 性能测试
├── test_functional.py       # 功能测试
├── run_all_tests.py         # 综合测试运行器
└── requirements.txt         # 测试依赖
```

## 安装依赖

在运行测试之前，请安装所需的依赖包：

```bash
cd tests
pip install -r requirements.txt
```

## 使用方法

### 1. 快速开始

确保 FastAPI 服务器正在运行（默认在 http://localhost:8000），然后运行：

```bash
# 运行所有测试
python run_all_tests.py

# 仅运行连通性测试
python run_all_tests.py --connectivity-only

# 仅运行功能测试
python run_all_tests.py --functional-only

# 运行测试但跳过性能测试（更快）
python run_all_tests.py --skip-performance

# 指定不同的服务器地址
python run_all_tests.py --url http://your-server:8000
```

### 2. 单独运行测试

#### 连通性测试
```bash
python test_connectivity.py
```
测试内容：
- 服务器是否运行
- 健康检查端点
- API端点可访问性
- CORS配置

#### 性能测试
```bash
python test_performance.py
```
测试内容：
- 响应时间测试
- 并发请求测试
- 负载测试
- 吞吐量测试

#### 功能测试
```bash
python test_functional.py
```
测试内容：
- API参数验证
- 支持的分析方法
- 文件上传功能
- API文档可访问性

### 3. 配置自定义参数

通过环境变量配置测试参数：

```bash
# 设置服务器地址
export FASTAPI_BASE_URL=http://localhost:8000

# 设置超时时间
export FASTAPI_TIMEOUT=30

# 设置性能测试请求数量
export PERFORMANCE_NUM_REQUESTS=20

# 设置并发用户数
export PERFORMANCE_CONCURRENT_USERS=10
```

## 测试输出

测试完成后会生成以下文件：

- `test_results_YYYYMMDD_HHMMSS.json` - 详细的JSON格式测试结果
- `test_report_YYYYMMDD_HHMMSS.md` - 人类可读的Markdown格式报告

## 测试场景说明

### 连通性测试
- ✅ **服务器运行检查**: 验证FastAPI服务器是否正常启动
- ✅ **端点可访问性**: 测试主要端点是否响应
- ✅ **健康检查**: 验证 `/health` 和 `/api/v1/health` 端点
- ✅ **CORS配置**: 检查跨域资源共享设置

### 功能测试
- ✅ **参数验证**: 测试API参数验证是否正确工作
- ✅ **支持的方法**: 验证所有分析方法（llm_ocr_hybrid, pure_llm, etc.）
- ✅ **文件上传**: 测试单文件、多文件、大文件上传
- ✅ **错误处理**: 测试无效输入的错误处理
- ✅ **API文档**: 验证Swagger UI和OpenAPI JSON可访问性

### 性能测试
- ⚡ **响应时间**: 测量API端点的平均响应时间
- ⚡ **并发处理**: 测试多个并发请求的处理能力
- ⚡ **负载测试**: 持续时间内的请求处理能力
- ⚡ **吞吐量**: 每秒处理的请求数量

## 常见问题

### Q: 测试显示"连接失败"
A: 请确保：
1. FastAPI服务器正在运行
2. 服务器地址和端口正确
3. 防火墙没有阻止连接

### Q: 性能测试运行太慢
A: 可以使用 `--skip-performance` 参数跳过性能测试，或通过环境变量减少测试请求数量。

### Q: 如何测试远程服务器
A: 使用 `--url` 参数指定远程服务器地址：
```bash
python run_all_tests.py --url http://remote-server:8000
```

### Q: 测试失败了怎么办
A: 查看生成的测试报告文件，其中包含详细的错误信息和状态码。

## 自动化集成

这些测试脚本可以集成到CI/CD流水线中：

```bash
# 在CI环境中运行
python run_all_tests.py --skip-performance --output-dir ./test-results
```

## 扩展测试

要添加新的测试：

1. 在相应的测试文件中添加新的测试方法
2. 在 `run_all_tests.py` 中调用新的测试
3. 更新 `test_config.py` 中的配置（如需要）

## 许可证

此测试套件遵循与主项目相同的许可证。
