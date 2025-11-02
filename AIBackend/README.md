# Docker 部署

1. 构建镜像：

```powershell
docker build -t diet-estimator .
```

2. 运行容器并映射到本地 8001 端口：

```powershell
docker run -p 8001:8001 diet-estimator
```

服务启动后可通过 http://localhost:8001 访问。
# Diet Estimator FastAPI Backend

基于FastAPI的食物热量计算器后端服务，集成百度文心一言Ernie4.5大模型和PaddleOCR技术。

## 项目结构

```
diet_estimator_fastapi/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口
│   ├── api/
│   │   ├── __init__.py
│   │   └── endpoints.py        # API端点定义
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ocr_service.py      # PaddleOCR服务封装
│   │   ├── llm_service.py      # 百度文心一言LLM服务
│   │   └── estimator.py        # 核心热量估算服务
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic数据模型
│   └── utils/
│       ├── __init__.py
│       ├── image_utils.py      # 图片处理工具
│       └── prompt_helper.py    # 提示词模板和辅助函数
├── requirements.txt            # 依赖包列表
└── README.md                  # 项目说明文档
```

## 功能特性

### 支持的分析方法

1. **大模型OCR混合估算** (`llm_ocr_hybrid`)
   - 适用场景：有营养标签的包装食品
   - 智能三阶段处理：营养表检测 → 分量信息检测 → 智能推理选择

2. **基于大模型估算** (`pure_llm`)
   - 适用场景：所有类型食物（新鲜食材、自制食品、包装食品等）
   - 直接使用VL模型进行视觉分析

3. **营养成分表提取** (`nutrition_table`)
   - 适用场景：需要详细营养成分信息的包装食品
   - 三阶段流程：检测 → OCR提取 → 结构化解析

4. **食物份量检测** (`food_portion`)
   - 适用场景：需要准确份量信息的包装食品或标签
   - 三阶段流程：检测 → OCR提取 → 标准化处理

## 快速开始

### 环境要求
- Python 3.8+
- pip

### 安装依赖

```bash
cd diet_estimator_fastapi
pip install -r requirements.txt
```

### 运行服务

```bash
# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

服务启动后，访问：
- API文档：http://localhost:8001/docs
- ReDoc文档：http://localhost:8001/redoc
- 健康检查：http://localhost:8001/health

## API接口说明

### 主要端点

#### 1. 通用热量估算接口
```
POST /api/v1/estimate
```

参数：
- `files`: 图片文件列表（支持多张图片）
- `api_key`: 百度文心一言API密钥
- `method`: 分析方法 (`llm_ocr_hybrid`/`pure_llm`/`nutrition_table`/`food_portion`)

#### 2. 专用分析接口

- `POST /api/v1/estimate/llm-ocr-hybrid` - 大模型OCR混合估算
- `POST /api/v1/estimate/pure-llm` - 基于大模型估算  
- `POST /api/v1/estimate/nutrition-table` - 营养成分表提取
- `POST /api/v1/estimate/food-portion` - 食物份量检测

#### 3. 辅助接口

- `GET /api/v1/methods` - 获取所有可用的分析方法
- `GET /api/v1/health` - 健康检查
- `GET /` - 根路径，返回API状态

### 请求示例

#### 使用curl

```bash
# 大模型OCR混合估算
curl -X POST "http://localhost:8001/api/v1/estimate/llm-ocr-hybrid" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@food_image.jpg" \
  -F "api_key=your_api_key_here"

# 获取可用方法
curl -X GET "http://localhost:8001/api/v1/methods"
```

#### 使用Python requests

```python
import requests

# 上传图片进行分析
files = {'files': open('food_image.jpg', 'rb')}
data = {
    'api_key': 'your_api_key_here',
    'method': 'pure_llm'
}

response = requests.post(
    'http://localhost:8001/api/v1/estimate', 
    files=files, 
    data=data
)

result = response.json()
print(result)
```

### 响应格式

```json
{
    "success": true,
    "message": "分析完成",
    "result": "✅ 热量: 250 大卡\n\n📝 估算依据:\n基于图片中的苹果大小和数量估算...",
    "error": null
}
```

## 配置说明

### API密钥配置

项目使用百度文心一言API，需要：
1. 在百度智能云平台申请API密钥
2. 在请求中传入`api_key`参数

### 环境变量（可选）

可以设置以下环境变量：
- `API_BASE_URL`: 自定义API基础URL
- `MAX_FILE_SIZE`: 最大文件大小限制

## 部署说明

### Docker部署

创建Dockerfile：
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

构建和运行：
```bash
docker build -t diet-estimator-api .
docker run -p 8001:8001 diet-estimator-api
```

### 生产环境部署

建议使用：
- Nginx作为反向代理
- Gunicorn作为WSGI服务器
- 使用SSL证书启用HTTPS

## 错误处理

API返回标准的HTTP状态码：
- 200: 成功
- 400: 请求参数错误
- 500: 服务器内部错误

错误响应格式：
```json
{
    "success": false,
    "message": "分析失败",
    "result": null,
    "error": "具体错误信息"
}
```

## 注意事项

1. **图片格式**: 支持JPG、PNG等常见图片格式
2. **文件大小**: 建议单张图片不超过10MB
3. **并发限制**: 建议控制并发请求数量
4. **API限制**: 注意百度文心一言API的调用限制
5. **隐私保护**: 上传的图片仅用于分析，不会被保存

## 开发说明

### 添加新的分析方法

1. 在`AnalysisMethod`枚举中添加新方法
2. 在`estimator.py`中实现处理逻辑
3. 在`endpoints.py`中添加对应的API端点
4. 更新文档说明

### 测试

```bash
# 运行测试（如果有测试文件）
pytest

# 手动测试API
python -m pytest tests/
```
