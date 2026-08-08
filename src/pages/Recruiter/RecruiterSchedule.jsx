import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLoader,
  FiRefreshCw,
  FiVideo,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";
import useRealtime from "../../hooks/useRealtime";

import {
  getInterviewSessionPath,
  isInterviewScheduled,
} from "../../utils/interviewSession";

// import "./RecruiterSchedule.css";

const getCandidateName = (session = {}) => {
  return (
    session.candidate_name ||
    session.student_name ||
    session.student?.full_name ||
    session.student?.name ||
    `Candidate ${
      session.student_id?.slice(0, 6) || ""
    }`
  );
};

const getSessionType = (session = {}) => {
  return (
    session.interview_type ||
    "Technical Interview"
  );
};

const getDateKey = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};

const formatDateHeading = (date) => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) {
    return "Date not assigned";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
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

const getMonthStart = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
};

const getMonthEnd = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  );
};

const getCalendarDays = (monthDate) => {
  const monthStart =
    getMonthStart(monthDate);

  const monthEnd =
    getMonthEnd(monthDate);

  const firstDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();

  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= totalDays;
    day += 1
  ) {
    cells.push(
      new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        day
      )
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const isSameDay = (first, second) => {
  if (!first || !second) {
    return false;
  }

  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const RecruiterSchedule = () => {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [visibleMonth, setVisibleMonth] =
    useState(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchSchedule = useCallback(
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
          "Failed to load recruiter schedule:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to load the schedule."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useRealtime(
    [
      "interview_requests",
      "notifications",
    ],
    () => fetchSchedule(true)
  );

  const scheduledSessions = useMemo(() => {
    return requests
      .filter((request) =>
        isInterviewScheduled(request)
      )
      .sort((first, second) => {
        const firstValue = `${first.meeting_date}T${first.meeting_time}`;
        const secondValue = `${second.meeting_date}T${second.meeting_time}`;

        return (
          new Date(firstValue).getTime() -
          new Date(secondValue).getTime()
        );
      });
  }, [requests]);

  const unscheduledAccepted = useMemo(() => {
    return requests.filter((request) => {
      const status = String(
        request.status || ""
      ).toLowerCase();

      return (
        (
          status === "accepted" ||
          status === "reschedule_accepted" ||
          status ===
            "waiting_recruiter_confirmation" ||
          status === "reschedule_requested"
        ) &&
        !isInterviewScheduled(request)
      );
    });
  }, [requests]);

  const sessionsForSelectedDate = useMemo(() => {
    const dateKey = selectedDate
      .toISOString()
      .slice(0, 10);

    return scheduledSessions.filter(
      (session) =>
        getDateKey(session.meeting_date) ===
        dateKey
    );
  }, [scheduledSessions, selectedDate]);

  const sessionsByDate = useMemo(() => {
    const result = new Map();

    scheduledSessions.forEach((session) => {
      const key = getDateKey(
        session.meeting_date
      );

      if (!key) {
        return;
      }

      const current = result.get(key) || [];

      result.set(key, [
        ...current,
        session,
      ]);
    });

    return result;
  }, [scheduledSessions]);

  const calendarDays =
    useMemo(
      () => getCalendarDays(visibleMonth),
      [visibleMonth]
    );

  const goToPreviousMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };

  const goToToday = () => {
    const today = new Date();

    setSelectedDate(today);

    setVisibleMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);

    setVisibleMonth(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  };

  const handleJoin = (session) => {
    if (!isInterviewScheduled(session)) {
      toast.error(
        "This session does not have a complete assigned slot."
      );
      return;
    }

    navigate(
      getInterviewSessionPath(session.id)
    );
  };

  return (
    <DashboardLayout title="Recruiter Schedule">
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
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              Interview Schedule
            </h1>

            <p
              style={{
                margin: "0.3rem 0 0",
                color: "var(--color-muted)",
                fontSize: "0.84rem",
              }}
            >
              View assigned interview sessions
              and join scheduled rooms.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={goToToday}
              className="btn btn-outline"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() =>
                fetchSchedule(true)
              }
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
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
          </div>
        </section>

        {unscheduledAccepted.length > 0 && (
          <section
            className="glass-card"
            style={{
              padding: "1rem 1.15rem",
              border:
                "1px solid rgba(245, 158, 11, 0.35)",
              background:
                "rgba(245, 158, 11, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#92400e",
                  }}
                >
                  {unscheduledAccepted.length} accepted
                  request
                  {unscheduledAccepted.length === 1
                    ? ""
                    : "s"}{" "}
                  need scheduling
                </strong>

                <span
                  style={{
                    color: "#92400e",
                    fontSize: "0.82rem",
                  }}
                >
                  Assign the final date and time
                  before joining the room.
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/recruiter/candidates"
                  )
                }
                className="btn btn-primary"
              >
                Schedule Sessions
              </button>
            </div>
          </section>
        )}

        {loading ? (
          <section
            className="glass-card"
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
              Loading schedule...
            </p>
          </section>
        ) : error ? (
          <section
            className="glass-card"
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#dc2626",
            }}
          >
            <FiAlertCircle
              style={{
                fontSize: "2rem",
                marginBottom: "0.6rem",
              }}
            />

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                fetchSchedule(true)
              }
              className="btn btn-primary"
            >
              Try Again
            </button>
          </section>
        ) : (
          <section
            className="glass-card"
            style={{
              padding: "1.25rem",
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
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="btn btn-outline"
                aria-label="Previous month"
              >
                <FiChevronLeft />
              </button>

              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                {visibleMonth.toLocaleDateString(
                  "en-IN",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h2>

              <button
                type="button"
                onClick={goToNextMonth}
                className="btn btn-outline"
                aria-label="Next month"
              >
                <FiChevronRight />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(7, minmax(0, 1fr))",
                gap: "0.4rem",
                marginBottom: "0.4rem",
              }}
            >
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    color: "var(--color-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "0.35rem",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(7, minmax(0, 1fr))",
                gap: "0.4rem",
              }}
            >
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      style={{
                        minHeight: 82,
                      }}
                    />
                  );
                }

                const dateKey = date
                  .toISOString()
                  .slice(0, 10);

                const daySessions =
                  sessionsByDate.get(
                    dateKey
                  ) || [];

                const isSelected =
                  isSameDay(
                    date,
                    selectedDate
                  );

                const isToday =
                  isSameDay(
                    date,
                    new Date()
                  );

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() =>
                      handleSelectDate(date)
                    }
                    style={{
                      minHeight: 82,
                      textAlign: "left",
                      padding: "0.55rem",
                      borderRadius: 10,
                      border: isSelected
                        ? "2px solid #14b8a6"
                        : "1px solid #e2e8f0",
                      background: isSelected
                        ? "rgba(20, 184, 166, 0.12)"
                        : "#ffffff",
                      cursor: "pointer",
                      color: "var(--color-text)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: isToday
                            ? "#14b8a6"
                            : "transparent",
                          color: isToday
                            ? "#ffffff"
                            : "inherit",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                        }}
                      >
                        {date.getDate()}
                      </span>

                      {daySessions.length > 0 && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            color: "#0f766e",
                          }}
                        >
                          {daySessions.length}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem",
                      }}
                    >
                      {daySessions
                        .slice(0, 2)
                        .map((session) => (
                          <span
                            key={session.id}
                            style={{
                              display: "block",
                              overflow: "hidden",
                              whiteSpace:
                                "nowrap",
                              textOverflow:
                                "ellipsis",
                              fontSize: "0.67rem",
                              color: "#0f766e",
                              fontWeight: 700,
                            }}
                          >
                            {formatTime(
                              session.meeting_time
                            )}{" "}
                            ·{" "}
                            {getCandidateName(
                              session
                            )}
                          </span>
                        ))}

                      {daySessions.length > 2 && (
                        <span
                          style={{
                            fontSize: "0.67rem",
                            color: "var(--color-muted)",
                          }}
                        >
                          +{daySessions.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                {formatDateHeading(
                  selectedDate
                )}
              </h2>

              <p
                style={{
                  margin: "0.3rem 0 0",
                  color: "var(--color-muted)",
                  fontSize: "0.82rem",
                }}
              >
                {sessionsForSelectedDate.length}{" "}
                scheduled session
                {sessionsForSelectedDate.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {sessionsForSelectedDate.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--color-muted)",
              }}
            >
              <FiCalendar
                style={{
                  fontSize: "2.3rem",
                  opacity: 0.45,
                  marginBottom: "0.65rem",
                }}
              />

              <p style={{ margin: 0 }}>
                No interview sessions scheduled
                for this date.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {sessionsForSelectedDate.map(
                (session) => (
                  <div
                    key={session.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      borderRadius: 10,
                      border:
                        "1px solid rgba(20, 184, 166, 0.25)",
                      background:
                        "rgba(20, 184, 166, 0.07)",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          background: "#ccfbf1",
                          color: "#0f766e",
                        }}
                      >
                        <FiCalendar />
                      </div>

                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: "var(--color-text)",
                          }}
                        >
                          {getCandidateName(
                            session
                          )}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "0.2rem",
                            color: "var(--color-primary)",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                          }}
                        >
                          {getSessionType(
                            session
                          )}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginTop: "0.35rem",
                            color: "var(--color-muted)",
                            fontSize: "0.82rem",
                          }}
                        >
                          <FiClock />
                          {formatShortDate(
                            session.meeting_date
                          )}{" "}
                          ·{" "}
                          {formatTime(
                            session.meeting_time
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleJoin(session)
                      }
                      className="btn btn-primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <FiVideo />
                      Join Meeting
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
};

export default RecruiterSchedule;