import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiVideo,
  FiAward,
  FiTrendingUp,
  FiUpload,
  FiUserCheck,
  FiPieChart,
  FiClock,
  FiBell,
  FiZap,
  FiLoader,
  FiArrowRight,
  FiActivity,
  FiTarget,
  FiCheckCircle,
  FiUsers,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import QuickActionCard from '../../components/Dashboard/cards/QuickActionCard';
import ActivityCard from '../../components/Dashboard/cards/ActivityCard';
import NotificationCard from '../../components/Dashboard/cards/NotificationCard';
import ProfileCard from '../../components/Dashboard/cards/ProfileCard';
import MembershipCard from '../../components/Dashboard/cards/MembershipCard';
import { useAuth } from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import interviewService from '../../services/interviewService';
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
  const [notifLoading, setNotifLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [notifs, requests] = await Promise.all([
        notificationService.getNotifications(),
        interviewService.getStudentInterviewRequests(),
      ]);

      setLiveNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
      setLiveRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useRealtime(['notifications', 'interview_requests'], fetchDashboardData);

  const pendingRequests = liveRequests.filter((r) => r.status === 'pending').length;
  const acceptedRequests = liveRequests.filter((r) => r.status === 'accepted').length;
  const completedRequests = liveRequests.filter((r) => r.status === 'completed').length;
  const lastRequest = liveRequests[0] || null;
  const nextInterview = liveRequests.find((r) => r.status === 'accepted') || null;

  const quickActions = [
    { label: 'Upload Resume', icon: <FiUpload />, primary: true, onClick: () => navigate('/student/resume') },
    { label: 'Find Recruiters', icon: <FiVideo />, primary: true, onClick: () => navigate('/student/find-recruiters') },
    { label: 'Update Profile', icon: <FiUserCheck />, primary: false, onClick: () => navigate('/student/profile') },
    { label: 'View Reports', icon: <FiPieChart />, primary: false, onClick: () => navigate('/student/reports') },
  ];

  const recentActivities = [
    {
      title: 'Completed Full Stack System Design Drill',
      timestamp: '2 hours ago',
      description: 'Scored 92% in load balancing and caching architecture.',
      status: '92% Score',
      icon: <FiVideo />,
    },
    {
      title: 'ATS Resume Rescan',
      timestamp: 'Yesterday',
      description: 'Match score improved after adding measurable metrics.',
      status: '94% Match',
      icon: <FiFileText />,
    },
    {
      title: 'Earned Badge: React Specialist',
      timestamp: '3 days ago',
      description: 'Verified candidate badge issued for technical proficiency.',
      status: 'Verified',
      icon: <FiAward />,
    },
  ];

  const rightSidebarContent = (
    <div className="sd-side-column">
      <ProfileCard user={user} completion={85} />
      <MembershipCard user={user} />

      <div className="sd-section">
        <div className="sd-section-head">
          <h3><FiBell /> Notifications</h3>
          <span>{liveNotifications.length} items</span>
        </div>

        {notifLoading ? (
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

      <div className="sd-section">
        <div className="sd-section-head">
          <h3><FiClock /> Next Interview</h3>
          <span>{nextInterview ? 'Scheduled' : 'Pending'}</span>
        </div>

        {nextInterview ? (
          <div className="sd-notice">
            <strong>{nextInterview.recruiter_name || 'Recruiter'}</strong>
            <div>
              {nextInterview.interview_type || 'Interview'} •{' '}
              {nextInterview.preferred_datetime
                ? new Date(nextInterview.preferred_datetime).toLocaleString()
                : 'Time pending'}
            </div>
          </div>
        ) : (
          <div className="sd-notice">No accepted interview scheduled yet.</div>
        )}
      </div>

      <div className="sd-section">
        <div className="sd-section-head">
          <h3><FiZap /> Career Suggestion</h3>
          <span>Tip</span>
        </div>
        <div className="sd-notice">
          Focus on system design practice and measurable project achievements to improve recruiter response.
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Student Dashboard" rightSidebar={rightSidebarContent}>
      <div className="student-dashboard-page">
        <section className="sd-hero">
          <div className="sd-hero-copy">
            <div className="sd-pill-row">
              <span className="badge-ai"><HiSparkles /> Candidate Portal</span>
              <span className="sd-pill">Date: {currentDate}</span>
              <span className="sd-pill">Profile Completion: 85%</span>
            </div>

            <h1>Welcome back, {user?.name || 'Student'}!</h1>
            <p>
              Manage your profile, interviews, resume score, and recruiter requests from one clean workspace.
            </p>
          </div>

          <div className="sd-hero-actions">
            <button
              type="button"
              className="sd-btn sd-btn-primary"
              onClick={() => navigate('/student/find-recruiters')}
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

        <section className="sd-stats">
          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiFileText /></div>
            <div className="sd-stat-label">Resume Score</div>
            <div className="sd-stat-value">94 / 100</div>
            <div className="sd-stat-sub">ATS verified compatible</div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiUsers /></div>
            <div className="sd-stat-label">Interview Requests</div>
            <div className="sd-stat-value">{liveRequests.length}</div>
            <div className="sd-stat-sub">{pendingRequests} pending • {acceptedRequests} accepted</div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiVideo /></div>
            <div className="sd-stat-label">Mock Interviews</div>
            <div className="sd-stat-value">24</div>
            <div className="sd-stat-sub">Completed AI drills</div>
          </div>

          <div className="sd-stat-card">
            <div className="sd-stat-icon"><FiCheckCircle /></div>
            <div className="sd-stat-label">Skills Improved</div>
            <div className="sd-stat-value">{completedRequests}</div>
            <div className="sd-stat-sub">Verified by AI assessment</div>
          </div>
        </section>

        <div className="sd-content-grid">
          <div className="sd-main-column">
            <section className="sd-section">
              <div className="sd-section-head">
                <h3>Quick Actions</h3>
                <span>Fast access</span>
              </div>
              <QuickActionCard actions={quickActions} />
            </section>

            <section className="sd-section">
              <div className="sd-section-head">
                <h3>Recent Interview Activity</h3>
                <span>Last 7 days</span>
              </div>
              <div className="sd-card-list">
                {recentActivities.map((act, idx) => (
                  <ActivityCard key={idx} {...act} />
                ))}
              </div>
            </section>

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
                    <div className="sd-summary-text">Interviews ready to join</div>
                  </div>
                </div>

                <div className="sd-summary-card">
                  <div className="sd-summary-icon"><FiActivity /></div>
                  <div className="sd-summary-content">
                    <div className="sd-summary-title">Pending Requests</div>
                    <div className="sd-summary-value">{pendingRequests}</div>
                    <div className="sd-summary-text">Waiting on recruiter response</div>
                  </div>
                </div>

                <div className="sd-summary-card">
                  <div className="sd-summary-icon"><FiTarget /></div>
                  <div className="sd-summary-content">
                    <div className="sd-summary-title">Latest Request</div>
                    <div className="sd-summary-value">{lastRequest?.interview_type || 'None'}</div>
                    <div className="sd-summary-text">
                      {lastRequest?.message || 'Latest request details will appear here.'}
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