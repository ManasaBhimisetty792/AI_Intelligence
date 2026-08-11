import {
  supabase,
  isSupabaseConfigured,
} from "./supabaseClient";

import { tokenStorage } from "./api";

const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(
      "st_read_notif_ids"
    );

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addStoredReadId = (id) => {
  try {
    if (!id || id === "ALL") {
      return;
    }

    const current = getStoredReadIds();

    if (!current.includes(id)) {
      localStorage.setItem(
        "st_read_notif_ids",
        JSON.stringify([...current, id])
      );
    }
  } catch {
    // Ignore localStorage errors.
  }
};

const setAllMarkedRead = () => {
  try {
    localStorage.setItem(
      "st_all_marked_read_time",
      new Date().toISOString()
    );
  } catch {
    // Ignore localStorage errors.
  }
};

const isAllMarkedRead = (createdAt) => {
  try {
    const markedAt = localStorage.getItem(
      "st_all_marked_read_time"
    );

    if (!markedAt || !createdAt) {
      return false;
    }

    return (
      new Date(createdAt) <=
      new Date(markedAt)
    );
  } catch {
    return false;
  }
};

const getStoredDeletedIds = () => {
  try {
    const raw = localStorage.getItem(
      "st_deleted_notif_ids"
    );

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addStoredDeletedId = (id) => {
  try {
    if (!id) {
      return;
    }

    const current = getStoredDeletedIds();

    if (!current.includes(id)) {
      localStorage.setItem(
        "st_deleted_notif_ids",
        JSON.stringify([...current, id])
      );
    }
  } catch {
    // Ignore localStorage errors.
  }
};

const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured."
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user || null;
};

const getCurrentUserId = async () => {
  const user = await getCurrentUser();

  return user?.id || null;
};

const getCurrentUserRole = async (
  fallbackRole = "student"
) => {
  const user = await getCurrentUser();

  return (
    user?.user_metadata?.role ||
    tokenStorage?.user?.role ||
    fallbackRole
  );
};

const isGeneratedRequestNotification = (
  id
) => {
  return (
    typeof id === "string" &&
    (
      id.startsWith("req_notif_") ||
      id.startsWith("req_rec_notif_")
    )
  );
};

const isInterviewScheduled = (
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

const getInterviewPath = (requestId) => {
  return `/interviews/session/${requestId}`;
};

const getStudentName = (request = {}) => {
  return (
    request.candidate_name ||
    request.student_name ||
    request.student?.full_name ||
    request.student?.name ||
    "Student Candidate"
  );
};

const getRecruiterName = (request = {}) => {
  return (
    request.recruiter_name ||
    request.recruiter?.full_name ||
    request.recruiter?.name ||
    "Recruiter"
  );
};

const getInterviewType = (request = {}) => {
  return (
    request.interview_type ||
    "Technical Interview"
  );
};

const getRequestDateText = (request = {}) => {
  if (
    request.meeting_date &&
    request.meeting_time
  ) {
    return `${request.meeting_date} at ${request.meeting_time}`;
  }

  if (request.preferred_datetime) {
    const date = new Date(
      request.preferred_datetime
    );

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-IN");
    }
  }

  return "Final slot not assigned";
};

const createGeneratedNotification = ({
  id,
  title,
  message,
  notificationType,
  priority = "normal",
  createdAt,
  actionLabel = null,
  actionPath = null,
  metadata = {},
}) => {
  const readIds = getStoredReadIds();

  const isRead =
    readIds.includes(id) ||
    isAllMarkedRead(createdAt);

  return {
    id,
    title,
    message,
    category: "interview",
    notification_type: notificationType,
    priority,
    created_at: createdAt,
    action_label: actionLabel,
    action_path: actionPath,
    action: actionLabel
      ? "open_interview"
      : null,
    action_url: actionPath,
    metadata,
    is_read: isRead,
    read: isRead,
  };
};

const buildNotificationsFromInterviewRequests = (
  requests = [],
  currentUserId = "",
  targetRole = "all"
) => {
  const notifications = [];
  const deletedIds = getStoredDeletedIds();

  requests.forEach((request) => {
    const requestId = request.id;

    if (!requestId) {
      return;
    }

    const studentId =
      request.student_id ||
      request.student?.id ||
      "";

    const recruiterUserId =
      request.recruiter_user_id ||
      request.recruiter?.id ||
      "";

    const studentName =
      getStudentName(request);

    const recruiterName =
      getRecruiterName(request);

    const interviewType =
      getInterviewType(request);

    const status = String(
      request.status || "pending"
    ).toLowerCase();

    const dateText =
      getRequestDateText(request);

    const studentCanSee =
      targetRole === "student" &&
      studentId === currentUserId;

    const recruiterCanSee =
      targetRole === "recruiter" &&
      recruiterUserId === currentUserId;

    if (studentCanSee) {
      let notification = null;

      if (status === "pending") {
        notification =
          createGeneratedNotification({
            id: `req_notif_${requestId}_pending`,
            title: "Interview Request Sent",
            message:
              `Your request for ${interviewType} with ${recruiterName} is pending recruiter approval. Requested slot: ${dateText}.`,
            notificationType:
              "interview_request",
            priority: "normal",
            createdAt:
              request.created_at ||
              request.updated_at ||
              new Date().toISOString(),
            actionLabel: "View Requests",
            actionPath: "/student/notifications",
            metadata: {
              request_id: requestId,
              interview_request_id: requestId,
              status,
              ...request,
            },
          });
      }

      if (
        status === "accepted" &&
        !isInterviewScheduled(request)
      ) {
        notification =
          createGeneratedNotification({
            id: `req_notif_${requestId}_accepted`,
            title: "Interview Request Accepted",
            message:
              `${recruiterName} accepted your ${interviewType} interview request. The recruiter will assign the final date and time.`,
            notificationType:
              "interview_accepted",
            priority: "high",
            createdAt:
              request.updated_at ||
              request.created_at ||
              new Date().toISOString(),
            actionLabel: "View Interview",
            actionPath:
              getInterviewPath(requestId),
            metadata: {
              request_id: requestId,
              interview_request_id: requestId,
              status,
              recruiter_name: recruiterName,
              scheduling_required: true,
              ...request,
            },
          });
      }

      if (isInterviewScheduled(request)) {
        notification =
          createGeneratedNotification({
            id: `req_notif_${requestId}_scheduled`,
            title: "Interview Session Scheduled",
            message:
              `Your ${interviewType} interview with ${recruiterName} is scheduled for ${request.meeting_date} at ${request.meeting_time}.`,
            notificationType:
              "interview_scheduled",
            priority: "high",
            createdAt:
              request.updated_at ||
              request.created_at ||
              new Date().toISOString(),
            actionLabel: "Join Meeting",
            actionPath:
              getInterviewPath(requestId),
            metadata: {
              request_id: requestId,
              interview_request_id: requestId,
              status,
              meeting_date:
                request.meeting_date,
              meeting_time:
                request.meeting_time,
              meeting_id:
                request.meeting_id,
              meeting_link:
                request.meeting_link,
              ...request,
            },
          });
      }

      if (
        status === "reschedule_requested" ||
        status === "reschedule"
      ) {
        notification =
          createGeneratedNotification({
            id: `req_notif_${requestId}_reschedule`,
            title: "Recruiter Proposed Reschedule",
            message:
              `${recruiterName} proposed a new interview time. Reason: ${
                request.reschedule_reason ||
                "Schedule adjustment"
              }.`,
            notificationType:
              "reschedule_request",
            priority: "high",
            createdAt:
              request.updated_at ||
              request.created_at ||
              new Date().toISOString(),
            actionLabel: "Respond to Reschedule",
            actionPath: "/student/notifications",
            metadata: {
              request_id: requestId,
              interview_request_id: requestId,
              status,
              ...request,
            },
          });
      }

      if (
        status === "rejected" ||
        status === "declined"
      ) {
        notification =
          createGeneratedNotification({
            id: `req_notif_${requestId}_rejected`,
            title: "Interview Declined",
            message:
              `${recruiterName} declined the ${interviewType} request. Reason: ${
                request.reject_reason ||
                "Unavailable"
              }.`,
            notificationType:
              "interview_rejected",
            priority: "normal",
            createdAt:
              request.updated_at ||
              request.created_at ||
              new Date().toISOString(),
            actionLabel: "Find Recruiters",
            actionPath:
              "/student/find-recruiters",
            metadata: {
              request_id: requestId,
              interview_request_id: requestId,
              status,
              ...request,
            },
          });
      }

      if (
        notification &&
        !deletedIds.includes(notification.id)
      ) {
        notifications.push(notification);
      }
    }

    if (recruiterCanSee) {
      const recruiterNotificationId =
        `req_rec_notif_${requestId}`;

      if (
        !deletedIds.includes(
          recruiterNotificationId
        )
      ) {
        const canJoin =
          isInterviewScheduled(request);

        const notification = {
          id: recruiterNotificationId,
          title:
            status === "pending"
              ? "New Candidate Interview Request"
              : canJoin
              ? "Interview Session Scheduled"
              : `Interview Request (${status})`,
          message:
            canJoin
              ? `${studentName}'s interview is scheduled for ${request.meeting_date} at ${request.meeting_time}.`
              : `${studentName} requested a ${interviewType} interview. ${dateText}.`,
          category: status.includes(
            "reschedule"
          )
            ? "reschedule"
            : "interview",
          notification_type:
            canJoin
              ? "interview_scheduled"
              : status === "pending"
              ? "interview_request"
              : `interview_${status}`,
          priority:
            status === "pending" || canJoin
              ? "high"
              : "normal",
          created_at:
            request.updated_at ||
            request.created_at ||
            new Date().toISOString(),
          action_label: canJoin
            ? "Join Meeting"
            : "View Request",
          action_path: canJoin
            ? getInterviewPath(requestId)
            : "/recruiter/notifications",
          action: canJoin
            ? "join_interview"
            : "view_request",
          action_url: canJoin
            ? getInterviewPath(requestId)
            : "/recruiter/notifications",
          metadata: {
            request_id: requestId,
            interview_request_id: requestId,
            student_id: studentId,
            student_name: studentName,
            status,
            meeting_date:
              request.meeting_date,
            meeting_time:
              request.meeting_time,
            meeting_id:
              request.meeting_id,
            meeting_link:
              request.meeting_link,
            ...request,
          },
          is_read:
            getStoredReadIds().includes(
              recruiterNotificationId
            ) ||
            isAllMarkedRead(
              request.updated_at ||
                request.created_at
            ),
        };

        notification.read =
          notification.is_read;

        notifications.push(notification);
      }
    }
  });

  return notifications;
};

const notificationService = {
  async getNotifications(
    overrideRole = null
  ) {
    const deletedIds =
      getStoredDeletedIds();

    const readIds =
      getStoredReadIds();

    const user =
      await getCurrentUser();

    if (!user) {
      return [];
    }

    const userId = user.id;

    const role =
      overrideRole ||
      user.user_metadata?.role ||
      tokenStorage?.user?.role ||
      "student";

    const {
      data: notificationRows,
      error: notificationError,
    } = await supabase
      .from("notifications")
      .select("*")
      .or(
        `user_id.eq.${userId},recipient_id.eq.${userId}`
      )
      .order("created_at", {
        ascending: false,
      });

    if (notificationError) {
      console.error(
        "Failed to fetch notifications:",
        notificationError
      );

      throw notificationError;
    }

    const databaseNotifications =
      (notificationRows || [])
        .filter(
          (notification) =>
            !deletedIds.includes(
              notification.id
            )
        )
        .map((notification) => {
          const isRead =
            Boolean(notification.is_read) ||
            Boolean(notification.read) ||
            readIds.includes(notification.id) ||
            isAllMarkedRead(
              notification.created_at
            );

          return {
            ...notification,
            is_read: isRead,
            read: isRead,
          };
        });

    let requestQuery = supabase
      .from("interview_requests")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (role === "recruiter") {
      requestQuery = requestQuery.eq(
        "recruiter_user_id",
        userId
      );
    } else {
      requestQuery = requestQuery.eq(
        "student_id",
        userId
      );
    }

    const {
      data: requestRows,
      error: requestError,
    } = await requestQuery;

    if (requestError) {
      console.warn(
        "Interview request notification query failed:",
        requestError
      );
    }

    const generatedNotifications =
      buildNotificationsFromInterviewRequests(
        requestRows || [],
        userId,
        role
      );

    const uniqueNotifications =
      new Map();

    [
      ...databaseNotifications,
      ...generatedNotifications,
    ].forEach((notification) => {
      if (
        notification &&
        !deletedIds.includes(notification.id)
      ) {
        uniqueNotifications.set(
          notification.id,
          notification
        );
      }
    });

    return Array.from(
      uniqueNotifications.values()
    ).sort((a, b) => {
      const first = new Date(
        a.created_at || 0
      ).getTime();

      const second = new Date(
        b.created_at || 0
      ).getTime();

      return second - first;
    });
  },

  async createNotification({
    user_id,
    recipient_id,
    actor_id = null,
    interview_id = null,
    recipient_role = "student",
    title,
    message,
    category = "system",
    notification_type = "system",
    priority = "normal",
    action_label = null,
    action_path = null,
    action = null,
    action_url = null,
    metadata = {},
    is_read = false,
  }) {
    const targetUserId =
      recipient_id || user_id;

    if (!targetUserId) {
      throw new Error(
        "Notification recipient ID is required."
      );
    }

    if (!title) {
      throw new Error(
        "Notification title is required."
      );
    }

    if (!message) {
      throw new Error(
        "Notification message is required."
      );
    }

    const cleanPayload = {
      user_id: targetUserId,
      title,
      message,
      notification_type: notification_type || category || "system",
      is_read: Boolean(is_read),
      action_url: action_url || action_path || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const {
        data,
        error,
      } = await supabase
        .from("notifications")
        .insert(cleanPayload)
        .select("*")
        .maybeSingle();

      if (error) {
        console.warn(
          "Notification insert warning (RLS or schema limitation):",
          error
        );

        return {
          id: `local_${Date.now()}`,
          ...cleanPayload,
        };
      }

      return data || { id: `local_${Date.now()}`, ...cleanPayload };
    } catch (err) {
      console.warn("Notification insert error caught:", err);
      return {
        id: `local_${Date.now()}`,
        ...cleanPayload,
      };
    }
  },

  async markAsRead(id) {
    if (!id) {
      return false;
    }

    addStoredReadId(id);

    if (
      isSupabaseConfigured() &&
      !isGeneratedRequestNotification(id)
    ) {
      const userId =
        await getCurrentUserId();

      if (!userId) {
        return false;
      }

      const {
        error,
      } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .or(
          `user_id.eq.${userId},recipient_id.eq.${userId}`
        );

      if (error) {
        throw error;
      }
    }

    return true;
  },

  async markAllAsRead() {
    setAllMarkedRead();

    const userId =
      await getCurrentUserId();

    if (!userId) {
      return false;
    }

    const {
      error,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .or(
        `user_id.eq.${userId},recipient_id.eq.${userId}`
      )
      .eq("is_read", false);

    if (error) {
      throw error;
    }

    return true;
  },

  async deleteNotification(id) {
    if (!id) {
      return false;
    }

    addStoredDeletedId(id);

    if (
      isSupabaseConfigured() &&
      !isGeneratedRequestNotification(id)
    ) {
      const userId =
        await getCurrentUserId();

      if (!userId) {
        return false;
      }

      const {
        error,
      } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .or(
          `user_id.eq.${userId},recipient_id.eq.${userId}`
        );

      if (error) {
        throw error;
      }
    }

    return true;
  },

  async clearAllNotifications() {
    setAllMarkedRead();

    const userId =
      await getCurrentUserId();

    if (!userId) {
      return false;
    }

    const {
      error,
    } = await supabase
      .from("notifications")
      .delete()
      .or(
        `user_id.eq.${userId},recipient_id.eq.${userId}`
      );

    if (error) {
      throw error;
    }

    return true;
  },

  async getUnreadCount(role = null) {
    const notifications =
      await this.getNotifications(role);

    return notifications.filter(
      (notification) =>
        !notification.is_read &&
        !notification.read
    ).length;
  },

  async triggerBackendEmail(payload) {
    const backendBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8000";

    const endpoint =
      `${backendBaseUrl}/api/v1/notifications/dispatch`;

    const accessToken =
      localStorage.getItem(
        "st_access_token"
      ) || "";

    const requestBody = {
      event_type:
        payload.event_type ||
        payload.event ||
        "system",

      recipient_id:
        payload.recipient_id ||
        payload.user_id,

      recipient_email:
        payload.recipient_email ||
        payload.to_email ||
        "",

      recipient_name:
        payload.recipient_name ||
        payload.name ||
        "User",

      title:
        payload.title ||
        "SkillTrack AI Notification",

      message:
        payload.message ||
        "You have a new notification.",

      sender_id:
        payload.sender_id || null,

      sender_role:
        payload.sender_role || "system",

      receiver_role:
        payload.receiver_role || "student",

      action_url:
        payload.action_url ||
        payload.action_path ||
        "",

      action_text:
        payload.action_text ||
        payload.action_label ||
        "",

      metadata:
        payload.metadata || {},

      send_smtp: true,
    };

    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",

          ...(accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {}),
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseText =
      await response.text();

    let responseData = {};

    try {
      responseData = responseText
        ? JSON.parse(responseText)
        : {};
    } catch {
      responseData = {
        message: responseText,
      };
    }

    if (!response.ok) {
      throw new Error(
        responseData.detail ||
          responseData.message ||
          "Backend email dispatch failed."
      );
    }

    return responseData;
  },

  async dispatchEvent({
    event_type,
    recipient_id,
    recipient_email = "",
    recipient_name = "User",
    sender_id = null,
    sender_role = "system",
    receiver_role = "student",
    recipient_role = null,
    title,
    message,
    category = "interview",
    priority = "normal",
    action_label = null,
    action_path = null,
    action_url = null,
    action_text = null,
    action = null,
    interview_id = null,
    metadata = {},
  }) {
    if (!recipient_id) {
      throw new Error(
        `Missing recipient_id for event: ${event_type}`
      );
    }

    const finalActionLabel =
      action_label || action_text || null;

    const finalActionPath =
      action_path || action_url || null;

    const finalRecipientRole =
      recipient_role ||
      receiver_role ||
      "student";

    const notification =
      await this.createNotification({
        user_id: recipient_id,
        recipient_id,
        actor_id: sender_id,
        interview_id,
        recipient_role:
          finalRecipientRole,
        title,
        message,
        category,
        notification_type: event_type,
        priority,
        action_label:
          finalActionLabel,
        action_path:
          finalActionPath,
        action,
        action_url:
          finalActionPath,
        metadata,
        is_read: false,
      });

    if (recipient_email) {
      try {
        await this.triggerBackendEmail({
          event_type,
          recipient_id,
          recipient_email,
          recipient_name,
          sender_id,
          sender_role,
          receiver_role:
            finalRecipientRole,
          title,
          message,
          action_path:
            finalActionPath,
          action_label:
            finalActionLabel,
          metadata,
        });
      } catch (emailError) {
        console.warn(
          "In-app notification created, but email failed:",
          emailError
        );
      }
    }

    return notification;
  },
};

export {
  buildNotificationsFromInterviewRequests,
};

export default notificationService;