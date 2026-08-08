import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  LiveKitRoom,
  PreJoin,
} from "@livekit/components-react";

import "@livekit/components-styles";

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiLoader,
  FiShield,
  FiUser,
  FiVideo,
  FiX,
} from "react-icons/fi";

import toast from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import ZoomMeetingRoom from "../../components/Meeting/ZoomMeetingRoom";
import { livekitService } from "../../services/livekitService";
import interviewService from "../../services/interviewService";
import {
  supabase,
  isSupabaseConfigured,
} from "../../services/supabaseClient";

import {
  isInterviewScheduled,
  getInterviewRoomName,
} from "../../utils/interviewSession";

import "./LiveInterviewRoom.css";

const LiveInterviewRoom = () => {
  const { requestId } = useParams();

  const navigate = useNavigate();

  const disconnectHandledRef =
    useRef(false);

  const [connection, setConnection] =
    useState(null);

  const [sessionData, setSessionData] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userRole, setUserRole] =
    useState("student");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showPreJoin, setShowPreJoin] =
    useState(false);

  const [hasJoined, setHasJoined] =
    useState(false);

  const [showFeedbackModal, setShowFeedbackModal] =
    useState(false);

  const [overallRating, setOverallRating] =
    useState(5);

  const [comments, setComments] =
    useState("");

  const [submittingFeedback, setSubmittingFeedback] =
    useState(false);

  const loadSession = useCallback(
    async () => {
      if (
        !isSupabaseConfigured() ||
        !requestId
      ) {
        throw new Error(
          "Interview session ID is missing."
        );
      }

      const {
        data: {
          user,
        },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          "Please log in to join the interview."
        );
      }

      const { data, error: requestError } =
        await supabase
          .from("interview_requests")
          .select("*")
          .eq("id", requestId)
          .or(
            `student_id.eq.${user.id},recruiter_user_id.eq.${user.id}`
          )
          .single();

      if (requestError) {
        throw requestError;
      }

      const role =
        data.recruiter_user_id === user.id
          ? "recruiter"
          : "student";

      setCurrentUser(user);
      setUserRole(role);
      setSessionData(data);

      if (!isInterviewScheduled(data)) {
        return {
          session: data,
          user,
          role,
          connection: null,
        };
      }

      const candidateName =
        data.candidate_name ||
        data.student_name ||
        "Student";

      const tokenData =
        await livekitService.getToken(
          getInterviewRoomName(data),
          role,
          role === "recruiter"
            ? "Recruiter"
            : candidateName
        );

      return {
        session: data,
        user,
        role,
        connection: tokenData,
      };
    },
    [requestId]
  );

  const refreshSession = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await loadSession();

        setConnection(
          result.connection || null
        );
      } catch (loadError) {
        console.error(
          "Failed to load interview session:",
          loadError
        );

        setError(
          loadError?.message ||
            "Unable to load interview session."
        );
      } finally {
        setLoading(false);
      }
    },
    [loadSession]
  );

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (
      !isSupabaseConfigured() ||
      !requestId
    ) {
      return undefined;
    }

    const channel = supabase
      .channel(
        `interview-session-${requestId}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interview_requests",
          filter: `id=eq.${requestId}`,
        },
        () => {
          refreshSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, refreshSession]);

  const handleJoinClick = () => {
    if (!isInterviewScheduled(sessionData)) {
      toast.error(
        "The recruiter has not assigned the final session slot."
      );
      return;
    }

    if (!connection) {
      toast.error(
        "Meeting credentials are still loading."
      );
      return;
    }

    setShowPreJoin(true);
  };

  const handleEnterRoom = () => {
    setShowPreJoin(false);
    setHasJoined(true);

    livekitService.startSession(
      requestId,
      connection.room,
      currentUser?.id || userRole
    );
  };

  const handleDisconnected = async () => {
    if (disconnectHandledRef.current) {
      return;
    }

    disconnectHandledRef.current = true;

    try {
      await interviewService.completeInterview(
        requestId
      );

      await livekitService.endSession(
        requestId
      );

      if (userRole === "student") {
        setShowFeedbackModal(true);
      } else {
        navigate(-1);
      }
    } catch (disconnectError) {
      console.warn(disconnectError);

      if (userRole === "student") {
        setShowFeedbackModal(true);
      } else {
        navigate(-1);
      }
    }
  };

  const handleFeedbackSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSubmittingFeedback(true);

    try {
      await interviewService.submitFeedback({
        interview_request_id: requestId,
        student_id: sessionData?.student_id,
        recruiter_user_id:
          sessionData?.recruiter_user_id,
        overall_rating: overallRating,
        comments,
        submitted_by_role: "student",
      });

      toast.success("Feedback submitted.");

      setShowFeedbackModal(false);
      navigate("/student/interview-history");
    } catch (feedbackError) {
      toast.error(
        feedbackError?.message ||
          "Failed to submit feedback."
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const interviewTitle =
    sessionData?.job_title ||
    sessionData?.position ||
    sessionData?.role ||
    "Live Interview";

  const interviewType =
    sessionData?.interview_type ||
    "Technical Screening";

  const candidateName =
    sessionData?.candidate_name ||
    sessionData?.student_name ||
    "Student";

  const scheduled =
    isInterviewScheduled(sessionData);

  if (loading) {
    return (
      <DashboardLayout title="Interview Session">
        <div className="lir-state-card">
          <FiLoader className="lir-spin" />
          <h2>Loading interview...</h2>
          <p>Checking the assigned session.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Interview Session">
        <div className="lir-state-card lir-error-card">
          <FiShield />
          <h2>Unable to open interview</h2>
          <p>{error}</p>

          <button
            className="lir-button lir-button-secondary"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
            Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (hasJoined && connection) {
    return (
      <div className="lir-livekit-screen">
        <LiveKitRoom
          serverUrl={connection.url}
          token={connection.token}
          connect
          audio
          video
          onDisconnected={handleDisconnected}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomMeetingRoom
            userRole={userRole}
            onLeave={handleDisconnected}
          />
        </LiveKitRoom>

        {showFeedbackModal && (
          <FeedbackModal
            overallRating={overallRating}
            setOverallRating={setOverallRating}
            comments={comments}
            setComments={setComments}
            submittingFeedback={
              submittingFeedback
            }
            onSubmit={handleFeedbackSubmit}
            onClose={() =>
              navigate("/student/interview-history")
            }
          />
        )}
      </div>
    );
  }

  return (
    <DashboardLayout title="Interview Session">
      <main className="lir-page">
        {scheduled ? (
          <section className="lir-card">
            <div className="lir-card-left">
              <div className="lir-title-row">
                <h1>{interviewTitle}</h1>
                <span className="lir-status active">
                  Scheduled
                </span>
              </div>

              <div className="lir-middle-lines">
                <div className="lir-line">
                  <FiUser />
                  <span>
                    {userRole === "recruiter"
                      ? candidateName
                      : "Recruiter"}
                  </span>
                </div>

                <div className="lir-line">
                  <FiCalendar />
                  <span>
                    {sessionData.meeting_date}
                  </span>
                </div>

                <div className="lir-line">
                  <FiClock />
                  <span>
                    {sessionData.meeting_time} ·{" "}
                    {interviewType}
                  </span>
                </div>
              </div>
            </div>

            <div className="lir-card-right">
              <button
                className="lir-button lir-button-primary"
                onClick={handleJoinClick}
                disabled={!connection}
              >
                <FiVideo />
                Join Now
              </button>
            </div>
          </section>
        ) : (
          <div className="lir-empty-state">
            <div className="lir-empty-icon">
              <FiShield />
            </div>

            <h2>No interview scheduled yet</h2>

            <p>
              The recruiter has accepted the request,
              but the final date and time have not been
              assigned.
            </p>

            <button
              className="lir-button lir-button-secondary"
              onClick={() => navigate(-1)}
            >
              <FiArrowLeft />
              Back
            </button>
          </div>
        )}

        {showPreJoin && connection && (
          <div className="lir-modal-overlay">
            <div className="lir-prejoin-modal">
              <div className="lir-modal-header">
                <h2>Prepare to join</h2>

                <button
                  className="lir-close-button"
                  onClick={() =>
                    setShowPreJoin(false)
                  }
                >
                  <FiX />
                </button>
              </div>

              <PreJoin onValidate={() => {}} />

              <div className="lir-modal-actions">
                <button
                  className="lir-button lir-button-secondary"
                  onClick={() =>
                    setShowPreJoin(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="lir-button lir-button-primary"
                  onClick={handleEnterRoom}
                >
                  Enter Room
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

const FeedbackModal = ({
  overallRating,
  setOverallRating,
  comments,
  setComments,
  submittingFeedback,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="lir-modal-overlay">
      <div className="lir-feedback-modal">
        <h2>Interview completed</h2>

        <form onSubmit={onSubmit}>
          <label>Rating</label>

          <div className="lir-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={
                  star <= overallRating
                    ? "lir-star active"
                    : "lir-star"
                }
                onClick={() =>
                  setOverallRating(star)
                }
              >
                ★
              </button>
            ))}
          </div>

          <label>Comments</label>

          <textarea
            rows={4}
            value={comments}
            onChange={(event) =>
              setComments(event.target.value)
            }
          />

          <div className="lir-feedback-actions">
            <button
              type="button"
              className="lir-button lir-button-secondary"
              onClick={onClose}
            >
              Skip
            </button>

            <button
              type="submit"
              className="lir-button lir-button-primary"
              disabled={submittingFeedback}
            >
              {submittingFeedback ? (
                <FiLoader className="lir-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveInterviewRoom;