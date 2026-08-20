from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # backend directory
ROOT_DIR = BASE_DIR.parent  # project root directory

class Settings(BaseSettings):
    APP_NAME: str = "SkillTrack AI Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000

    SECRET_KEY: str = "super-secret-jwt-key-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "sqlite:///./skilltrack.db"

    SUPABASE_URL: str = "https://iqoagbzejdaplefjvxnb.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxb2FnYnplamRhcGxlZmp2eG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5OTc0ODgsImV4cCI6MjEwMDU3MzQ4OH0.CYzabpcKnJ46JaBVmyTOMbg5gttEb8jxQzTcMcUFDp8"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxb2FnYnplamRhcGxlZmp2eG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5OTc0ODgsImV4cCI6MjEwMDU3MzQ4OH0.CYzabpcKnJ46JaBVmyTOMbg5gttEb8jxQzTcMcUFDp8"

    RAZORPAY_KEY_ID: str = "rzp_test_TK5SkXFb1fsSwg"
    RAZORPAY_KEY_SECRET: str = "AF5gdqC2b295I428dTz604Z9"
    RAZORPAY_WEBHOOK_SECRET: str = "razorpay_webhook_secret"

    LIVEKIT_URL: str = "wss://skilltrack-ai-71jz5l0t.livekit.cloud"
    LIVEKIT_API_KEY: str = "APImVGXNhPheQ5G"
    LIVEKIT_API_SECRET: str = "S5cWsIfWgyCdLVyLB0ZDBKhbfBP4blCDqa2m5h3BTdfB"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), str(ROOT_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
