import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle, FiCalendar, FiChevronLeft, FiChevronRight, FiClock,
  FiLoader, FiRefreshCw, FiVideo, FiUser, FiCheckCircle, FiPlus, FiX, FiLink, FiArrowRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";
import useRealtime from "../../hooks/useRealtime";
import {
  getInterviewSessionPath,
  isInterviewScheduled,
  formatInterviewDate,
  formatInterviewTime,
  formatTimeWindow,
  getSessionTimeStatus,
} from "../../utils/interviewSession";

const getCandidateName = (session = {}) => {
  return (
    session.candidate_name ||
    session.student_name ||
    session.student?.full_name ||
    session.student?.name ||
    `Candidate ${session.student_id?.slice(0, 6) || ""}`
  );
};

const getCandidateEmail = (session = {}) => {
  return (
    session.candidate_email ||
    session.student_email ||
    session.student?.email ||
    ""
  );
};

const getStudentId = (session = {}) => {
  return (
    session.student_id ||
    session.student?.id ||
    session.candidate_id ||
    session.user_id ||
    ""
  );
};

const getDateKey = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getMonthEnd = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getCalendarDays = (monthDate) => {
  const monthStart = getMonthStart(monthDate);
  const monthEnd = getMonthEnd(monthDate);
  const firstDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();

  const cells = [];
  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

const isSameDay = (first, second) => {
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const RecruiterSchedule = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleMonth, setVisibleMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Schedule Modal state
  const [schedulingReq, setSchedulingReq] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchSchedule = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await recruiterService.getInterviewRequestsForRecruiter();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load recruiter schedule:", err);
      toast.error("Failed to load schedule.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useRealtime(["interview_requests", "notifications"], () => fetchSchedule(true));

  // Filter unscheduled accepted requests
  const unscheduledAccepted = useMemo(() => {
    return requests.filter((r) => {
      const status = String(r.status || "").toLowerCase();
      const isAcceptedStatus =
        status === "accepted" ||
        status === "reschedule_accepted" ||
        status === "waiting_recruiter_confirmation";
      const isScheduled = Boolean(r.meeting_date && (r.meeting_time || r.start_time));
      return isAcceptedStatus && !isScheduled;
    });
  }, [requests]);

  // Scheduled sessions sorted by date & time
  const scheduledSessions = useMemo(() => {
    return requests
      .filter((r) => Boolean(r.meeting_date && (r.meeting_time || r.start_time)))
      .sort((a, b) => {
        const first = `${a.meeting_date}T${a.start_time || a.meeting_time || "00:00"}`;
        const second = `${b.meeting_date}T${b.start_time || b.meeting_time || "00:00"}`;
        return new Date(first).getTime() - new Date(second).getTime();
      });
  }, [requests]);

  // Sessions for the currently selected date
  const sessionsForSelectedDate = useMemo(() => {
    const dateKey = selectedDate.toISOString().slice(0, 10);
    return scheduledSessions.filter((s) => getDateKey(s.meeting_date) === dateKey);
  }, [scheduledSessions, selectedDate]);

  // Group scheduled dates for calendar dot indicator
  const sessionsByDate = useMemo(() => {
    const map = new Map();
    scheduledSessions.forEach((s) => {
      const key = getDateKey(s.meeting_date);
      if (!key) return;
      const current = map.get(key) || [];
      map.set(key, [...current, s]);
    });
    return map;
  }, [scheduledSessions]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  const openScheduleModal = (req) => {
    setSchedulingReq(req);
    const todayStr = new Date().toISOString().slice(0, 10);
    setMeetingDate(req.meeting_date || todayStr);
    setStartTime(req.start_time || req.meeting_time || "10:00");
    setEndTime(req.end_time || "11:00");
    setMeetingLink(req.meeting_link || `/interviews/session/${req.id}`);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!schedulingReq) return;

    const requestId = schedulingReq.id || schedulingReq.request_id;
    const candidateUserId = getStudentId(schedulingReq);
    const candidateName = getCandidateName(schedulingReq);

    if (!requestId || !candidateUserId) {
      toast.error("Candidate or request information is missing.");
      return;
    }

    if (!meetingDate || !startTime || !endTime) {
      toast.error("Please provide meeting date, start time, and end time.");
      return;
    }

    try {
      setSavingSchedule(true);
      await recruiterService.assignInterviewSlot({
        requestId,
        candidateUserId,
        meetingDate,
        startTime,
        endTime,
        meetingLink: meetingLink || `/interviews/session/${requestId}`,
      });

      toast.success(`Session successfully scheduled with ${candidateName}!`);
      setSchedulingReq(null);
      fetchSchedule(true);
    } catch (err) {
      console.error("Failed to assign schedule slot:", err);
      toast.error(err?.message || "Failed to schedule session.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const goToPreviousMonth = () => {
    setVisibleMonth((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  };

  return (
    <DashboardLayout title="Interview Schedule">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%" }}>
        
        {/* Top Header */}
        <div
          className="glass-card"
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--color-text)" }}>
              Interview Scheduling Hub
            </h1>
            <p style={{ margin: "0.25rem 0 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
              Interactive calendar schedule, daily session details, and slot assignment workspace.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button
              onClick={() => fetchSchedule(true)}
              className="btn btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
            >
              <FiRefreshCw className={refreshing ? "spin-animation" : ""} /> Refresh
            </button>
            <button
              onClick={() => navigate("/recruiter/interviews")}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
            >
              <FiVideo /> Live Interviews Studio <FiArrowRight />
            </button>
          </div>
        </div>

        {/* ── 1. FIRST: Interactive Calendar Widget (Full Width) ── */}
        <div className="glass-card" style={{ padding: "1.75rem", borderRadius: "var(--radius-xl)", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(99, 102, 241, 0.12)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>
                <FiCalendar />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--color-text)" }}>
                  {visibleMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </h2>
                <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                  Click on any date to inspect scheduled sessions
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", fontWeight: 700 }}
              >
                Today
              </button>
              <button
                onClick={goToPreviousMonth}
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.95rem" }}
                aria-label="Previous Month"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={goToNextMonth}
                className="btn btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.95rem" }}
                aria-label="Next Month"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Weekdays Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "0.8rem", fontWeight: 800, color: "var(--color-muted)", marginBottom: "0.75rem", letterSpacing: "0.03em" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={{ padding: "0.35rem 0" }}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: 52 }} />;
              }

              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const dateKey = getDateKey(date.toISOString());
              const daySessions = sessionsByDate.get(dateKey) || [];
              const hasSessions = daySessions.length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  type="button"
                  style={{
                    minHeight: 52,
                    padding: "0.4rem 0.2rem",
                    borderRadius: "var(--radius-md, 10px)",
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: isSelected
                      ? "var(--color-primary-light, rgba(99, 102, 241, 0.15))"
                      : isToday
                      ? "rgba(16, 185, 129, 0.08)"
                      : "var(--color-surface)",
                    color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                    fontWeight: isSelected || isToday ? 850 : 600,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{date.getDate()}</span>
                  {hasSessions && (
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: isSelected ? "var(--color-primary)" : "#10B981",
                        }}
                      />
                      {daySessions.length > 1 && (
                        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: isSelected ? "var(--color-primary)" : "#10B981" }}>
                          {daySessions.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. THEN: Selected Day's Agenda Details (Full Width) ── */}
        <div className="glass-card" style={{ padding: "1.75rem", borderRadius: "var(--radius-xl)", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>
                <FiClock />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--color-text)" }}>
                  Agenda for {selectedDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>
                  {sessionsForSelectedDate.length} drill session(s) scheduled on this day
                </span>
              </div>
            </div>

            <span style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 800, background: "var(--color-primary-light, rgba(99,102,241,0.12))", padding: "0.3rem 0.8rem", borderRadius: 999 }}>
              {sessionsForSelectedDate.length} Active Slot(s)
            </span>
          </div>

          {sessionsForSelectedDate.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-muted)", background: "var(--color-surface-sec, rgba(0,0,0,0.02))", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
              <FiCalendar size={40} style={{ opacity: 0.35, marginBottom: "0.6rem" }} />
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--color-text)" }}>No sessions scheduled for this day</div>
              <p style={{ margin: "0.35rem auto 0", fontSize: "0.84rem", maxWidth: 450 }}>
                Pick another date on the calendar above or assign schedule slots to accepted candidates below.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sessionsForSelectedDate.map((session) => {
                const timeStatus = getSessionTimeStatus(session);
                const candidateName = getCandidateName(session);
                const candidateEmail = getCandidateEmail(session);

                return (
                  <div
                    key={session.id}
                    style={{
                      padding: "1.25rem",
                      borderRadius: "var(--radius-lg, 14px)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 260, flex: 1 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        {candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                          <strong style={{ fontWeight: 800, fontSize: "1rem", color: "var(--color-text)" }}>
                            {candidateName}
                          </strong>
                          <span
                            style={{
                              padding: "0.2rem 0.6rem",
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
                        <div style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
                          {candidateEmail || session.interview_type || "Technical Deep Dive"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.15rem" }}>
                          <FiClock />
                          <strong>Time Window:</strong> {formatTimeWindow(session)}
                        </div>
                        {session.meeting_link && (
                          <div style={{ fontSize: "0.76rem", color: "var(--color-muted)", wordBreak: "break-all", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <FiLink /> {session.meeting_link}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => openScheduleModal(session)}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.82rem", padding: "0.55rem 1rem", fontWeight: 700 }}
                      >
                        Edit Slot
                      </button>
                      <button
                        type="button"
                        disabled={!timeStatus.canJoin}
                        onClick={() => {
                          if (session.meeting_link && session.meeting_link.startsWith("http")) {
                            window.open(session.meeting_link, "_blank");
                          } else {
                            navigate(getInterviewSessionPath(session.id));
                          }
                        }}
                        className="btn btn-primary"
                        style={{
                          fontSize: "0.82rem",
                          padding: "0.55rem 1.15rem",
                          fontWeight: 700,
                          background: timeStatus.canJoin ? "linear-gradient(135deg, #10b981, #059669)" : undefined,
                          opacity: timeStatus.canJoin ? 1 : 0.6,
                          cursor: timeStatus.canJoin ? "pointer" : "not-allowed",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <FiVideo /> {timeStatus.isEnded ? "Session Ended" : timeStatus.canJoin ? "Join Live Studio" : "Upcoming Window"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. THEN: Assignment Schedule Part (Full Width) ── */}
        <div
          className="glass-card"
          style={{
            padding: "1.75rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(99, 102, 241, 0.04))",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245, 158, 11, 0.14)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>
                <FiClock />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--color-text)" }}>
                  Assignment Schedule Hub — Accepted Requests ({unscheduledAccepted.length})
                </h2>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--color-muted)" }}>
                  Assign interview dates, specific start &amp; end times, and meeting links for accepted applicants.
                </p>
              </div>
            </div>

            {unscheduledAccepted.length > 0 && (
              <span style={{ fontSize: "0.78rem", color: "#F59E0B", fontWeight: 800, background: "rgba(245, 158, 11, 0.14)", padding: "0.3rem 0.8rem", borderRadius: 999 }}>
                ⚡ Action Required
              </span>
            )}
          </div>

          {unscheduledAccepted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
              <FiCheckCircle size={36} style={{ color: "#10B981", marginBottom: "0.5rem" }} />
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--color-text)" }}>All accepted candidates are scheduled!</div>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--color-muted)" }}>
                No pending accepted requests waiting for slot assignment. Check the Candidates tab to review new applications.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {unscheduledAccepted.map((req) => {
                const name = getCandidateName(req);
                const email = getCandidateEmail(req);

                return (
                  <div
                    key={req.id}
                    style={{
                      padding: "1.15rem 1.25rem",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 260, flex: 1 }}>
                      <img
                        src={
                          req.candidate_avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=80`
                        }
                        alt={name}
                        style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--color-primary)", flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--color-text)" }}>
                          {name}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--color-muted)" }}>
                          {email || req.interview_type || "Technical Deep Dive"}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--color-primary)", marginTop: "0.2rem", fontWeight: 600 }}>
                          📅 Candidate Preferred Window: {req.preferred_datetime ? new Date(req.preferred_datetime).toLocaleString() : "Flexible"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openScheduleModal(req)}
                      className="btn btn-primary"
                      style={{
                        padding: "0.6rem 1.25rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.28)",
                      }}
                    >
                      <FiCalendar /> Assign Schedule &amp; Link
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule / Slot Assignment Modal */}
        {schedulingReq && (
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
              onSubmit={handleSaveSchedule}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: 520,
                padding: "2rem",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FiCalendar style={{ color: "var(--color-primary)" }} /> Assign Interview Session
                </h3>
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  disabled={savingSchedule}
                  style={{ border: "none", background: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: "1.25rem" }}
                >
                  <FiX />
                </button>
              </div>

              <p style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>
                Assign schedule parameters for candidate <strong>{getCandidateName(schedulingReq)}</strong>.
              </p>

              {/* Day / Date */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                  Day / Interview Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  disabled={savingSchedule}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {/* Start Time & End Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={savingSchedule}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={savingSchedule}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              {/* Meeting Link */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--color-text)" }}>
                  Meeting Link (Livekit)
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  disabled={savingSchedule}
                  placeholder={`/interviews/session/${schedulingReq.id}`}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ fontSize: "0.74rem", color: "var(--color-muted)", marginTop: "0.25rem", display: "block" }}>
                  Defaults to built-in LiveKit Live Studio or paste a custom Zoom / Google Meet room URL.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  disabled={savingSchedule}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {savingSchedule ? <FiLoader className="spin-animation" /> : <FiCheckCircle />}
                  {savingSchedule ? "Saving Slot..." : "Confirm & Send Link"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecruiterSchedule;