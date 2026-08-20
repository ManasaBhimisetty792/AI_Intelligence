import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from pathlib import Path
from dotenv import load_dotenv

_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")
load_dotenv(_backend_dir.parent / ".env")
load_dotenv()
from app.core.config import settings
from app.core.logging import logger
from app.api.auth import router as auth_router
from app.api.payment_routes import router as payments_router
from app.api.profile import router as profile_router
from app.api.resume import router as resume_router
from app.api.recruiter import router as recruiter_router
from app.api.notifications import router as notifications_router
from app.api.interviews import router as interviews_router
from app.api.feedback import router as feedback_router
from app.routers.livekit import router as livekit_router
from app.database.session import engine
from app.models.user import Base
from app.models.payment import Payment          # noqa: F401
from app.models.subscription import Subscription  # noqa: F401



# Auto-create tables in development / SQLite mode
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.warning(f"Could not auto-create database tables: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise API backend for SkillTrack AI recruitment and career intelligence platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(livekit_router, prefix="/api", tags=["LiveKit"])


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-MS"] = f"{process_time * 1000:.2f}"
    return response


# Health Check
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": time.time()
    }


# Include Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(resume_router, prefix="/api/v1")
app.include_router(recruiter_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(interviews_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
