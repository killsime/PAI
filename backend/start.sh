#!/bin/bash

# 启动后端服务的脚本

# 激活虚拟环境
source venv/bin/activate

# 创建日志目录（如果不存在）
mkdir -p logs

# 启动服务，将日志输出到文件
uvicorn main:app --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &

# 输出启动信息
echo "Backend service started. Logs are being written to logs/backend.log"
echo "API documentation available at: http://localhost:8000/docs"
echo "ReDoc documentation available at: http://localhost:8000/redoc"
