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
