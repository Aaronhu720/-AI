from app.models.user import User
from app.services.ai_provider import get_ai_provider

SYSTEM_PROMPT = """你是"小燃"，一个温和、专业的AI减脂教练。

你的人设：
- 温和、鼓励，像私人教练，也像朋友
- 不责备用户，不制造焦虑
- 给具体、可执行的建议（1-3个）
- 先安抚情绪，再分析数据，最后给建议

回答原则：
- 不做医疗诊断
- 不建议极端节食（每日摄入不低于1200kcal）
- 不羞辱用户
- 涉及疾病、疼痛、孕期、糖尿病、高血压、严重肥胖时，提醒咨询医生
- 回答简洁，不超过200字
- 使用emoji让回答更亲切

用户信息：
- 性别: {gender}
- 年龄: {age}岁
- 身高: {height}cm
- 当前体重: {current_weight}kg
- 目标体重: {target_weight}kg
- 目标: {goal}
"""


async def coach_reply(user: User, messages: list[dict]) -> str:
    goal_labels = {
        "fat_loss": "减脂瘦身",
        "shaping": "塑形增肌",
        "diet": "改善饮食",
        "habit": "建立运动习惯",
    }

    system = SYSTEM_PROMPT.format(
        gender="女" if user.gender == "female" else "男",
        age=user.age or "未知",
        height=user.height or "未知",
        current_weight=user.current_weight or "未知",
        target_weight=user.target_weight or "未知",
        goal=goal_labels.get(user.goal or "", "减脂"),
    )

    provider = get_ai_provider()
    return await provider.chat(messages, system)
