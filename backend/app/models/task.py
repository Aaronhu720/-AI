import uuid
from datetime import datetime, timezone, date

from sqlalchemy import String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    task_date: Mapped[date] = mapped_column(Date, index=True)
    title: Mapped[str] = mapped_column(String(100))
    task_type: Mapped[str] = mapped_column(String(30))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
