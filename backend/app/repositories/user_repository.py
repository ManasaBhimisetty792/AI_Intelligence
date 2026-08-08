import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import Profile, CandidateProfile, RecruiterProfile
from app.schemas.auth import UserCreate


class UserRepository:
    def get_by_id(self, db: Session, user_id: str) -> Optional[Profile]:
        return db.query(Profile).filter(Profile.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[Profile]:
        return db.query(Profile).filter(Profile.email == email.lower()).first()

    def create(self, db: Session, obj_in: UserCreate) -> Profile:
        user_id = str(uuid.uuid4())
        profile = Profile(
            id=user_id,
            email=obj_in.email.lower(),
            name=obj_in.name,
            role=obj_in.role,
            avatar_url=f"https://ui-avatars.com/api/?name={obj_in.name}&background=4F46E5&color=fff",
        )
        db.add(profile)
        db.flush()

        if obj_in.role == "recruiter":
            rec_profile = RecruiterProfile(
                id=profile.id,
                company=obj_in.company,
                linkedin_url=obj_in.linkedin_url,
                approval_status="pending",
                is_approved=False,
            )
            db.add(rec_profile)
        else:
            cand_profile = CandidateProfile(
                id=profile.id,
                linkedin_url=obj_in.linkedin_url,
            )
            db.add(cand_profile)

        db.commit()
        db.refresh(profile)
        return profile


user_repository = UserRepository()
