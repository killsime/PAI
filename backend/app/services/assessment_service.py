from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db, Result

# 创建评估路由
assessment_router = APIRouter()

# 评估相关模型
class AssessmentRequest(BaseModel):
    depression: int
    anxiety: int
    stress: int
    user_id: int | None = None

# API路由
@assessment_router.post("/submit")
async def submit_assessment(request: AssessmentRequest, db: Session = Depends(get_db)):
    try:
        result = AssessmentService.submit_assessment(
            request.depression, request.anxiety, request.stress, request.user_id, db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@assessment_router.get("/history/{user_id}")
async def get_assessment_history(user_id: int, db: Session = Depends(get_db)):
    try:
        result = AssessmentService.get_user_history(user_id, db)
        return {"history": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AssessmentService:
    """测评服务类"""
    
    @staticmethod
    def calculate_severity(dimension, score):
        """计算严重程度"""
        if dimension == 'depression':
            if score <= 9:
                return '正常'
            elif score <= 13:
                return '轻度'
            elif score <= 20:
                return '中度'
            elif score <= 27:
                return '重度'
            else:
                return '极重'
        elif dimension == 'anxiety':
            if score <= 7:
                return '正常'
            elif score <= 9:
                return '轻度'
            elif score <= 14:
                return '中度'
            elif score <= 19:
                return '重度'
            else:
                return '极重'
        elif dimension == 'stress':
            if score <= 14:
                return '正常'
            elif score <= 18:
                return '轻度'
            elif score <= 25:
                return '中度'
            elif score <= 33:
                return '重度'
            else:
                return '极重'
        return '未知'
    
    @staticmethod
    def generate_ai_analysis(depression_score, anxiety_score, stress_score):
        """生成AI分析"""
        # 这里简单模拟AI分析，实际项目中可以使用更复杂的算法
        analysis = "基于您的测评结果，我们发现：\n"
        
        if depression_score > 13:
            analysis += f"您的抑郁得分{depression_score}，属于{AssessmentService.calculate_severity('depression', depression_score)}级别，建议关注情绪变化，必要时寻求专业帮助。\n"
        
        if anxiety_score > 9:
            analysis += f"您的焦虑得分{anxiety_score}，属于{AssessmentService.calculate_severity('anxiety', anxiety_score)}级别，建议学习放松技巧，如深呼吸、冥想等。\n"
        
        if stress_score > 18:
            analysis += f"您的压力得分{stress_score}，属于{AssessmentService.calculate_severity('stress', stress_score)}级别，建议适当调整工作和生活节奏，增加休息时间。\n"
        
        if depression_score <= 9 and anxiety_score <= 7 and stress_score <= 14:
            analysis += "您的心理状态良好，继续保持积极的生活态度。\n"
        
        analysis += "建议定期进行心理测评，关注自身心理健康。"
        return analysis
    
    @staticmethod
    def submit_assessment(depression, anxiety, stress, user_id=None, db=None):
        """提交测评结果"""
        try:
            # 计算严重程度
            depression_level = AssessmentService.calculate_severity('depression', depression)
            anxiety_level = AssessmentService.calculate_severity('anxiety', anxiety)
            stress_level = AssessmentService.calculate_severity('stress', stress)
            
            # 生成AI分析
            ai_analysis = AssessmentService.generate_ai_analysis(depression, anxiety, stress)
            
            # 创建测评结果
            new_result = Result(
                user_id=user_id,
                depression_score=depression,
                anxiety_score=anxiety,
                stress_score=stress,
                depression_level=depression_level,
                anxiety_level=anxiety_level,
                stress_level=stress_level,
                ai_analysis=ai_analysis
            )
            
            db.add(new_result)
            db.commit()
            db.refresh(new_result)
            
            return {
                "assessment_id": new_result.id,
                "depression": depression,
                "anxiety": anxiety,
                "stress": stress,
                "depression_level": depression_level,
                "anxiety_level": anxiety_level,
                "stress_level": stress_level,
                "ai_analysis": ai_analysis,
                "user_id": user_id
            }
        except Exception as e:
            db.rollback()
            raise Exception(f"提交测评结果失败: {str(e)}")
    
    @staticmethod
    def get_user_history(user_id, db=None):
        """获取用户的历史测评结果"""
        try:
            results = db.query(Result).filter(
                Result.user_id == user_id
            ).order_by(Result.created_at.desc()).all()
            
            # 转换为字典列表
            history = []
            for result in results:
                history.append({
                    "id": result.id,
                    "depression_score": result.depression_score,
                    "anxiety_score": result.anxiety_score,
                    "stress_score": result.stress_score,
                    "depression_level": result.depression_level,
                    "anxiety_level": result.anxiety_level,
                    "stress_level": result.stress_level,
                    "ai_analysis": result.ai_analysis,
                    "created_at": result.created_at
                })
            
            return history
        except Exception as e:
            raise Exception(f"获取历史测评结果失败: {str(e)}")
