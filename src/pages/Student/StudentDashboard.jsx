import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiVideo,
  FiTrendingUp,
  FiUpload,
  FiUserCheck,
  FiPieChart,
  FiBell,
  FiZap,
  FiLoader,
  FiArrowRight,
  FiActivity,
  FiTarget,
  FiCheckCircle,
  FiUsers,
  FiCalendar,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import QuickActionCard from '../../components/Dashboard/cards/QuickActionCard';
import NotificationCard from '../../components/Dashboard/cards/NotificationCard';
import ProfileCard from '../../components/Dashboard/cards/ProfileCard';
import MembershipCard from '../../components/Dashboard/cards/MembershipCard';
import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import interviewService from '../../services/interviewService';
import resumeService from '../../services/resumeService';
import userService from '../../services/userService';
import useRealtime from '../../hooks/useRealtime';
import './StudentDashboard.css';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveRequests, setLiveRequests] = useState([]);
  const [resumeScoreData, setResumeScoreData] = useState({ score: null, record: null });
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all Supabase-powered dashboard metrics
  const fetchDashboardData = useCallback(async () => {
    try {
      const [notifs, requests, scoreResult, profileResult] = await Promise.all([
        notificationService.getNotifications('student').catch(() => []),
        interviewService.getStudentInterviewRequests().catch(() => []),
        resumeService.getLatestScore().catch(() => ({ score: null, record: null })),
        user?.id ? userService.getCandidateProfile(user.id).catch(() => null) : Promise.resolve(null),
      ]);

      setLiveNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
      setLiveRequests(Array.isArray(requests) ? requests : []);
      setResumeScoreData(scoreResult || { score: null, record: null });
      if (profileResult) {
        setCandidateProfile(profileResult);
      }
    } catch (err) {
      console.warn('Student Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Realtime updates from Supabase tables
  useRealtime(
    ['notifications', 'interview_requests', 'resume_analysis_scores', 'candidate_profiles', 'profiles'],
    fetchDashboardData
  );

  // Profile calculations from Supabase candidate_profiles
  const profileCompletion = useMemo(() => {
    const profile = candidateProfile || user;
    if (!profile) return 0;

    const fieldsToCheck = [
      Boolean(profile.name),
      Boolean(profile.email),
      Boolean(profile.phone),
      Boolean(profile.location),
      Boolean(profile.bio),
      Boolean(profile.current_status),
      Boolean(profile.skills && profile.skills.length > 0),
      Boolean(profile.resume_file_url || profile.resume_url),
      Boolean(profile.github_url || profile.linkedin_url || profile.portfolio_url),
    ];

    const filled = fieldsToCheck.filter(Boolean).length;
    return Math.round((filled / fieldsToCheck.length) * 100);
  }, [candidateProfile, user]);

  const skillsCount = useMemo(() => {
    if (candidateProfile?.skills && Array.isArray(candidateProfile.skills)) {
      return candidateProfile.skills.length;
    }
    if (user?.skills && Array.isArray(user.skills)) {
      return user.skills.length;
    }
    return 0;
  }, [candidateProfile, user]);

  // Interview metrics
  const pendingRequests = liveRequests.filter((r) => r.status === 'pending').length;
  const acceptedRequests = liveRequests.filter((r) => r.status === 'accepted' || r.status === 'scheduled').length;
  const completedRequests = liveRequests.filter((r) => r.status === 'completed').length;
  const lastRequest = liveRequests[0] || null;

  // Context-aware Career Suggestion based on Supabase metrics
  const careerSuggestion = useMemo(() => {
    if (resumeScoreData.score === null) {
      return 'Upload and scan your resume to get instant AI scoring, ATS keyword optimization, and unlock recruiter booking.';
    }
    if (resumeScoreData.score < 75) {
      return `Your ATS resume score is currently ${Math.round(resumeScoreData.score)}%. Boost it above 75% by adding quantifiable impact metrics and key technical competencies to connect with top recruiters.`;
    }
    if (pendingRequests > 0) {
      return 'Your interview request is under review with the recruiter. Prepare your technical project walkthroughs in the meantime.';
    }
    if (acceptedRequests > 0) {
      return 'You have accepted interview sessions ready! Check the Live Interview Room to review topics and launch your drill.';
    }
    return 'Your profile is ready and ATS verified! Connect with verified recruiters to schedule technical 1-on-1 interview drills.';
  }, [resumeScoreData, pendingRequests, acceptedRequests]);

  const quickActions = [
    { label: 'Upload Resume', icon: <FiUpload />, primary: true, onClick: () => navigate('/student/resume') },
    { label: 'Find Recruiters', icon: <FiUsers />, primary: true, onClick: () => navigate('/student/recruiters') },
    { label: 'Live Interview Room', icon: <FiVideo />, primary: false, onClick: () => navigate('/student/live-interview') },
    { label: 'Update Profile', icon: <FiUserCheck />, primary: false, onClick: () => navigate('/student/profile') },
    { label: 'View Reports', icon: <FiPieChart />, primary: false, onClick: () => navigate('/student/reports') },
  ];

  const rightSidebarContent = (
    <div className="sd-side-column">
      <ProfileCard user={candidateProfile || user} completion={profileCompletion} />
      <MembershipCard user={candidateProfile || user} />

      {/* Notifications Section */}
      <div className="sd-section">
        <div className="sd-section-head">
          <h3><FiBell /> Notifications</h3>
          <span>{liveNotifications.length} items</span>
        </div>

        {loading ? (
          <div className="sd-loading">
            <FiLoader className="spin-animation" /> Loading...
          </div>
        ) : liveNotifications.length === 0 ? (
          <div className="sd-empty">No new notifications</div>
        ) : (
          <div className="sd-list">
            {liveNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                title={n.title || 'Notification'}
                message={n.message || ''}
                time={
                  n.created_at
                    ? new Date(n.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''
                }
                type={
                  n.notification_type === 'interview_accepted'
                    ? 'success'
                    : n.notification_type === 'interview_rejected'
                      ? 'error'
                      : 'info'
                }
                unread={!n.is_read}
              />
            ))}
          </div>
        )}

        <Link className="sd-link-btn" to="/student/notifications">
          View all notifications <FiArrowRight />
        </Link>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Student Dashboard" rightSidebar={rightSidebarContent}>
      <div className="student-dashboard-page">
        {/* HERO BANNER */}
        <section className="sd-hero">
          <div className="sd-hero-copy">
            <div className="sd-pill-row">
              <span className="badge-ai"><HiSparkles /> Candidate Portal</span>
              <span className="sd-pill"><FiCalendar size={12} /> {currentDate}</span>
              <span className="sd-pill">Profile Completion: {profileCompletion}%</span>
            </div>

            <h1>Welcome back, {candidateProfile?.name || user?.name || 'Student'}!</h1>
            <p>
              Manage your profile, interviews, ATS resume score, and recruiter connections from one centralized dashboard.
            </p>
          </div>

          <div className="sd-hero-actions">
            <button
              type="button"
              className="sd-btn sd-btn-primary"
              onClick={() => navigate('/student/recruiters')}
            >
              Find Recruiters <FiArrowRight />
            </button>
            <button
              type="button"
              className="sd-btn sd-btn-secondary"
              onClick={() => navigate('/student/profile')}
            >
              Update Profile
            </button>
          </div>
        </section>

        {/* STATS ROW (ALL POWERED BY SUPABASE) */}
        <section className="sd-stats">
          {/* Resume Score */}
          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiFileText /></div>
            <div className="sd-stat-label">Resume Score</div>
            <div className="sd-stat-value">
              {resumeScoreData.score !== null ? `${Math.round(resumeScoreData.score)} / 100` : '— / 100'}
            </div>
            <div className="sd-stat-sub">
              {resumeScoreData.score !== null
                ? (resumeScoreData.score >= 75 ? 'ATS verified compatible' : 'Needs ATS optimization')
                : 'Scan resume to compute score'}
            </div>
          </div>

          {/* Interview Requests */}
          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiUsers /></div>
            <div className="sd-stat-label">Interview Requests</div>
            <div className="sd-stat-value">{liveRequests.length}</div>
            <div className="sd-stat-sub">{pendingRequests} pending • {acceptedRequests} accepted</div>
          </div>

          {/* Completed Interviews */}
          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiVideo /></div>
            <div className="sd-stat-label">Completed Interviews</div>
            <div className="sd-stat-value">{completedRequests}</div>
            <div className="sd-stat-sub">{completedRequests > 0 ? 'Verified drills & sessions' : 'Start your first live drill'}</div>
          </div>

          {/* Profile Skills */}
          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiCheckCircle /></div>
            <div className="sd-stat-label">Profile Skills</div>
            <div className="sd-stat-value">{skillsCount}</div>
            <div className="sd-stat-sub">{skillsCount > 0 ? 'Listed in candidate profile' : 'Add skills in profile'}</div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="sd-content-grid">
          <div className="sd-main-column">
            {/* Quick Actions */}
            <section className="sd-section">
              <div className="sd-section-head">
                <h3>Quick Actions</h3>
                <span>Fast access</span>
              </div>
              <QuickActionCard actions={quickActions} />
            </section>

            {/* 100% Full-Width Career Suggestion Section */}
            <section className="sd-section" style={{ width: '100%' }}>
              <div className="sd-section-head">
                <h3><FiZap style={{ color: '#F59E0B' }} /> AI Career Strategy & Recommendation</h3>
                <span className="badge-ai"><HiSparkles /> Personalized Guidance</span>
              </div>
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  width: '100%',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                    Recommended Next Step
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>
                    {careerSuggestion}
                  </p>
                </div>
                <button
                  type="button"
                  className="sd-btn sd-btn-primary"
                  onClick={() => navigate(resumeScoreData.score === null ? '/student/resume' : '/student/recruiters')}
                >
                  {resumeScoreData.score === null ? 'Upload Resume' : 'Find Recruiters'} <FiArrowRight />
                </button>
              </div>
            </section>

            {/* Interview Requests Summary */}
            <section className="sd-section">
              <div className="sd-section-head">
                <h3>Interview Summary</h3>
                <span>Overview</span>
              </div>

              <div className="sd-summary-grid">
                <div className="sd-summary-card">
                  <div className="sd-summary-icon"><FiTrendingUp /></div>
                  <div className="sd-summary-content">
                    <div className="sd-summary-title">Accepted Requests</div>
                    <div className="sd-summary-value">{acceptedRequests}</div>
                    <div className="sd-summary-text">Interviews scheduled & ready to join</div>
                  </div>
                </div>

                <div className="sd-summary-card">
                  <div className="sd-summary-icon"><FiActivity /></div>
                  <div className="sd-summary-content">
                    <div className="sd-summary-title">Pending Requests</div>
                    <div className="sd-summary-value">{pendingRequests}</div>
                    <div className="sd-summary-text">Waiting on recruiter review & response</div>
                  </div>
                </div>

                <div className="sd-summary-card">
                  <div className="sd-summary-icon"><FiTarget /></div>
                  <div className="sd-summary-content">
                    <div className="sd-summary-title">Latest Request</div>
                    <div className="sd-summary-value">{lastRequest?.type || lastRequest?.interview_type || 'None'}</div>
                    <div className="sd-summary-text">
                      {lastRequest ? `With ${lastRequest.recruiter || 'Recruiter'} (${lastRequest.company || 'Tech Partner'})` : 'No interview requests sent yet.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;