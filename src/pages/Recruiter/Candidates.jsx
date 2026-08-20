import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCalendar, FiCheck, FiClock, FiEye, FiFileText, FiFilter,
  FiLoader, FiRefreshCw, FiSearch, FiUser, FiX, FiArrowRight, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";
import CandidateDetailsModal from "./CandidateDetailsModal";
import useRealtime from "../../hooks/useRealtime";

const getStudentId = (request = {}) => {
  return (
    request.student_id ||
    request.student?.id ||
    request.candidate_id ||
    request.user_id ||
    ""
  );
};

const getCandidateName = (request = {}) => {
  return (
    request.candidate_name ||
    request.student_name ||
    request.student?.full_name ||
    request.student?.name ||
    request.full_name ||
    request.name ||
    `Candidate ${getStudentId(request).slice(0, 6) || ""}`
  );
};

const getCandidateEmail = (request = {}) => {
  return (
    request.candidate_email ||
    request.student_email ||
    request.student?.email ||
    request.email ||
    ""
  );
};

const getRequestStatus = (request = {}) => {
  return String(request.status || "pending").toLowerCase();
};

const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return { label: "Pending Review", bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" };
    case "accepted":
      return { label: "Accepted", bg: "rgba(16, 185, 129, 0.15)", color: "#10B981" };
    case "rejected":
      return { label: "Declined", bg: "rgba(239, 68, 68, 0.15)", color: "#EF4444" };
    case "reschedule_requested":
      return { label: "Reschedule Proposed", bg: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6" };
    case "reschedule_accepted":
      return { label: "Reschedule Accepted", bg: "rgba(14, 165, 233, 0.15)", color: "#0EA5E9" };
    case "waiting_recruiter_confirmation":
      return { label: "Awaiting Scheduling", bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" };
    case "completed":
      return { label: "Completed", bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" };
    default:
      return { label: status, bg: "rgba(148, 163, 184, 0.15)", color: "#94A3B8" };
  }
};

export const Candidates = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileModalReq, setProfileModalReq] = useState(null);
  const [declineModalReq, setDeclineModalReq] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [rescheduleModalReq, setRescheduleModalReq] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await recruiterService.getInterviewRequestsForRecruiter();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load candidates requests:", err);
      toast.error("Failed to load interview requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useRealtime(["interview_requests"], () => fetchRequests(true));

  // Accept request handler
  const handleAccept = async (request) => {
    const requestId = request.id || request.request_id;
    const candidateUserId = getStudentId(request);
    const candidateName = getCandidateName(request);

    if (!requestId || !candidateUserId) {
      toast.error("Invalid request or candidate ID.");
      return;
    }

    try {
      setSubmittingAction(true);
      await recruiterService.acceptInterviewRequest(requestId, candidateUserId, "Recruiter");
      toast.success(`Accepted request from ${candidateName}. Proceed to Schedule to assign slot.`);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error(err?.message || "Failed to accept interview request.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Decline request handler
  const handleConfirmDecline = async (e) => {
    e.preventDefault();
    if (!declineModalReq) return;

    const requestId = declineModalReq.id || declineModalReq.request_id;
    const candidateUserId = getStudentId(declineModalReq);

    try {
      setSubmittingAction(true);
      await recruiterService.rejectOrRescheduleRequest(requestId, candidateUserId, {
        action: "reject",
        rejectReason: declineReason || "Recruiter schedule conflict",
      });
      toast.success("Interview request declined.");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
      );
      setDeclineModalReq(null);
      setDeclineReason("");
    } catch (err) {
      console.error("Error declining request:", err);
      toast.error("Failed to decline request.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Reschedule request handler
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModalReq) return;

    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Please specify both proposed date and time.");
      return;
    }

    const requestId = rescheduleModalReq.id || rescheduleModalReq.request_id;
    const candidateUserId = getStudentId(rescheduleModalReq);

    try {
      setSubmittingAction(true);
      await recruiterService.rejectOrRescheduleRequest(requestId, candidateUserId, {
        action: "reschedule",
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        rejectReason: rescheduleReason || "Proposed alternative time slot",
      });
      toast.success("Reschedule proposal sent to student.");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "reschedule_requested",
                reschedule_datetime: `${rescheduleDate}T${rescheduleTime}:00`,
                reschedule_reason: rescheduleReason,
              }
            : r
        )
      );
      setRescheduleModalReq(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleReason("");
    } catch (err) {
      console.error("Error proposing reschedule:", err);
      toast.error("Failed to submit reschedule.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const name = getCandidateName(r).toLowerCase();
      const email = getCandidateEmail(r).toLowerCase();
      const type = (r.interview_type || "").toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch = !query || name.includes(query) || email.includes(query) || type.includes(query);
      const status = getRequestStatus(r);

      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "pending") return status === "pending";
      if (filter === "accepted") return status === "accepted" || status === "reschedule_accepted" || status === "waiting_recruiter_confirmation";
      if (filter === "reschedule") return status === "reschedule_requested";
      if (filter === "rejected") return status === "rejected";
      if (filter === "completed") return status === "completed";
      return true;
    });
  }, [requests, search, filter]);

  const pendingCount = requests.filter((r) => getRequestStatus(r) === "pending").length;

  return (
    <DashboardLayout title="Interview Requests">
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
              Candidate Interview Requests
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
              Review student applications, inspect candidate profiles, accept or reschedule requests.
            </p>
          </div>

          <button
            onClick={() => fetchRequests(true)}
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <FiRefreshCw className={refreshing ? "spin-animation" : ""} /> Refresh
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div
          className="glass-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.85rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "accepted", label: "Accepted" },
              { id: "reschedule", label: "Reschedule Proposed" },
              { id: "completed", label: "Completed" },
              { id: "rejected", label: "Declined" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "0.45rem 0.85rem",
                  borderRadius: "var(--radius-md)",
                  border: filter === tab.id ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: filter === tab.id ? "var(--color-primary)" : "transparent",
                  color: filter === tab.id ? "#ffffff" : "var(--color-muted)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", minWidth: 260 }}>
            <FiSearch
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-muted)",
              }}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate or role..."
              style={{
                width: "100%",
                padding: "0.55rem 0.85rem 0.55rem 2.4rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "0.84rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Requests List: Full Width Horizontal Containers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div className="glass-card" style={{ padding: "3.5rem", textAlign: "center", color: "var(--color-muted)" }}>
              <FiLoader className="spin-animation" style={{ fontSize: "2rem", marginBottom: "0.6rem" }} />
              <div>Loading candidate requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="glass-card" style={{ padding: "3.5rem", textAlign: "center", color: "var(--color-muted)" }}>
              <FiFileText size={42} style={{ opacity: 0.35, marginBottom: "0.75rem" }} />
              <h3 style={{ margin: 0, color: "var(--color-text)", fontSize: "1.05rem" }}>No interview requests found</h3>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem" }}>
                {search ? "Try searching with different keywords." : "New interview requests will appear here."}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const status = getRequestStatus(req);
              const statusBadge = getStatusBadge(status);
              const name = getCandidateName(req);
              const email = getCandidateEmail(req);
              const isPending = status === "pending";
              const isAccepted = status === "accepted" || status === "reschedule_accepted" || status === "waiting_recruiter_confirmation";
              const isScheduled = Boolean(req.meeting_date && (req.meeting_time || req.start_time));

              return (
                <div
                  key={req.id}
                  className="glass-card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    borderRadius: "var(--radius-xl)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1.25rem",
                    border: isPending ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid var(--color-border)",
                    boxShadow: isPending ? "0 4px 20px rgba(245, 158, 11, 0.06)" : "var(--shadow-sm)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Left Column: Avatar & Basic Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 260, flex: "1 1 300px" }}>
                    <img
                      src={
                        req.candidate_avatar ||
                        req.student?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=100`
                      }
                      alt={name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--color-primary)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--color-text)" }}>
                          {name}
                        </span>
                        <span
                          style={{
                            padding: "0.2rem 0.6rem",
                            borderRadius: "999px",
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>
                        {email || "Email not specified"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.35rem" }}>
                        <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--color-primary)", background: "var(--color-primary-light)", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>
                          {req.interview_type || "Technical Deep Dive"}
                        </span>
                        {req.ats_score && (
                          <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 800 }}>
                            ★ {req.ats_score}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Preferred Schedule */}
                  <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <FiCalendar style={{ color: "var(--color-primary)" }} />
                      <strong>Requested Slot:</strong>{" "}
                      {req.preferred_datetime
                        ? new Date(req.preferred_datetime).toLocaleString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Flexible timing"}
                    </div>

                    {status === "reschedule_requested" && req.reschedule_datetime && (
                      <div style={{ fontSize: "0.78rem", color: "#8B5CF6", marginTop: "0.35rem", fontWeight: 700 }}>
                        ⏳ Reschedule proposed: {new Date(req.reschedule_datetime).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setProfileModalReq(req)}
                      className="btn btn-outline"
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                      title="View Candidate Full Profile, Scores & Job Description"
                    >
                      <FiEye /> View Profile
                    </button>

                    {/* Pending actions: Accept, Decline, Reschedule */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => handleAccept(req)}
                          className="btn btn-primary"
                          style={{
                            padding: "0.5rem 0.95rem",
                            fontSize: "0.82rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                          }}
                        >
                          <FiCheck /> Accept
                        </button>

                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => {
                            setRescheduleModalReq(req);
                            setRescheduleReason("");
                          }}
                          className="btn btn-secondary"
                          style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        >
                          <FiClock /> Reschedule
                        </button>

                        <button
                          type="button"
                          disabled={submittingAction}
                          onClick={() => {
                            setDeclineModalReq(req);
                            setDeclineReason("");
                          }}
                          className="btn btn-outline"
                          style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem", color: "#EF4444", borderColor: "rgba(239, 68, 68, 0.4)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                        >
                          <FiX /> Decline
                        </button>
                      </>
                    )}

                    {/* Accepted: Direct to Schedule page */}
                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => navigate("/recruiter/schedule")}
                        className="btn btn-primary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.82rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "var(--gradient-primary)",
                        }}
                      >
                        <FiCalendar /> Go to Schedule <FiArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Candidate Profile Details Modal */}
        {profileModalReq && (
          <CandidateDetailsModal
            candidate={profileModalReq.student || { id: getStudentId(profileModalReq), full_name: getCandidateName(profileModalReq), email: getCandidateEmail(profileModalReq) }}
            request={profileModalReq}
            onClose={() => setProfileModalReq(null)}
            onAccept={() => {
              const reqToAccept = profileModalReq;
              setProfileModalReq(null);
              handleAccept(reqToAccept);
            }}
            onReject={() => {
              const reqToDecline = profileModalReq;
              setProfileModalReq(null);
              setDeclineModalReq(reqToDecline);
              setDeclineReason("");
            }}
            onReschedule={() => {
              const reqToReschedule = profileModalReq;
              setProfileModalReq(null);
              setRescheduleModalReq(reqToReschedule);
              setRescheduleDate("");
              setRescheduleTime("");
              setRescheduleReason("");
            }}
          />
        )}

        {/* Decline Request Modal */}
        {declineModalReq && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <form
              onSubmit={handleConfirmDecline}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: 450,
                padding: "1.75rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#EF4444", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FiAlertCircle /> Decline Interview Request
                </h3>
                <button
                  type="button"
                  onClick={() => setDeclineModalReq(null)}
                  style={{ border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  <FiX />
                </button>
              </div>

              <p style={{ fontSize: "0.86rem", color: "var(--color-muted)", margin: "0 0 1rem" }}>
                Are you sure you want to decline the interview request from <strong>{getCandidateName(declineModalReq)}</strong>?
              </p>

              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "0.4rem", color: "var(--color-text)" }}>
                Reason (Optional, sent to student):
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Current slot unavailable, please apply for next cohort."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  resize: "vertical",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={() => setDeclineModalReq(null)}
                  className="btn btn-outline"
                  style={{ fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn"
                  style={{ background: "#EF4444", color: "#fff", border: "none", fontSize: "0.82rem", fontWeight: 700, padding: "0.55rem 1.1rem" }}
                >
                  {submittingAction ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reschedule Request Modal */}
        {rescheduleModalReq && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <form
              onSubmit={handleConfirmReschedule}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: 480,
                padding: "1.75rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FiClock style={{ color: "var(--color-primary)" }} /> Propose New Slot
                </h3>
                <button
                  type="button"
                  onClick={() => setRescheduleModalReq(null)}
                  style={{ border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  <FiX />
                </button>
              </div>

              <p style={{ fontSize: "0.86rem", color: "var(--color-muted)", margin: "0 0 1.2rem" }}>
                Propose an alternative date & time for <strong>{getCandidateName(rescheduleModalReq)}</strong>.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                    Proposed Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                    Proposed Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                Reason / Note for Student:
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g. Let's meet at this time for our technical discussion."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  fontSize: "0.85rem",
                  marginBottom: "1.25rem",
                  resize: "vertical",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
                <button
                  type="button"
                  onClick={() => setRescheduleModalReq(null)}
                  className="btn btn-outline"
                  style={{ fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-primary"
                  style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}
                >
                  {submittingAction ? "Sending..." : "Send Proposal"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;