# DietEstimator

基于AI的饮食估算系统，提供食物热量计算和营养分析功能。

## 技术栈

- **后端**: FastAPI (Python)
- **AI后端**: FastAPI + 百度文心一言/OCR (Python)
- **前端**: React + TypeScript + Vite
- **数据库**: PostgreSQL + SQLAlchemy + Alembic
- **部署**: Docker & Docker Compose

## 项目结构

```
DietEstimator/
├── Backend/              # 主后端API (FastAPI)
├── AIBackend/            # AI后端API (OCR + LLM)
├── Frontend/             # React前端应用
├── GradioProject/        # Gradio界面 (可选)
├── docker/               # Docker配置文件
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   └── ...
└── .dockerignore
```

## 快速开始 (开发环境)

### 前置要求

- Docker Desktop
- Python 3.10+
- Node.js 18+
- Git

### 1. 克隆项目

```bash
git clone [repository-url]
cd DietEstimator
```

### 2. 数据库设置

开发环境下，使用Docker快速启动PostgreSQL数据库：

```bash
# 启动数据库和Adminer
docker-compose -f docker/docker-compose.dev.yml up -d db adminer

# 等待数据库启动 (约10秒)
```

数据库访问：
- PostgreSQL: localhost:5432
- Adminer: http://localhost:8080 (用户名: dietuser, 密码: dietpass)

### 3. 启动后端服务

#### 主后端 (Backend)
```bash
cd Backend
python run.py  # 自动应用数据库迁移并启动FastAPI
```

#### AI后端 (AIBackend)
```bash
cd ../AIBackend
python run.py  # 启动AI服务
```

### 4. 启动前端

```bash
cd Frontend
npm install
npm run dev
```

### 5. 访问应用

- 前端: http://localhost:3000
- 主后端API: http://localhost:8000
- AI后端API: http://localhost:8001

## 数据库迁移

后端使用Alembic进行数据库结构管理：

```bash
cd Backend

# 生成新迁移 (当模型变更时)
alembic revision --autogenerate -m "migration message"

# 应用迁移
alembic upgrade head

# 或在run.py中自动应用
python run.py
```

## 完整开发环境

使用Docker Compose启动所有服务：

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

这将启动数据库、前后端所有服务。

## 生产部署

```bash
# 配置环境变量 (.env.prod)
docker-compose -f docker/docker-compose.prod.yml --env-file .env.prod up -d
```

## 开发指南

- 后端API文档: http://localhost:8000/docs
- AI后端API文档: http://localhost:8001/docs
- 数据库管理: http://localhost:8080

## 许可证

[License]