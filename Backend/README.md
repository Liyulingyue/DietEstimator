# DietEstimator Backend

这是 DietEstimator 项目的后端服务，提供 API 接口服务和数据库管理。项目支持开发环境和生产环境的分离部署。在 Windows 环境下进行开发和部署时，请使�?PowerShell 命令�?

## 技术栈

- FastAPI: 现代、快速的 Web 框架
- PostgreSQL: 数据�?
- SQLAlchemy: ORM框架
- Alembic: 数据库迁移工�?
- Docker & Docker Compose: 容器化部�?
- Adminer: 数据库管理工具（仅开发环境）

## 项目结构

```
Backend/
├── app/                    # 主应用目�?
�?  ├── api/               # API路由和端�?
�?  ├── core/              # 核心配置
�?  ├── models/            # 数据库模�?
�?  ├── schemas/           # Pydantic模式
�?  ├── crud/              # 数据库操�?
�?  └── services/          # 业务逻辑
├── alembic/               # 数据库迁移文�?
├── requirements.txt       # Python依赖
├── alembic.ini           # Alembic配置
├── run.py                # 开发环境启动脚本（跨平台）
├── .env                  # 当前环境配置
└── .env.example          # 环境配置模板
```

Docker 配置文件位于项目根目录的 `docker/` 文件夹中�?

## 开发环�?

### 前置要求

- Docker Desktop for Windows
- Python 3.10+
- pip

### 开发环境配�?

1. 克隆项目到本地：
   ```powershell
   git clone [repository-url]
   cd Backend
   ```

2. 创建并激活虚拟环境：
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. 安装依赖�?
   ```powershell
   pip install -r requirements.txt
   ```

4. 复制并配置环境文件：
   ```powershell
   # 复制开发环境配置文件到 .env
   copy .env.example .env
   ```

5. �?`.env` 中配�?AI 后端地址�?
   ```powershell
   # �?.env 中设�?AI 后端服务地址，例如：
   # AI_BACKEND_URL=http://localhost:8001
   ```

5. 启动开发环境：
   ```powershell
   # 启动数据库和Adminer
   docker-compose -f ../../docker/docker-compose.dev.yml up -d
   
   # 启动后端服务（在新的终端中运行）
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

开发环境将启动�?
- PostgreSQL 数据�?(localhost:5432)
- Adminer 数据库管理工�?(http://localhost:8080)
- FastAPI 应用（本地运行，支持热重载）

### 数据库访�?

通过 Adminer 访问数据库：
- URL: http://localhost:8080
- 系统：MySQL
- 服务器：db
- 用户名：dietuser
- 密码：dietpass
- 数据库：diet_estimator

## 生产环境

### 部署步骤

1. 创建生产环境配置�?
   ```powershell
   # 复制并编辑生产环境配�?
   copy .env.example .env.prod
   # 使用文本编辑器编�?.env.prod，设置安全的数据库密�?
   ```

2. 启动生产环境�?
   ```powershell
   docker-compose -f ../docker/docker-compose.prod.yml --env-file .env.prod up -d
   ```

3. 数据库迁移（自动执行）：
   生产环境配置了自动数据库迁移，容器启动时会：
   - 等待数据库服务就�?
   - 自动执行 `alembic upgrade head`
   - 启动 FastAPI 应用

   如果需要手动执行迁移：
   ```powershell
   # 进入后端容器
   docker-compose -f ../docker/docker-compose.prod.yml exec backend bash
   # 执行迁移
   alembic upgrade head
   ```

### 生产环境注意事项

1. 确保 `.env.prod` 中使用强密码
2. 生产环境不包�?Adminer，建议使用专业的数据库管理工�?
3. 所有服务配置了自动重启
4. 数据持久化存储在 Docker volumes �?

## 数据库迁�?

### Alembic 初始化与配置

1. 初始�?Alembic（如�?alembic 目录不存在）�?
   ```powershell
   alembic init alembic
   ```

2. 配置数据库连接：
   Alembic 现在自动从环境变量读取数据库配置，无需手动修改 `alembic.ini`�?
   
   支持的环境变量：
   - `PostgreSQL_SERVER`：数据库主机（默�? localhost�?
   - `PostgreSQL_USER`：数据库用户（默�? dietuser�?
   - `PostgreSQL_PASSWORD`：数据库密码（默�? dietpass�?
   - `PostgreSQL_DB`：数据库名（默认: diet_estimator�?
   - `PostgreSQL_PORT`：数据库端口（默�? 5432�?

3. 配置模型导入（修�?alembic/env.py）：
   ```python
   # 在文件开头添�?
   import os
   import sys
   sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

   # 找到 target_metadata = None 这一行，替换为：
   from app.models.models import Base
   target_metadata = Base.metadata
   ```

### 使用 Alembic 管理数据�?

1. 创建新的迁移文件�?
   ```powershell
   # 自动检测模型变化并生成迁移文件
   alembic revision --autogenerate -m "描述你的修改"
   ```

2. 查看迁移文件�?
   - 检�?`alembic/versions/` 目录下生成的迁移文件
   - 确认自动生成的变更是否符合预�?

3. 应用迁移�?
   ```powershell
   # 升级到最新版�?
   alembic upgrade head

   # 或者升级到指定版本
   alembic upgrade <revision_id>
   ```

4. 查看迁移状态：
   ```powershell
   # 查看当前版本
   alembic current

   # 查看历史记录
   alembic history
   ```

5. 回滚操作�?
   ```powershell
   # 回滚到上一个版�?
   alembic downgrade -1

   # 回滚到初始状�?
   alembic downgrade base
   ```

### 常见问题解决

1. 模块导入错误�?
   - 确保虚拟环境已激�?
   - 确保在项目根目录运行命令
   - 检�?env.py 中的路径配置

2. 数据库连接错误：
   - 确保 PostgreSQL 容器正在运行
   - 验证 alembic.ini 中的连接信息
   - 使用 Adminer 测试数据库连�?

3. 迁移文件冲突�?
   - 保存当前数据库内�?
   - 删除 alembic_version �?
   - 重新生成迁移文件

### 在生产环境中

```powershell
# 在生产环境容器中运行迁移
docker-compose -f ../docker/docker-compose.prod.yml exec backend alembic upgrade head
```

## 常用命令

### 开发环�?

- 停止开发环境数据库�?
  ```powershell
  docker-compose -f ../docker/docker-compose.dev.yml down
  ```

- 查看数据库日志：
  ```powershell
  docker-compose -f ../docker/docker-compose.dev.yml logs db
  ```

### 生产环境

- 停止所有服务：
  ```powershell
  docker-compose -f ../docker/docker-compose.prod.yml down
  ```

- 查看应用日志�?
  ```powershell
  docker-compose -f ../docker/docker-compose.prod.yml logs backend
  ```

- 重启服务�?
  ```powershell
  docker-compose -f ../docker/docker-compose.prod.yml restart backend
  ```

## 故障排除

### 开发环�?

1. 如果遇到数据库连接问题：
   - 检�?`.env` 中的配置是否�?`.env.example` 一�?
   - 确保数据库容器正常运行：
     ```powershell
     docker-compose -f ../docker/docker-compose.dev.yml ps
     ```

2. 如果热重载不工作�?
   - 检查是否使用了 `--reload` 参数启动 uvicorn
   - 检�?Python 虚拟环境是否正确激�?

### 生产环境

1. 服务无法启动�?
   - 检�?`.env.prod` 配置
   - 查看容器日志�?
     ```powershell
     docker-compose -f ../docker/docker-compose.prod.yml logs
     ```

2. 数据库连接失败：
   - 确保 volumes 正确创建
   - 检查网络配�?

## AI 后端中转与接口变�?

本仓库现在将 AI 请求�?API 层中原样中转到你配置�?AI 后端（由 `AI_BACKEND_URL` 指定）�?

暴露的中转端点：

- POST /api/v1/estimate/pure_llm
- POST /api/v1/estimate/llm_ocr_hybrid
- POST /api/v1/nutrition_table
- POST /api/v1/food_portion

注意：历史的单一端点 `POST /api/v1/estimate` 已移除，请使用上面四个端点之一�?

已移除的模块�?

- `app/services/ai_service.py` 的实现已从仓库中移除（文件保留为占位）。要在本�?git 仓库中真正删除该文件并提交，请运行：

```powershell
git rm app/services/ai_service.py
git commit -m "Remove legacy ai_service implementation; endpoints proxy to AI backend"
git push
```

