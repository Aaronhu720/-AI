import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    nickname: Mapped[str] = mapped_column(String(50), default="")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    goal: Mapped[str | None] = mapped_column(String(30), nullable=True)
    days_per_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    minutes_per_session: Mapped[int | None] = mapped_column(Integer, nullable=True)

    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_member: Mapped[bool] = mapped_column(Boolean, default=False)
    member_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
