import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiCheck,
  FiEye,
  FiFileText,
  FiLoader,
  FiRefreshCw,
  FiVideo,
  FiX,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";

import {
  getInterviewSessionPath,
  isInterviewScheduled,
} from "../../utils/interviewSession";

// import "./Candidates.css";

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
    `Candidate ${
      getStudentId(request).slice(0, 6) || ""
    }`
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
  return String(
    request.status || "pending"
  ).toLowerCase();
};

const getStatusDetails = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        background: "#fef3c7",
        color: "#92400e",
      };

    case "accepted":
      return {
        label: "Accepted",
        background: "#dcfce7",
        color: "#166534",
      };

    case "rejected":
      return {
        label: "Rejected",
        background: "#fee2e2",
        color: "#991b1b",
      };

    case "reschedule_requested":
      return {
        label: "Reschedule Requested",
        background: "#ede9fe",
        color: "#6d28d9",
      };

    case "reschedule_accepted":
      return {
        label: "Reschedule Accepted",
        background: "#e0f2fe",
        color: "#0369a1",
      };

    case "waiting_recruiter_confirmation":
      return {
        label: "Awaiting Scheduling",
        background: "#fef3c7",
        color: "#92400e",
      };

    case "completed":
      return {
        label: "Completed",
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        background: "#f1f5f9",
        color: "#475569",
      };

    default:
      return {
        label: status || "Unknown",
        background: "#f1f5f9",
        color: "#475569",
      };
  }
};

const formatDate = (value) => {
  if (!value) {
    return "Date not assigned";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "Time not assigned";
  }

  const [hours, minutes] = String(value)
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const ScheduleSessionModal = ({
  request,
  onClose,
  onScheduled,
}) => {
  const [meetingDate, setMeetingDate] =
    useState("");

  const [meetingTime, setMeetingTime] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const candidateName =
    getCandidateName(request);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requestId =
      request.id || request.request_id;

    const candidateUserId =
      getStudentId(request);

    if (!requestId) {
      toast.error(
        "Interview request ID is missing."
      );
      return;
    }

    if (!candidateUserId) {
      toast.error(
        "Candidate user ID is missing."
      );
      return;
    }

    if (!meetingDate || !meetingTime) {
      toast.error(
        "Please select both date and time."
      );
      return;
    }

    setSaving(true);

    try {
      const updatedRequest =
        await recruiterService.assignInterviewSlot({
          requestId,
          candidateUserId,
          meetingDate,
          meetingTime,
        });

      toast.success(
        `Session scheduled with ${candidateName}.`
      );

      onScheduled(updatedRequest);
      onClose();
    } catch (error) {
      console.error(
        "Failed to schedule interview:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to assign the interview session."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-session-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: "1.5rem",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            id="schedule-session-title"
            style={{
              margin: 0,
              fontSize: "1.2rem",
              color: "#0f172a",
            }}
          >
            Schedule Session
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close schedule modal"
            style={{
              border: "none",
              background: "transparent",
              color: "#475569",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontSize: "1.25rem",
            }}
          >
            <FiX />
          </button>
        </div>

        <p
          style={{
            margin: "0 0 1rem",
            color: "#64748b",
            fontSize: "0.88rem",
            lineHeight: 1.5,
          }}
        >
          Assign the final interview date and
          time for{" "}
          <strong>{candidateName}</strong>.
        </p>

        <label
          htmlFor="meeting-date"
          style={{
            display: "block",
            marginBottom: "0.4rem",
            color: "#334155",
            fontWeight: 700,
            fontSize: "0.86rem",
          }}
        >
          Interview Date
        </label>

        <input
          id="meeting-date"
          type="date"
          value={meetingDate}
          min={new Date()
            .toISOString()
            .slice(0, 10)}
          onChange={(event) =>
            setMeetingDate(event.target.value)
          }
          required
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.7rem",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            color: "#0f172a",
            background: "#ffffff",
          }}
        />

        <label
          htmlFor="meeting-time"
          style={{
            display: "block",
            marginTop: "1rem",
            marginBottom: "0.4rem",
            color: "#334155",
            fontWeight: 700,
            fontSize: "0.86rem",
          }}
        >
          Interview Time
        </label>

        <input
          id="meeting-time"
          type="time"
          value={meetingTime}
          onChange={(event) =>
            setMeetingTime(event.target.value)
          }
          required
          disabled={saving}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.7rem",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            color: "#0f172a",
            background: "#ffffff",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "1.35rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {saving ? (
              <FiLoader className="spin-animation" />
            ) : (
              <FiCalendar />
            )}

            {saving
              ? "Assigning..."
              : "Assign Session"}
          </button>
        </div>
      </form>
    </div>
  );
};

const CandidateCard = ({
  request,
  onAccept,
  onReject,
  onSchedule,
  onJoin,
  onView,
}) => {
  const status =
    getRequestStatus(request);

  const statusDetails =
    getStatusDetails(status);

  const candidateName =
    getCandidateName(request);

  const candidateEmail =
    getCandidateEmail(request);

  const scheduled =
    isInterviewScheduled(request);

  const canSchedule =
    !scheduled &&
    (
      status === "accepted" ||
      status === "reschedule_accepted" ||
      status ===
        "waiting_recruiter_confirmation" ||
      status === "reschedule_requested"
    );

  const canRespond =
    status === "pending";

  return (
    <article
      className="glass-card"
      style={{
        padding: "1.15rem",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            minWidth: 0,
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              candidateName
            )}&background=4f46e5&color=fff&size=96`}
            alt=""
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              border: "2px solid var(--color-primary)",
              flexShrink: 0,
            }}
          />

          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                color: "var(--color-text)",
                fontSize: "1rem",
                fontWeight: 800,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {candidateName}
            </h3>

            <p
              style={{
                margin: "0.2rem 0 0",
                color: "var(--color-muted)",
                fontSize: "0.82rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {candidateEmail || "Email unavailable"}
            </p>
          </div>
        </div>

        <span
          style={{
            padding: "0.35rem 0.7rem",
            borderRadius: 999,
            background: statusDetails.background,
            color: statusDetails.color,
            fontSize: "0.75rem",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {scheduled
            ? "Session Scheduled"
            : statusDetails.label}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.65rem",
          color: "var(--color-muted)",
          fontSize: "0.82rem",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              color: "var(--color-text)",
              marginBottom: "0.2rem",
            }}
          >
            Interview type
          </strong>

          {request.interview_type ||
            "Technical Interview"}
        </div>

        <div>
          <strong
            style={{
              display: "block",
              color: "var(--color-text)",
              marginBottom: "0.2rem",
            }}
          >
            Requested slot
          </strong>

          {request.preferred_datetime
            ? new Date(
                request.preferred_datetime
              ).toLocaleString("en-IN")
            : "Not specified"}
        </div>

        {scheduled && (
          <div>
            <strong
              style={{
                display: "block",
                color: "var(--color-text)",
                marginBottom: "0.2rem",
              }}
            >
              Final session
            </strong>

            {formatDate(request.meeting_date)}
            {" · "}
            {formatTime(request.meeting_time)}
          </div>
        )}
      </div>

      {request.message && (
        <p
          style={{
            margin: 0,
            padding: "0.7rem",
            borderRadius: 8,
            background: "rgba(148, 163, 184, 0.1)",
            color: "var(--color-muted)",
            fontSize: "0.82rem",
            fontStyle: "italic",
          }}
        >
          “{request.message}”
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          flexWrap: "wrap",
        }}
      >
        {canRespond && (
          <>
            <button
              type="button"
              onClick={() => onAccept(request)}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <FiCheck />
              Accept
            </button>

            <button
              type="button"
              onClick={() => onReject(request)}
              className="btn btn-outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <FiX />
              Decline
            </button>
          </>
        )}

        {canSchedule && (
          <button
            type="button"
            onClick={() => onSchedule(request)}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <FiCalendar />
            Schedule Session
          </button>
        )}

        {scheduled && (
          <button
            type="button"
            onClick={() => onJoin(request)}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              background:
                "linear-gradient(135deg, #10b981, #14b8a6)",
            }}
          >
            <FiVideo />
            Join Interview
          </button>
        )}

        <button
          type="button"
          onClick={() => onView(request)}
          className="btn btn-outline"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <FiEye />
          View
        </button>
      </div>
    </article>
  );
};

const Candidates = () => {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [schedulingCandidate, setSchedulingCandidate] =
    useState(null);

  const [selectedCandidate, setSelectedCandidate] =
    useState(null);

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await recruiterService.getInterviewRequestsForRecruiter();

        setRequests(
          Array.isArray(data) ? data : []
        );
      } catch (fetchError) {
        console.error(
          "Failed to load interview requests:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to load interview requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchRequests(true);
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchRequests]);

  const visibleRequests = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return requests.filter((request) => {
      const status =
        getRequestStatus(request);

      const name =
        getCandidateName(request)
          .toLowerCase();

      const email =
        getCandidateEmail(request)
          .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        status === filter ||
        (
          filter === "scheduled" &&
          isInterviewScheduled(request)
        );

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [requests, filter, search]);

  const updateRequestLocally = (
    requestId,
    changes
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              ...changes,
            }
          : request
      )
    );
  };

  const handleAccept = async (request) => {
    const requestId =
      request.id || request.request_id;

    const candidateUserId =
      getStudentId(request);

    if (!requestId || !candidateUserId) {
      toast.error(
        "Request or candidate ID is missing."
      );
      return;
    }

    try {
      await recruiterService.acceptInterviewRequest(
        requestId,
        candidateUserId,
        "Recruiter",
        getCandidateEmail(request)
      );

      updateRequestLocally(requestId, {
        status: "accepted",
        meeting_date: null,
        meeting_time: null,
        meeting_id: null,
        meeting_link: null,
      });

      toast.success(
        "Request accepted. Assign the final session slot next."
      );
    } catch (acceptError) {
      console.error(
        "Failed to accept request:",
        acceptError
      );

      toast.error(
        acceptError?.message ||
          "Failed to accept request."
      );
    }
  };

  const handleReject = async (request) => {
    const requestId =
      request.id || request.request_id;

    const candidateUserId =
      getStudentId(request);

    if (!requestId || !candidateUserId) {
      toast.error(
        "Request or candidate ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Decline the interview request from ${getCandidateName(
        request
      )}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      if (
        typeof recruiterService.rejectInterviewRequest ===
        "function"
      ) {
        await recruiterService.rejectInterviewRequest(
          requestId,
          candidateUserId
        );
      } else if (
        typeof recruiterService.rejectOrRescheduleRequest ===
        "function"
      ) {
        await recruiterService.rejectOrRescheduleRequest(
          requestId,
          "rejected",
          "Declined by recruiter"
        );
      } else {
        throw new Error(
          "Reject request service method is missing."
        );
      }

      updateRequestLocally(requestId, {
        status: "rejected",
      });

      toast.success("Request declined.");
    } catch (rejectError) {
      console.error(
        "Failed to reject request:",
        rejectError
      );

      toast.error(
        rejectError?.message ||
          "Failed to decline request."
      );
    }
  };

  const handleSchedule = (request) => {
    setSchedulingCandidate(request);
  };

  const handleScheduled = (updatedRequest) => {
    if (!updatedRequest?.id) {
      fetchRequests(true);
      return;
    }

    updateRequestLocally(
      updatedRequest.id,
      updatedRequest
    );

    fetchRequests(true);
  };

  const handleJoin = (request) => {
    if (!isInterviewScheduled(request)) {
      toast.error(
        "The final interview date and time are not assigned yet."
      );
      return;
    }

    navigate(
      getInterviewSessionPath(request.id)
    );
  };

  const handleView = (request) => {
    setSelectedCandidate(request);
  };

  return (
    <DashboardLayout title="Candidates">
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <section
          className="glass-card"
          style={{
            padding: "1.15rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.35rem",
                fontWeight: 800,
              }}
            >
              Candidates
            </h1>

            <p
              style={{
                margin: "0.3rem 0 0",
                color: "var(--color-muted)",
                fontSize: "0.84rem",
              }}
            >
              Manage interview requests and
              schedule final interview sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchRequests(true)}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "spin-animation"
                  : ""
              }
            />
            Refresh
          </button>
        </section>

        <section
          className="glass-card"
          style={{
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search candidate or email..."
            style={{
              flex: "1 1 240px",
              minWidth: 220,
              padding: "0.7rem 0.8rem",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            style={{
              padding: "0.7rem 0.8rem",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              minWidth: 170,
            }}
          >
            <option value="all">
              All requests
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="accepted">
              Accepted
            </option>
            <option value="scheduled">
              Scheduled
            </option>
            <option value="completed">
              Completed
            </option>
            <option value="rejected">
              Rejected
            </option>
          </select>
        </section>

        <section
          className="glass-card"
          style={{
            padding: "1rem",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--color-muted)",
              }}
            >
              <FiLoader
                className="spin-animation"
                style={{
                  fontSize: "2rem",
                  marginBottom: "0.75rem",
                }}
              />

              <p style={{ margin: 0 }}>
                Loading candidates...
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              <FiFileText
                style={{
                  fontSize: "2rem",
                  marginBottom: "0.6rem",
                }}
              />

              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  fetchRequests(true)
                }
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : visibleRequests.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--color-muted)",
              }}
            >
              <FiFileText
                style={{
                  fontSize: "2.5rem",
                  opacity: 0.45,
                  marginBottom: "0.75rem",
                }}
              />

              <h3
                style={{
                  margin: 0,
                  color: "var(--color-text)",
                }}
              >
                No candidates found
              </h3>

              <p
                style={{
                  margin: "0.35rem 0 0",
                  fontSize: "0.85rem",
                }}
              >
                New interview requests will appear
                here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {visibleRequests.map((request) => (
                <CandidateCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onSchedule={handleSchedule}
                  onJoin={handleJoin}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </section>

        {selectedCandidate && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              background: "rgba(15, 23, 42, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: 520,
                padding: "1.5rem",
                background: "#ffffff",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                  }}
                >
                  Candidate Details
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCandidate(null)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  <FiX />
                </button>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  color: "#475569",
                  lineHeight: 1.7,
                  fontSize: "0.9rem",
                }}
              >
                <p>
                  <strong>Name:</strong>{" "}
                  {getCandidateName(
                    selectedCandidate
                  )}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {getCandidateEmail(
                    selectedCandidate
                  ) || "Unavailable"}
                </p>

                <p>
                  <strong>Interview type:</strong>{" "}
                  {selectedCandidate.interview_type ||
                    "Technical Interview"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {getStatusDetails(
                    getRequestStatus(
                      selectedCandidate
                    )
                  ).label}
                </p>

                {isInterviewScheduled(
                  selectedCandidate
                ) && (
                  <p>
                    <strong>Scheduled:</strong>{" "}
                    {formatDate(
                      selectedCandidate.meeting_date
                    )}
                    {" · "}
                    {formatTime(
                      selectedCandidate.meeting_time
                    )}
                  </p>
                )}

                {selectedCandidate.message && (
                  <p>
                    <strong>Message:</strong>{" "}
                    {selectedCandidate.message}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCandidate(null)
                  }
                  className="btn btn-outline"
                >
                  Close
                </button>

                {isInterviewScheduled(
                  selectedCandidate
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      handleJoin(selectedCandidate)
                    }
                    className="btn btn-primary"
                  >
                    <FiVideo />
                    Join Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {schedulingCandidate && (
          <ScheduleSessionModal
            request={schedulingCandidate}
            onClose={() =>
              setSchedulingCandidate(null)
            }
            onScheduled={handleScheduled}
          />
        )}
      </main>
    </DashboardLayout>
  );
};

export default Candidates;