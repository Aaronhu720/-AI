from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatMessage
from app.services.coach import coach_reply

router = APIRouter(prefix="/coach", tags=["coach"])


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_msg = ChatMessage(user_id=user.id, role="user", content=req.message)
    db.add(user_msg)
    await db.flush()

    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
    )
    history = list(reversed(history_result.scalars().all()))

    messages = [{"role": m.role, "content": m.content} for m in history]

    reply = await coach_reply(user, messages)

    ai_msg = ChatMessage(user_id=user.id, role="assistant", content=reply)
    db.add(ai_msg)
    await db.commit()

    return {"reply": reply}
