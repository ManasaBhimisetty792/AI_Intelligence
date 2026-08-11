import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiVideo,
  FiCalendar,
  FiClock,
  FiUser,
  FiBriefcase,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiLink,
} from 'react-icons/fi';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';

import './liveInterviewRoom.css';


// ============================================================
// HELPERS
// ============================================================

const getScheduledDateTimeStr = (item) => {
  if (item.scheduled_at) return item.scheduled_at;
  if (item.preferred_datetime) return item.preferred_datetime;
  if (item.meeting_date) {
    if (item.meeting_time) {
      return `${item.meeting_date}T${item.meeting_time}`;
    }
    return item.meeting_date;
  }
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Date TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return 'Time TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const getStatusLabel = (status) => {
  const map = {
    accepted: 'Accepted',
    scheduled: 'Scheduled',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return map[status] || status || 'Unknown';
};

const getStatusClass = (status) => {
  if (status === 'accepted' || status === 'scheduled') return 'lir-status active';
  if (status === 'completed') return 'lir-status completed';
  if (status === 'cancelled' || status === 'rejected') return 'lir-status cancelled';
  return 'lir-status';
};

const isJoinable = (status) =>
  status === 'accepted' || status === 'scheduled';


// ============================================================
// STUDENT LIVE INTERVIEW ROOM PAGE
// ============================================================

const StudentLiveInterviewRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviews, setInterviews] = useState([]);


  // ==========================================================
  // FETCH STUDENT'S INTERVIEWS
  // ==========================================================

  const fetchInterviews = async () => {
    setLoading(true);
    setError('');

    if (!user?.id) {
      setError('You must be logged in to view interviews.');
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('interview_requests')
        .select('*')
        .eq('student_id', user.id)
        .in('status', ['accepted', 'scheduled', 'pending', 'completed'])
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const rawItems = data || [];

      // Fetch recruiter details for missing names
      const recruiterUserIds = [
        ...new Set(
          rawItems
            .map((r) => r.recruiter_user_id || r.recruiter_id)
            .filter(Boolean)
        ),
      ];

      let recruiterMap = {};
      if (recruiterUserIds.length > 0) {
        try {
          const { data: recProfsByUserId } = await supabase
            .from('recruiter_profiles')
            .select('*')
            .in('user_id', recruiterUserIds);

          const { data: recProfsById } = await supabase
            .from('recruiter_profiles')
            .select('*')
            .in('id', recruiterUserIds);

          [...(recProfsByUserId || []), ...(recProfsById || [])].forEach((rp) => {
            if (rp.user_id) recruiterMap[rp.user_id] = rp;
            if (rp.id) recruiterMap[rp.id] = rp;
          });
        } catch (e) {
          console.warn('[StudentLiveInterviewRoom] Failed to fetch recruiter profiles:', e);
        }
      }

      const enriched = rawItems.map((item) => {
        const rec =
          recruiterMap[item.recruiter_user_id] ||
          recruiterMap[item.recruiter_id] ||
          {};

        return {
          ...item,
          displayRecruiterName:
            item.recruiter_name ||
            item.recruiter ||
            rec.full_name ||
            rec.name ||
            'Recruiter',
          displayCompanyName:
            item.company_name ||
            item.company ||
            rec.company_name ||
            rec.company ||
            '',
        };
      });

      setInterviews(enriched);
    } catch (err) {
      console.error('[StudentLiveInterviewRoom] Fetch error:', err);
      setError(err?.message || 'Failed to load your interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);


  // ==========================================================
  // JOIN HANDLER
  // ==========================================================

  const handleJoin = (interviewId) => {
    toast.success('Entering interview room...');
    navigate(`/interviews/session/${interviewId}`);
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardLayout>
      <div className="lir-page">

        {/* PAGE HEADER */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--color-text)',
            }}
          >
            <FiVideo style={{ color: 'var(--color-primary)' }} />
            Live Interview Room
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Your scheduled and accepted interviews. Click <strong>Join</strong> to enter the meeting room.
          </p>
        </div>


        {/* LOADING */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--color-muted)',
            }}
          >
            <FiLoader
              style={{ fontSize: '2rem', marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}
            />
            <div style={{ fontWeight: 600 }}>Loading your interviews...</div>
          </div>
        )}


        {/* ERROR */}
        {!loading && error && (
          <div className="lir-state-card">
            <div className="lir-error-icon">
              <FiAlertCircle />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
              Unable to load interviews
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              {error}
            </p>
            <button
              className="lir-button lir-button-primary"
              onClick={fetchInterviews}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiRefreshCw size={15} />
              Retry
            </button>
          </div>
        )}


        {/* EMPTY STATE */}
        {!loading && !error && interviews.length === 0 && (
          <div className="lir-empty-state">
            <div className="lir-empty-icon">
              <FiVideo />
            </div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
              No interviews scheduled
            </h3>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              When a recruiter schedules a live interview with you, it will appear here with schedule details and a join link.
            </p>
          </div>
        )}


        {/* INTERVIEW LIST */}
        {!loading && !error && interviews.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {interviews.map((interview) => {
              const joinable = isJoinable(interview.status);
              const dateTimeRaw = getScheduledDateTimeStr(interview);
              const formattedDate = formatDate(dateTimeRaw);
              const formattedTime = formatTime(dateTimeRaw);
              const durationStr = interview.duration || '60 mins';

              return (
                <div key={interview.id} className="lir-card">

                  {/* LEFT: INFO */}
                  <div className="lir-card-left">
                    <div className="lir-title-row">
                      <h1>
                        {interview.interview_type || 'Live Interview Session'}
                      </h1>
                      <span className={getStatusClass(interview.status)}>
                        {getStatusLabel(interview.status)}
                      </span>
                    </div>

                    <div className="lir-middle-lines">
                      {/* RECRUITER & COMPANY */}
                      <div className="lir-line" style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                        <FiUser size={15} style={{ color: 'var(--color-primary)' }} />
                        <span>Recruiter: <strong>{interview.displayRecruiterName}</strong></span>
                        {interview.displayCompanyName && (
                          <span style={{ opacity: 0.8, fontWeight: 400 }}>
                            ({interview.displayCompanyName})
                          </span>
                        )}
                      </div>

                      {/* POSITION IF AVAILABLE */}
                      {interview.position && (
                        <div className="lir-line">
                          <FiBriefcase size={14} />
                          Position: {interview.position}
                        </div>
                      )}

                      {/* SCHEDULED DATE & TIME */}
                      <div className="lir-line">
                        <FiCalendar size={14} />
                        <span><strong>Date:</strong> {formattedDate}</span>
                        {formattedTime && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '0.5rem' }}>
                            <FiClock size={14} />
                            <strong>Time:</strong> {formattedTime} ({durationStr})
                          </span>
                        )}
                      </div>

                      {/* ROOM / SESSION ID */}
                      <div className="lir-line" style={{ fontSize: '0.78rem', opacity: 0.65 }}>
                        <FiLink size={12} />
                        Session ID: {interview.id}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: JOIN BUTTON */}
                  <div className="lir-card-right">
                    <button
                      className={`lir-button ${
                        joinable ? 'lir-button-primary' : 'lir-button-secondary'
                      }`}
                      onClick={() => joinable && handleJoin(interview.id)}
                      disabled={!joinable}
                      title={
                        joinable
                          ? 'Click to join live interview room'
                          : `Interview is ${getStatusLabel(interview.status)}`
                      }
                    >
                      <FiVideo size={16} />
                      {joinable ? 'Join Interview' : getStatusLabel(interview.status)}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default StudentLiveInterviewRoom;

