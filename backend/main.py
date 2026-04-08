from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router

# 创建FastAPI应用
app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境中应该设置具体的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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

# 全局处理OPTIONS请求
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}
