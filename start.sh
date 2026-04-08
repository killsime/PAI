#!/bin/bash

# 启动前后端服务的脚本

# 进入项目根目录
cd "$(dirname "$0")"

# 创建日志目录（如果不存在）
mkdir -p logs

# 启动后端服务
echo "Starting backend service..."
cd backend

# 激活虚拟环境
source venv/bin/activate

# 启动服务，将日志输出到文件
uvicorn main:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &

# 输出后端启动信息
echo "Backend service started. Logs are being written to logs/backend.log"
echo "API documentation available at: http://localhost:8000/docs"
echo

# 启动前端服务
echo "Starting frontend service..."
cd ../frontend

# 启动前端开发服务器
npm run dev -- --port 3001 > ../logs/frontend.log 2>&1 &

# 输出前端启动信息
echo "Frontend service started. Logs are being written to logs/frontend.log"
echo "Frontend available at: http://localhost:3001"
echo
echo "Both services have been started."
echo "To stop the services, use 'pkill -f uvicorn' and 'pkill -f next'"
