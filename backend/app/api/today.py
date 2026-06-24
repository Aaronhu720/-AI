from datetime import date, datetime, timezone

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

router = APIRouter(tags=["today"])


@router.get("/today")
async def get_today(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()

    weight_result = await db.execute(
        select(WeightRecord)
        .where(WeightRecord.user_id == user.id)
        .order_by(WeightRecord.recorded_at.desc())
        .limit(1)
    )
    latest_weight = weight_result.scalar_one_or_none()

    cal_result = await db.execute(
        select(func.coalesce(func.sum(Meal.calories), 0))
        .where(Meal.user_id == user.id, func.date(Meal.recorded_at) == today)
    )
    calories_consumed = cal_result.scalar() or 0

    tasks_result = await db.execute(
        select(DailyTask)
        .where(DailyTask.user_id == user.id, DailyTask.task_date == today)
        .order_by(DailyTask.created_at)
    )
    tasks = tasks_result.scalars().all()

    if not tasks:
        default_tasks = [
            ("记录今日体重", "weight"),
            ("完成20分钟运动", "exercise"),
            ("记录三餐饮食", "diet"),
            ("喝够2000ml水", "water"),
        ]
        for title, task_type in default_tasks:
            t = DailyTask(user_id=user.id, task_date=today, title=title, task_type=task_type)
            db.add(t)
        await db.commit()
        tasks_result = await db.execute(
            select(DailyTask).where(DailyTask.user_id == user.id, DailyTask.task_date == today)
        )
        tasks = tasks_result.scalars().all()

    day_count = (today - user.created_at.date()).days + 1

    return {
        "day_count": day_count,
        "weight": latest_weight.weight if latest_weight else None,
        "target_weight": user.target_weight or 65,
        "calories_consumed": calories_consumed,
        "calories_target": 1800,
        "water_ml": 0,
        "water_target": 2000,
        "tasks": [
            {"id": t.id, "title": t.title, "type": t.task_type, "completed": t.completed}
            for t in tasks
        ],
        "ai_tip": "今天也要加油哦！记得按时吃早餐，保持蛋白质摄入 💪",
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
