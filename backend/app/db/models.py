from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    """用户模型"""
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)
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
