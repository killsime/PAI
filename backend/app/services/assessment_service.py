from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db, Result, UserStatus, PushMessage
from openai import OpenAI
from dotenv import load_dotenv
import os
from datetime import datetime
import random

# 加载环境变量
load_dotenv()

# 创建评估路由
assessment_router = APIRouter()
AI_explain = False

# 创建 OpenAI 客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL")
)

# 等级权重映射
level_weight = {
    "正常": 1,
    "轻度": 2,
    "中度": 3,
    "重度": 4,
    "极重": 5
}

# 等级英文名映射
level_name_map = {
    "正常": "normal",
    "轻度": "mild",
    "中度": "moderate",
    "重度": "severe",
    "极重": "extremely_severe"
}

# 评估相关模型
class AssessmentRequest(BaseModel):
    depression: int
    anxiety: int
    stress: int
    user_id: int | None = None

# API接口
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
        if AI_explain:
            return AssessmentService.generate_analysis_with_llm(depression_score, anxiety_score, stress_score)
        else:
            # 现有的简单分析逻辑
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
    def generate_analysis_with_llm(depression_score, anxiety_score, stress_score):
        """使用大模型生成分析"""
        try:
            # 计算每个维度的级别
            depression_level = AssessmentService.calculate_severity('depression', depression_score)
            anxiety_level = AssessmentService.calculate_severity('anxiety', anxiety_score)
            stress_level = AssessmentService.calculate_severity('stress', stress_score)
            
            # 构建提示词
            prompt = f"""【输入数据】
抑郁得分：{depression_score}：{depression_level}
焦虑得分：{anxiety_score}：{anxiety_level}
压力得分：{stress_score}：{stress_level}
【任务说明】
根据分级标准判断每个维度的等级
综合三个维度生成整体干预建议
【干预策略】
正常：给予积极鼓励
轻度：建议简单放松方式（如散步、听音乐）
中度：建议调整生活方式（作息、运动、社交）
重度：建议关注状态并尝试寻求支持（如朋友/家人）
极重：建议尽量寻求专业帮助（但语气温和，不强制）
【输出要求】
输出3条建议
每条不超过50字
内容具体、可执行
语气温和，不使用医学诊断语言
不要解释过程，直接输出结果
【输出格式示例】
建议1：……
建议2：……
建议3：……"""
            
            # 调用大模型
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "你是一位专业的心理健康顾问，擅长根据测评结果给出温和、具体的建议。"},
                    {"role": "user", "content": prompt}
                ],
                stream=False
            )
            
            return response.choices[0].message.content
        except Exception as e:
            # 出错时回退到默认分析
            return AssessmentService.generate_ai_analysis(depression_score, anxiety_score, stress_score)
    
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
            
            # 更新用户状态并立即推送新消息（如果有user_id）
            if user_id:
                # 找出最高等级
                levels = [depression_level, anxiety_level, stress_level]
                max_level_name = max(levels, key=lambda x: level_weight.get(x, 0))
                level_en = level_name_map.get(max_level_name, "normal")
                
                # 查找或创建用户状态
                user_status = db.query(UserStatus).filter(UserStatus.user_id == user_id).first()
                if not user_status:
                    user_status = UserStatus(user_id=user_id, level=level_en)
                    db.add(user_status)
                else:
                    user_status.level = level_en
                
                db.commit()
                db.refresh(user_status)
                
                # 立即推送新消息（每次测评都推送）
                messages = db.query(PushMessage).filter(PushMessage.level == level_en).all()
                if messages:
                    # 避免重复
                    if user_status.last_message_id:
                        available = [m for m in messages if m.id != user_status.last_message_id]
                        if not available:
                            available = messages
                    else:
                        available = messages
                    
                    selected = random.choice(available)
                    user_status.last_push_time = datetime.now()
                    user_status.last_message_id = selected.id
                    db.commit()
            
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
