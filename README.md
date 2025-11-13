# DietEstimator

基于AI的智能饮食估算系统，提供食物热量计算、营养分析和饮食记录管理功能。

## 项目介绍

DietEstimator 是一个创新的智能饮食管理平台，利用AI视觉识别技术帮助用户轻松记录和管理日常饮食。只需拍照上传食物图片，系统就能自动识别食物种类、估算热量和营养成分，让健康饮食管理变得简单高效。

### 核心功能

#### 🎯 智能热量估算
- **拍照即可分析**：上传食物照片，AI自动识别食物类型和份量
- **多种分析模式**：
  - 纯视觉AI分析 - 适用于所有食物类型
  - OCR+AI混合分析 - 针对包装食品营养标签的精准识别
  - 营养成分表提取 - 自动识别并结构化营养标签信息
  - 食物份量检测 - 智能识别食品包装上的份量信息
- **即时反馈**：实时返回热量、蛋白质、碳水化合物、脂肪等营养数据

#### 📊 饮食记录管理
- **完整的记录系统**：记录每餐的食物照片、时间、营养数据
- **历史数据查询**：按日期、时间段查看历史饮食记录
- **数据统计分析**：图表展示热量摄入趋势、营养比例分布
- **个性化标签**：为记录添加备注、餐次标签（早餐/午餐/晚餐/加餐）

#### 🖼️ 图库管理
- **照片归档**：自动保存所有分析过的食物照片
- **便捷回顾**：快速浏览和检索历史照片
- **关联记录**：照片与饮食记录自动关联，方便追溯

#### 👤 用户系统
- **账户注册登录**：安全的用户认证机制
- **个人数据隔离**：每个用户的数据独立存储，保护隐私
- **会话管理**：支持多设备登录，自动会话保持

### 应用场景

- **🏋️ 健身人群**：精确控制热量摄入，配合运动达成健身目标
- **🩺 健康管理**：慢性病患者（如糖尿病、高血压）进行饮食监控
- **⚖️ 体重管理**：减重或增重人群科学管理饮食
- **🍱 营养均衡**：关注营养健康的普通用户日常饮食记录
- **👨‍👩‍👧‍👦 家庭使用**：记录家人饮食，关注全家健康

### 技术亮点

- **先进的AI模型**：集成百度文心一言视觉大模型，识别准确率高
- **OCR文字识别**：PaddleOCR技术精准提取营养标签信息
- **智能决策系统**：根据图片特征自动选择最优分析方案
- **微服务架构**：前后端分离，AI服务独立部署，易于扩展
- **容器化部署**：Docker Compose一键部署，开发生产环境隔离
- **数据持久化**：PostgreSQL关系型数据库，数据安全可靠

## 技术栈

### 后端服务
- **主后端 (Backend)**: FastAPI + PostgreSQL + SQLAlchemy + Alembic
- **AI后端 (AIBackend)**: FastAPI + 百度文心一言 + PaddleOCR
- **数据库**: PostgreSQL 15
- **数据库管理**: Adminer (仅开发环境)

### 前端应用
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design 5
- **路由**: React Router DOM 7
- **图表**: Recharts

### 部署与容器化
- **容器**: Docker & Docker Compose
- **Web服务器**: Nginx (生产环境)
- **开发工具**: 热重载、源码映射

## 项目结构

```
DietEstimator/
├── Backend/                    # 主后端服务
├── AIBackend/                  # AI分析服务
├── Frontend/                   # React前端应用
├── docker/                     # Docker配置集中管理
└── GradioProject/              # Gradio原型界面 (可选)
```

## 快速开始

### 前置要求

- **Docker Desktop** (推荐)
- **Python 3.10+** (本地开发)
- **Node.js 18+** (本地开发)
- **Git**

### 方式一：使用Docker Compose (推荐)

**开发环境完整部署**

```powershell
# 克隆项目
git clone [repository-url]
cd DietEstimator

# 启动所有服务 (数据库、后端、AI后端、前端、Adminer)
docker-compose -f docker/docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker/docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker/docker-compose.dev.yml logs -f
```

**访问地址**：
- 前端应用: http://localhost:5176
- 主后端API: http://localhost:8000/docs
- AI后端API: http://localhost:8001/docs
- 数据库管理 (Adminer): http://localhost:8080

**停止服务**：
```powershell
docker-compose -f docker/docker-compose.dev.yml down
```

### 方式二：本地开发 (支持热重载)

#### 1. 启动数据库

```powershell
# 仅启动数据库和Adminer
docker-compose -f docker/docker-compose.dev.yml up -d db adminer
```

#### 2. 启动主后端

```powershell
cd Backend

# 创建虚拟环境 (首次)
python -m venv venv
.\venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量 (复制 .env.example 到 .env 并修改)
copy .env.example .env

# 启动服务 (自动执行数据库迁移)
python run.py
```

#### 3. 启动AI后端

```powershell
cd AIBackend

# 创建虚拟环境
python -m venv venv
.\venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
python run.py
```

#### 4. 启动前端

```powershell
cd Frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**访问地址**：
- 前端: http://localhost:5176
- 主后端: http://localhost:8000
- AI后端: http://localhost:8001
- Adminer: http://localhost:8080

### Adminer数据库管理

- **URL**: http://localhost:8080
- **系统**: PostgreSQL
- **服务器**: db (容器内) 或 localhost (本地)
- **用户名**: dietuser
- **密码**: dietpass
- **数据库**: diet_estimator

## 数据库管理

### 使用Alembic进行数据库迁移

```powershell
cd Backend

# 自动检测模型变化并生成迁移文件
alembic revision --autogenerate -m "描述变更内容"

# 查看待执行的迁移
alembic current
alembic history

# 应用迁移到最新版本
alembic upgrade head

# 回滚到上一版本
alembic downgrade -1
```

**提示**: `run.py` 启动时会自动执行 `alembic upgrade head`

### 常见数据库操作

```powershell
# 查看数据库容器日志
docker-compose -f docker/docker-compose.dev.yml logs db

# 进入数据库容器
docker-compose -f docker/docker-compose.dev.yml exec db psql -U dietuser -d diet_estimator

# 备份数据库
docker-compose -f docker/docker-compose.dev.yml exec db pg_dump -U dietuser diet_estimator > backup.sql

# 恢复数据库
cat backup.sql | docker-compose -f docker/docker-compose.dev.yml exec -T db psql -U dietuser -d diet_estimator
```

## 生产环境部署

### 1. 准备环境配置

```powershell
# 创建生产环境配置文件
copy .env.example .env.prod

# 编辑 .env.prod，设置安全的密码和密钥
# 必须设置: PROD_DB_PASSWORD
```

### 2. 启动生产服务

```powershell
# 使用生产配置启动
docker-compose -f docker/docker-compose.prod.yml --env-file .env.prod up -d

# 查看服务状态
docker-compose -f docker/docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker/docker-compose.prod.yml logs -f
```

### 3. 访问生产服务

- **前端**: http://your-domain:5176
- **主后端API**: http://your-domain:8000
- **AI后端API**: http://your-domain:8001

### 4. 生产环境管理

```powershell
# 重启特定服务
docker-compose -f docker/docker-compose.prod.yml restart backend

# 查看资源使用情况
docker stats

# 清理未使用的资源
docker system prune -a
```

### 生产环境注意事项

- ✅ 使用强密码 (`.env.prod` 中的 `PROD_DB_PASSWORD`)
- ✅ 配置HTTPS (建议使用Nginx反向代理 + Let's Encrypt)
- ✅ 定期备份数据库
- ✅ 监控日志和资源使用
- ✅ 设置防火墙规则，仅开放必要端口
- ❌ 生产环境不包含Adminer


## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request
