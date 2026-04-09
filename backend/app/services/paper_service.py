from fastapi import APIRouter, HTTPException, Depends
import random
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db import get_db, Question

# 创建问题路由
questions_router = APIRouter()

# API路由
@questions_router.get("/random")
async def get_random_questions(db: Session = Depends(get_db)):
    try:
        questions = PaperService.get_random_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.get("/dass")
async def get_dass_questions(db: Session = Depends(get_db)):
    try:
        questions = PaperService.get_dass_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PaperService:
    """试卷生成服务类"""
    
    @staticmethod
    def get_random_questions(db=None):
        """获取随机题目，每个维度抽取7题"""
        try:
            # 从每个维度随机抽取7题
            dimensions = ['depression', 'anxiety', 'stress']
            questions = []
            
            for dimension in dimensions:
                # 使用SQLAlchemy的随机排序
                dimension_questions = db.query(Question).filter(
                    Question.dimension == dimension
                ).order_by(func.rand()).limit(7).all()
                
                # 转换为字典列表
                for q in dimension_questions:
                    questions.append({
                        "id": q.id,
                        "content": q.content,
                        "dimension": q.dimension
                    })
            
            # 打乱题目顺序
            random.shuffle(questions)
            
            return questions
        except Exception as e:
            raise Exception(f"获取随机题目失败: {str(e)}")
    
    @staticmethod
    def get_dass_questions(db=None):
        """获取标准DASS-21题目"""
        try:
            # 获取前21题（DASS-21）
            dass_questions = db.query(Question).limit(21).all()
            
            # 转换为字典列表
            questions = []
            for q in dass_questions:
                questions.append({
                    "id": q.id,
                    "content": q.content,
                    "dimension": q.dimension
                })
            
            return questions
        except Exception as e:
            raise Exception(f"获取DASS-21题目失败: {str(e)}")
