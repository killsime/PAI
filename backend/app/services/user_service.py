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

class ChangePasswordRequest(BaseModel):
    user_id: int
    old_password: str
    new_password: str

class UserInfoRequest(BaseModel):
    user_id: int

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

@user_router.post("/create-test-user")
async def create_test_user():
    try:
        result = UserService.create_test_user()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_router.post("/get-user-info")
async def get_user_info(request: UserInfoRequest):
    try:
        result = UserService.get_user_info(request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@user_router.post("/change-password")
async def change_password(request: ChangePasswordRequest):
    try:
        result = UserService.change_password(request.user_id, request.old_password, request.new_password)
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
    
    @staticmethod
    def create_test_user():
        """创建测试用户"""
        try:
            # 检查test用户是否已存在
            query = "SELECT id FROM user WHERE username = 'test'"
            result = Database.execute_query(query, ())
            if result:
                return {"message": "test用户已存在"}
            
            # 对密码进行哈希处理
            hashed_password = UserService.hash_password("test123")
            
            # 插入test用户
            query = "INSERT INTO user (username, password) VALUES (%s, %s)"
            user_id = Database.execute_insert(query, ("test", hashed_password))
            
            return {"user_id": user_id, "username": "test"}
        except Exception as e:
            raise Exception(f"创建test用户失败: {str(e)}")
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """修改密码"""
        try:
            # 检查用户是否存在
            query = "SELECT password FROM user WHERE id = %s"
            result = Database.execute_query(query, (user_id,))
            if not result:
                raise Exception("用户不存在")
            
            # 检查旧密码是否正确
            hashed_old_password = UserService.hash_password(old_password)
            if result[0]["password"] != hashed_old_password:
                raise Exception("原密码错误")
            
            # 对新密码进行哈希处理
            hashed_new_password = UserService.hash_password(new_password)
            
            # 更新密码
            query = "UPDATE user SET password = %s WHERE id = %s"
            Database.execute_update(query, (hashed_new_password, user_id))
            
            return {"message": "密码修改成功"}
        except Exception as e:
            raise Exception(f"修改密码失败: {str(e)}")
    
    @staticmethod
    def get_user_info(user_id):
        """获取用户信息"""
        try:
            query = "SELECT id, username FROM user WHERE id = %s"
            result = Database.execute_query(query, (user_id,))
            if not result:
                raise Exception("用户不存在")
            
            return result[0]
        except Exception as e:
            raise Exception(f"获取用户信息失败: {str(e)}")
