import httpx
import logging
from datetime import datetime, timezone, timedelta

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


class UpdateProfileRequest(BaseModel):
    nickname: str | None = None
    gender: str | None = None
    age: int | None = None
    height: float | None = None
    current_weight: float | None = None


@router.post("/update-profile")
async def update_profile(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.nickname is not None:
        user.nickname = data.nickname
    if data.gender is not None:
        user.gender = data.gender
    if data.age is not None:
        user.age = data.age
    if data.height is not None:
        user.height = data.height
    if data.current_weight is not None:
        user.current_weight = data.current_weight
    await db.commit()

    from app.api.auth import user_dict
    return {"ok": True, "user": user_dict(user)}


class UpdateGoalsRequest(BaseModel):
    goal: str | None = None
    target_weight: float | None = None


@router.post("/update-goals")
async def update_goals(
    data: UpdateGoalsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.goal is not None:
        user.goal = data.goal
    if data.target_weight is not None:
        user.target_weight = data.target_weight
    await db.commit()

    from app.api.auth import user_dict
    return {"ok": True, "user": user_dict(user)}


class SubscribeRequest(BaseModel):
    plan: str


@router.post("/subscribe")
async def subscribe(
    req: SubscribeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    if req.plan == "yearly":
        expires = now + timedelta(days=365)
    else:
        expires = now + timedelta(days=30)

    user.is_member = True
    user.member_expires_at = expires
    await db.commit()

    from app.api.auth import user_dict
    return {"ok": True, "user": user_dict(user)}


logger = logging.getLogger(__name__)

APPLE_VERIFY_URL = "https://buy.itunes.apple.com/verifyReceipt"
APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt"
BUNDLE_ID = "com.aaronusa.xiaoran"
PRODUCT_ID = "com.aaronusa.xiaoran.premium.monthly"


class AppleReceiptRequest(BaseModel):
    receipt_data: str


async def _verify_with_apple(receipt_data: str, url: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json={"receipt-data": receipt_data})
        return resp.json()


@router.post("/verify-apple-receipt")
async def verify_apple_receipt(
    req: AppleReceiptRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await _verify_with_apple(req.receipt_data, APPLE_VERIFY_URL)

    if result.get("status") == 21007:
        result = await _verify_with_apple(req.receipt_data, APPLE_SANDBOX_URL)

    status = result.get("status")
    if status != 0:
        logger.warning(f"Apple receipt verification failed: status={status}")
        return {"ok": False, "error": "receipt_invalid"}

    receipt = result.get("receipt", {})
    if receipt.get("bundle_id") != BUNDLE_ID:
        return {"ok": False, "error": "bundle_mismatch"}

    in_app = result.get("latest_receipt_info") or receipt.get("in_app", [])
    valid_purchase = False
    latest_expires = None

    for item in in_app:
        if item.get("product_id") == PRODUCT_ID:
            expires_ms = item.get("expires_date_ms")
            if expires_ms:
                expires_dt = datetime.fromtimestamp(int(expires_ms) / 1000, tz=timezone.utc)
                if expires_dt > datetime.now(timezone.utc):
                    valid_purchase = True
                    if latest_expires is None or expires_dt > latest_expires:
                        latest_expires = expires_dt

    if valid_purchase and latest_expires:
        user.is_member = True
        user.member_expires_at = latest_expires
        await db.commit()

        from app.api.auth import user_dict
        return {"ok": True, "user": user_dict(user)}

    return {"ok": False, "error": "no_active_subscription"}
