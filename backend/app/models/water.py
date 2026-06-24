import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Integer, DateTime, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WaterLog(Base):
    __tablename__ = "water_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    cups: Mapped[int] = mapped_column(Integer, default=1)
    log_date: Mapped[datetime] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
