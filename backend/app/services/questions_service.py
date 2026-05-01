from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import random
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.db import get_db, Question

questions_router = APIRouter()

class CreateQuestionRequest(BaseModel):
    content: str
    dimension: str

class UpdateQuestionRequest(BaseModel):
    content: str | None = None
    dimension: str | None = None

@questions_router.get("/random")
async def get_random_questions(db: Session = Depends(get_db)):
    try:
        questions = QuestionService.get_random_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.get("/dass")
async def get_dass_questions(db: Session = Depends(get_db)):
    try:
        questions = QuestionService.get_dass_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.get("")
async def get_all_questions(db: Session = Depends(get_db)):
    try:
        questions = QuestionService.get_all_questions(db)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.post("")
async def create_question(request: CreateQuestionRequest, db: Session = Depends(get_db)):
    try:
        question_id = QuestionService.create_question(request.content, request.dimension, db)
        return {"message": "题目创建成功", "question_id": question_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.put("/{question_id}")
async def update_question(question_id: int, request: UpdateQuestionRequest, db: Session = Depends(get_db)):
    try:
        result = QuestionService.update_question(question_id, request.dict(exclude_unset=True), db)
        if result:
            return {"message": "题目更新成功"}
        else:
            raise HTTPException(status_code=404, detail="题目不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@questions_router.delete("/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        result = QuestionService.delete_question(question_id, db)
        if result:
            return {"message": "题目删除成功"}
        else:
            raise HTTPException(status_code=404, detail="题目不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class QuestionService:
    """题目服务类"""

    @staticmethod
    def get_all_questions(db=None):
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
    def get_random_questions(db=None):
        """获取随机题目，每个维度抽取7题"""
        try:
            dimensions = ['depression', 'anxiety', 'stress']
            questions = []

            for dimension in dimensions:
                dimension_questions = db.query(Question).filter(
                    Question.dimension == dimension
                ).order_by(func.rand()).limit(7).all()

                for q in dimension_questions:
                    questions.append({
                        "id": q.id,
                        "content": q.content,
                        "dimension": q.dimension
                    })

            random.shuffle(questions)
            return questions
        except Exception as e:
            raise Exception(f"获取随机题目失败: {str(e)}")

    @staticmethod
    def get_dass_questions(db=None):
        """获取标准DASS-21题目"""
        try:
            dass_questions = db.query(Question).limit(21).all()
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
