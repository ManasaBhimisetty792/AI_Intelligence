export const isInterviewScheduled = (
  request = {}
) => {
  const status = String(request.status || "").toLowerCase();
  return Boolean(
    (status === "accepted" || status === "scheduled" || status === "completed") &&
      request.meeting_date &&
      (request.meeting_time || request.start_time)
  );
};

export const getInterviewSessionPath = (
  requestId
) => {
  return `/interviews/session/${requestId}`;
};

export const getInterviewRoomName = (
  request = {}
) => {
  return (
    request.meeting_id ||
    `interview_${request.id}`
  );
};

export const formatInterviewDate = (
  value
) => {
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

export const formatInterviewTime = (
  value
) => {
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

export const formatTimeWindow = (
  request = {}
) => {
  let startTime = request.start_time || request.meeting_time;
  let endTime = request.end_time;

  if (request.duration && request.duration.includes("-")) {
    const parts = request.duration.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      if (!startTime) startTime = parts[0];
      if (!endTime) endTime = parts[1];
    }
  }

  if (startTime && startTime.includes("-")) {
    const parts = startTime.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      startTime = parts[0];
      if (!endTime) endTime = parts[1];
    }
  }

  if (!startTime) return "Time not assigned";
  if (!endTime) return formatInterviewTime(startTime);

  return `${formatInterviewTime(startTime)} - ${formatInterviewTime(endTime)}`;
};

/**
 * Returns session time status:
 * - 'completed': session marked completed
 * - 'ended': current time is past end_time
 * - 'active': current time is within [start_time - 5min, end_time]
 * - 'upcoming': current time is before start_time
 */
export const getSessionTimeStatus = (
  request = {}
) => {
  const status = String(request.status || "").toLowerCase();
  if (status === "completed") {
    return {
      status: "completed",
      label: "Completed",
      canJoin: false,
      isEnded: true,
      color: "#0284c7",
      bg: "#e0f2fe",
    };
  }

  if (!request.meeting_date) {
    return {
      status: "unscheduled",
      label: "Not Scheduled",
      canJoin: false,
      isEnded: false,
      color: "#92400e",
      bg: "#fef3c7",
    };
  }

  const dateStr = String(request.meeting_date).slice(0, 10);
  let startTimeStr = request.start_time || request.meeting_time || "00:00";
  let endTimeStr = request.end_time;

  if (request.duration && request.duration.includes("-")) {
    const parts = request.duration.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      if (!request.start_time) startTimeStr = parts[0];
      if (!endTimeStr) endTimeStr = parts[1];
    }
  }

  if (startTimeStr && startTimeStr.includes("-")) {
    const parts = startTimeStr.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      startTimeStr = parts[0];
      if (!endTimeStr) endTimeStr = parts[1];
    }
  }

  const [startH, startM] = startTimeStr.split(":").map(Number);

  const startDt = new Date(`${dateStr}T00:00:00`);
  startDt.setHours(startH || 0, startM || 0, 0, 0);

  let endDt = new Date(startDt);
  if (endTimeStr) {
    const [endH, endM] = String(endTimeStr).split(":").map(Number);
    endDt.setHours(endH || 0, endM || 0, 0, 0);
  } else {
    // Default 1-hour session duration if end_time not specified
    endDt.setHours(endDt.getHours() + 1);
  }

  const now = new Date();

  // Allow joining 5 minutes before scheduled start time
  const earlyAccessStart = new Date(startDt.getTime() - 5 * 60 * 1000);

  if (now > endDt) {
    return {
      status: "ended",
      label: "Session Ended",
      canJoin: false,
      isEnded: true,
      color: "#64748b",
      bg: "#f1f5f9",
    };
  }

  if (now >= earlyAccessStart && now <= endDt) {
    return {
      status: "active",
      label: "In Progress",
      canJoin: true,
      isEnded: false,
      color: "#166534",
      bg: "#dcfce7",
    };
  }

  return {
    status: "upcoming",
    label: `Starts at ${formatInterviewTime(startTimeStr)}`,
    canJoin: false,
    isEnded: false,
    color: "#4338ca",
    bg: "#e0e7ff",
  };
};