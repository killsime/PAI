from fastapi import APIRouter
from app.api.endpoints import questions, assessment, user

api_router = APIRouter()

# 注册路由
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
