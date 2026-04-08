from fastapi import FastAPI
from app.api import api_router

# 创建FastAPI应用
app = FastAPI()

# 注册路由
app.include_router(api_router)

# 启动事件
@app.on_event("startup")
async def startup_event():
    # 应用启动时的初始化操作
    pass

# 根路径
@app.get("/")
async def root():
    return {"message": "Welcome to PAI API"}
