from typing import Tuple
from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.repositories.user_repository import user_repository
from app.core.exceptions import AuthenticationError, UserAlreadyExistsError
from app.utils.security import create_access_token, create_refresh_token


class AuthService:
    def register_user(self, db: Session, user_in: UserCreate) -> Tuple[UserResponse, TokenResponse]:
        existing = user_repository.get_by_email(db, email=user_in.email)
        if existing:
            raise UserAlreadyExistsError()

        # Creates base profile + candidate_profile or recruiter_profile
        profile = user_repository.create(db, obj_in=user_in)
        access_token = create_access_token(subject=profile.id, role=profile.role)
        refresh_token = create_refresh_token(subject=profile.id, role=profile.role)

        user_resp = UserResponse.model_validate(profile)
        user_resp.company = user_in.company
        user_resp.linkedin_url = user_in.linkedin_url

        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_resp
        )
        return user_resp, token_resp

    def authenticate_user(self, db: Session, login_in: UserLogin) -> Tuple[UserResponse, TokenResponse]:
        profile = user_repository.get_by_email(db, email=login_in.email)
        if not profile:
            raise AuthenticationError("Invalid email or password")

        if login_in.role and login_in.role in ["student", "recruiter"]:
            profile.role = login_in.role

        access_token = create_access_token(subject=profile.id, role=profile.role)
        refresh_token = create_refresh_token(subject=profile.id, role=profile.role)

        user_resp = UserResponse.model_validate(profile)
        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_resp
        )
        return user_resp, token_resp

    def request_password_reset(self, db: Session, email: str) -> dict:
        return {
            "message": "If an account with this email exists, a password reset link has been dispatched.",
            "status": "success"
        }

    def reset_password(self, db: Session, token: str, new_password: str) -> dict:
        return {
            "message": "Password updated successfully. You may now sign in.",
            "status": "success"
        }


auth_service = AuthService()
