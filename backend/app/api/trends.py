from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.weight import WeightRecord
from app.models.meal import Meal
from app.models.workout import WorkoutLog

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("/data")
async def get_trends(
    days: int = Query(default=7),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)

    # Weight records
    weight_result = await db.execute(
        select(WeightRecord)
        .where(WeightRecord.user_id == user.id, WeightRecord.recorded_at >= start)
        .order_by(WeightRecord.recorded_at)
    )
    weights = weight_result.scalars().all()
    weight_data = [
        {"date": w.recorded_at.strftime("%m-%d"), "weight": w.weight}
        for w in weights
    ]

    # All weight records for calculating total loss
    all_weight_result = await db.execute(
        select(WeightRecord)
        .where(WeightRecord.user_id == user.id)
        .order_by(WeightRecord.recorded_at)
    )
    all_weights = all_weight_result.scalars().all()

    first_weight = all_weights[0].weight if all_weights else None
    latest_weight = all_weights[-1].weight if all_weights else None
    total_loss = round(first_weight - latest_weight, 1) if first_weight and latest_weight else 0

    period_weights = [w.weight for w in weights]
    period_loss = round(period_weights[0] - period_weights[-1], 1) if len(period_weights) >= 2 else 0

    # Daily calories (meals)
    meal_result = await db.execute(
        select(
            func.strftime("%m-%d", Meal.recorded_at).label("day"),
            func.sum(Meal.calories).label("cal"),
        )
        .where(Meal.user_id == user.id, Meal.recorded_at >= start)
        .group_by(func.strftime("%m-%d", Meal.recorded_at))
        .order_by(func.strftime("%m-%d", Meal.recorded_at))
    )
    calorie_data = [{"date": r.day, "calories": r.cal} for r in meal_result.all()]

    avg_calories = 0
    if calorie_data:
        avg_calories = round(sum(c["calories"] for c in calorie_data) / len(calorie_data))

    # Workout stats
    workout_result = await db.execute(
        select(
            func.strftime("%m-%d", WorkoutLog.created_at).label("day"),
            func.sum(WorkoutLog.calories_burned).label("cal"),
            func.sum(WorkoutLog.duration_seconds).label("dur"),
        )
        .where(WorkoutLog.user_id == user.id, WorkoutLog.created_at >= start)
        .group_by(func.strftime("%m-%d", WorkoutLog.created_at))
        .order_by(func.strftime("%m-%d", WorkoutLog.created_at))
    )
    workout_data = [
        {"date": r.day, "calories": r.cal, "duration": r.dur // 60}
        for r in workout_result.all()
    ]
    workout_days = len(workout_data)

    return {
        "weight_data": weight_data,
        "calorie_data": calorie_data,
        "workout_data": workout_data,
        "period_loss": period_loss,
        "total_loss": total_loss,
        "avg_calories": avg_calories,
        "workout_days": workout_days,
        "current_weight": latest_weight or (user.current_weight if user.current_weight else None),
        "target_weight": user.target_weight,
    }
