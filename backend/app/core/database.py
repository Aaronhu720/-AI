from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session


async def create_tables():
    from app.models import User, WeightRecord, Meal, DailyTask, ChatMessage  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _ensure_demo_account()


async def _ensure_demo_account():
    from sqlalchemy import select as sa_select
    from app.models.user import User
    from app.core.security import hash_password

    async with async_session() as session:
        result = await session.execute(sa_select(User).where(User.phone == "10000000000"))
        if result.scalar_one_or_none():
            return
        demo = User(
            phone="10000000000",
            password_hash=hash_password("Test123456"),
            nickname="Demo用户",
            onboarding_completed=True,
            gender="male",
            age=30,
            height=175.0,
            current_weight=75.0,
            target_weight=68.0,
            is_member=False,
        )
        session.add(demo)
        await session.commit()
