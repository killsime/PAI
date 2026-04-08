import random
from app.db import Database

class PaperService:
    """试卷生成服务类"""
    
    @staticmethod
    def get_random_questions():
        """获取随机题目，每个维度抽取7题"""
        try:
            # 从每个维度随机抽取7题
            dimensions = ['depression', 'anxiety', 'stress']
            questions = []
            
            for dimension in dimensions:
                query = "SELECT id, content, dimension FROM question WHERE dimension = %s ORDER BY RAND() LIMIT 7"
                result = Database.execute_query(query, (dimension,))
                questions.extend(result)
            
            # 打乱题目顺序
            random.shuffle(questions)
            
            return questions
        except Exception as e:
            raise Exception(f"获取随机题目失败: {str(e)}")
    
    @staticmethod
    def get_dass_questions():
        """获取标准DASS-21题目"""
        try:
            # 获取前21题（DASS-21）
            query = "SELECT id, content, dimension FROM question LIMIT 21"
            result = Database.execute_query(query)
            return result
        except Exception as e:
            raise Exception(f"获取DASS-21题目失败: {str(e)}")
