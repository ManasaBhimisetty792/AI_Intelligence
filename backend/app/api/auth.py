from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ErrorResponse
)
from app.services.auth_service import auth_service
from app.middleware.auth_middleware import get_current_user
from app.models.user import Profile

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}}
)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a new candidate or recruiter account."""
    _, token_resp = auth_service.register_user(db, user_in=user_in)
    return token_resp


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    responses={401: {"model": ErrorResponse}}
)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    _, token_resp = auth_service.authenticate_user(db, login_in=login_in)
    return token_resp


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: Profile = Depends(get_current_user)):
    """Revoke user session."""
    return {"message": "Logged out successfully", "user_id": current_user.id}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset link."""
    return auth_service.request_password_reset(db, email=req.email)


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using token."""
    return auth_service.reset_password(db, token=req.token, new_password=req.new_password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Profile = Depends(get_current_user)):
    """Get authenticated user profile."""
    return current_user
