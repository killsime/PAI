from app.db import Database

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
    def submit_assessment(depression, anxiety, stress, user_id=None):
        """提交测评结果"""
        try:
            # 计算严重程度
            depression_level = AssessmentService.calculate_severity('depression', depression)
            anxiety_level = AssessmentService.calculate_severity('anxiety', anxiety)
            stress_level = AssessmentService.calculate_severity('stress', stress)
            
            # 生成AI分析
            ai_analysis = AssessmentService.generate_ai_analysis(depression, anxiety, stress)
            
            # 插入测评结果
            query = """
            INSERT INTO result (user_id, depression_score, anxiety_score, stress_score, 
                               depression_level, anxiety_level, stress_level, ai_analysis)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            assessment_id = Database.execute_insert(query, (user_id, depression, anxiety, stress, 
                                                         depression_level, anxiety_level, stress_level, ai_analysis))
            
            return {
                "assessment_id": assessment_id,
                "depression": depression,
                "anxiety": anxiety,
                "stress": stress,
                "depression_level": depression_level,
                "anxiety_level": anxiety_level,
                "stress_level": stress_level,
                "ai_analysis": ai_analysis
            }
        except Exception as e:
            raise Exception(f"提交测评结果失败: {str(e)}")
