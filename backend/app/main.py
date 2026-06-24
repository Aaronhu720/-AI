from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, user, today, coach, training, diet, trends
from app.core.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title="小燃AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(today.router, prefix="/api")
app.include_router(coach.router, prefix="/api")
app.include_router(training.router, prefix="/api")
app.include_router(diet.router, prefix="/api")
app.include_router(trends.router, prefix="/api")


app.mount("/static", StaticFiles(directory=Path(__file__).parent.parent / "static"), name="static")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "xiaoran-ai"}


@app.get("/privacy.html")
async def privacy():
    from fastapi.responses import FileResponse
    return FileResponse(Path(__file__).parent.parent / "static" / "privacy.html")


@app.get("/terms.html")
async def terms():
    from fastapi.responses import FileResponse
    return FileResponse(Path(__file__).parent.parent / "static" / "terms.html")
