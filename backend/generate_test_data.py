import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import engine, Base, User, Result

# 初始化数据库
Base.metadata.create_all(bind=engine)

# 生成随机用户名
def generate_username(index):
    return f"user{index:03d}"

# 生成随机密码
def generate_password():
    return "password123"  # 简单密码用于测试

# 生成随机得分（0-30之间）
def generate_score():
    return random.randint(0, 30)

# 计算严重程度
def calculate_severity(dimension, score):
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

# 生成AI分析
def generate_ai_analysis(depression_score, anxiety_score, stress_score):
    analysis = "基于您的测评结果，我们发现：\n"
    
    if depression_score > 13:
        analysis += f"您的抑郁得分{depression_score}，属于{calculate_severity('depression', depression_score)}级别，建议关注情绪变化，必要时寻求专业帮助。\n"
    
    if anxiety_score > 9:
        analysis += f"您的焦虑得分{anxiety_score}，属于{calculate_severity('anxiety', anxiety_score)}级别，建议学习放松技巧，如深呼吸、冥想等。\n"
    
    if stress_score > 18:
        analysis += f"您的压力得分{stress_score}，属于{calculate_severity('stress', stress_score)}级别，建议适当调整工作和生活节奏，增加休息时间。\n"
    
    if depression_score <= 9 and anxiety_score <= 7 and stress_score <= 14:
        analysis += "您的心理状态良好，继续保持积极的生活态度。\n"
    
    analysis += "建议定期进行心理测评，关注自身心理健康。"
    return analysis

# 生成测试数据
def generate_test_data():
    with Session(engine) as session:
        # 生成50个用户
        for i in range(1, 51):
            username = generate_username(i)
            password = generate_password()
            
            # 检查用户是否已存在
            existing_user = session.query(User).filter(User.username == username).first()
            if not existing_user:
                user = User(username=username, password=password, is_admin=0)
                session.add(user)
                session.commit()
                session.refresh(user)
                
                # 为每个用户生成5条测试记录
                for j in range(5):
                    depression_score = generate_score()
                    anxiety_score = generate_score()
                    stress_score = generate_score()
                    
                    depression_level = calculate_severity('depression', depression_score)
                    anxiety_level = calculate_severity('anxiety', anxiety_score)
                    stress_level = calculate_severity('stress', stress_score)
                    
                    ai_analysis = generate_ai_analysis(depression_score, anxiety_score, stress_score)
                    
                    result = Result(
                        user_id=user.id,
                        depression_score=depression_score,
                        anxiety_score=anxiety_score,
                        stress_score=stress_score,
                        depression_level=depression_level,
                        anxiety_level=anxiety_level,
                        stress_level=stress_level,
                        ai_analysis=ai_analysis
                    )
                    session.add(result)
                
                session.commit()
                print(f"生成用户 {username} 和 5 条测试记录")
            else:
                print(f"用户 {username} 已存在，跳过")

if __name__ == "__main__":
    print("开始生成测试数据...")
    generate_test_data()
    print("测试数据生成完成！")
