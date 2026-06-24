import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    workout_id: Mapped[str] = mapped_column(String(50))
    workout_name: Mapped[str] = mapped_column(String(100))
    duration_seconds: Mapped[int] = mapped_column(Integer)
    calories_burned: Mapped[int] = mapped_column(Integer)
    log_date: Mapped[date] = mapped_column(Date, index=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
