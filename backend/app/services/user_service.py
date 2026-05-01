from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db, User
import hashlib

# 创建用户路由
user_router = APIRouter()

# 用户相关模型
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# API路由
@user_router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    try:
        result = UserService.register(request.username, request.password, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = UserService.login(request.username, request.password, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UserService:
    """用户服务类"""

    @staticmethod
    def hash_password(password):
        """对密码进行哈希处理"""
        return hashlib.md5(password.encode()).hexdigest()

    @staticmethod
    def register(username, password, db):
        """用户注册"""
        try:
            # 检查用户名是否已存在
            existing_user = db.query(User).filter(User.username == username).first()
            if existing_user:
                raise Exception("用户名已存在")

            # 对密码进行哈希处理
            hashed_password = UserService.hash_password(password)

            # 创建新用户
            new_user = User(username=username, password=hashed_password)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            return {"user_id": new_user.id, "username": new_user.username}
        except Exception as e:
            db.rollback()
            raise Exception(f"注册失败: {str(e)}")

    @staticmethod
    def login(username, password, db):
        """用户登录"""
        try:
            # 先查询用户
            user = db.query(User).filter(User.username == username).first()

            if not user:
                raise Exception("用户名或密码错误")

            # 检查密码是否匹配
            # 如果数据库中的密码不是哈希格式（旧的明文数据），直接对比
            # 如果是哈希格式，进行哈希后对比
            if len(user.password) == 32 and all(c in '0123456789abcdef' for c in user.password):
                # 看起来是MD5哈希
                hashed_password = UserService.hash_password(password)
                if user.password != hashed_password:
                    raise Exception("用户名或密码错误")
            else:
                # 明文密码（兼容旧的测试数据）
                if user.password != password:
                    raise Exception("用户名或密码错误")

            return {"user_id": user.id, "username": user.username}
        except Exception as e:
            raise Exception(f"登录失败: {str(e)}")
