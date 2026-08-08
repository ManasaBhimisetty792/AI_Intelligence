import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiClock,
  FiLoader,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiStar,
  FiVideo,
  FiX,
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
} from "../../utils/interviewSession";

const getCandidateName = (item = {}) => {
  return (
    item.candidate_name ||
    item.student_name ||
    item.student?.full_name ||
    item.student?.name ||
    `Candidate ${
      item.student_id?.slice(0, 6) || ""
    }`
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "accepted":
      return {
        bg: "#e6f9f4",
        color: "#149174",
        label: "Accepted",
      };

    case "pending":
      return {
        bg: "#fef3e0",
        color: "#b8860b",
        label: "Pending",
      };

    case "completed":
      return {
        bg: "#e0f2fe",
        color: "#0284c7",
        label: "Completed",
      };

    case "rejected":
      return {
        bg: "#fef2f2",
        color: "#ef4444",
        label: "Declined",
      };

    case "rescheduled":
    case "reschedule_requested":
      return {
        bg: "#ede9fe",
        color: "#7c3aed",
        label: "Reschedule Proposed",
      };

    case "reschedule_accepted":
      return {
        bg: "#e0f2fe",
        color: "#0369a1",
        label: "Reschedule Accepted",
      };

    case "waiting_recruiter_confirmation":
      return {
        bg: "#fef3e0",
        color: "#b8860b",
        label: "Pending Confirmation",
      };

    case "cancelled":
      return {
        bg: "#fef2f2",
        color: "#ef4444",
        label: "Cancelled",
      };

    default:
      return {
        bg: "#f1f5f9",
        color: "#64748b",
        label: status || "Unknown",
      };
  }
};

const getInterviewDate = (item = {}) => {
  if (item.meeting_date) {
    const date = new Date(
      `${item.meeting_date}T00:00:00`
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    }

    return item.meeting_date;
  }

  if (item.preferred_datetime) {
    const date = new Date(
      item.preferred_datetime
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(
        "en-IN"
      );
    }
  }

  return "TBD";
};

const getInterviewTime = (item = {}) => {
  if (item.meeting_time) {
    const [hours, minutes] = String(
      item.meeting_time
    )
      .split(":")
      .map(Number);

    if (
      !Number.isNaN(hours) &&
      !Number.isNaN(minutes)
    ) {
      const date = new Date();

      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);

      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }

    return item.meeting_time;
  }

  if (item.preferred_datetime) {
    const date = new Date(
      item.preferred_datetime
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    }
  }

  return "TBD";
};

const needsScheduling = (item = {}) => {
  const status = String(
    item.status || ""
  ).toLowerCase();

  return (
    (
      status === "accepted" ||
      status === "reschedule_accepted" ||
      status ===
        "waiting_recruiter_confirmation" ||
      status === "reschedule_requested"
    ) &&
    !isInterviewScheduled(item)
  );
};

export const InterviewScheduling = () => {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [tab, setTab] =
    useState("Upcoming");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [feedbackModal, setFeedbackModal] =
    useState(null);

  const [feedbackRating, setFeedbackRating] =
    useState(5);

  const [feedbackComment, setFeedbackComment] =
    useState("");

  const [submittingFeedback, setSubmittingFeedback] =
    useState(false);

  const fetchInterviews = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await recruiterService.getInterviewRequestsForRecruiter();

        setRequests(
          Array.isArray(data) ? data : []
        );
      } catch (fetchError) {
        console.error(
          "Error loading interviews:",
          fetchError
        );

        setError(
          "Failed to load interviews. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  useRealtime(
    [
      "interview_requests",
      "interview_feedback",
      "notifications",
    ],
    fetchInterviews
  );

  const upcomingInterviews = useMemo(() => {
    return requests.filter((request) => {
      const status = String(
        request.status || ""
      ).toLowerCase();

      return (
        status === "pending" ||
        status === "accepted" ||
        status === "rescheduled" ||
        status === "reschedule_requested" ||
        status === "reschedule_accepted" ||
        status ===
          "waiting_recruiter_confirmation"
      );
    });
  }, [requests]);

  const completedInterviews = useMemo(() => {
    return requests.filter((request) => {
      const status = String(
        request.status || ""
      ).toLowerCase();

      return (
        status === "completed" ||
        status === "rejected" ||
        status === "cancelled"
      );
    });
  }, [requests]);

  const displayList =
    tab === "Upcoming"
      ? upcomingInterviews
      : completedInterviews;

  const handleCompleteInterview = async (
    request
  ) => {
    if (!isInterviewScheduled(request)) {
      toast.error(
        "Only a fully scheduled session can be completed."
      );
      return;
    }

    const confirmed = window.confirm(
      "Mark this interview as completed?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await interviewService.completeInterview(
        request.id
      );

      toast.success(
        "Interview marked as completed!"
      );

      fetchInterviews();
    } catch (completeError) {
      console.error(
        "Failed to complete interview:",
        completeError
      );

      toast.error(
        "Failed to mark interview as completed."
      );
    }
  };

  const openFeedbackModal = (item) => {
    setFeedbackModal(item);
    setFeedbackRating(5);
    setFeedbackComment("");
  };

  const closeFeedbackModal = () => {
    if (submittingFeedback) {
      return;
    }

    setFeedbackModal(null);
    setFeedbackRating(5);
    setFeedbackComment("");
  };

  const handleSubmitFeedback = async (
    event
  ) => {
    event.preventDefault();

    if (!feedbackModal) {
      return;
    }

    setSubmittingFeedback(true);

    try {
      await recruiterService.submitInterviewFeedback(
        {
          interview_request_id:
            feedbackModal.id,

          student_id:
            feedbackModal.student_id,

          recruiter_user_id:
            feedbackModal.recruiter_user_id,

          rating: feedbackRating,

          comments: feedbackComment,

          candidate_name:
            feedbackModal.candidate_name ||
            feedbackModal.student_name ||
            "Candidate",
        }
      );

      toast.success(
        "Feedback submitted successfully!"
      );

      closeFeedbackModal();
      fetchInterviews();
    } catch (feedbackError) {
      console.error(
        "Failed to submit feedback:",
        feedbackError
      );

      toast.error(
        feedbackError?.message ||
          "Failed to submit feedback."
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleJoin = (item) => {
    if (!isInterviewScheduled(item)) {
      toast.error(
        "The final date, time, and meeting room are not assigned yet."
      );
      return;
    }

    navigate(
      getInterviewSessionPath(item.id)
    );
  };

  return (
    <DashboardLayout title="Interview Scheduling & Management">
      <div
        className="glass-card mb-4"
        style={{
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {["Upcoming", "Completed"].map(
              (tabName) => (
                <button
                  key={tabName}
                  type="button"
                  onClick={() =>
                    setTab(tabName)
                  }
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "8px",
                    border:
                      tab === tabName
                        ? "1px solid #1abc9c"
                        : "1px solid #e2e8f0",
                    background:
                      tab === tabName
                        ? "#1abc9c"
                        : "transparent",
                    color:
                      tab === tabName
                        ? "#fff"
                        : "#475569",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {tabName} Interviews

                  {tabName === "Upcoming" &&
                    upcomingInterviews.length >
                      0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: "50%",
                          padding: "1px 6px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {
                          upcomingInterviews.length
                        }
                      </span>
                    )}
                </button>
              )
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={fetchInterviews}
              className="btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                fontSize: "0.82rem",
              }}
            >
              <FiRefreshCw
                className={
                  loading
                    ? "spin-animation"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/recruiter/notifications"
                )
              }
              className="btn btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <FiPlus />
              View All Requests
            </button>
          </div>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {tab === "Upcoming"
              ? "📅 Scheduled & Upcoming Interviews"
              : "✅ Past Interview Sessions"}

            <span
              style={{
                marginLeft: 8,
                fontSize: "0.85rem",
                color: "var(--color-muted)",
                fontWeight: 500,
              }}
            >
              ({displayList.length})
            </span>
          </h3>

          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            Realtime Supabase Sync
          </span>
        </div>

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
                color: "var(--color-primary)",
              }}
            />

            <p
              style={{
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              Loading interviews from Supabase...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#EF4444",
            }}
          >
            <FiAlertCircle
              style={{
                fontSize: "2rem",
                marginBottom: "0.5rem",
              }}
            />

            <p
              style={{
                margin: "0 0 1rem",
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={fetchInterviews}
              className="btn-primary"
              style={{
                padding: "0.45rem 1rem",
                fontSize: "0.82rem",
              }}
            >
              Retry
            </button>
          </div>
        ) : displayList.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--color-muted)",
              fontSize: "0.9rem",
            }}
          >
            <FiCalendar
              style={{
                fontSize: "2.5rem",
                opacity: 0.4,
                marginBottom: "0.75rem",
              }}
            />

            <div
              style={{
                fontWeight: 700,
              }}
            >
              No {tab.toLowerCase()} interviews
              found.
            </div>

            <div
              style={{
                fontSize: "0.82rem",
                marginTop: "0.25rem",
              }}
            >
              {tab === "Upcoming"
                ? "New requests will appear here when students book interviews."
                : "Completed sessions will be archived here."}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
            }}
          >
            {displayList.map((item) => {
              const statusStyle =
                getStatusStyle(item.status);

              const candidateName =
                getCandidateName(item);

              const interviewDate =
                getInterviewDate(item);

              const interviewTime =
                getInterviewTime(item);

              const scheduled =
                isInterviewScheduled(item);

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    padding: "1rem 1.25rem",
                    borderRadius: "10px",
                    background:
                      "rgba(255,255,255,0.04)",
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      candidateName
                    )}&background=4f46e5&color=fff&size=80`}
                    alt=""
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border:
                        "2px solid var(--color-primary)",
                    }}
                  />

                  <div
                    style={{
                      flex: "1 1 200px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--color-text)",
                      }}
                    >
                      {candidateName}
                    </div>

                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {item.interview_type ||
                        "Technical Interview"}
                    </div>

                    {item.message && (
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--color-muted)",
                          marginTop: "0.2rem",
                          fontStyle: "italic",
                        }}
                      >
                        “{item.message}”
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 190,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        marginBottom: "0.1rem",
                      }}
                    >
                      {tab === "Upcoming"
                        ? scheduled
                          ? "Scheduled Time"
                          : "Scheduling Status"
                        : "Completed Date"}
                    </div>

                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      {scheduled ? (
                        <>
                          <FiClock
                            style={{
                              opacity: 0.6,
                            }}
                          />
                          {interviewDate}{" "}
                          {interviewTime}
                        </>
                      ) : (
                        "Final slot not assigned"
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: scheduled
                          ? "#dcfce7"
                          : statusStyle.bg,
                        color: scheduled
                          ? "#166534"
                          : statusStyle.color,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {scheduled
                        ? "Scheduled"
                        : statusStyle.label}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {needsScheduling(item) && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/recruiter/candidates"
                          )
                        }
                        className="btn btn-outline"
                        style={{
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <FiCalendar />
                        Schedule Session
                      </button>
                    )}

                    {scheduled && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleJoin(item)
                          }
                          className="btn btn-primary"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <FiVideo />
                          Join Live Room
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCompleteInterview(
                              item
                            )
                          }
                          className="btn btn-outline"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <FiCheck />
                          Mark Done
                        </button>
                      </>
                    )}

                    {item.status === "completed" && (
                      <button
                        type="button"
                        onClick={() =>
                          openFeedbackModal(item)
                        }
                        className="btn btn-outline"
                        style={{
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <FiMessageSquare />
                        Submit Feedback
                      </button>
                    )}

                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/recruiter/notifications"
                          )
                        }
                        className="btn btn-outline"
                        style={{
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        Respond to Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {feedbackModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: 480,
              padding: "1.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 800,
                }}
              >
                Submit Interview Feedback
              </h3>

              <button
                type="button"
                onClick={closeFeedbackModal}
                disabled={submittingFeedback}
                style={{
                  border: "none",
                  background: "none",
                  color: "var(--color-text)",
                  cursor: submittingFeedback
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "1.2rem",
                }}
              >
                <FiX />
              </button>
            </div>

            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-muted)",
                marginBottom: "1rem",
              }}
            >
              Rate the interview session with{" "}
              <strong>
                {getCandidateName(
                  feedbackModal
                )}
              </strong>
            </p>

            <form
              onSubmit={handleSubmitFeedback}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Overall Rating
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFeedbackRating(
                            star
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "1.75rem",
                          cursor: "pointer",
                          color:
                            star <= feedbackRating
                              ? "#F59E0B"
                              : "#CBD5E1",
                          transition:
                            "color 0.15s",
                        }}
                      >
                        ★
                      </button>
                    )
                  )}

                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {feedbackRating}/5
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-comment"
                  style={{
                    display: "block",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Comments / Feedback
                </label>

                <textarea
                  id="feedback-comment"
                  value={feedbackComment}
                  onChange={(event) =>
                    setFeedbackComment(
                      event.target.value
                    )
                  }
                  placeholder="Describe the candidate's technical skills, communication, and overall performance..."
                  rows={4}
                  className="input-field"
                  style={{
                    width: "100%",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  disabled={submittingFeedback}
                  className="btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingFeedback}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  {submittingFeedback ? (
                    <FiLoader className="spin-animation" />
                  ) : (
                    <FiStar />
                  )}

                  {submittingFeedback
                    ? "Submitting..."
                    : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InterviewScheduling;