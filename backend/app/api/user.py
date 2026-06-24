from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/user", tags=["user"])


class OnboardingData(BaseModel):
    gender: str
    age: int
    height: float
    current_weight: float
    target_weight: float
    goal: str
    days_per_week: int
    minutes_per_session: int


@router.post("/onboarding")
async def complete_onboarding(
    data: OnboardingData,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.gender = data.gender
    user.age = data.age
    user.height = data.height
    user.current_weight = data.current_weight
    user.target_weight = data.target_weight
    user.goal = data.goal
    user.days_per_week = data.days_per_week
    user.minutes_per_session = data.minutes_per_session
    user.onboarding_completed = True

    await db.commit()
    return {"ok": True}
