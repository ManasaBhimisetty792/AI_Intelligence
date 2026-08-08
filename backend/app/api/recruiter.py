from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

router = APIRouter(prefix="/recruiter", tags=["Recruiter Module"])

# --------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# --------------------------------------------------------------------------

class RecruiterProfileSchema(BaseModel):
    full_name: str = "John Doe"
    email: str = "john.doe@techcorp.com"
    phone: Optional[str] = "+1 (555) 234-5678"
    designation: Optional[str] = "Senior Technical Recruiter"
    avatar_url: Optional[str] = "https://i.pravatar.cc/120?img=68"
    company_name: Optional[str] = "Nexus Tech Solutions"
    company_logo: Optional[str] = None
    company_website: Optional[str] = "https://nexustech.io"
    industry: Optional[str] = "Software & Artificial Intelligence"
    company_size: Optional[str] = "100-500 Employees"
    location: Optional[str] = "San Francisco, CA"
    experience_years: Optional[int] = 8
    specialization: Optional[str] = "Full Stack & Cloud Architecture"
    bio: Optional[str] = "Passionate recruiter and mentor with 8+ years of experience in building scalable engineering teams."
    verification_status: Optional[str] = "Verified"
    tax_id: Optional[str] = "TAX-9988214-US"


class JobCreateSchema(BaseModel):
    title: str
    department: str = "Engineering"
    location: str = "Remote"
    job_type: str = "Full-Time"
    salary_range: str = "$120,000 - $160,000"
    ai_score_threshold: int = 80
    description: Optional[str] = ""
    requirements: List[str] = []


# In-memory store for fallback/demo state
in_memory_recruiter_profile = RecruiterProfileSchema().model_dump()

# --------------------------------------------------------------------------
# ENDPOINTS
# --------------------------------------------------------------------------

@router.get("/profile")
def get_recruiter_profile():
    """GET recruiter profile endpoint"""
    return {
        "status": "success",
        "data": in_memory_recruiter_profile
    }


@router.put("/profile")
def update_recruiter_profile(payload: RecruiterProfileSchema):
    """PUT recruiter profile endpoint with validation and persistence"""
    global in_memory_recruiter_profile
    data = payload.model_dump(exclude_unset=True)
    in_memory_recruiter_profile.update(data)
    return {
        "status": "success",
        "message": "Recruiter profile updated successfully",
        "data": in_memory_recruiter_profile
    }


@router.get("/dashboard")
def get_recruiter_dashboard():
    """GET recruiter dashboard summary metrics & recent items"""
    return {
        "status": "success",
        "metrics": {
            "pending_requests": 12,
            "todays_interviews": 3,
            "upcoming_interviews": 5,
            "completed_interviews": 25,
            "active_jobs": 8,
            "total_applicants": 240
        },
        "recent_applicants": [
            {
                "id": "cand_1",
                "name": "Akhila Reddy",
                "role": "Python Developer",
                "exp": "2.5 Yrs Exp.",
                "loc": "Hyderabad, India",
                "ats": 91,
                "fit": "Suitable",
                "skills": ["Python", "Django", "SQL", "REST API"],
                "date": "29 Jul, 2024",
                "img": "https://i.pravatar.cc/80?img=47"
            },
            {
                "id": "cand_2",
                "name": "Rahul Kumar",
                "role": "Full Stack Developer",
                "exp": "3.1 Yrs Exp.",
                "loc": "Bangalore, India",
                "ats": 87,
                "fit": "Suitable",
                "skills": ["React", "Node.js", "MongoDB", "Express"],
                "date": "29 Jul, 2024",
                "img": "https://i.pravatar.cc/80?img=12"
            },
            {
                "id": "cand_3",
                "name": "Sneha Patel",
                "role": "Frontend Developer",
                "exp": "1.8 Yrs Exp.",
                "loc": "Pune, India",
                "ats": 72,
                "fit": "Maybe",
                "skills": ["HTML", "CSS", "JavaScript", "React"],
                "date": "29 Jul, 2024",
                "img": "https://i.pravatar.cc/80?img=32"
            }
        ],
        "today_schedule": [
            { "time": "10:00 AM", "name": "Akhila Reddy", "role": "Python Developer", "status": "Confirmed", "img": "https://i.pravatar.cc/80?img=47" },
            { "time": "02:00 PM", "name": "Rahul Kumar", "role": "Full Stack Developer", "status": "Confirmed", "img": "https://i.pravatar.cc/80?img=12" },
            { "time": "04:00 PM", "name": "Priya Sharma", "role": "React Developer", "status": "Pending", "img": "https://i.pravatar.cc/80?img=25" }
        ]
    }


@router.get("/revenue")
def get_recruiter_revenue():
    """GET comprehensive recruiter revenue, payouts, and transaction history"""
    return {
        "status": "success",
        "overview": {
            "monthly_revenue": 14850.00,
            "pending_payouts": 3200.00,
            "paid_history": 48900.00,
            "performance_bonus": 1500.00,
            "expected_payout": 4700.00,
            "ranking": 4
        },
        "monthly_chart": [
            { "month": "Jan", "amount": 6200 },
            { "month": "Feb", "amount": 7800 },
            { "month": "Mar", "amount": 9100 },
            { "month": "Apr", "amount": 8400 },
            { "month": "May", "amount": 11200 },
            { "month": "Jun", "amount": 13500 },
            { "month": "Jul", "amount": 14850 }
        ],
        "transactions": [
            { "id": "TXN-8091", "date": "2026-07-28", "description": "Candidate Placement Fee - Akhila Reddy", "type": "Placement Commission", "amount": 2500.00, "status": "Completed" },
            { "id": "TXN-8044", "date": "2026-07-25", "description": "Monthly Performance Milestone Bonus", "type": "Bonus", "amount": 1500.00, "status": "Completed" },
            { "id": "TXN-7982", "date": "2026-07-20", "description": "Candidate Placement Fee - Rahul Kumar", "type": "Placement Commission", "amount": 3200.00, "status": "Pending" },
            { "id": "TXN-7910", "date": "2026-07-15", "description": "Withdrawal to Chase Bank (****4821)", "type": "Withdrawal", "amount": -5000.00, "status": "Completed" },
            { "id": "TXN-7855", "date": "2026-07-10", "description": "Candidate Placement Fee - Sneha Patel", "type": "Placement Commission", "amount": 2100.00, "status": "Completed" }
        ],
        "withdraw_history": [
            { "date": "15 Jul, 2026", "amount": "$5,000.00", "account": "Chase Bank (****4821)", "status": "Completed" },
            { "date": "01 Jul, 2026", "amount": "$4,500.00", "account": "Chase Bank (****4821)", "status": "Completed" },
            { "date": "15 Jun, 2026", "amount": "$6,200.00", "account": "Chase Bank (****4821)", "status": "Completed" }
        ]
    }


@router.get("/notifications")
def get_recruiter_notifications():
    """GET notifications list for recruiter"""
    return {
        "status": "success",
        "notifications": [
            { "id": 1, "icon": "request", "text": "New interview request from Akhila Reddy", "sub": "Python Developer", "time": "5 mins ago", "category": "Requests", "read": False },
            { "id": 2, "icon": "accept", "text": "Rahul Kumar accepted your interview request", "sub": "Full Stack Developer", "time": "20 mins ago", "category": "Interviews", "read": False },
            { "id": 3, "icon": "reminder", "text": "Interview with Priya Sharma starts in 30 minutes", "sub": "React Developer", "time": "30 mins ago", "category": "Interviews", "read": False },
            { "id": 4, "icon": "cancel", "text": "Vikram Singh cancelled the interview", "sub": "Backend Developer", "time": "2 hours ago", "category": "Interviews", "read": True },
            { "id": 5, "icon": "complete", "text": "Your interview with Suresh Patel has been completed", "sub": "Senior Architect", "time": "3 hours ago", "category": "Interviews", "read": True }
        ]
    }


@router.get("/interviews")
def get_recruiter_interviews():
    """GET list of scheduled & past interviews"""
    return {
        "status": "success",
        "schedule": [
            { "id": 101, "time": "10:00 AM", "name": "Akhila Reddy", "role": "Python Developer", "status": "Confirmed", "img": "https://i.pravatar.cc/80?img=47", "date": "2026-07-31" },
            { "id": 102, "time": "02:00 PM", "name": "Rahul Kumar", "role": "Full Stack Developer", "status": "Confirmed", "img": "https://i.pravatar.cc/80?img=12", "date": "2026-07-31" },
            { "id": 103, "time": "04:00 PM", "name": "Priya Sharma", "role": "React Developer", "status": "Pending", "img": "https://i.pravatar.cc/80?img=25", "date": "2026-07-31" }
        ],
        "history": [
            { "id": 201, "name": "Akhila Reddy", "role": "Python Developer", "date": "30 Jul, 2024", "time": "10:00 AM", "dur": "60 min", "status": "Completed", "img": "https://i.pravatar.cc/80?img=47" },
            { "id": 202, "name": "Rahul Kumar", "role": "Full Stack Developer", "date": "28 Jul, 2024", "time": "02:00 PM", "dur": "45 min", "status": "Completed", "img": "https://i.pravatar.cc/80?img=12" },
            { "id": 203, "name": "Sneha Patel", "role": "Frontend Developer", "date": "25 Jul, 2024", "time": "11:00 AM", "dur": "60 min", "status": "Completed", "img": "https://i.pravatar.cc/80?img=32" },
            { "id": 204, "name": "Vikram Singh", "role": "Backend Developer", "date": "24 Jul, 2024", "time": "04:00 PM", "dur": "45 min", "status": "Cancelled", "img": "https://i.pravatar.cc/80?img=53" }
        ]
    }


@router.get("/candidates")
def get_recruiter_candidates():
    """GET candidates list"""
    return {
        "status": "success",
        "candidates": [
            { "id": 1, "name": "Akhila Reddy", "role": "Python Developer", "exp": "2.5 Yrs Exp.", "loc": "Hyderabad, India", "ats": 91, "fit": "Suitable", "skills": ["Python", "Django", "SQL", "REST API"], "date": "29 Jul, 2024", "img": "https://i.pravatar.cc/80?img=47" },
            { "id": 2, "name": "Rahul Kumar", "role": "Full Stack Developer", "exp": "3.1 Yrs Exp.", "loc": "Bangalore, India", "ats": 87, "fit": "Suitable", "skills": ["React", "Node.js", "MongoDB", "Express"], "date": "29 Jul, 2024", "img": "https://i.pravatar.cc/80?img=12" },
            { "id": 3, "name": "Sneha Patel", "role": "Frontend Developer", "exp": "1.8 Yrs Exp.", "loc": "Pune, India", "ats": 72, "fit": "Maybe", "skills": ["HTML", "CSS", "JavaScript", "React"], "date": "29 Jul, 2024", "img": "https://i.pravatar.cc/80?img=32" },
            { "id": 4, "name": "Vikram Singh", "role": "Backend Developer", "exp": "4.2 Yrs Exp.", "loc": "Delhi, India", "ats": 65, "fit": "Maybe", "skills": ["Java", "Spring Boot", "MySQL"], "date": "29 Jul, 2024", "img": "https://i.pravatar.cc/80?img=53" }
        ]
    }


@router.get("/jobs")
def get_recruiter_jobs():
    """GET active recruiter job postings"""
    return {
        "status": "success",
        "jobs": [
            {
                "id": "job_1",
                "title": "Lead Full Stack React Engineer",
                "department": "Engineering",
                "location": "San Francisco, CA (Hybrid)",
                "type": "Full-Time",
                "applicantsCount": 142,
                "aiScoreThreshold": 85,
                "status": "Active",
                "postedDate": "2026-07-01",
                "salaryRange": "$160,000 - $190,000"
            },
            {
                "id": "job_2",
                "title": "AI Product Specialist & Technical Recruiter",
                "department": "Talent Acquisition",
                "location": "Remote",
                "type": "Full-Time",
                "applicantsCount": 88,
                "aiScoreThreshold": 80,
                "status": "Active",
                "postedDate": "2026-07-10",
                "salaryRange": "$120,000 - $145,000"
            },
            {
                "id": "job_3",
                "title": "Senior Python & FastAPI Architect",
                "department": "Backend & Cloud",
                "location": "New York, NY",
                "type": "Full-Time",
                "applicantsCount": 210,
                "aiScoreThreshold": 90,
                "status": "Active",
                "postedDate": "2026-07-15",
                "salaryRange": "$175,000 - $210,000"
            }
        ]
    }


@router.post("/jobs")
def create_recruiter_job(payload: JobCreateSchema):
    """POST endpoint to create a new job posting"""
    new_job = {
        "id": f"job_{int(datetime.now().timestamp())}",
        "title": payload.title,
        "department": payload.department,
        "location": payload.location,
        "type": payload.job_type,
        "applicantsCount": 0,
        "aiScoreThreshold": payload.ai_score_threshold,
        "status": "Active",
        "postedDate": datetime.now().strftime("%Y-%m-%d"),
        "salaryRange": payload.salary_range
    }
    return {
        "status": "success",
        "message": "Job posted successfully",
        "job": new_job
    }


@router.get("/applications")
def get_recruiter_applications():
    """GET list of candidate applications with status funnel"""
    return {
        "status": "success",
        "applications": [
            { "id": "app_1", "candidate_name": "Akhila Reddy", "role": "Python Developer", "job_title": "Senior Python Architect", "ats_score": 91, "fit": "Suitable", "status": "Interviewing", "date": "2026-07-29" },
            { "id": "app_2", "candidate_name": "Rahul Kumar", "role": "Full Stack Developer", "job_title": "Lead Full Stack React Engineer", "ats_score": 87, "fit": "Suitable", "status": "Offered", "date": "2026-07-28" },
            { "id": "app_3", "candidate_name": "Sneha Patel", "role": "Frontend Developer", "job_title": "Lead Full Stack React Engineer", "ats_score": 72, "fit": "Maybe", "status": "Screening", "date": "2026-07-27" },
            { "id": "app_4", "candidate_name": "Vikram Singh", "role": "Backend Developer", "job_title": "Senior Python Architect", "ats_score": 65, "fit": "Maybe", "status": "Rejected", "date": "2026-07-24" }
        ]
    }
