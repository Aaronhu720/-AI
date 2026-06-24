from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_token, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthRequest(BaseModel):
    phone: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


def user_dict(u: User) -> dict:
    return {
        "id": u.id,
        "phone": u.phone,
        "nickname": u.nickname,
        "avatar_url": u.avatar_url,
        "gender": u.gender,
        "age": u.age,
        "height": u.height,
        "current_weight": u.current_weight,
        "target_weight": u.target_weight,
        "onboarding_completed": u.onboarding_completed,
        "is_member": u.is_member,
    }


@router.post("/register")
async def register(req: AuthRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.phone == req.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="该手机号已注册")

    user = User(phone=req.phone, password_hash=hash_password(req.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {"token": create_token(user.id), "user": user_dict(user)}


@router.post("/login")
async def login(req: AuthRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    return {"token": create_token(user.id), "user": user_dict(user)}


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return user_dict(user)
