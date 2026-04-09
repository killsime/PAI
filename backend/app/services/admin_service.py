from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db, User, Question
import hashlib

# 创建管理员路由
admin_router = APIRouter()

# 管理员相关模型
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class CreateQuestionRequest(BaseModel):
    content: str
    dimension: str

class UpdateQuestionRequest(BaseModel):
    content: str
    dimension: str

# API路由
@admin_router.post("/login")
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.login(request.username, request.password, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/users")
async def get_users(db: Session = Depends(get_db)):
    try:
        users = AdminService.get_all_users(db)
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        result = AdminService.delete_user(user_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/questions")
async def get_questions(db: Session = Depends(get_db)):
    try:
        questions = AdminService.get_all_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/questions")
async def create_question(request: CreateQuestionRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.create_question(request.content, request.dimension, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/questions/{question_id}")
async def update_question(question_id: int, request: UpdateQuestionRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.update_question(question_id, request.content, request.dimension, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/questions/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        result = AdminService.delete_question(question_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AdminService:
    """管理员服务类"""
    
    @staticmethod
    def hash_password(password):
        """对密码进行哈希处理"""
        return hashlib.md5(password.encode()).hexdigest()
    
    @staticmethod
    def login(username, password, db):
        """管理员登录"""
        try:
            # 对密码进行哈希处理
            hashed_password = AdminService.hash_password(password)
            
            # 检查用户名、密码和管理员权限
            user = db.query(User).filter(
                User.username == username,
                User.password == hashed_password,
                User.is_admin == 1
            ).first()
            
            if not user:
                raise Exception("用户名或密码错误，或无管理员权限")
            
            return {"user_id": user.id, "username": user.username, "is_admin": True}
        except Exception as e:
            raise Exception(f"登录失败: {str(e)}")
    
    @staticmethod
    def get_all_users(db):
        """获取所有用户"""
        try:
            users = db.query(User).all()
            
            # 转换为字典列表
            user_list = []
            for user in users:
                user_list.append({
                    "id": user.id,
                    "username": user.username,
                    "is_admin": bool(user.is_admin),
                    "created_at": user.created_at
                })
            
            return user_list
        except Exception as e:
            raise Exception(f"获取用户列表失败: {str(e)}")
    
    @staticmethod
    def delete_user(user_id, db):
        """删除用户"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise Exception("用户不存在")
            
            db.delete(user)
            db.commit()
            
            return {"message": "用户删除成功"}
        except Exception as e:
            db.rollback()
            raise Exception(f"删除用户失败: {str(e)}")
    
    @staticmethod
    def get_all_questions(db):
        """获取所有题目"""
        try:
            questions = db.query(Question).all()
            
            # 转换为字典列表
            question_list = []
            for question in questions:
                question_list.append({
                    "id": question.id,
                    "content": question.content,
                    "dimension": question.dimension
                })
            
            return question_list
        except Exception as e:
            raise Exception(f"获取题目列表失败: {str(e)}")
    
    @staticmethod
    def create_question(content, dimension, db):
        """创建题目"""
        try:
            new_question = Question(
                content=content,
                dimension=dimension
            )
            
            db.add(new_question)
            db.commit()
            db.refresh(new_question)
            
            return {
                "id": new_question.id,
                "content": new_question.content,
                "dimension": new_question.dimension
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"创建题目失败: {str(e)}")
    
    @staticmethod
    def update_question(question_id, content, dimension, db):
        """更新题目"""
        try:
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                raise Exception("题目不存在")
            
            question.content = content
            question.dimension = dimension
            
            db.commit()
            db.refresh(question)
            
            return {
                "id": question.id,
                "content": question.content,
                "dimension": question.dimension
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"更新题目失败: {str(e)}")
    
    @staticmethod
    def delete_question(question_id, db):
        """删除题目"""
        try:
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                raise Exception("题目不存在")
            
            db.delete(question)
            db.commit()
            
            return {"message": "题目删除成功"}
        except Exception as e:
            db.rollback()
            raise Exception(f"删除题目失败: {str(e)}")
