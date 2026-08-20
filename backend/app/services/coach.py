from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.meal import Meal
from app.models.weight import WeightRecord
from app.models.workout import WorkoutLog
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
- 结合用户的实际饮食、运动、体重数据给出建议，不要泛泛而谈

用户信息：
- 性别: {gender}
- 年龄: {age}岁
- 身高: {height}cm
- 当前体重: {current_weight}kg
- 目标体重: {target_weight}kg
- 目标: {goal}

近期数据（用于个性化分析）：
{recent_data}
"""


async def _get_recent_data(user: User, db: AsyncSession) -> str:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=8)

    lines = []

    try:
        result = await db.execute(
            select(Meal)
            .where(Meal.user_id == user.id, Meal.recorded_at >= today_start)
        )
        today_meals = result.scalars().all()
        if today_meals:
            total_cal = sum(m.calories for m in today_meals)
            total_protein = sum(m.protein for m in today_meals)
            total_carbs = sum(m.carbs for m in today_meals)
            total_fat = sum(m.fat for m in today_meals)
            food_names = ", ".join(m.name for m in today_meals[:8])
            lines.append(f"今日饮食: {total_cal}kcal (蛋白{total_protein:.0f}g/碳水{total_carbs:.0f}g/脂肪{total_fat:.0f}g)")
            lines.append(f"吃了: {food_names}")
        else:
            lines.append("今日饮食: 尚未记录")
    except Exception:
        pass

    try:
        result = await db.execute(
            select(WeightRecord)
            .where(WeightRecord.user_id == user.id)
            .order_by(WeightRecord.recorded_at.desc())
            .limit(7)
        )
        weights = list(reversed(result.scalars().all()))
        if weights:
            latest = weights[-1].weight
            if len(weights) >= 2:
                change = latest - weights[0].weight
                trend = f"{'减少' if change < 0 else '增加'}{abs(change):.1f}kg"
            else:
                trend = "数据不足"
            lines.append(f"近期体重: {latest}kg, 7天趋势: {trend}")
    except Exception:
        pass

    try:
        result = await db.execute(
            select(func.count(), func.sum(WorkoutLog.duration_seconds), func.sum(WorkoutLog.calories_burned))
            .where(WorkoutLog.user_id == user.id, WorkoutLog.log_date >= week_ago.date())
        )
        row = result.one()
        if row[0] and row[0] > 0:
            lines.append(f"本周运动: {row[0]}次, 共{(row[1] or 0)//60}分钟, 消耗{row[2] or 0}kcal")
        else:
            lines.append("本周运动: 尚未运动")
    except Exception:
        pass

    return "\n".join(lines) if lines else "暂无数据记录"


async def coach_reply(user: User, messages: list[dict], db: AsyncSession | None = None) -> str:
    goal_labels = {
        "fat_loss": "减脂瘦身",
        "shaping": "塑形增肌",
        "diet": "改善饮食",
        "habit": "建立运动习惯",
    }

    recent_data = "暂无数据记录"
    if db:
        recent_data = await _get_recent_data(user, db)

    system = SYSTEM_PROMPT.format(
        gender="女" if user.gender == "female" else "男",
        age=user.age or "未知",
        height=user.height or "未知",
        current_weight=user.current_weight or "未知",
        target_weight=user.target_weight or "未知",
        goal=goal_labels.get(user.goal or "", "减脂"),
        recent_data=recent_data,
    )

    provider = get_ai_provider()
    return await provider.chat(messages, system)
