"""
resume.py — FastAPI router for resume analysis
POST /api/v1/resume/analyze
"""

import os
import tempfile
from typing import Optional

from fastapi import (
    APIRouter,
    File,
    Form,
    UploadFile,
    HTTPException,
    status,
)
from fastapi.responses import JSONResponse

from app.services.resume_engine import analyze, load_document

router = APIRouter(
    prefix="/resume",
    tags=["Resume Analysis"],
)


def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save UploadFile to a temporary file and return its path.
    """
    suffix = os.path.splitext(upload_file.filename or "")[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(upload_file.file.read())
        temp_path = temp.name

    return temp_path


@router.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
):
    """
    Analyze Resume against Job Description.
    """

    if not jd_text and not jd_file:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either jd_text or jd_file."
        )

    resume_path = None
    jd_path = None

    try:
        # -------------------------------
        # Resume
        # -------------------------------
        resume_path = save_upload_file(resume_file)
        resume_text = load_document(resume_path)

        if not resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Resume file is empty."
            )

        # -------------------------------
        # Job Description
        # -------------------------------
        if jd_file:
            jd_path = save_upload_file(jd_file)
            jd_text = load_document(jd_path)

        if not jd_text or not jd_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Job Description is empty."
            )

        # -------------------------------
        # AI Analysis
        # -------------------------------
        result = analyze(resume_text, jd_text)

        return JSONResponse(
            status_code=200,
            content=result.to_dict()
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(e)}"
        )

    finally:
        if resume_path and os.path.exists(resume_path):
            os.remove(resume_path)

        if jd_path and os.path.exists(jd_path):
            os.remove(jd_path)