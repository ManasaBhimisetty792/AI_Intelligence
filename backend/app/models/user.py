from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    role = Column(String, nullable=False, default="student")
    avatar_url = Column(String, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# Alias User to Profile for backward compatibility
User = Profile


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    username = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    current_status = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    resume_file_name = Column(String, nullable=True)
    resume_file_url = Column(String, nullable=True)
    profile_completion_pct = Column(Integer, default=0)
    website = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Comma-separated or JSON string
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    username = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    company = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    experience_years = Column(Integer, default=5)
    specialization = Column(String, nullable=True)
    company_logo = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Comma-separated or JSON string
    approval_status = Column(String, default="pending")
    is_approved = Column(Boolean, default=False)
    linkedin_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

