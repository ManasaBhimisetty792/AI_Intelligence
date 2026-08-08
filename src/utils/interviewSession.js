export const isInterviewScheduled = (
  request = {}
) => {
  return Boolean(
    request.status === "accepted" &&
      request.meeting_date &&
      request.meeting_time &&
      request.meeting_id &&
      request.meeting_link
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