from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import Database
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
async def register(request: RegisterRequest):
    try:
        result = UserService.register(request.username, request.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_router.post("/login")
async def login(request: LoginRequest):
    try:
        result = UserService.login(request.username, request.password)
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
    def register(username, password):
        """用户注册"""
        try:
            # 检查用户名是否已存在
            query = "SELECT id FROM user WHERE username = %s"
            result = Database.execute_query(query, (username,))
            if result:
                raise Exception("用户名已存在")
            
            # 对密码进行哈希处理
            hashed_password = UserService.hash_password(password)
            
            # 插入新用户
            query = "INSERT INTO user (username, password) VALUES (%s, %s)"
            user_id = Database.execute_insert(query, (username, hashed_password))
            
            return {"user_id": user_id, "username": username}
        except Exception as e:
            raise Exception(f"注册失败: {str(e)}")
    
    @staticmethod
    def login(username, password):
        """用户登录"""
        try:
            # 对密码进行哈希处理
            hashed_password = UserService.hash_password(password)
            
            # 检查用户名和密码是否匹配
            query = "SELECT id, username FROM user WHERE username = %s AND password = %s"
            result = Database.execute_query(query, (username, hashed_password))
            if not result:
                raise Exception("用户名或密码错误")
            
            user = result[0]
            return {"user_id": user["id"], "username": user["username"]}
        except Exception as e:
            raise Exception(f"登录失败: {str(e)}")
    

