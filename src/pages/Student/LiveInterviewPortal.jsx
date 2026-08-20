import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiVideo, FiCalendar, FiClock, FiUser, FiCheckCircle,
  FiArrowRight, FiLoader, FiAlertCircle, FiShield, FiPlay, FiStar, FiX, FiMessageSquare, FiCheck
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import ZoomMeetingRoom from '../../components/Meeting/ZoomMeetingRoom';
import interviewService from '../../services/interviewService';
import useRealtime from '../../hooks/useRealtime';
import {
  formatInterviewDate,
  formatTimeWindow,
  getSessionTimeStatus,
} from '../../utils/interviewSession';

export const LiveInterviewPortal = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student feedback modal state
  const [feedbackModalReq, setFeedbackModalReq] = useState(null);
  const [overallRating, setOverallRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // If a specific requestId parameter is provided in the URL, render ZoomMeetingRoom directly!
  if (requestId) {
    return <ZoomMeetingRoom userRole="student" onLeave={() => navigate('/student/dashboard')} />;
  }

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewService.getStudentInterviewRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch student interview requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useRealtime(['interview_requests'], fetchRequests);

  const acceptedRequests = requests.filter((r) => {
    const status = (r.status || '').toLowerCase();
    return status === 'accepted' || status === 'scheduled' || status === 'completed';
  });

  const pendingRequests = requests.filter((r) => (r.status || '').toLowerCase() === 'pending');

  const startInstantSession = () => {
    const instantId = `demo_live_${Date.now()}`;
    toast.success('Launching Instant AI Technical Drill Studio...');
    navigate(`/student/live-interview/${instantId}`);
  };

  const handleJoinStudentSession = (req) => {
    const timeStatus = getSessionTimeStatus(req);
    if (!timeStatus.canJoin) {
      if (timeStatus.isEnded) {
        toast.error('This interview session has ended.');
      } else {
        toast.error(`Session is not active yet. Scheduled for ${formatTimeWindow(req)}.`);
      }
      return;
    }

    if (req.meeting_link && req.meeting_link.startsWith('http')) {
      window.open(req.meeting_link, '_blank');
    } else {
      navigate(`/student/live-interview/${req.id}`);
    }
  };

  const handleSubmitStudentFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackModalReq) return;

    try {
      setSubmittingFeedback(true);
      await interviewService.submitFeedback({
        interview_request_id: feedbackModalReq.id,
        student_id: feedbackModalReq.student_id,
        recruiter_user_id: feedbackModalReq.recruiter_user_id || feedbackModalReq.recruiter_id,
        overall_rating: overallRating,
        comments: feedbackComments,
        submitted_by_role: 'student',
      });

      toast.success('Thank you! Your feedback and rating have been sent to the recruiter.');
      setFeedbackModalReq(null);
      setFeedbackComments('');
      fetchRequests();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <DashboardLayout title="Live Technical Interview Room">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

        {/* HERO BANNER */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(16, 185, 129, 0.12))',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 9999, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <HiSparkles /> LiveKit Studio Engine
            </div>
            <h1 style={{ margin: '0.2rem 0 0.4rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Live Interactive Technical Interview Studio
            </h1>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.88rem', maxWidth: 650 }}>
              Join live 1-on-1 recruiter interviews during your assigned time window.
            </p>
          </div>

    
        </div>

        {/* ACTIVE / SCHEDULED ROOMS SECTION */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiVideo style={{ color: 'var(--color-primary)' }} /> Scheduled Interview Sessions
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
              {acceptedRequests.length} Scheduled
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiLoader className="spin-animation" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }} />
              <div>Checking interview schedules...</div>
            </div>
          ) : acceptedRequests.length === 0 ? (
            <div
              style={{
                padding: '2rem', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-sec)', border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            >
              <FiCalendar size={36} style={{ color: 'var(--color-muted)', opacity: 0.4, marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                No Scheduled Interviews
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                You have {pendingRequests.length} pending request(s) waiting for recruiter schedule assignment.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={startInstantSession}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  <FiVideo /> Enter AI Instant Drill
                </button>
                <button
                  onClick={() => navigate('/student/recruiters')}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  }}
                >
                  Find Recruiters <FiArrowRight />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {acceptedRequests.map((req) => {
                const timeStatus = getSessionTimeStatus(req);

                return (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-surface-sec)', border: '1px solid var(--color-border)',
                      flexWrap: 'wrap', gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                          {req.type || 'Technical Interview'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            background: timeStatus.bg,
                            color: timeStatus.color,
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 800,
                          }}
                        >
                          {timeStatus.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser /> Recruiter: <strong>{req.recruiter || 'Tech Partner'}</strong> ({req.company || 'Enterprise'})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FiClock /> Time Window: {formatInterviewDate(req.meeting_date || req.date)} · {formatTimeWindow(req)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* Join Room button - active only during valid time */}
                      <button
                        onClick={() => handleJoinStudentSession(req)}
                        disabled={!timeStatus.canJoin}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)',
                          background: timeStatus.canJoin ? 'var(--gradient-primary)' : 'rgba(148, 163, 184, 0.2)',
                          color: timeStatus.canJoin ? '#fff' : 'var(--color-muted)',
                          fontWeight: 800, fontSize: '0.82rem', border: 'none',
                          cursor: timeStatus.canJoin ? 'pointer' : 'not-allowed',
                          boxShadow: timeStatus.canJoin ? 'var(--shadow-glow-primary)' : 'none',
                          opacity: timeStatus.canJoin ? 1 : 0.6,
                        }}
                      >
                        <FiVideo /> {timeStatus.isEnded ? 'Session Ended' : timeStatus.canJoin ? 'Enter Studio Room' : timeStatus.label}
                      </button>

                      {/* Give Feedback button if session is ended/completed */}
                      {timeStatus.isEnded && (
                        <button
                          onClick={() => setFeedbackModalReq(req)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-md)',
                            background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B',
                            fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(245, 158, 11, 0.4)',
                            cursor: 'pointer',
                          }}
                        >
                          <FiStar /> Rate Recruiter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Feedback & Rating Modal */}
        {feedbackModalReq && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1200,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <form
              onSubmit={handleSubmitStudentFeedback}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: 480,
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiStar style={{ color: '#F59E0B' }} /> Interview Feedback &amp; Rating
                </h3>
                <button
                  type="button"
                  onClick={() => setFeedbackModalReq(null)}
                  style={{ border: 'none', background: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  <FiX />
                </button>
              </div>

              <p style={{ margin: '0 0 1.25rem', fontSize: '0.86rem', color: 'var(--color-muted)' }}>
                Please rate your experience with <strong>{feedbackModalReq.recruiter || 'the Recruiter'}</strong>.
              </p>

              {/* Star Rating */}
              <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  Overall Rating ({overallRating}/5)
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '2rem',
                        color: star <= overallRating ? '#F59E0B' : 'var(--color-border)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text)' }}>
                  Comments / Review
                </label>
                <textarea
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="Share feedback on the interview drill, questions asked, and guidance provided..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackModalReq(null)}
                  disabled={submittingFeedback}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {submittingFeedback ? <FiLoader className="spin-animation" /> : <FiCheck />}
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveInterviewPortal;
