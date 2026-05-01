from app.db import Base, engine, PushMessage
from sqlalchemy.orm import Session

# 创建表
Base.metadata.create_all(bind=engine)

# 初始化推送消息数据
def init_push_messages():
    with Session(engine) as session:
        # 检查是否已有数据
        if session.query(PushMessage).count() > 0:
            print("推送消息表已有数据，跳过初始化")
            return
        
        # Normal 等级消息（每7天推送）
        normal_messages = [
            "继续保持健康的生活方式，每天都是新的开始！",
            "您的心理状态很好，适当的放松会让您更快乐！",
            "记得多和朋友家人交流，分享是快乐的源泉！",
            "保持规律作息，适量运动，让身心都得到休息！",
            "每天给自己一个微笑，好心情从现在开始！"
        ]
        
        # Mild 等级消息（每3天推送）
        mild_messages = [
            "今天试试做一些简单的放松，比如深呼吸或听轻音乐！",
            "出去散散步吧，大自然会让心情变得更好！",
            "试着写日记，把心里的感受记录下来！",
            "做一件自己喜欢的小事，享受当下的快乐！",
            "和朋友聊聊天，分享彼此的近况！"
        ]
        
        # Moderate 等级消息（每天推送）
        moderate_messages = [
            "您现在需要多关注自己的感受，试着做一些让自己开心的事！",
            "请记得您不是一个人，有需要时可以找亲友倾诉！",
            "尝试规律作息，每天留出一点时间做自己喜欢的事！",
            "今天试着做一些简单的运动，让身体动起来！",
            "给自己制定一个小目标，完成它会带来成就感！",
            "您的感受很重要，不要忽视它们，慢慢来！",
            "试着接触一些新事物，或许会带来新的发现！"
        ]
        
        # Severe 等级消息（每天推送）
        severe_messages = [
            "请多关注自己的健康状况，您值得被好好对待！",
            "如果感到困难，请不要犹豫，寻求专业帮助是勇敢的选择！",
            "您正在经历困难，但请记住这会过去的，给自己一点时间！",
            '每天给自己一个拥抱，告诉自己"我很棒"！',
            "请确保身边有人可以倾诉，您不是孤独的！",
            "试着每天做一件小小的让自己开心的事！",
            "您的感受是真实的，不要压抑自己！"
        ]
        
        # Extremely Severe 等级消息（每天推送，优先级最高）
        extremely_severe_messages = [
            "您现在需要特别关注自己的健康，请尽快寻求专业帮助！",
            "请联系专业的心理医生或咨询师，他们会给您专业的支持！",
            "如果您感到非常困难，请立即寻求帮助，您值得被关爱！",
            "请务必让身边的人知道您的状况，他们会陪伴您！",
            "请记住，寻求帮助是最勇敢的决定，您不是一个人！",
            "请优先考虑自己的健康，专业的帮助会让您好起来！",
            "请立即联系当地的心理援助热线或医疗机构！"
        ]
        
        # 添加消息到数据库
        all_messages = []
        for content in normal_messages:
            all_messages.append(PushMessage(level="normal", content=content))
        for content in mild_messages:
            all_messages.append(PushMessage(level="mild", content=content))
        for content in moderate_messages:
            all_messages.append(PushMessage(level="moderate", content=content))
        for content in severe_messages:
            all_messages.append(PushMessage(level="severe", content=content))
        for content in extremely_severe_messages:
            all_messages.append(PushMessage(level="extremely_severe", content=content))
        
        session.add_all(all_messages)
        session.commit()
        print(f"成功初始化 {len(all_messages)} 条推送消息")

if __name__ == "__main__":
    init_push_messages()
