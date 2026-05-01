from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
import random
from app.db import get_db, UserStatus, PushMessage, User, Result, Question

# 创建推送路由
push_router = APIRouter()

# 推送频率配置
push_frequency = {
    "normal": 7,  # 每7天
    "mild": 3,    # 每3天
    "moderate": 1, # 每天
    "severe": 1,   # 每天
    "extremely_severe": 1 # 每天，优先级最高
}

# 等级中文名称
level_cn_map = {
    "normal": "正常",
    "mild": "轻度",
    "moderate": "中度",
    "severe": "重度",
    "extremely_severe": "极重"
}

# Pydantic模型
class PushMessageCreate(BaseModel):
    level: str
    content: str

class PushMessageUpdate(BaseModel):
    level: Optional[str] = None
    content: Optional[str] = None

class DashboardStats(BaseModel):
    user_count: int
    assessment_count: int
    question_count: int
    level_distribution: dict

# 检查是否需要推送
def should_push(user_status: UserStatus) -> bool:
    if not user_status:
        return False
    
    level = user_status.level
    days = push_frequency.get(level, 7)
    
    if not user_status.last_push_time:
        return True
    
    # 计算距离上次推送的天数
    days_since_push = (datetime.now() - user_status.last_push_time).days
    return days_since_push >= days

# 获取随机推送消息
def get_random_message(level: str, last_message_id: Optional[int], db: Session) -> Optional[PushMessage]:
    messages = db.query(PushMessage).filter(PushMessage.level == level).all()
    if not messages:
        return None
    
    # 避免重复消息
    available_messages = [m for m in messages if m.id != last_message_id]
    if not available_messages:
        available_messages = messages
    
    return random.choice(available_messages)

# 执行推送（内部函数）
def execute_push(user_status: UserStatus, db: Session) -> Optional[PushMessage]:
    message = get_random_message(user_status.level, user_status.last_message_id, db)
    if message:
        user_status.last_push_time = datetime.now()
        user_status.last_message_id = message.id
        db.commit()
    return message

# 定时任务：检查并推送消息
def check_and_push(db: Session):
    print(f"[{datetime.now()}] 开始检查推送任务...")
    user_statuses = db.query(UserStatus).all()
    pushed_count = 0
    
    for user_status in user_statuses:
        if should_push(user_status):
            execute_push(user_status, db)
            pushed_count += 1
    
    print(f"[{datetime.now()}] 推送检查完成，推送了 {pushed_count} 条消息")

# 获取用户当前推送消息
def get_user_push_message(user_id: int, db: Session) -> Optional[dict]:
    user_status = db.query(UserStatus).filter(UserStatus.user_id == user_id).first()
    if not user_status:
        return None
    
    # 如果有last_message_id，先检查该消息是否属于当前等级
    message = None
    if user_status.last_message_id:
        message = db.query(PushMessage).filter(
            PushMessage.id == user_status.last_message_id,
            PushMessage.level == user_status.level
        ).first()
    
    # 如果没有消息或消息等级不匹配，选一条新的
    if not message:
        messages = db.query(PushMessage).filter(PushMessage.level == user_status.level).all()
        if messages:
            message = random.choice(messages)
            # 更新用户状态
            user_status.last_push_time = datetime.now()
            user_status.last_message_id = message.id
            db.commit()
    
    if message:
        return {
            "content": message.content,
            "level": user_status.level,
            "level_cn": level_cn_map.get(user_status.level, "未知")
        }
    return None

# API接口
@push_router.get("/api/push/message/{user_id}")
async def get_push_message(user_id: int, db: Session = Depends(get_db)):
    """获取用户的推送消息"""
    message = get_user_push_message(user_id, db)
    if message:
        return {"success": True, "data": message}
    return {"success": True, "data": None}

@push_router.get("/api/push/messages")
async def get_all_push_messages(level: Optional[str] = None, db: Session = Depends(get_db)):
    """获取所有推送消息"""
    query = db.query(PushMessage)
    if level:
        query = query.filter(PushMessage.level == level)
    messages = query.order_by(PushMessage.created_at.desc()).all()
    return {
        "success": True,
        "data": [
            {
                "id": m.id,
                "level": m.level,
                "level_cn": level_cn_map.get(m.level, "未知"),
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None
            } for m in messages
        ]
    }

@push_router.post("/api/push/message")
async def create_push_message(msg: PushMessageCreate, db: Session = Depends(get_db)):
    """创建推送消息"""
    if msg.level not in level_cn_map:
        raise HTTPException(status_code=400, detail="无效的等级")
    
    new_msg = PushMessage(level=msg.level, content=msg.content)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    return {
        "success": True,
        "data": {
            "id": new_msg.id,
            "level": new_msg.level,
            "level_cn": level_cn_map.get(new_msg.level, "未知"),
            "content": new_msg.content
        }
    }

@push_router.put("/api/push/message/{msg_id}")
async def update_push_message(msg_id: int, msg: PushMessageUpdate, db: Session = Depends(get_db)):
    """更新推送消息"""
    existing_msg = db.query(PushMessage).filter(PushMessage.id == msg_id).first()
    if not existing_msg:
        raise HTTPException(status_code=404, detail="消息不存在")
    
    if msg.level and msg.level not in level_cn_map:
        raise HTTPException(status_code=400, detail="无效的等级")
    
    if msg.level:
        existing_msg.level = msg.level
    if msg.content:
        existing_msg.content = msg.content
    
    db.commit()
    db.refresh(existing_msg)
    
    return {
        "success": True,
        "data": {
            "id": existing_msg.id,
            "level": existing_msg.level,
            "level_cn": level_cn_map.get(existing_msg.level, "未知"),
            "content": existing_msg.content
        }
    }

@push_router.delete("/api/push/message/{msg_id}")
async def delete_push_message(msg_id: int, db: Session = Depends(get_db)):
    """删除推送消息"""
    msg = db.query(PushMessage).filter(PushMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="消息不存在")
    
    db.delete(msg)
    db.commit()
    return {"success": True}

@push_router.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """获取管理面板统计数据"""
    # 统计用户数
    user_count = db.query(func.count(User.id)).scalar()
    
    # 统计测评次数
    assessment_count = db.query(func.count(Result.id)).scalar()
    
    # 统计题库数量
    question_count = db.query(func.count(Question.id)).scalar()
    
    # 统计等级分布
    level_dist = {}
    user_statuses = db.query(UserStatus).all()
    for us in user_statuses:
        level_cn = level_cn_map.get(us.level, "未知")
        level_dist[level_cn] = level_dist.get(level_cn, 0) + 1
    
    # 补充其他等级为0
    for cn in level_cn_map.values():
        if cn not in level_dist:
            level_dist[cn] = 0
    
    return {
        "success": True,
        "data": {
            "user_count": user_count,
            "assessment_count": assessment_count,
            "question_count": question_count,
            "level_distribution": level_dist
        }
    }
