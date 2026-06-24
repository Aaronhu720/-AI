from datetime import date, datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.weight import WeightRecord
from app.models.meal import Meal
from app.models.task import DailyTask
from app.models.workout import WorkoutLog

router = APIRouter(tags=["today"])


def _calorie_target(user: User) -> int:
    if user.current_weight and user.target_weight:
        t = int(user.current_weight * (22 if user.gender == "female" else 24))
        return max(1200, min(t, 2500))
    return 1800


async def _calc_streak(user_id: str, db: AsyncSession) -> int:
    streak = 0
    d = date.today()
    while True:
        result = await db.execute(
            select(func.count()).select_from(DailyTask).where(
                DailyTask.user_id == user_id,
                DailyTask.task_date == d,
                DailyTask.completed == True,
            )
        )
        count = result.scalar() or 0
        if count > 0:
            streak += 1
            d -= timedelta(days=1)
        else:
            break
        if streak > 365:
            break
    return streak


@router.get("/today")
async def get_today(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today_date = date.today()
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=8)
    day_end = day_start + timedelta(hours=32)

    # Latest weight
    weight_result = await db.execute(
        select(WeightRecord)
        .where(WeightRecord.user_id == user.id)
        .order_by(WeightRecord.recorded_at.desc())
        .limit(1)
    )
    latest_weight = weight_result.scalar_one_or_none()

    # Previous weight for trend
    prev_weight_result = await db.execute(
        select(WeightRecord)
        .where(WeightRecord.user_id == user.id)
        .order_by(WeightRecord.recorded_at.desc())
        .offset(1)
        .limit(1)
    )
    prev_weight = prev_weight_result.scalar_one_or_none()
    weight_trend = 0.0
    if latest_weight and prev_weight:
        weight_trend = round(latest_weight.weight - prev_weight.weight, 1)

    # Today's calories
    cal_result = await db.execute(
        select(func.coalesce(func.sum(Meal.calories), 0))
        .where(Meal.user_id == user.id, Meal.recorded_at >= day_start, Meal.recorded_at < day_end)
    )
    calories_consumed = cal_result.scalar() or 0

    # Today's meal count
    meal_count_result = await db.execute(
        select(func.count(func.distinct(Meal.meal_type)))
        .where(Meal.user_id == user.id, Meal.recorded_at >= day_start, Meal.recorded_at < day_end)
    )
    meal_types_logged = meal_count_result.scalar() or 0

    # Today's workout
    workout_result = await db.execute(
        select(
            func.coalesce(func.sum(WorkoutLog.duration_seconds), 0),
            func.coalesce(func.sum(WorkoutLog.calories_burned), 0),
        )
        .where(WorkoutLog.user_id == user.id, WorkoutLog.created_at >= day_start, WorkoutLog.created_at < day_end)
    )
    workout_row = workout_result.first()
    workout_minutes = (workout_row[0] or 0) // 60
    workout_calories = workout_row[1] or 0

    # Today weight recorded?
    today_weight_result = await db.execute(
        select(func.count()).select_from(WeightRecord)
        .where(WeightRecord.user_id == user.id, WeightRecord.recorded_at >= day_start, WeightRecord.recorded_at < day_end)
    )
    weight_logged_today = (today_weight_result.scalar() or 0) > 0

    # Tasks
    tasks_result = await db.execute(
        select(DailyTask)
        .where(DailyTask.user_id == user.id, DailyTask.task_date == today_date)
        .order_by(DailyTask.created_at)
    )
    tasks = tasks_result.scalars().all()

    if not tasks:
        default_tasks = [
            ("记录今日体重", "weight"),
            ("完成20分钟运动", "exercise"),
            ("记录三餐饮食", "diet"),
            ("喝够8杯水", "water"),
        ]
        for title, task_type in default_tasks:
            t = DailyTask(user_id=user.id, task_date=today_date, title=title, task_type=task_type)
            db.add(t)
        await db.commit()
        tasks_result = await db.execute(
            select(DailyTask).where(DailyTask.user_id == user.id, DailyTask.task_date == today_date)
        )
        tasks = tasks_result.scalars().all()

    # Auto-complete tasks
    changed = False
    for t in tasks:
        if t.task_type == "weight" and weight_logged_today and not t.completed:
            t.completed = True
            t.completed_at = now
            changed = True
        elif t.task_type == "exercise" and workout_minutes >= 20 and not t.completed:
            t.completed = True
            t.completed_at = now
            changed = True
        elif t.task_type == "diet" and meal_types_logged >= 3 and not t.completed:
            t.completed = True
            t.completed_at = now
            changed = True
    if changed:
        await db.commit()

    day_count = (today_date - user.created_at.date()).days + 1
    cal_target = _calorie_target(user)

    # Streak
    streak = await _calc_streak(user.id, db)

    # AI tip based on time and status
    h = datetime.now().hour
    if h < 10:
        if not weight_logged_today:
            tip = "早上好！起床后记得称量体重，空腹测量最准确哦 ⏰"
        else:
            tip = "体重已记录，很棒！早餐记得补充优质蛋白，为一天蓄能 🥚"
    elif h < 14:
        if calories_consumed < cal_target * 0.3:
            tip = "午饭时间到了！别忘了记录饮食，保持热量在目标范围内 🍱"
        else:
            tip = "午餐吃得不错！下午可以做一组简单的拉伸运动放松一下 🧘"
    elif h < 18:
        if workout_minutes == 0:
            tip = "下午了还没运动？哪怕散步20分钟也是好的开始！走起 🚶"
        else:
            tip = f"今天已经运动了{workout_minutes}分钟，消耗{workout_calories}kcal，继续保持 💪"
    else:
        completed = sum(1 for t in tasks if t.completed)
        if completed >= len(tasks):
            tip = "今日任务全部完成！你真棒，好好休息，明天继续加油 🌟"
        else:
            tip = f"今天完成了{completed}/{len(tasks)}个任务，睡前记得复盘一下哦 🌙"

    return {
        "day_count": day_count,
        "streak": streak,
        "weight": latest_weight.weight if latest_weight else None,
        "weight_trend": weight_trend,
        "target_weight": user.target_weight or 65,
        "calories_consumed": calories_consumed,
        "calories_target": cal_target,
        "calories_burned": workout_calories,
        "workout_minutes": workout_minutes,
        "water_cups": 0,
        "water_target": 8,
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "type": t.task_type,
                "completed": t.completed,
                "completed_at": t.completed_at.strftime("%H:%M") if t.completed_at else None,
            }
            for t in tasks
        ],
        "ai_tip": tip,
    }


class WeightInput(BaseModel):
    weight: float


@router.post("/weight")
async def record_weight(
    data: WeightInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    record = WeightRecord(user_id=user.id, weight=data.weight)
    db.add(record)
    user.current_weight = data.weight
    await db.commit()
    return {"ok": True}


@router.post("/tasks/{task_id}/toggle")
async def toggle_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DailyTask).where(DailyTask.id == task_id, DailyTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        return {"ok": False}

    task.completed = not task.completed
    task.completed_at = datetime.now(timezone.utc) if task.completed else None
    await db.commit()
    return {"ok": True}
