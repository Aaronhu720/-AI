from datetime import date, datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.meal import Meal

router = APIRouter(prefix="/diet", tags=["diet"])


COMMON_FOODS = [
    {"name": "米饭(一碗)", "calories": 230, "protein": 4.3, "carbs": 50, "fat": 0.5},
    {"name": "面条(一碗)", "calories": 280, "protein": 8, "carbs": 55, "fat": 1.5},
    {"name": "馒头(一个)", "calories": 220, "protein": 7, "carbs": 44, "fat": 1},
    {"name": "鸡胸肉(100g)", "calories": 133, "protein": 25, "carbs": 0, "fat": 3},
    {"name": "鸡蛋(一个)", "calories": 78, "protein": 6, "carbs": 0.6, "fat": 5},
    {"name": "牛奶(250ml)", "calories": 160, "protein": 8, "carbs": 12, "fat": 8},
    {"name": "酸奶(200ml)", "calories": 140, "protein": 6, "carbs": 18, "fat": 4},
    {"name": "全麦面包(两片)", "calories": 160, "protein": 8, "carbs": 28, "fat": 2},
    {"name": "苹果(一个)", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2},
    {"name": "香蕉(一根)", "calories": 89, "protein": 1, "carbs": 23, "fat": 0.3},
    {"name": "西兰花(100g)", "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4},
    {"name": "豆腐(100g)", "calories": 76, "protein": 8, "carbs": 1.9, "fat": 4.2},
    {"name": "三文鱼(100g)", "calories": 208, "protein": 20, "carbs": 0, "fat": 13},
    {"name": "虾(100g)", "calories": 99, "protein": 20, "carbs": 0.2, "fat": 1.7},
    {"name": "牛肉(100g)", "calories": 250, "protein": 26, "carbs": 0, "fat": 15},
    {"name": "猪肉(100g)", "calories": 242, "protein": 14, "carbs": 0, "fat": 20},
    {"name": "沙拉(一份)", "calories": 120, "protein": 3, "carbs": 12, "fat": 7},
    {"name": "燕麦粥(一碗)", "calories": 150, "protein": 5, "carbs": 27, "fat": 2.5},
    {"name": "红薯(一个)", "calories": 112, "protein": 2, "carbs": 26, "fat": 0.1},
    {"name": "玉米(一根)", "calories": 96, "protein": 3.4, "carbs": 21, "fat": 1.4},
    {"name": "奶茶(一杯)", "calories": 350, "protein": 3, "carbs": 55, "fat": 12},
    {"name": "可乐(一罐)", "calories": 140, "protein": 0, "carbs": 39, "fat": 0},
    {"name": "炸鸡(一份)", "calories": 450, "protein": 28, "carbs": 18, "fat": 30},
    {"name": "汉堡(一个)", "calories": 500, "protein": 25, "carbs": 40, "fat": 26},
]


@router.get("/foods")
async def search_foods(q: str = ""):
    if not q:
        return COMMON_FOODS[:12]
    return [f for f in COMMON_FOODS if q.lower() in f["name"].lower()]


class AddMealRequest(BaseModel):
    meal_type: str
    name: str
    calories: int
    protein: float = 0
    carbs: float = 0
    fat: float = 0


@router.post("/meal")
async def add_meal(
    req: AddMealRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    meal = Meal(
        user_id=user.id,
        meal_type=req.meal_type,
        name=req.name,
        calories=req.calories,
        protein=req.protein,
        carbs=req.carbs,
        fat=req.fat,
    )
    db.add(meal)
    await db.commit()
    return {"ok": True, "id": meal.id}


@router.delete("/meal/{meal_id}")
async def delete_meal(
    meal_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Meal).where(Meal.id == meal_id, Meal.user_id == user.id)
    )
    meal = result.scalar_one_or_none()
    if meal:
        await db.delete(meal)
        await db.commit()
    return {"ok": True}


@router.get("/today")
async def get_today_diet(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=8)
    end_of_day = start_of_day + timedelta(hours=32)
    result = await db.execute(
        select(Meal)
        .where(
            Meal.user_id == user.id,
            Meal.recorded_at >= start_of_day,
            Meal.recorded_at < end_of_day,
        )
        .order_by(Meal.recorded_at)
    )
    meals = result.scalars().all()

    meals_by_type = {"breakfast": [], "lunch": [], "dinner": [], "snack": []}
    total_cal = 0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0

    for m in meals:
        item = {
            "id": m.id,
            "name": m.name,
            "calories": m.calories,
            "protein": m.protein,
            "carbs": m.carbs,
            "fat": m.fat,
        }
        if m.meal_type in meals_by_type:
            meals_by_type[m.meal_type].append(item)
        total_cal += m.calories
        total_protein += m.protein
        total_carbs += m.carbs
        total_fat += m.fat

    target = 1800
    if user.current_weight and user.target_weight:
        if user.gender == "female":
            target = int(user.current_weight * 22)
        else:
            target = int(user.current_weight * 24)
        target = max(1200, min(target, 2500))

    return {
        "meals": meals_by_type,
        "total_calories": total_cal,
        "target_calories": target,
        "total_protein": round(total_protein, 1),
        "total_carbs": round(total_carbs, 1),
        "total_fat": round(total_fat, 1),
    }
