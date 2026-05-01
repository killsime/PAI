from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db, User, Question
import hashlib

admin_router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    is_admin: int = 0

class UpdateUserRequest(BaseModel):
    username: str | None = None
    password: str | None = None
    is_admin: int | None = None

class CreateQuestionRequest(BaseModel):
    content: str
    dimension: str

class UpdateQuestionRequest(BaseModel):
    content: str | None = None
    dimension: str | None = None

@admin_router.post("/login")
async def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.admin_login(request.username, request.password, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@admin_router.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    try:
        result = AdminService.get_all_users(db)
        print(f"DEBUG: AdminService.get_all_users returned {len(result)} users")
        return {"users": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/users")
async def create_user(request: RegisterRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.create_user(request.username, request.password, request.is_admin, db)
        return {"message": "用户创建成功", "user_id": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/users/{user_id}")   
async def update_user(user_id: int, request: UpdateUserRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.update_user(user_id, request.dict(exclude_unset=True), db)
        if result:
            return {"message": "用户更新成功"}
        else:
            raise HTTPException(status_code=404, detail="用户不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        result = AdminService.delete_user(user_id, db)
        if result:
            return {"message": "用户删除成功"}
        else:
            raise HTTPException(status_code=404, detail="用户不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("/questions")
async def get_all_questions(db: Session = Depends(get_db)):
    try:
        result = AdminService.get_all_questions(db)
        return {"questions": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("/questions")
async def create_question(request: CreateQuestionRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.create_question(request.content, request.dimension, db)
        return {"message": "题目创建成功", "question_id": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.put("/questions/{question_id}")
async def update_question(question_id: int, request: UpdateQuestionRequest, db: Session = Depends(get_db)):
    try:
        result = AdminService.update_question(question_id, request.dict(exclude_unset=True), db)
        if result:
            return {"message": "题目更新成功"}
        else:
            raise HTTPException(status_code=404, detail="题目不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/questions/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        result = AdminService.delete_question(question_id, db)
        if result:
            return {"message": "题目删除成功"}
        else:
            raise HTTPException(status_code=404, detail="题目不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AdminService:
    """管理员服务类"""

    @staticmethod
    def hash_password(password: str) -> str:
        """MD5哈希密码"""
        return hashlib.md5(password.encode()).hexdigest()

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """验证密码"""
        return AdminService.hash_password(password) == hashed

    @staticmethod
    def admin_login(username: str, password: str, db=None):
        """管理员登录"""
        try:
            # 先尝试查找管理员
            user = db.query(User).filter(User.username == username, User.is_admin == 1).first()

            if not user:
                raise Exception("管理员不存在")

            # 验证密码
            if not AdminService.verify_password(password, user.password):
                raise Exception("密码错误")

            return {
                "user_id": user.id,
                "username": user.username,
                "is_admin": True
            }
        except Exception as e:
            raise Exception(f"登录失败: {str(e)}")

    @staticmethod
    def get_all_users(db):
        """获取所有普通用户"""
        try:
            users = db.query(User).filter(User.is_admin == 0).all()
            
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
    def create_user(username: str, password: str, is_admin: int = 0, db=None):
        """创建用户"""
        try:
            # 检查用户名是否已存在
            existing_user = db.query(User).filter(User.username == username).first()
            if existing_user:
                raise Exception("用户名已存在")

            # 创建新用户
            hashed_password = AdminService.hash_password(password)
            new_user = User(
                username=username,
                password=hashed_password,
                is_admin=is_admin
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            return new_user.id
        except Exception as e:
            db.rollback()
            raise Exception(f"创建用户失败: {str(e)}")

    @staticmethod
    def update_user(user_id: int, update_data: dict, db=None):
        """更新用户"""
        try:
            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                return False

            if "username" in update_data and update_data["username"]:
                # 检查新用户名是否已被其他用户使用
                existing_user = db.query(User).filter(
                    User.username == update_data["username"],
                    User.id != user_id
                ).first()
                if existing_user:
                    raise Exception("用户名已被使用")
                user.username = update_data["username"]

            if "password" in update_data and update_data["password"]:
                user.password = AdminService.hash_password(update_data["password"])

            if "is_admin" in update_data and update_data["is_admin"] is not None:
                user.is_admin = update_data["is_admin"]

            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"更新用户失败: {str(e)}")

    @staticmethod
    def delete_user(user_id: int, db=None):
        """删除用户"""
        try:
            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                return False


            db.delete(user)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"删除用户失败: {str(e)}")

    @staticmethod
    def get_all_questions(db):
        """获取所有题目"""
        try:
            questions = db.query(Question).all()
            question_list = []
            for q in questions:
                question_list.append({
                    "id": q.id,
                    "content": q.content,
                    "dimension": q.dimension
                })
            return question_list
        except Exception as e:
            raise Exception(f"获取题目列表失败: {str(e)}")

    @staticmethod
    def create_question(content: str, dimension: str, db=None):
        """创建题目"""
        try:
            new_question = Question(
                content=content,
                dimension=dimension
            )
            db.add(new_question)
            db.commit()
            db.refresh(new_question)
            return new_question.id
        except Exception as e:
            db.rollback()
            raise Exception(f"创建题目失败: {str(e)}")

    @staticmethod
    def update_question(question_id: int, update_data: dict, db=None):
        """更新题目"""
        try:
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                return False

            if "content" in update_data and update_data["content"]:
                question.content = update_data["content"]

            if "dimension" in update_data and update_data["dimension"]:
                question.dimension = update_data["dimension"]

            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"更新题目失败: {str(e)}")

    @staticmethod
    def delete_question(question_id: int, db=None):
        """删除题目"""
        try:
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                return False

            db.delete(question)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise Exception(f"删除题目失败: {str(e)}")
