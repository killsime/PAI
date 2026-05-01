from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    """用户模型"""
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)
    is_admin = Column(Integer, default=0, nullable=False)  # 0: 普通用户, 1: 管理员
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Assessment(Base):
    """评估模型"""
    __tablename__ = "assessment"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    type = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    """问题模型"""
    __tablename__ = "question"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    dimension = Column(String(50), nullable=False)  # 维度：depression, anxiety, stress

class Result(Base):
    """测评结果模型"""
    __tablename__ = "result"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    depression_score = Column(Integer, nullable=False)
    anxiety_score = Column(Integer, nullable=False)
    stress_score = Column(Integer, nullable=False)
    depression_level = Column(String(50), nullable=False)
    anxiety_level = Column(String(50), nullable=False)
    stress_level = Column(String(50), nullable=False)
    ai_analysis = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserStatus(Base):
    """用户状态表"""
    __tablename__ = "user_status"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False, unique=True)
    level = Column(String(50), nullable=False)  # 综合等级：normal, mild, moderate, severe, extremely_severe
    last_push_time = Column(DateTime(timezone=True), nullable=True)
    last_message_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class PushMessage(Base):
    """推送消息表"""
    __tablename__ = "push_message"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50), nullable=False)  # 适用等级
    content = Column(Text, nullable=False)  # 推送内容
    created_at = Column(DateTime(timezone=True), server_default=func.now())
