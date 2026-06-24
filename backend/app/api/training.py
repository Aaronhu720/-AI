from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.workout import WorkoutLog

router = APIRouter(prefix="/training", tags=["training"])

WORKOUT_LIBRARY = [
    {
        "id": "hiit_full",
        "name": "全身燃脂HIIT",
        "category": "hiit",
        "duration": 20,
        "calories": 180,
        "level": "初级",
        "icon": "fire",
        "description": "高效全身燃脂，交替高低强度动作",
        "exercises": [
            {"name": "开合跳", "duration": 30, "rest": 15},
            {"name": "高抬腿", "duration": 30, "rest": 15},
            {"name": "波比跳", "duration": 20, "rest": 20},
            {"name": "深蹲跳", "duration": 30, "rest": 15},
            {"name": "登山跑", "duration": 30, "rest": 15},
            {"name": "俯卧撑", "duration": 20, "rest": 20},
        ],
    },
    {
        "id": "core_abs",
        "name": "腹部核心训练",
        "category": "strength",
        "duration": 15,
        "calories": 120,
        "level": "初级",
        "icon": "muscle",
        "description": "针对腹部核心肌群，打造紧实腰腹",
        "exercises": [
            {"name": "仰卧卷腹", "duration": 30, "rest": 10},
            {"name": "平板支撑", "duration": 30, "rest": 10},
            {"name": "俄罗斯转体", "duration": 30, "rest": 10},
            {"name": "仰卧抬腿", "duration": 30, "rest": 10},
            {"name": "侧平板支撑", "duration": 20, "rest": 10},
        ],
    },
    {
        "id": "cardio_low",
        "name": "低冲击有氧",
        "category": "cardio",
        "duration": 30,
        "calories": 200,
        "level": "入门",
        "icon": "run",
        "description": "关节友好的有氧运动，适合新手和大体重人群",
        "exercises": [
            {"name": "原地踏步", "duration": 60, "rest": 15},
            {"name": "侧步走", "duration": 40, "rest": 15},
            {"name": "前后踏步", "duration": 40, "rest": 15},
            {"name": "手臂画圈", "duration": 30, "rest": 15},
            {"name": "膝盖提拉", "duration": 40, "rest": 15},
        ],
    },
    {
        "id": "upper_body",
        "name": "上肢力量训练",
        "category": "strength",
        "duration": 25,
        "calories": 150,
        "level": "中级",
        "icon": "dumbbell",
        "description": "强化手臂和肩部肌群，改善上半身线条",
        "exercises": [
            {"name": "俯卧撑", "duration": 30, "rest": 15},
            {"name": "三头肌撑体", "duration": 30, "rest": 15},
            {"name": "肩部推举(空手)", "duration": 30, "rest": 15},
            {"name": "二头肌弯举(水瓶)", "duration": 30, "rest": 15},
            {"name": "超人式", "duration": 30, "rest": 15},
        ],
    },
    {
        "id": "stretch",
        "name": "拉伸放松",
        "category": "stretch",
        "duration": 10,
        "calories": 40,
        "level": "入门",
        "icon": "yoga",
        "description": "全身拉伸放松，缓解肌肉酸痛",
        "exercises": [
            {"name": "颈部拉伸", "duration": 30, "rest": 5},
            {"name": "肩部拉伸", "duration": 30, "rest": 5},
            {"name": "大腿前侧拉伸", "duration": 30, "rest": 5},
            {"name": "大腿后侧拉伸", "duration": 30, "rest": 5},
            {"name": "腰部扭转", "duration": 30, "rest": 5},
            {"name": "蝴蝶式拉伸", "duration": 30, "rest": 5},
        ],
    },
    {
        "id": "leg_day",
        "name": "下肢塑形训练",
        "category": "strength",
        "duration": 20,
        "calories": 160,
        "level": "初级",
        "icon": "leg",
        "description": "臀腿塑形，打造紧致下半身",
        "exercises": [
            {"name": "深蹲", "duration": 30, "rest": 15},
            {"name": "弓步蹲", "duration": 30, "rest": 15},
            {"name": "臀桥", "duration": 30, "rest": 15},
            {"name": "侧卧抬腿", "duration": 30, "rest": 15},
            {"name": "小腿提踵", "duration": 30, "rest": 15},
        ],
    },
]


@router.get("/library")
async def get_library():
    return WORKOUT_LIBRARY


@router.get("/workout/{workout_id}")
async def get_workout(workout_id: str):
    for w in WORKOUT_LIBRARY:
        if w["id"] == workout_id:
            return w
    return {"error": "not found"}


class LogWorkoutRequest(BaseModel):
    workout_id: str
    workout_name: str
    duration_seconds: int
    calories_burned: int
    note: str | None = None


@router.post("/log")
async def log_workout(
    req: LogWorkoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = WorkoutLog(
        user_id=user.id,
        workout_id=req.workout_id,
        workout_name=req.workout_name,
        duration_seconds=req.duration_seconds,
        calories_burned=req.calories_burned,
        log_date=date.today(),
        note=req.note,
    )
    db.add(log)
    await db.commit()
    return {"ok": True, "id": log.id}


@router.get("/history")
async def get_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user.id)
        .order_by(WorkoutLog.created_at.desc())
        .limit(30)
    )
    logs = result.scalars().all()
    return [
        {
            "id": l.id,
            "workout_id": l.workout_id,
            "workout_name": l.workout_name,
            "duration_seconds": l.duration_seconds,
            "calories_burned": l.calories_burned,
            "log_date": str(l.log_date),
            "note": l.note,
        }
        for l in logs
    ]


@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(
        select(
            func.count(WorkoutLog.id),
            func.coalesce(func.sum(WorkoutLog.duration_seconds), 0),
            func.coalesce(func.sum(WorkoutLog.calories_burned), 0),
        ).where(WorkoutLog.user_id == user.id)
    )
    total_count, total_duration, total_calories = total_result.one()

    week_result = await db.execute(
        select(func.count(WorkoutLog.id))
        .where(WorkoutLog.user_id == user.id)
        .where(WorkoutLog.log_date >= func.date("now", "-7 days"))
    )
    week_count = week_result.scalar() or 0

    return {
        "total_workouts": total_count,
        "total_duration_minutes": total_duration // 60,
        "total_calories": total_calories,
        "week_workouts": week_count,
    }
