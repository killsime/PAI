from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services import user_router, assessment_router, questions_router

# 创建FastAPI应用
app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 注册路由
app.include_router(user_router, prefix="/user", tags=["user"])
app.include_router(assessment_router, prefix="/assessment", tags=["assessment"])
app.include_router(questions_router, prefix="/questions", tags=["questions"])

# 启动事件
@app.on_event("startup")
async def startup_event():
    # 应用启动时的初始化操作
    pass

# 根路径
@app.get("/")
async def root():
    return {"message": "Welcome to PAI API"}

