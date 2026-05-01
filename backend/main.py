from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from app.services import user_router, assessment_router, questions_router, admin_router, push_router
from app.services.push_service import check_and_push
from app.db import init_db, engine
from sqlalchemy.orm import Session

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
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(push_router, tags=["push"])

# 定时任务调度器
scheduler = BackgroundScheduler()

def scheduled_push_task():
    """定时推送任务"""
    with Session(engine) as db:
        check_and_push(db)

# 启动事件
@app.on_event("startup")
async def startup_event():
    # 初始化数据库
    init_db()
    
    # 启动定时任务（每天早上9点执行）
    scheduler.add_job(
        scheduled_push_task,
        'cron',
        hour=9,
        minute=0,
        id='daily_push',
        name='每日推送',
        replace_existing=True
    )
    scheduler.start()
    print("定时任务调度器已启动")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    print("定时任务调度器已关闭")

# 根路径
@app.get("/")
async def root():
    return {"message": "Welcome to PAI API"}

