#!/bin/bash

# 生产环境启动脚本
echo "Starting production environment..."

# 等待数据库启动
echo "Waiting for database to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_SERVER" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
    echo "PostgreSQL is not ready yet. Waiting 2 seconds..."
    sleep 2
done
echo "PostgreSQL is ready!"

# 执行数据库迁移
echo "Running database migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "Database migrations completed successfully!"
else
    echo "Database migrations failed!"
    exit 1
fi

# 启动应用
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
