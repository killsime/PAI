#!/bin/bash

# 启动前后端服务的脚本

# 进入项目根目录
cd "$(dirname "$0")"

# 启动后端服务
echo "Starting backend service..."
cd backend

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment 'venv' not found in backend directory."
    echo "Please create a virtual environment first: cd backend && python3 -m venv venv"
    exit 1
fi

# 创建 logs 目录（如果不存在）
mkdir -p logs

# 启动服务，将日志输出到文件
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend service started with PID: $BACKEND_PID"
echo "Backend service started. Logs are being written to logs/backend.log"
echo "API documentation available at: http://localhost:8000/docs"
echo


# 启动前端服务
echo "Starting frontend service..."
cd ../frontend

# 创建 logs 目录（如果不存在）
mkdir -p logs

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "Warning: node_modules not found. Running npm install..."
    npm install
fi

# 启动前端开发服务器
npm run dev -- --turbo --port 3000 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend service started with PID: $FRONTEND_PID"
echo "Frontend service started. Logs are being written to logs/frontend.log"
echo "Frontend available at: http://localhost:3000"
echo "Admin login available at: http://localhost:3000/admin/login"
echo
echo "Both services have been started."
echo "To stop the services, use './kill.sh'"

