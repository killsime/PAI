#!/bin/bash

# 停止前后端服务的脚本

# 进入项目根目录
cd "$(dirname "$0")"

echo "Stopping backend service..."
pkill -f uvicorn

echo "Stopping frontend service..."
pkill -f next

echo "Both services have been stopped."
