"""
email_service.py — SMTP Email Notification Service for SkillTrack AI
Uses Python's built-in smtplib + email.mime for sending transactional emails.
All credentials are loaded from environment variables.
"""

import smtplib
import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# SMTP Configuration from environment variables
# ─────────────────────────────────────────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "SkillTrack AI")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)


# ─────────────────────────────────────────────────────────────────────────────
# Base Email Sender
# ─────────────────────────────────────────────────────────────────────────────

def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Send an HTML email via SMTP.
    Returns True on success, False on failure.
    Logs exceptions rather than raising them to avoid crashing API handlers.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(
            "SMTP credentials not configured. "
            "Set SMTP_USER and SMTP_PASSWORD environment variables to enable email."
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((SMTP_FROM_NAME, SMTP_FROM_EMAIL))
        msg["To"] = to_email
        msg["Date"] = datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")

        # Plain-text fallback
        plain = text_body or _strip_html(html_body)
        msg.attach(MIMEText(plain, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())

        logger.info(f"Email sent successfully to {to_email}: {subject}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD.")
    except smtplib.SMTPConnectError:
        logger.error(f"Could not connect to SMTP server {SMTP_HOST}:{SMTP_PORT}.")
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error while sending email to {to_email}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending email to {to_email}: {e}")

    return False


def _strip_html(html: str) -> str:
    """Very simple HTML tag stripper for plain-text fallback."""
    import re
    return re.sub(r"<[^>]+>", " ", html).strip()


# ─────────────────────────────────────────────────────────────────────────────
# HTML Email Templates
# ─────────────────────────────────────────────────────────────────────────────

def _base_template(content: str, title: str) -> str:
    """Wrap content in a branded SkillTrack AI email wrapper."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
  <style>
    body {{ margin:0; padding:0; background:#0a1412; font-family:'Segoe UI',Arial,sans-serif; color:#ecfdf5; }}
    .wrapper {{ max-width:600px; margin:0 auto; padding:32px 16px; }}
    .card {{ background:#192e29; border:1px solid #28473e; border-radius:12px; padding:32px; }}
    .logo {{ font-size:22px; font-weight:800; color:#10b981; margin-bottom:24px; }}
    h1 {{ font-size:20px; font-weight:700; margin:0 0 12px; color:#ecfdf5; }}
    p {{ font-size:15px; line-height:1.6; color:#93c5fd; margin:0 0 16px; }}
    .btn {{
      display:inline-block; background:linear-gradient(135deg,#10b981,#14b8a6);
      color:#fff !important; font-weight:700; font-size:15px; padding:12px 28px;
      border-radius:8px; text-decoration:none; margin:16px 0;
    }}
    .divider {{ border:none; border-top:1px solid #28473e; margin:24px 0; }}
    .footer {{ font-size:12px; color:#375247; text-align:center; margin-top:24px; }}
    .highlight {{ color:#10b981; font-weight:700; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">⚡ SkillTrack AI</div>
      {content}
      <hr class="divider"/>
      <div class="footer">
        © {datetime.utcnow().year} SkillTrack AI — AI-Powered Career Intelligence Platform<br/>
        You are receiving this because you have an active account.
      </div>
    </div>
  </div>
</body>
</html>
"""


# ─────────────────────────────────────────────────────────────────────────────
# Event-specific Email Templates
# ─────────────────────────────────────────────────────────────────────────────

def send_registration_email(to_email: str, name: str, role: str = "student") -> bool:
    """Welcome email after user registration."""
    role_label = "Recruiter" if role == "recruiter" else "Candidate"
    content = f"""
    <h1>Welcome to SkillTrack AI, {name}! 🎉</h1>
    <p>Your <span class="highlight">{role_label}</span> account has been created successfully.</p>
    <p>You can now access your personalized AI career intelligence dashboard, book mock interviews, and get AI-powered resume analysis.</p>
    <a class="btn" href="https://skilltrack.ai/login">Login to Dashboard →</a>
    <p>If you have any questions, reply to this email and we'll help you get started.</p>
    """
    return send_email(
        to_email=to_email,
        subject="🎉 Welcome to SkillTrack AI — Account Created Successfully",
        html_body=_base_template(content, "Welcome to SkillTrack AI")
    )


def send_interview_scheduled_email(
    to_email: str,
    name: str,
    recruiter_name: str,
    interview_date: str,
    interview_type: str = "Mock Interview"
) -> bool:
    """Notification email when an interview is scheduled."""
    content = f"""
    <h1>Interview Scheduled ✅</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Your <strong>{interview_type}</strong> with <span class="highlight">{recruiter_name}</span> has been confirmed.</p>
    <p><strong>Date & Time:</strong> {interview_date}</p>
    <a class="btn" href="https://skilltrack.ai/student/live-interview">Join Interview Room →</a>
    <p>Make sure to log in 5 minutes early and test your camera/microphone.</p>
    """
    return send_email(
        to_email=to_email,
        subject=f"✅ Interview Scheduled with {recruiter_name}",
        html_body=_base_template(content, "Interview Scheduled")
    )


def send_interview_cancelled_email(
    to_email: str,
    name: str,
    recruiter_name: str,
    reason: Optional[str] = None
) -> bool:
    """Notification email when an interview is cancelled."""
    reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
    content = f"""
    <h1>Interview Cancelled ❌</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Unfortunately, your upcoming interview with <strong>{recruiter_name}</strong> has been cancelled.</p>
    {reason_text}
    <a class="btn" href="https://skilltrack.ai/student/find-recruiters">Book New Interview →</a>
    <p>You can browse other available recruiters and schedule a new session.</p>
    """
    return send_email(
        to_email=to_email,
        subject=f"❌ Interview Cancelled — {recruiter_name}",
        html_body=_base_template(content, "Interview Cancelled")
    )


def send_interview_completed_email(
    to_email: str,
    name: str,
    recruiter_name: str,
    score: Optional[str] = None
) -> bool:
    """Notification after interview is completed."""
    score_text = f"<p>Your preliminary score: <span class='highlight'>{score}</span></p>" if score else ""
    content = f"""
    <h1>Interview Completed 🏆</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Your interview with <strong>{recruiter_name}</strong> has been successfully completed.</p>
    {score_text}
    <p>Your detailed feedback and performance report will be available shortly.</p>
    <a class="btn" href="https://skilltrack.ai/student/reports">View Report →</a>
    """
    return send_email(
        to_email=to_email,
        subject=f"🏆 Interview Completed — Report Ready",
        html_body=_base_template(content, "Interview Completed")
    )


def send_resume_uploaded_email(
    to_email: str,
    name: str,
    resume_name: str
) -> bool:
    """Notification after resume upload."""
    content = f"""
    <h1>Resume Uploaded Successfully 📄</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Your resume <strong>{resume_name}</strong> has been uploaded and is ready for AI analysis.</p>
    <a class="btn" href="https://skilltrack.ai/student/resume">View Resume & AI Score →</a>
    <p>Run an AI analysis to get your ATS score, keyword match, and improvement suggestions.</p>
    """
    return send_email(
        to_email=to_email,
        subject="📄 Resume Uploaded — AI Analysis Ready",
        html_body=_base_template(content, "Resume Uploaded")
    )


def send_payment_success_email(
    to_email: str,
    name: str,
    plan_name: str,
    amount: str,
    payment_id: str
) -> bool:
    """Payment confirmation email."""
    content = f"""
    <h1>Payment Successful 💳</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Your payment for <strong>{plan_name}</strong> has been processed successfully.</p>
    <p><strong>Amount Paid:</strong> {amount}</p>
    <p><strong>Transaction ID:</strong> <code>{payment_id}</code></p>
    <a class="btn" href="https://skilltrack.ai/student/profile">View Membership →</a>
    <p>You now have access to all premium features. Enjoy your upgraded experience!</p>
    """
    return send_email(
        to_email=to_email,
        subject=f"💳 Payment Confirmed — {plan_name}",
        html_body=_base_template(content, "Payment Successful")
    )


def send_profile_updated_email(to_email: str, name: str) -> bool:
    """Profile update confirmation email."""
    content = f"""
    <h1>Profile Updated ✅</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Your SkillTrack AI profile has been updated successfully.</p>
    <a class="btn" href="https://skilltrack.ai/student/profile">View Profile →</a>
    <p>If you did not make this change, please contact support immediately.</p>
    """
    return send_email(
        to_email=to_email,
        subject="✅ Your SkillTrack AI Profile Has Been Updated",
        html_body=_base_template(content, "Profile Updated")
    )


def send_admin_approval_email(
    to_email: str,
    name: str,
    approved: bool = True
) -> bool:
    """Recruiter admin approval/rejection email."""
    if approved:
        content = f"""
        <h1>Account Approved ✅</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>Congratulations! Your recruiter account has been <strong>approved</strong> by the SkillTrack AI admin team.</p>
        <p>You can now create your recruiter profile, post job listings, and start interviewing candidates.</p>
        <a class="btn" href="https://skilltrack.ai/recruiter/dashboard">Go to Recruiter Dashboard →</a>
        """
        subject = "✅ Your Recruiter Account Has Been Approved"
    else:
        content = f"""
        <h1>Account Review Update</h1>
        <p>Hi <span class="highlight">{name}</span>,</p>
        <p>After reviewing your recruiter application, we are unable to approve your account at this time.</p>
        <p>Please contact our support team for more information or to appeal this decision.</p>
        """
        subject = "SkillTrack AI — Recruiter Account Status Update"

    return send_email(
        to_email=to_email,
        subject=subject,
        html_body=_base_template(content, "Account Approval")
    )


def send_feedback_submitted_email(to_email: str, name: str) -> bool:
    """Post-interview feedback confirmation."""
    content = f"""
    <h1>Feedback Received 🙏</h1>
    <p>Hi <span class="highlight">{name}</span>,</p>
    <p>Thank you for submitting your interview feedback. Your input helps improve the SkillTrack AI platform for everyone.</p>
    <a class="btn" href="https://skilltrack.ai/student/reports">View Your Reports →</a>
    """
    return send_email(
        to_email=to_email,
        subject="🙏 Thank You — Interview Feedback Received",
        html_body=_base_template(content, "Feedback Received")
    )
