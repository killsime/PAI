#!/bin/bash

# 停止前后端服务的脚本

# 进入项目根目录
cd "$(dirname "$0")"

echo "Stopping backend service..."
pkill -f uvicorn 2>/dev/null || true

echo "Stopping frontend service..."
pkill -f next 2>/dev/null || true

echo "Both services have been stopped."

