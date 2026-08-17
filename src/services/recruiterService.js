import { supabase } from "./supabaseClient";
import notificationService from "./notificationService";

const safeString = (value, fallback = "") => {
  return value === null || value === undefined
    ? fallback
    : String(value);
};

const safeText = (value) => {
  return value === null || value === undefined
    ? ""
    : String(value);
};

const getAvatarUrl = (
  name = "Recruiter",
  avatarUrl = ""
) => {
  if (avatarUrl) {
    return avatarUrl;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=4f46e5&color=fff&size=128`;
};

const getAuthenticatedUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user || null;
};

const getRequiredAuthenticatedUser = async (
  role = "User"
) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error(
      `${role} is not authenticated.`
    );
  }

  return user;
};

const getRecruiterContact = async (
  recruiterUserId
) => {
  if (!recruiterUserId) {
    return {
      email: "",
      name: "Recruiter",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("recruiter_profiles")
    .select("email, full_name")
    .eq("user_id", recruiterUserId)
    .maybeSingle();

  if (error) {
    console.warn(
      "Recruiter contact lookup failed:",
      error
    );

    return {
      email: "",
      name: "Recruiter",
    };
  }

  return {
    email: data?.email || "",
    name: data?.full_name || "Recruiter",
  };
};

const getStudentContact = async (
  studentUserId
) => {
  if (!studentUserId) {
    return {
      email: "",
      name: "Candidate",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select("email, full_name, name")
    .eq("id", studentUserId)
    .maybeSingle();

  if (error || !data) {
    const { data: candidateData } = await supabase
      .from("candidate_profiles")
      .select("email, full_name")
      .eq("user_id", studentUserId)
      .maybeSingle();

    return {
      email: candidateData?.email || "",
      name: candidateData?.full_name || "Candidate",
    };
  }

  return {
    email: data?.email || "",
    name: data?.full_name || data?.name || "Candidate",
  };
};

const sendNotificationSafely = async (
  payload
) => {
  try {
    return await notificationService.dispatchEvent(
      payload
    );
  } catch (notificationError) {
    console.error(
      "Notification failed:",
      notificationError
    );

    return null;
  }
};

// -----------------------------------------------------------------------------
// Recruiter profile mapping
// -----------------------------------------------------------------------------

const RECRUITER_PROFILE_COLUMNS = `
  id,
  user_id,
  full_name,
  email,
  phone,
  designation,
  avatar_url,
  company_name,
  company_logo,
  company_website,
  industry,
  company_size,
  location,
  experience_years,
  specialization,
  bio,
  verification_status,
  tax_id,
  registration_doc_url,
  verified_at,
  created_at,
  updated_at,
  availability
`;

const mapRecruiterRow = (row = {}) => {
  const name = row.full_name || "Recruiter";

  const experienceYears = Number(
    row.experience_years || 0
  );

  const techStack = [
    row.specialization,
    row.industry,
    row.designation,
  ].filter(Boolean);

  const isVerified =
    String(
      row.verification_status || ""
    ).toLowerCase() === "verified";

  return {
    id: row.id,
    user_id: row.user_id,

    full_name: row.full_name || "",
    name,

    email: row.email || "",
    phone: row.phone || "",

    designation:
      row.designation ||
      "Talent Acquisition Manager",

    avatar_url: row.avatar_url || "",
    avatar: getAvatarUrl(name, row.avatar_url),

    company_name: row.company_name || "",
    company: row.company_name || "",

    company_logo: row.company_logo || "",
    companyLogo: row.company_logo || "",

    company_website:
      row.company_website || "",
    website: row.company_website || "",

    industry: row.industry || "",
    company_size: row.company_size || "",
    location: row.location || "Remote",

    experience_years: experienceYears,
    experience: `${experienceYears} ${
      experienceYears === 1 ? "Year" : "Years"
    }`,

    specialization:
      row.specialization || "",
    bio: row.bio || "",

    techStack: [...new Set(techStack)],

    verification_status:
      row.verification_status || "Pending",

    isVerified,

    tax_id: row.tax_id || "",
    registration_doc_url:
      row.registration_doc_url || "",

    verified_at: row.verified_at || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,

    availability: safeText(
      row.availability
    ),

    rating: 0,
    reviewsCount: 0,
    completedInterviews: 0,
    hourlyFee: 0,
    isAvailable: true,

    interviewTypes: [
      "Technical Deep Dive",
      "System Design",
      "Behavioral",
    ],
  };
};

// -----------------------------------------------------------------------------
// Candidate profile mapping
// -----------------------------------------------------------------------------

const mapCandidateRow = (candidate = {}) => {
  const candidateName =
    candidate.full_name ||
    candidate.name ||
    "Student";

  const experienceYears = Number(
    candidate.experience_years || 0
  );

  return {
    id: candidate.id,

    user_id:
      candidate.user_id ||
      candidate.student_id ||
      candidate.id,

    request_id:
      candidate.request_id ||
      candidate.id,

    name: candidateName,

    role:
      candidate.role ||
      candidate.current_role ||
      "Candidate",

    exp: experienceYears
      ? `${experienceYears} Years`
      : candidate.exp || "N/A",

    loc:
      candidate.location ||
      candidate.loc ||
      "Remote",

    email: candidate.email || "",
    phone: candidate.phone || "",

    ats: Number(
      candidate.ats_score ||
        candidate.ats ||
        85
    ),

    fit: candidate.fit || "Suitable",

    interview_status:
      candidate.interview_status ||
      candidate.status ||
      "pending",

    applied_date:
      candidate.applied_date ||
      candidate.created_at ||
      "",

    bio: candidate.bio || "",

    skills: Array.isArray(candidate.skills)
      ? candidate.skills
      : typeof candidate.skills === "string"
      ? candidate.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [],

    img:
      candidate.avatar_url ||
      candidate.img ||
      getAvatarUrl(candidateName),

    resume_url:
      candidate.resume_url ||
      candidate.resume_link ||
      candidate.cv_url ||
      "",

    github_url: candidate.github_url || "",
    linkedin_url:
      candidate.linkedin_url || "",
    portfolio_url:
      candidate.portfolio_url || "",

    education:
      candidate.education ||
      "B.Tech Computer Science",

    experience:
      candidate.experience ||
      "2+ Years Software Engineering",

    certifications:
      candidate.certifications ||
      "AWS Certified Developer",

    projects:
      candidate.projects ||
      "Full Stack React & FastAPI Platform",
  };
};

// -----------------------------------------------------------------------------
// Recruiter profile methods
// -----------------------------------------------------------------------------

const getProfile = async () => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("recruiter_profiles")
    .select(RECRUITER_PROFILE_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapRecruiterRow(data) : null;
};

const getAvailability = async () => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return "";
  }

  const {
    data,
    error,
  } = await supabase
    .from("recruiter_profiles")
    .select("availability")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return safeText(data?.availability);
};

const createRecruiterProfilePayload = (
  profile = {},
  user
) => {
  return {
    user_id: user.id,

    full_name: safeString(
      profile.full_name
    ),

    email: safeString(
      profile.email || user.email
    ),

    phone: safeString(profile.phone),

    designation: safeString(
      profile.designation,
      "Talent Acquisition Manager"
    ),

    avatar_url: safeString(
      profile.avatar_url
    ),

    company_name: safeString(
      profile.company_name
    ),

    company_logo: safeString(
      profile.company_logo
    ),

    company_website: safeString(
      profile.company_website
    ),

    industry: safeString(profile.industry),
    company_size: safeString(
      profile.company_size
    ),
    location: safeString(profile.location),

    experience_years: Number(
      profile.experience_years || 0
    ),

    specialization: safeString(
      profile.specialization
    ),

    bio: safeString(profile.bio),

    verification_status: safeString(
      profile.verification_status,
      "Pending"
    ),

    tax_id: safeString(profile.tax_id),

    availability: safeText(
      profile.availability
    ),

    updated_at: new Date().toISOString(),
  };
};

const updateProfile = async (profile = {}) => {
  const user =
    await getRequiredAuthenticatedUser(
      "Recruiter"
    );

  const payload =
    createRecruiterProfilePayload(
      profile,
      user
    );

  const {
    data,
    error,
  } = await supabase
    .from("recruiter_profiles")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select(RECRUITER_PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data ? mapRecruiterRow(data) : null;
};

const saveRecruiterProfile = async (
  profile = {}
) => {
  return updateProfile(profile);
};

const getAllRecruiterProfiles = async () => {
  const {
    data,
    error,
  } = await supabase
    .from("recruiter_profiles")
    .select(RECRUITER_PROFILE_COLUMNS)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapRecruiterRow);
};

// -----------------------------------------------------------------------------
// Student sends interview request
// -----------------------------------------------------------------------------

const bookInterview = async ({
  recruiter_id,
  recruiter_user_id,
  recruiter_email = "",
  recruiter_name = "Recruiter",

  student_id,
  student_name = "Candidate",
  student_email = "",

  interview_type,
  message = "",
}) => {
  if (!recruiter_id) {
    throw new Error(
      "Recruiter ID is required."
    );
  }

  if (!recruiter_user_id) {
    throw new Error(
      "Recruiter user ID is required."
    );
  }

  if (!student_id) {
    throw new Error(
      "Student ID is required."
    );
  }

  if (!interview_type) {
    throw new Error(
      "Interview type is required."
    );
  }

  let finalRecruiterEmail =
    recruiter_email;

  let finalRecruiterName =
    recruiter_name;

  if (!finalRecruiterEmail) {
    const recruiterContact =
      await getRecruiterContact(
        recruiter_user_id
      );

    finalRecruiterEmail =
      recruiterContact.email;

    finalRecruiterName =
      recruiterContact.name ||
      finalRecruiterName;
  }

  const requestPayload = {
    recruiter_id: String(recruiter_id),
    recruiter_user_id: String(
      recruiter_user_id
    ),
    student_id: String(student_id),
    interview_type,
    message,
    status: "pending",
    updated_at: new Date().toISOString(),
  };

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("interview_requests")
    .insert(requestPayload)
    .select("*")
    .single();

  if (requestError) {
    console.error(
      "Interview request insert failed:",
      requestError
    );

    throw requestError;
  }

  await sendNotificationSafely({
    user_id: recruiter_user_id,
    recipient_id: recruiter_user_id,
    actor_id: student_id,
    interview_id: request.id,

    notification_type:
      "interview_request",

    recipient_role: "recruiter",

    title: "New Interview Request Received",

    message: `${student_name} requested a ${interview_type} interview. Please choose a suitable date and time.`,

    category: "interview",
    priority: "high",
    is_read: false,

    action_label: "Schedule Interview",
    action_path: "/recruiter/candidates",
    action: "schedule_interview",
    action_url: "/recruiter/candidates",

    metadata: {
      request_id: request.id,
      interview_request_id: request.id,

      recruiter_id,
      recruiter_user_id,
      recruiter_name: finalRecruiterName,

      student_id,
      student_name,
      student_email,

      interview_type,
      message,

      scheduling_required: true,
    },
  });

  return request;
};

// -----------------------------------------------------------------------------
// Recruiter interview requests
// -----------------------------------------------------------------------------

const getInterviewRequestsForRecruiter = async () => {
  const user =
    await getRequiredAuthenticatedUser("Recruiter");

  const {
    data,
    error,
  } = await supabase
    .from("interview_requests")
    .select("*")
    .eq("recruiter_user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const requests = data || [];

  const studentIds = [
    ...new Set(
      requests
        .map((request) => request.student_id)
        .filter(Boolean)
    ),
  ];

  const candidateMap = {};

  if (studentIds.length > 0) {
    const {
      data: candidateProfiles,
      error: candidateProfilesError,
    } = await supabase
      .from("candidate_profiles")
      .select("*")
      .in("id", studentIds);

    if (candidateProfilesError) {
      console.warn(
        "Candidate profile lookup failed:",
        candidateProfilesError
      );
    }

    (candidateProfiles || []).forEach(
      (candidate) => {
        if (candidate.id) {
          candidateMap[candidate.id] = {
            ...(candidateMap[candidate.id] || {}),
            ...candidate,
          };
        }

        if (candidate.user_id) {
          candidateMap[candidate.user_id] = {
            ...(candidateMap[candidate.user_id] || {}),
            ...candidate,
          };
        }
      }
    );
  }

  return requests.map((request) => {
    const candidate =
      candidateMap[request.student_id] || {};

    const candidateName =
      request.candidate_name ||
      request.student_name ||
      candidate.username ||
      candidate.full_name ||
      candidate.name ||
      "Student Candidate";

    const avatar =
      request.candidate_avatar ||
      candidate.avatar_url ||
      candidate.avatar ||
      candidate.img ||
      getAvatarUrl(candidateName);

    const resume =
      request.resume_url ||
      request.resume_file_url ||
      candidate.resume_file_url ||
      candidate.resume_url ||
      candidate.resume_link ||
      candidate.cv_url ||
      "";

    const candidateEmail =
      request.student_email ||
      request.candidate_email ||
      request.email ||
      candidate.email ||
      "";

    return {
      ...request,

      request_id: request.id,
      interview_request_id: request.id,

      candidate_name: candidateName,
      name: candidateName,

      candidate_avatar: avatar,
      img: avatar,

      ats_score:
        candidate.ats_score ||
        request.ats_score ||
        88,

      resume_url: resume,
      resume_file_url: resume,

      email: candidateEmail,

      phone:
        candidate.phone ||
        request.phone ||
        "",

      role:
        candidate.current_role ||
        candidate.role ||
        request.interview_type ||
        "Candidate",

      exp: candidate.experience_years
        ? `${candidate.experience_years} Years`
        : candidate.exp || "N/A",

      loc:
        candidate.location ||
        candidate.loc ||
        "Remote",

      skills:
        candidate.skills ||
        request.skills ||
        [],
    };
  });
};

const getInterviewRequestsForStudent =
  async () => {
    const user =
      await getRequiredAuthenticatedUser(
        "Student"
      );

    const {
      data,
      error,
    } = await supabase
      .from("interview_requests")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data || [];
  };



const getInterviews = async () => {
  return getInterviewRequestsForRecruiter();
};

// -----------------------------------------------------------------------------
// Update request status
// -----------------------------------------------------------------------------

const updateInterviewRequestStatus = async (
  requestId,
  status,
  extra = {}
) => {
  if (!requestId) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!status) {
    throw new Error(
      "Interview status is required."
    );
  }

  const payload = {
    status,
    updated_at: new Date().toISOString(),
    ...extra,
  };

  const {
    data,
    error,
  } = await supabase
    .from("interview_requests")
    .update(payload)
    .eq("id", requestId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// -----------------------------------------------------------------------------
// Recruiter accepts and schedules interview
// -----------------------------------------------------------------------------

const acceptInterviewRequest = async (
  requestId,
  candidateUserId,
  recruiterName = "Recruiter",
  candidateEmail = ""
) => {
  const recruiter =
    await getRequiredAuthenticatedUser(
      "Recruiter"
    );

  if (!requestId) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!candidateUserId) {
    throw new Error(
      "Candidate user ID is required."
    );
  }

  const {
    data: updated,
    error,
  } = await supabase
    .from("interview_requests")
    .update({
      status: "accepted",

      // Do not assign a meeting until the
      // recruiter uses Schedule Session.
      meeting_date: null,
      meeting_time: null,
      meeting_id: null,
      meeting_link: null,

      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("recruiter_user_id", recruiter.id)
    .eq("student_id", candidateUserId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  let finalCandidateEmail =
    candidateEmail;

  let finalCandidateName = "Candidate";

  if (!finalCandidateEmail) {
    const studentContact =
      await getStudentContact(
        candidateUserId
      );

    finalCandidateEmail =
      studentContact.email;

    finalCandidateName =
      studentContact.name ||
      finalCandidateName;
  }

  await sendNotificationSafely({
    user_id: candidateUserId,
    recipient_id: candidateUserId,
    actor_id: recruiter.id,
    interview_id: updated.id,

    notification_type:
      "interview_accepted",

    recipient_role: "student",

    title: "Interview Request Accepted",

    message: `Recruiter ${recruiterName} accepted your interview request. The recruiter will assign the final date and time.`,

    category: "interview",
    priority: "high",
    is_read: false,

    action_label: "View Interview",
    action_path:
      `/interviews/session/${updated.id}`,

    action: "view_interview",
    action_url:
      `/interviews/session/${updated.id}`,

    metadata: {
      request_id: updated.id,
      interview_request_id: updated.id,

      recruiter_id: recruiter.id,
      recruiter_name: recruiterName,

      student_id: candidateUserId,
      candidate_name: finalCandidateName,
      candidate_email: finalCandidateEmail,

      meeting_date: null,
      meeting_time: null,
      meeting_id: null,
      meeting_link: null,

      scheduling_required: true,
    },
  });

  return updated;
};

const assignInterviewSlot = async ({
  requestId,
  candidateUserId,
  meetingDate,
  meetingTime,
  startTime,
  endTime,
  meetingLink: customLink,
}) => {
  const recruiter =
    await getRequiredAuthenticatedUser(
      "Recruiter"
    );

  if (!requestId) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!candidateUserId) {
    throw new Error(
      "Candidate user ID is required."
    );
  }

  const finalStartTime = startTime || meetingTime;

  if (!meetingDate || !finalStartTime) {
    throw new Error(
      "Meeting date and start time are required."
    );
  }

  const roomName = `interview_${requestId}`;

  const defaultLink =
    `/interviews/session/${requestId}`;

  const finalMeetingLink =
    customLink && customLink.trim()
      ? customLink.trim()
      : defaultLink;

  let payloadToUpdate = {
    status: "accepted",
    meeting_date: meetingDate,
    meeting_time: finalStartTime,
    start_time: finalStartTime,
    end_time: endTime || null,
    duration: endTime ? `${finalStartTime} - ${endTime}` : "60 mins",
    meeting_id: roomName,
    meeting_link: finalMeetingLink,
    reschedule_status: "scheduled",
    updated_at: new Date().toISOString(),
  };

  let updated = null;
  let attempts = 0;

  while (attempts < 8 && !updated) {
    attempts++;
    const res = await supabase
      .from("interview_requests")
      .update(payloadToUpdate)
      .eq("id", requestId)
      .select("*")
      .maybeSingle();

    if (res.data && !res.error) {
      updated = res.data;
      break;
    }

    if (res.error) {
      const errMsg = res.error.message || "";
      const match = errMsg.match(/Could not find the '([^']+)' column/i);

      if (match && match[1] && payloadToUpdate[match[1]] !== undefined) {
        console.warn(`Column '${match[1]}' missing in table, stripping and retrying...`);
        delete payloadToUpdate[match[1]];
      } else if (payloadToUpdate.duration !== undefined) {
        delete payloadToUpdate.duration;
      } else if (payloadToUpdate.start_time !== undefined || payloadToUpdate.end_time !== undefined) {
        delete payloadToUpdate.start_time;
        delete payloadToUpdate.end_time;
      } else if (payloadToUpdate.reschedule_status !== undefined) {
        delete payloadToUpdate.reschedule_status;
      } else if (payloadToUpdate.meeting_id !== undefined || payloadToUpdate.meeting_link !== undefined) {
        delete payloadToUpdate.meeting_id;
        delete payloadToUpdate.meeting_link;
      } else {
        // Fallback to basic update
        const minimalRes = await supabase
          .from("interview_requests")
          .update({
            status: "accepted",
            meeting_date: meetingDate,
            meeting_time: finalStartTime,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select("*")
          .maybeSingle();

        if (minimalRes.data) {
          updated = minimalRes.data;
        } else {
          console.warn("Minimal update failed:", minimalRes.error?.message);
        }
        break;
      }
    }
  }

  if (!updated) {
    updated = {
      id: requestId,
      recruiter_user_id: recruiter.id,
      student_id: candidateUserId,
      status: "accepted",
      meeting_date: meetingDate,
      meeting_time: finalStartTime,
      start_time: finalStartTime,
      end_time: endTime || null,
      meeting_id: roomName,
      meeting_link: finalMeetingLink,
    };
  }

  const studentContact =
    await getStudentContact(
      candidateUserId
    );

  const recruiterContact =
    await getRecruiterContact(
      recruiter.id
    );

  const timeDisplay = endTime
    ? `${finalStartTime} - ${endTime}`
    : finalStartTime;

  const studentMessage =
    `Your interview is scheduled for ${meetingDate} from ${timeDisplay}.`;

  const recruiterMessage =
    `Your interview session is scheduled for ${meetingDate} from ${timeDisplay}.`;

  await sendNotificationSafely({
    user_id: candidateUserId,
    recipient_id: candidateUserId,
    actor_id: recruiter.id,
    interview_id: updated.id,

    notification_type:
      "interview_scheduled",

    recipient_role: "student",

    title: "Interview Session Scheduled",
    message: studentMessage,

    category: "interview",
    priority: "high",
    is_read: false,

    action_label: "Join Meeting",
    action_path:
      `/interviews/session/${updated.id}`,

    action: "join_interview",
    action_url:
      `/interviews/session/${updated.id}`,

    recipient_email: studentContact.email,
    recipient_name: studentContact.name,

    metadata: {
      request_id: updated.id,
      interview_request_id: updated.id,
      meeting_date: meetingDate,
      meeting_time: finalStartTime,
      start_time: finalStartTime,
      end_time: endTime || null,
      meeting_id: roomName,
      meeting_link: finalMeetingLink,
    },
  });

  await sendNotificationSafely({
    user_id: recruiter.id,
    recipient_id: recruiter.id,
    actor_id: recruiter.id,
    interview_id: updated.id,

    notification_type:
      "interview_scheduled",

    recipient_role: "recruiter",

    title: "Interview Session Assigned",
    message: recruiterMessage,

    category: "interview",
    priority: "high",
    is_read: false,

    action_label: "Join Meeting",
    action_path:
      `/interviews/session/${updated.id}`,

    action: "join_interview",
    action_url:
      `/interviews/session/${updated.id}`,

    recipient_email: recruiterContact.email,
    recipient_name: recruiterContact.name,

    metadata: {
      request_id: updated.id,
      interview_request_id: updated.id,
      meeting_date: meetingDate,
      meeting_time: finalStartTime,
      start_time: finalStartTime,
      end_time: endTime || null,
      meeting_id: roomName,
      meeting_link: finalMeetingLink,
    },
  });

  return updated;
};

// -----------------------------------------------------------------------------
// Recruiter rejects or requests reschedule
// -----------------------------------------------------------------------------

const rejectOrRescheduleRequest = async (
  requestId,
  candidateUserId,
  payload = {}
) => {
  const recruiter =
    await getRequiredAuthenticatedUser(
      "Recruiter"
    );

  if (!requestId) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!candidateUserId) {
    throw new Error(
      "Candidate user ID is required."
    );
  }

  const isReschedule =
    payload.action === "reschedule";

  const actionStatus = isReschedule
    ? "reschedule_requested"
    : "rejected";

  const recruiterName =
    payload.recruiterName || "Recruiter";

  const extra = isReschedule
    ? {
        reschedule_datetime:
          payload.newDate &&
          payload.newTime
            ? new Date(
                `${payload.newDate}T${payload.newTime}:00`
              ).toISOString()
            : null,

        reschedule_reason:
          payload.rejectReason || "",

        reschedule_status:
          "requested",
      }
    : {
        reject_reason:
          payload.rejectReason || "",
      };

  const {
    data: updated,
    error: updateError,
  } = await supabase
    .from("interview_requests")
    .update({
      status: actionStatus,
      ...extra,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("recruiter_user_id", recruiter.id)
    .eq("student_id", candidateUserId)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  let candidateEmail =
    payload.candidateEmail || "";

  let candidateName = "Candidate";

  if (!candidateEmail) {
    const studentContact =
      await getStudentContact(
        candidateUserId
      );

    candidateEmail =
      studentContact.email;

    candidateName =
      studentContact.name || candidateName;
  }

  if (isReschedule) {
    await sendNotificationSafely({
      user_id: candidateUserId,
      recipient_id: candidateUserId,
      actor_id: recruiter.id,
      interview_id: updated.id,

      notification_type:
        "reschedule_request",

      recipient_role: "student",

      title: "Recruiter Requested Reschedule",

      message: `${recruiterName} requested to reschedule your interview. New proposed time: ${
        payload.newDate ||
        "Not specified"
      } ${
        payload.newTime || ""
      }. Reason: ${
        payload.rejectReason ||
        "Schedule adjustment"
      }.`,

      category: "reschedule",
      priority: "high",
      is_read: false,

      action_label: "Respond to Reschedule",
      action_path: "/student/notifications",
      action:
        "respond_to_reschedule",
      action_url: "/student/notifications",

      metadata: {
        request_id: updated.id,
        interview_request_id: updated.id,

        recruiter_user_id: recruiter.id,
        recruiter_id: recruiter.id,
        recruiter_name: recruiterName,

        student_id: candidateUserId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,

        new_date:
          payload.newDate || null,
        new_time:
          payload.newTime || null,
        reason:
          payload.rejectReason || "",
      },
    });
  } else {
    await sendNotificationSafely({
      user_id: candidateUserId,
      recipient_id: candidateUserId,
      actor_id: recruiter.id,
      interview_id: updated.id,

      notification_type:
        "interview_rejected",

      recipient_role: "student",

      title: "Interview Request Declined",

      message: `${recruiterName} declined your interview request. Reason: ${
        payload.rejectReason ||
        "Slot unavailable"
      }.`,

      category: "interview",
      priority: "high",
      is_read: false,

      action_label:
        "Search Another Recruiter",
      action_path:
        "/student/find-recruiters",
      action:
        "view_recruiters",
      action_url:
        "/student/find-recruiters",

      metadata: {
        request_id: updated.id,
        interview_request_id: updated.id,

        recruiter_id: recruiter.id,
        recruiter_user_id: recruiter.id,
        recruiter_name: recruiterName,

        student_id: candidateUserId,
        reason:
          payload.rejectReason || "",
      },
    });
  }

  return updated;
};

// -----------------------------------------------------------------------------
// Student responds to reschedule
// -----------------------------------------------------------------------------

const respondToReschedule = async ({
  requestId,
  recruiterUserId,
  candidateAccepts,
  recruiterName = "Recruiter",
}) => {
  const student =
    await getRequiredAuthenticatedUser(
      "Student"
    );

  if (!requestId) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!recruiterUserId) {
    throw new Error(
      "Recruiter user ID is required."
    );
  }

  const nextStatus = candidateAccepts
    ? "reschedule_accepted"
    : "rejected";

  const nextRescheduleStatus =
    candidateAccepts
      ? "accepted"
      : "declined";

  const {
    data: request,
    error: updateError,
  } = await supabase
    .from("interview_requests")
    .update({
      status: nextStatus,
      reschedule_status:
        nextRescheduleStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("student_id", student.id)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  await sendNotificationSafely({
    user_id: recruiterUserId,
    recipient_id: recruiterUserId,
    actor_id: student.id,
    interview_id: request.id,

    notification_type: candidateAccepts
      ? "reschedule_accepted"
      : "reschedule_declined",

    recipient_role: "recruiter",

    category: "reschedule",

    action: candidateAccepts
      ? "reschedule_accepted"
      : "reschedule_declined",

    title: candidateAccepts
      ? "Candidate Accepted Reschedule"
      : "Candidate Declined Reschedule",

    message: candidateAccepts
      ? "The candidate accepted the proposed interview time."
      : "The candidate declined the proposed interview time.",

    priority: "high",
    is_read: false,

    action_label:
      "View Interview Requests",
    action_path:
      "/recruiter/candidates",
    action_url:
      "/recruiter/candidates",

    metadata: {
      request_id: request.id,
      interview_request_id: request.id,

      recruiter_user_id:
        recruiterUserId,
      student_id: student.id,
      recruiter_name: recruiterName,

      response: candidateAccepts
        ? "accepted"
        : "declined",
    },
  });

  return request;
};

// -----------------------------------------------------------------------------
// Feedback
// -----------------------------------------------------------------------------

const submitInterviewFeedback = async ({
  interview_request_id,
  student_id,
  recruiter_user_id,
  rating,
  comments,
  candidate_name = "Candidate",
}) => {
  const student =
    await getRequiredAuthenticatedUser(
      "Student"
    );

  if (!interview_request_id) {
    throw new Error(
      "Interview request ID is required."
    );
  }

  if (!recruiter_user_id) {
    throw new Error(
      "Recruiter user ID is required."
    );
  }

  const normalizedRating = Number(
    rating
  );

  if (
    Number.isNaN(normalizedRating) ||
    normalizedRating < 1 ||
    normalizedRating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5."
    );
  }

  const feedbackPayload = {
    interview_request_id,

    student_id:
      student_id || student.id,

    recruiter_user_id,

    overall_rating:
      normalizedRating,

    comments: comments || "",

    created_at:
      new Date().toISOString(),
  };

  const {
    data: feedbackData,
    error: feedbackError,
  } = await supabase
    .from("interview_feedback")
    .insert(feedbackPayload)
    .select("*")
    .single();

  if (feedbackError) {
    throw feedbackError;
  }

  const {
    data: completedRequest,
    error: completeError,
  } = await supabase
    .from("interview_requests")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", interview_request_id)
    .eq("student_id", student.id)
    .select("*")
    .single();

  if (completeError) {
    console.warn(
      "Feedback saved, but interview status update failed:",
      completeError
    );
  }

  await sendNotificationSafely({
    user_id: recruiter_user_id,
    recipient_id: recruiter_user_id,
    actor_id: student.id,
    interview_id: interview_request_id,

    notification_type:
      "feedback_received",

    recipient_role: "recruiter",

    category: "feedback",
    action: "view_feedback",

    title: "New Feedback Received",

    message: `${candidate_name} submitted a ${normalizedRating}/5 rating and feedback for your interview session.`,

    priority: "normal",
    is_read: false,

    action_label: "View Feedback",
    action_path:
      "/recruiter/dashboard",
    action_url:
      "/recruiter/dashboard",

    metadata: {
      request_id: interview_request_id,
      interview_request_id,

      student_id: student.id,
      recruiter_user_id,

      candidate_name,
      rating: normalizedRating,
      comments: comments || "",
    },
  });

  return {
    feedback: feedbackData,
    interviewRequest:
      completedRequest || null,
  };
};

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

const getDashboardOverview = async () => {
  const user =
    await getRequiredAuthenticatedUser(
      "Recruiter"
    );

  const [
    profileResult,
    requestsResult,
  ] = await Promise.all([
    supabase
      .from("recruiter_profiles")
      .select(RECRUITER_PROFILE_COLUMNS)
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("interview_requests")
      .select("*")
      .eq("recruiter_user_id", user.id)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (requestsResult.error) {
    throw requestsResult.error;
  }

  const profile = profileResult.data
    ? mapRecruiterRow(profileResult.data)
    : null;

  const requests =
    requestsResult.data || [];

  const scheduledRequests =
    requests.filter((request) => {
      return Boolean(
        request.meeting_date ||
          request.preferred_datetime
      );
    });

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const todayRequests =
    scheduledRequests.filter((request) => {
      const dateValue =
        request.meeting_date ||
        request.preferred_datetime;

      if (!dateValue) {
        return false;
      }

      return (
        new Date(dateValue)
          .toISOString()
          .slice(0, 10) === today
      );
    });

  return {
    profile,
    requests,

    metrics: {
      pending_requests: requests.filter(
        (request) =>
          request.status === "pending"
      ).length,

      todays_interviews:
        todayRequests.length,

      upcoming_interviews: requests.filter(
        (request) =>
          request.status === "pending" ||
          request.status === "accepted"
      ).length,

      completed_interviews: requests.filter(
        (request) =>
          request.status === "completed"
      ).length,

      active_jobs: 0,
      total_applicants: 0,
    },

    recent_applicants: [],

    today_schedule: todayRequests.map(
      (request) => ({
        id: request.id,

        time:
          request.meeting_time ||
          (request.preferred_datetime
            ? new Date(
                request.preferred_datetime
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"),

        status:
          request.status || "pending",

        name:
          request.candidate_name ||
          "Student",

        role:
          request.interview_type ||
          "Interview",

        img: getAvatarUrl(
          request.candidate_name ||
            "Student"
        ),
      })
    ),
  };
};

// -----------------------------------------------------------------------------
// Candidates and notifications
// -----------------------------------------------------------------------------

const getLiveCandidatesPool = async () => {
  const {
    data,
    error,
  } = await supabase
    .from("candidate_profiles")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(mapCandidateRow);
};

const getNotifications = async (role = "recruiter") => {
  return notificationService.getNotifications(role);
};

const getRevenueData = async () => {
  const user = await getAuthenticatedUser();
  const recruiterUserId = user?.id;

  let allRequests = [];
  let payouts = [];
  let earnings = null;

  if (recruiterUserId) {
    try {
      const [intRes, payRes, earnRes] = await Promise.all([
        supabase
          .from('interview_requests')
          .select('*')
          .eq('recruiter_user_id', recruiterUserId)
          .order('created_at', { ascending: false }),
        supabase
          .from('recruiter_payouts')
          .select('*')
          .eq('recruiter_id', recruiterUserId)
          .order('created_at', { ascending: false }),
        supabase
          .from('recruiter_earnings')
          .select('*')
          .eq('recruiter_id', recruiterUserId)
          .maybeSingle(),
      ]);

      if (!intRes.error && intRes.data) allRequests = intRes.data;
      if (!payRes.error && payRes.data) payouts = payRes.data;
      if (!earnRes.error && earnRes.data) earnings = earnRes.data;
    } catch (e) {
      console.warn('[RecruiterService] Revenue data Supabase query error:', e);
    }
  }

  const perInterviewRate = Number(earnings?.amount_per_interview || 500);

  const completedRequests = allRequests.filter((i) => (i.status || '').toLowerCase() === 'completed');
  const acceptedRequests = allRequests.filter((i) => (i.status || '').toLowerCase() === 'accepted');
  const pendingRequests = allRequests.filter((i) => (i.status || '').toLowerCase() === 'pending');

  const completedCount = completedRequests.length;
  const acceptedCount = acceptedRequests.length;

  const totalEarned = completedCount * perInterviewRate;
  const expectedPayout = (completedCount + acceptedCount) * perInterviewRate;

  let paidHistory = 0;
  let pendingPayouts = 0;

  payouts.forEach((p) => {
    const amt = Number(p.amount || 0);
    if ((p.payment_status || '').toLowerCase() === 'completed') {
      paidHistory += amt;
    } else {
      pendingPayouts += amt;
    }
  });

  // Calculate unpaid balance from completed interviews
  const unpaidBalance = Math.max(0, totalEarned - paidHistory - pendingPayouts);

  // Dynamic transactions built directly from Supabase interview_requests and recruiter_payouts
  const transactions = [];

  // Payout withdrawals
  payouts.forEach((p) => {
    transactions.push({
      id: `PAY-${p.id ? p.id.slice(0, 8) : Date.now()}`,
      date: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: p.remarks || `Payout Withdrawal via ${p.payment_mode || 'Bank Transfer'}`,
      type: 'Payout Withdrawal',
      amount: -Number(p.amount || 0),
      status: (p.payment_status || 'completed').charAt(0).toUpperCase() + (p.payment_status || 'completed').slice(1),
    });
  });

  // Completed interview session earnings
  completedRequests.forEach((req, idx) => {
    transactions.push({
      id: `TXN-${req.id ? req.id.slice(0, 8) : idx + 100}`,
      date: req.updated_at ? new Date(req.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: `Completed Technical Drill — ${req.interview_type || 'Interview Session'}`,
      type: 'Interview Fee',
      amount: perInterviewRate,
      status: 'Completed',
    });
  });

  // Accepted interview session pending earnings
  acceptedRequests.forEach((req, idx) => {
    transactions.push({
      id: `SCH-${req.id ? req.id.slice(0, 8) : idx + 500}`,
      date: req.meeting_date || (req.created_at ? new Date(req.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      description: `Scheduled Technical Drill — ${req.interview_type || 'Interview Session'}`,
      type: 'Scheduled Fee',
      amount: perInterviewRate,
      status: 'Pending',
    });
  });

  const withdrawHistory = payouts.map((p) => ({
    date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
    amount: `₹${Number(p.amount || 0).toLocaleString()}`,
    account: p.payment_mode || 'Bank Transfer',
    status: (p.payment_status || 'Completed').charAt(0).toUpperCase() + (p.payment_status || 'Completed').slice(1),
  }));

  // Build monthly trend dynamically from real completed requests
  const monthlyMap = {};
  completedRequests.forEach((req) => {
    const d = new Date(req.updated_at || req.created_at || Date.now());
    const mKey = d.toLocaleString('default', { month: 'short' });
    monthlyMap[mKey] = (monthlyMap[mKey] || 0) + perInterviewRate;
  });

  const monthlyChart = Object.keys(monthlyMap).length > 0
    ? Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }))
    : [
        { month: 'May', amount: totalEarned > 0 ? totalEarned * 0.3 : 1500 },
        { month: 'Jun', amount: totalEarned > 0 ? totalEarned * 0.5 : 2500 },
        { month: 'Jul', amount: totalEarned > 0 ? totalEarned * 0.8 : 3500 },
        { month: 'Aug', amount: totalEarned > 0 ? totalEarned : 4500 },
      ];

  return {
    overview: {
      monthly_revenue: totalEarned,
      pending_payouts: unpaidBalance + pendingPayouts,
      paid_history: paidHistory,
      performance_bonus: completedCount >= 5 ? 1500.00 : 0,
      expected_payout: expectedPayout,
      ranking: completedCount >= 10 ? 1 : completedCount >= 5 ? 4 : 10,
    },
    monthly_chart: monthlyChart,
    transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
    withdraw_history: withdrawHistory,
  };
};

const requestPayout = async (amount) => {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error('Not authenticated.');

  const { data, error } = await supabase
    .from('recruiter_payouts')
    .insert([
      {
        recruiter_id: user.id,
        amount: Number(amount || 500),
        payment_status: 'pending',
        payment_mode: 'manual_bank_transfer',
        remarks: `Recruiter requested payout withdrawal of ₹${amount}`,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// -----------------------------------------------------------------------------
// Export service
// -----------------------------------------------------------------------------

const recruiterService = {
  mapRecruiterRow,
  mapCandidateRow,
  getProfile,
  updateProfile,
  getAvailability,
  saveRecruiterProfile,
  getAllRecruiterProfiles,
  bookInterview,
  getInterviewRequestsForRecruiter,
  getInterviewRequestsForStudent,
  getInterviews,
  updateInterviewRequestStatus,
  getNotifications,
  getDashboardOverview,
  getLiveCandidatesPool,
  acceptInterviewRequest,
  rejectOrRescheduleRequest,
  respondToReschedule,
  assignInterviewSlot,
  submitInterviewFeedback,
  getRevenueData,
  requestPayout,
};

export default recruiterService;