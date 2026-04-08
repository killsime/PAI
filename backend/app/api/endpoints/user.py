from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import UserService

router = APIRouter()

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

@router.post("/register")
async def register(request: RegisterRequest):
    try:
        result = UserService.register(request.username, request.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(request: LoginRequest):
    try:
        result = UserService.login(request.username, request.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-test-user")
async def create_test_user():
    try:
        result = UserService.create_test_user()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get-user-info")
async def get_user_info(request: UserInfoRequest):
    try:
        result = UserService.get_user_info(request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest):
    try:
        result = UserService.change_password(request.user_id, request.old_password, request.new_password)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
