from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./xiaoran.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30

    AI_PROVIDER: str = "doubao"
    DEEPSEEK_API_KEY: str = ""
    DOUBAO_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    QWEN_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
