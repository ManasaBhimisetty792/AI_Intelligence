from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.session import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import Profile, CandidateProfile, RecruiterProfile

router = APIRouter(prefix="/profile", tags=["Profile"])


class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    current_status: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_file_name: Optional[str] = None
    resume_file_url: Optional[str] = None
    profile_completion_pct: Optional[int] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    skills: Optional[List[str]] = None


class RecruiterProfileUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    experience_years: Optional[int] = None
    specialization: Optional[str] = None
    company_logo: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    approval_status: Optional[str] = None
    is_approved: Optional[bool] = None
    linkedin_url: Optional[str] = None
    website: Optional[str] = None



@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    if current_user.role == "recruiter":
        profile = db.query(RecruiterProfile).filter(RecruiterProfile.id == current_user.id).first()
        if not profile:
            return {"role": "recruiter", "id": current_user.id, "email": current_user.email, "name": current_user.name}
        return profile
    else:
        profile = db.query(CandidateProfile).filter(CandidateProfile.id == current_user.id).first()
        if not profile:
            return {"role": "student", "id": current_user.id, "email": current_user.email, "name": current_user.name}
        return profile


@router.put("/candidate")
def update_candidate_profile(
    payload: CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.id == current_user.id).first()
    if not profile:
        profile = CandidateProfile(id=current_user.id)
        db.add(profile)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Candidate profile updated successfully", "profile": profile}


@router.put("/recruiter")
def update_recruiter_profile(
    payload: RecruiterProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    profile = db.query(RecruiterProfile).filter(RecruiterProfile.id == current_user.id).first()
    if not profile:
        profile = RecruiterProfile(id=current_user.id)
        db.add(profile)

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Recruiter profile updated successfully", "profile": profile}