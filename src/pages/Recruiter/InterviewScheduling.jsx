import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle, FiCalendar, FiCheck, FiCheckCircle, FiClock,
  FiLoader, FiMessageSquare, FiRefreshCw, FiStar, FiVideo, FiX, FiLink, FiCopy, FiArrowRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";
import interviewService from "../../services/interviewService";
import useRealtime from "../../hooks/useRealtime";
import {
  getInterviewSessionPath,
  isInterviewScheduled,
  formatInterviewDate,
  formatInterviewTime,
  formatTimeWindow,
  getSessionTimeStatus,
} from "../../utils/interviewSession";

const getCandidateName = (item = {}) => {
  return (
    item.candidate_name ||
    item.student_name ||
    item.student?.full_name ||
    item.student?.name ||
    `Candidate ${item.student_id?.slice(0, 6) || ""}`
  );
};

const getCandidateEmail = (item = {}) => {
  return (
    item.candidate_email ||
    item.student_email ||
    item.student?.email ||
    ""
  );
};

export const InterviewScheduling = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("Scheduled");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  // Recruiter feedback modal
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchInterviews = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await recruiterService.getInterviewRequestsForRecruiter();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading interviews:", err);
      toast.error("Failed to load interview sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  useRealtime(["interview_requests", "interview_feedback", "notifications"], () =>
    fetchInterviews(true)
  );

  // Scheduled / Active interviews
  const scheduledInterviews = useMemo(() => {
    return requests.filter((r) => {
      const status = String(r.status || "").toLowerCase();
      const isScheduled = Boolean(r.meeting_date && (r.meeting_time || r.start_time));
      return (status === "accepted" || status === "scheduled") && isScheduled;
    });
  }, [requests]);

  // Completed interviews
  const completedInterviews = useMemo(() => {
    return requests.filter((r) => {
      const status = String(r.status || "").toLowerCase();
      return status === "completed";
    });
  }, [requests]);

  const displayList = tab === "Scheduled" ? scheduledInterviews : completedInterviews;

  // Complete Interview
  const handleCompleteInterview = async (session) => {
    const confirmed = window.confirm(
      `Mark interview with ${getCandidateName(session)} as completed? This will finalize the session and record earnings.`
    );
    if (!confirmed) return;

    try {
      setCompletingId(session.id);
      await interviewService.completeInterview(session.id);
      toast.success("Interview session marked as completed!");
      fetchInterviews(true);
    } catch (err) {
      console.error("Failed to complete interview:", err);
      toast.error("Failed to mark interview as completed.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleCopyLink = (link) => {
    if (!link) return;
    const fullLink = link.startsWith("http") ? link : `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullLink);
    toast.success("Meeting link copied to clipboard!");
  };

  const handleJoinSession = (session) => {
    const timeStatus = getSessionTimeStatus(session);
    if (!timeStatus.canJoin) {
      if (timeStatus.isEnded) {
        toast.error("This interview session has ended and is no longer accessible.");
      } else {
        toast.error(`Session is not active yet. Scheduled for ${formatTimeWindow(session)}.`);
      }
      return;
    }

    if (session.meeting_link && session.meeting_link.startsWith("http")) {
      window.open(session.meeting_link, "_blank");
    } else {
      navigate(getInterviewSessionPath(session.id));
    }
  };

  return (
    <DashboardLayout title="Live Interviews Studio">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
        
        {/* Header Banner */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--color-text)" }}>
              Recruiter Live Interviews
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
              Join scheduled interview rooms during active time windows, monitor student feedback, and mark sessions complete.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={() => fetchInterviews(true)}
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
            >
              <FiRefreshCw className={refreshing ? "spin-animation" : ""} /> Refresh
            </button>
            <button
              onClick={() => navigate("/recruiter/schedule")}
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
            >
              <FiCalendar /> View Calendar
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="glass-card"
          style={{
            padding: "0.85rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setTab("Scheduled")}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-md)",
                border: tab === "Scheduled" ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: tab === "Scheduled" ? "var(--color-primary)" : "transparent",
                color: tab === "Scheduled" ? "#ffffff" : "var(--color-muted)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FiClock /> Scheduled Sessions ({scheduledInterviews.length})
            </button>

            <button
              onClick={() => setTab("Completed")}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-md)",
                border: tab === "Completed" ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: tab === "Completed" ? "var(--color-primary)" : "transparent",
                color: tab === "Completed" ? "#ffffff" : "var(--color-muted)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FiCheckCircle /> Completed &amp; Feedback ({completedInterviews.length})
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div className="glass-card" style={{ padding: "3.5rem", textAlign: "center", color: "var(--color-muted)" }}>
              <FiLoader className="spin-animation" style={{ fontSize: "2rem", marginBottom: "0.6rem" }} />
              <div>Loading interview sessions...</div>
            </div>
          ) : displayList.length === 0 ? (
            <div className="glass-card" style={{ padding: "3.5rem", textAlign: "center", color: "var(--color-muted)" }}>
              <FiVideo size={42} style={{ opacity: 0.35, marginBottom: "0.75rem" }} />
              <h3 style={{ margin: 0, color: "var(--color-text)", fontSize: "1.05rem" }}>
                {tab === "Scheduled" ? "No upcoming scheduled interviews" : "No completed interviews yet"}
              </h3>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                {tab === "Scheduled"
                  ? "Assign slots to accepted candidates in the Schedule page to see sessions here."
                  : "Completed technical drills and student feedback reviews will appear here."}
              </p>
              {tab === "Scheduled" && (
                <button
                  onClick={() => navigate("/recruiter/schedule")}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.84rem" }}
                >
                  <FiCalendar /> Go to Schedule Hub
                </button>
              )}
            </div>
          ) : (
            displayList.map((session) => {
              const name = getCandidateName(session);
              const email = getCandidateEmail(session);
              const timeStatus = getSessionTimeStatus(session);
              const isCompleted = session.status === "completed";

              return (
                <div
                  key={session.id}
                  className="glass-card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1.25rem",
                    border: timeStatus.canJoin ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid var(--color-border)",
                    boxShadow: timeStatus.canJoin ? "0 0 20px rgba(16, 185, 129, 0.12)" : "var(--shadow-sm)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {/* Left: Candidate Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 260, flex: "1 1 280px" }}>
                    <img
                      src={
                        session.candidate_avatar ||
                        session.student?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=96`
                      }
                      alt={name}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        border: `2px solid ${timeStatus.canJoin ? "#10B981" : "var(--color-primary)"}`,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: "1.02rem", color: "var(--color-text)" }}>
                          {name}
                        </span>
                        <span
                          style={{
                            padding: "0.2rem 0.55rem",
                            borderRadius: "999px",
                            background: timeStatus.bg,
                            color: timeStatus.color,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                          }}
                        >
                          {timeStatus.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>
                        {email || "Candidate"}
                      </div>
                      <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--color-primary)", marginTop: "0.25rem" }}>
                        {session.interview_type || "Technical Deep Dive"}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Schedule Window & Link */}
                  <div style={{ flex: "2 1 300px", minWidth: 240 }}>
                    <div style={{ fontSize: "0.84rem", color: "var(--color-text)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.3rem" }}>
                      <FiCalendar style={{ color: "var(--color-primary)" }} />
                      {formatInterviewDate(session.meeting_date)}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.4rem" }}>
                      <FiClock style={{ color: "var(--color-primary)" }} />
                      <strong>Time:</strong> {formatTimeWindow(session)}
                    </div>

                    {session.meeting_link && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: "var(--color-muted)" }}>
                        <FiLink />
                        <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {session.meeting_link}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(session.meeting_link)}
                          style={{ border: "none", background: "none", color: "var(--color-primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 700, fontSize: "0.76rem" }}
                          title="Copy meeting link"
                        >
                          <FiCopy /> Copy
                        </button>
                      </div>
                    )}

                    {/* Student Feedback display on completed sessions */}
                    {isCompleted && session.feedback && (
                      <div style={{ marginTop: "0.5rem", padding: "0.4rem 0.65rem", borderRadius: "6px", background: "rgba(245, 158, 11, 0.08)", borderLeft: "3px solid #F59E0B" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "#F59E0B", fontWeight: 800 }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} style={{ color: s <= (session.feedback.overall_rating || 5) ? "#F59E0B" : "var(--color-border)" }}>★</span>
                          ))}
                          <span style={{ color: "var(--color-text)", fontSize: "0.76rem", marginLeft: 4 }}>Student Rating</span>
                        </div>
                        {session.feedback.comments && (
                          <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 2, fontStyle: "italic" }}>
                            "{session.feedback.comments}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {!isCompleted && (
                      <>
                        {/* Time-Gated Join Button */}
                        <button
                          type="button"
                          disabled={!timeStatus.canJoin}
                          onClick={() => handleJoinSession(session)}
                          className="btn btn-primary"
                          style={{
                            padding: "0.55rem 1.25rem",
                            fontSize: "0.84rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            background: timeStatus.canJoin ? "linear-gradient(135deg, #10b981, #059669)" : undefined,
                            boxShadow: timeStatus.canJoin ? "0 4px 15px rgba(16, 185, 129, 0.35)" : "none",
                            opacity: timeStatus.canJoin ? 1 : 0.6,
                            cursor: timeStatus.canJoin ? "pointer" : "not-allowed",
                          }}
                        >
                          <FiVideo />
                          {timeStatus.isEnded ? "Session Ended" : timeStatus.canJoin ? "Join Interview" : timeStatus.label}
                        </button>

                        {/* Mark Complete */}
                        <button
                          type="button"
                          disabled={completingId === session.id}
                          onClick={() => handleCompleteInterview(session)}
                          className="btn btn-secondary"
                          style={{
                            padding: "0.55rem 0.95rem",
                            fontSize: "0.82rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <FiCheckCircle />
                          {completingId === session.id ? "Completing..." : "Complete"}
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <span
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "var(--radius-md)",
                          background: "rgba(59, 130, 246, 0.12)",
                          color: "#3B82F6",
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <FiCheckCircle /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InterviewScheduling;