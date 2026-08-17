import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiLoader,
  FiUsers,
  FiVideo,
  FiBell,
  FiBarChart2,
  FiUser,
  FiChevronRight,
  FiExternalLink,
  FiAlertCircle,
  FiTrendingUp,
  FiAward,
  FiCheck,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import useRealtime from '../../hooks/useRealtime';
import {
  formatInterviewDate,
  formatTimeWindow,
  getSessionTimeStatus,
  getInterviewSessionPath,
} from '../../utils/interviewSession';
import './RecruiterDashboard.css';

const DEFAULT_METRICS = {
  pending_requests: 0,
  todays_interviews: 0,
  upcoming_interviews: 0,
  completed_interviews: 0,
  total_earned: 0,
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getCandidateName = (candidate) =>
  candidate?.name ||
  candidate?.full_name ||
  candidate?.candidate_name ||
  candidate?.student_name ||
  'Candidate';

const getCandidateRole = (candidate) =>
  candidate?.role ||
  candidate?.target_role ||
  candidate?.interview_type ||
  candidate?.domain ||
  'Technical Evaluation';

const getCandidateAts = (candidate) => {
  if (typeof candidate?.ats_score === 'number') return candidate.ats_score;
  if (typeof candidate?.ats === 'number') return candidate.ats;
  if (typeof candidate?.score === 'number') return candidate.score;
  return 88;
};

export const RecruiterDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidateFilter, setCandidateFilter] = useState('all');

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const fetchOverview = useCallback(async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const response = await recruiterService.getDashboardOverview();
      setData(response);
    } catch (err) {
      console.warn('[RecruiterDashboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useRealtime(
    ['interview_requests', 'notifications', 'recruiter_profiles'],
    () => fetchOverview({ background: true })
  );

  const metrics = { ...DEFAULT_METRICS, ...(data?.metrics || {}) };
  const profile = data?.profile || {};
  const allRequests = data?.requests || data?.recent_applicants || [];

  const pendingRequests = useMemo(
    () => allRequests.filter((r) => String(r.status || '').toLowerCase() === 'pending'),
    [allRequests]
  );

  const scheduledSessions = useMemo(
    () =>
      allRequests
        .filter((r) => {
          const s = String(r.status || '').toLowerCase();
          return (s === 'accepted' || s === 'scheduled') && Boolean(r.meeting_date);
        })
        .sort((a, b) => {
          const fa = `${a.meeting_date}T${a.meeting_time || '00:00'}`;
          const fb = `${b.meeting_date}T${b.meeting_time || '00:00'}`;
          return new Date(fa) - new Date(fb);
        }),
    [allRequests]
  );

  const todaySessions = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return scheduledSessions.filter((s) => String(s.meeting_date || '').slice(0, 10) === todayStr);
  }, [scheduledSessions]);

  const filteredRequests = useMemo(() => {
    if (candidateFilter === 'pending') {
      return allRequests.filter((r) => String(r.status || '').toLowerCase() === 'pending');
    }
    if (candidateFilter === 'scheduled') {
      return scheduledSessions;
    }
    return allRequests.slice(0, 5);
  }, [allRequests, scheduledSessions, candidateFilter]);

  const displayName = profile?.full_name || profile?.name || 'Partner Recruiter';

  // ─── KPI Cards Data ─────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: 'Pending Requests',
      value: pendingRequests.length || metrics.pending_requests,
      badge: 'Review Needed',
      icon: <FiClock />,
      accent: '#F59E0B',
      accentBg: 'rgba(245, 158, 11, 0.12)',
      route: '/recruiter/candidates',
      trend: `${pendingRequests.length} candidate(s) awaiting review`,
    },
    {
      label: 'Scheduled Drills',
      value: scheduledSessions.length,
      badge: 'Active Slots',
      icon: <FiCalendar />,
      accent: '#6366F1',
      accentBg: 'rgba(99, 102, 241, 0.12)',
      route: '/recruiter/schedule',
      trend: `${todaySessions.length} session(s) taking place today`,
    },
    {
      label: "Today's Sessions",
      value: todaySessions.length,
      badge: 'Live Today',
      icon: <FiVideo />,
      accent: '#10B981',
      accentBg: 'rgba(16, 185, 129, 0.12)',
      route: '/recruiter/interviews',
      trend: 'WebRTC audio/video studio ready',
    },
    {
      label: 'Completed Drills',
      value: metrics.completed_interviews,
      badge: 'All-Time',
      icon: <FiCheckCircle />,
      accent: '#8B5CF6',
      accentBg: 'rgba(139, 92, 246, 0.12)',
      route: '/recruiter/interviews',
      trend: 'Session payouts credited to wallet',
    },
  ];

  // ─── Quick Actions ──────────────────────────────────────────────────────────
  const quickActions = [
    {
      label: 'Candidate Requests',
      desc: 'Review, accept & reschedule candidate applications',
      icon: <FiUsers size={22} />,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.12)',
      route: '/recruiter/candidates',
    },
    {
      label: 'Schedule Hub',
      desc: 'Interactive calendar & slot assignments',
      icon: <FiCalendar size={22} />,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      route: '/recruiter/schedule',
    },
    {
      label: 'Live Interview Room',
      desc: 'Conduct real-time technical & coding drills',
      icon: <FiVideo size={22} />,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      route: '/recruiter/interviews',
    },
    {
      label: 'Notifications',
      desc: 'Candidate alerts and schedule updates',
      icon: <FiBell size={22} />,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      route: '/recruiter/notifications',
    },
    {
      label: 'Revenue & Payouts',
      desc: 'Track completed interviews and earnings',
      icon: <FiDollarSign size={22} />,
      color: '#0EA5E9',
      bg: 'rgba(14, 165, 233, 0.12)',
      route: '/recruiter/revenue',
    },
    {
      label: 'Company Profile',
      desc: 'Manage interviewer bio, domain, and rates',
      icon: <FiUser size={22} />,
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.12)',
      route: '/recruiter/profile',
    },
  ];

  // ─── Workflow Steps ─────────────────────────────────────────────────────────
  const workflowSteps = [
    {
      step: '01',
      title: 'Review Candidates',
      desc: 'Screen candidate ATS resume scores and domain experience',
      color: '#6366F1',
      route: '/recruiter/candidates',
    },
    {
      step: '02',
      title: 'Assign Schedule',
      desc: 'Set date, start/end time window and WebRTC room link',
      color: '#10B981',
      route: '/recruiter/schedule',
    },
    {
      step: '03',
      title: 'Conduct Interview',
      desc: 'Live video evaluation, code editor & system design drills',
      color: '#F59E0B',
      route: '/recruiter/interviews',
    },
    {
      step: '04',
      title: 'Release Payout',
      desc: 'Submit grading feedback and release session payout',
      color: '#8B5CF6',
      route: '/recruiter/revenue',
    },
  ];

  return (
    <DashboardLayout title="Recruiter Workspace">
      <div className="recruiter-dashboard-page">

        {/* ── 1. Full-Width Hero / Welcome Banner ── */}
        <section className="rd-hero-banner">
          <div className="rd-hero-content">
            <div className="rd-eyebrow-row">
              <span className="rd-eyebrow-badge">
                <HiSparkles /> Technical Hiring Hub
              </span>
              <span className="rd-date-pill">{currentDate}</span>
              <span className="rd-live-pill">
                <span className="rd-pulse-dot" /> Active Recruiter
              </span>
              
            </div>
            <h1>Good day, {displayName}!</h1>
            <p>
              Manage your interview pipeline, review student requests, conduct livekit technical drills, and track payouts.
            </p>
          </div>

          <div className="rd-hero-actions">
            <button
              type="button"
              className="rd-action-btn rd-action-primary"
              onClick={() => navigate('/recruiter/candidates')}
            >
              <FiUsers /> Review Candidates ({pendingRequests.length})
            </button>
            <button
              type="button"
              className="rd-action-btn rd-action-secondary"
              onClick={() => navigate('/recruiter/schedule')}
            >
              <FiCalendar /> Schedule Hub
            </button>
            <button
              type="button"
              className="rd-action-btn rd-action-secondary"
              onClick={() => navigate('/recruiter/interviews')}
            >
              <FiVideo /> Live Studio
            </button>
          </div>
        </section>

        {/* ── 2. Full-Width KPI Stat Cards Grid ── */}
        <section className="rd-stat-grid">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className="rd-kpi-card"
              onClick={() => navigate(kpi.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(kpi.route)}
            >
              <div className="rd-kpi-header">
                <div
                  className="rd-kpi-icon"
                  style={{ background: kpi.accentBg, color: kpi.accent }}
                >
                  {kpi.icon}
                </div>
                <span
                  className="rd-kpi-badge"
                  style={{ color: kpi.accent, background: kpi.accentBg }}
                >
                  {kpi.badge}
                </span>
              </div>
              <div className="rd-kpi-body">
                <div className="rd-kpi-value">{kpi.value}</div>
                <div className="rd-kpi-label">{kpi.label}</div>
                <div className="rd-kpi-trend">{kpi.trend}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── 3. Overview Highlights Row: Profile, Agenda & Earnings ── */}
        <section className="rd-highlights-row">
          
          {/* Profile Overview Card */}
          <div className="rd-highlight-card rd-profile-card">
            <div className="rd-profile-heading">
              <div className="rd-avatar-container">
                <img
                  src={
                    profile?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4f46e5&color=fff&size=128`
                  }
                  alt={displayName}
                  className="rd-profile-avatar"
                />
                <span className="rd-avatar-online-dot" />
              </div>
              <div className="rd-profile-meta">
                <strong>{displayName}</strong>
                <span>{profile?.designation || 'Technical Interviewer'}</span>
                <small>{profile?.company_name || 'Enterprise Hiring Partner'}</small>
              </div>
            </div>

            <div className="rd-profile-details">
              <div className="rd-profile-row">
                <span className="rd-row-label">Verification</span>
                <span className="rd-badge-verified">
                  <FiCheckCircle /> Verified Partner
                </span>
              </div>
              <div className="rd-profile-row">
                <span className="rd-row-label">Base Payout</span>
                <strong className="rd-rate-value">₹500 / Drill</strong>
              </div>
            </div>

            <Link to="/recruiter/profile" className="rd-profile-action-btn">
              Manage Profile Settings <FiArrowRight />
            </Link>
          </div>

          {/* Today's Agenda Card */}
          <div className="rd-highlight-card rd-agenda-card">
            <div className="rd-highlight-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCalendar style={{ color: 'var(--color-primary)' }} />
                <h3>Today's Agenda</h3>
              </div>
              <Link to="/recruiter/schedule" className="rd-highlight-link">
                Schedule Hub →
              </Link>
            </div>

            {todaySessions.length === 0 ? (
              <div className="rd-empty-side-box">
                <FiClock size={24} className="rd-empty-icon" />
                <p>No interviews scheduled for today.</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 4 }}>
                  Check awaiting requests below to assign slots
                </span>
              </div>
            ) : (
              <div className="rd-agenda-list">
                {todaySessions.slice(0, 3).map((session) => {
                  const ts = getSessionTimeStatus(session);
                  return (
                    <div key={session.id} className="rd-agenda-item">
                      <div className="rd-agenda-info">
                        <span className="rd-agenda-name">{getCandidateName(session)}</span>
                        <span className="rd-agenda-time">{formatTimeWindow(session)}</span>
                      </div>
                      <span
                        className="rd-agenda-status"
                        style={{ background: ts.bg, color: ts.color }}
                      >
                        {ts.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Earnings Card */}
          <div className="rd-highlight-card rd-earnings-card">
            <div className="rd-earnings-top">
              <span className="rd-earnings-title">
                <FiDollarSign /> Recruiter Earnings
              </span>
              <span className="rd-earnings-badge">Live Wallet</span>
            </div>
            <div className="rd-earnings-amount">
              {formatCurrency(metrics.total_earned)}
            </div>
            <div className="rd-earnings-sub">
              Total earnings across completed candidate sessions
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Link to="/recruiter/revenue" className="rd-earnings-link">
                View Detailed Analytics <FiArrowRight />
              </Link>
            </div>
          </div>

        </section>

        {/* ── 4. Candidate Requests & Pipeline Panel (Full Width) ── */}
        <section className="rd-panel rd-requests-panel">
          <div className="rd-panel-header">
            <div className="rd-panel-title-group">
              <div className="rd-panel-icon-circle">
                <FiUsers />
              </div>
              <div>
                <h2>Candidate Applications &amp; Drills</h2>
                <p>Technical drill requests and active session pipeline</p>
              </div>
            </div>

            <div className="rd-filter-tabs">
              <button
                type="button"
                className={`rd-tab-btn ${candidateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCandidateFilter('all')}
              >
                All ({allRequests.length})
              </button>
              <button
                type="button"
                className={`rd-tab-btn ${candidateFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setCandidateFilter('pending')}
              >
                Pending ({pendingRequests.length})
              </button>
              <button
                type="button"
                className={`rd-tab-btn ${candidateFilter === 'scheduled' ? 'active' : ''}`}
                onClick={() => setCandidateFilter('scheduled')}
              >
                Scheduled ({scheduledSessions.length})
              </button>
              <Link to="/recruiter/candidates" className="rd-panel-link">
                View All Candidates <FiChevronRight />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rd-loading-state">
              <FiLoader className="rd-spin" /> Loading candidates pipeline...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rd-empty-requests">
              <div className="rd-empty-requests-icon">
                <FiUsers size={30} />
              </div>
              <h3>No candidate requests found</h3>
              <p>When students apply for technical drills with you, they will appear right here.</p>
              <button
                type="button"
                className="rd-action-btn rd-action-primary"
                onClick={() => navigate('/recruiter/candidates')}
              >
                Browse All Candidates
              </button>
            </div>
          ) : (
            <div className="rd-requests-list">
              {filteredRequests.map((req) => {
                const status = String(req.status || 'pending').toLowerCase();
                const atsScore = getCandidateAts(req);
                return (
                  <div key={req.id} className="rd-request-card">
                    <div className="rd-request-left">
                      <div className="rd-request-avatar">
                        {getCandidateName(req).charAt(0).toUpperCase()}
                      </div>
                      <div className="rd-request-details">
                        <div className="rd-request-name-row">
                          <strong className="rd-request-name">{getCandidateName(req)}</strong>
                          <span className={`rd-status-pill rd-status-${status}`}>
                            {status === 'pending'
                              ? 'Pending Review'
                              : status === 'accepted'
                              ? 'Accepted'
                              : status === 'scheduled'
                              ? 'Scheduled'
                              : status === 'completed'
                              ? 'Completed'
                              : status}
                          </span>
                        </div>
                        <div className="rd-request-meta">
                          <span>{getCandidateRole(req)}</span>
                          <span className="rd-meta-dot">•</span>
                          <span className="rd-ats-box">
                            ATS Match Score: <strong className="rd-ats-highlight">{atsScore}%</strong>
                          </span>
                          {req.meeting_date && (
                            <>
                              <span className="rd-meta-dot">•</span>
                              <span className="rd-meta-date">
                                📅 {formatInterviewDate(req.meeting_date)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rd-request-actions">
                      {status === 'pending' ? (
                        <button
                          type="button"
                          className="rd-btn-sm rd-btn-primary"
                          onClick={() => navigate('/recruiter/candidates')}
                        >
                          Review &amp; Schedule
                        </button>
                      ) : status === 'accepted' || status === 'scheduled' ? (
                        <button
                          type="button"
                          className="rd-btn-sm rd-btn-success"
                          onClick={() => navigate(getInterviewSessionPath(req.id))}
                        >
                          <FiVideo /> Join Live Studio
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rd-btn-sm rd-btn-secondary"
                          onClick={() => navigate('/recruiter/candidates')}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 5. Workspace Quick Actions Hub (Full Width Grid) ── */}
        <section className="rd-panel rd-quick-actions-panel">
          <div className="rd-panel-header">
            <div className="rd-panel-title-group">
              <div className="rd-panel-icon-circle">
                <FiBarChart2 />
              </div>
              <div>
                <h2>Workspace Quick Actions</h2>
                <p>One-click access to candidate management, schedule hub, and live sessions</p>
              </div>
            </div>
          </div>

          <div className="rd-quick-actions-grid">
            {quickActions.map((action) => (
              <div
                key={action.label}
                className="rd-quick-action-card"
                onClick={() => navigate(action.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(action.route)}
              >
                <div
                  className="rd-quick-icon-wrap"
                  style={{ background: action.bg, color: action.color }}
                >
                  {action.icon}
                </div>
                <div className="rd-quick-card-body">
                  <strong>{action.label}</strong>
                  <p>{action.desc}</p>
                </div>
                <FiChevronRight className="rd-quick-card-arrow" />
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Recruiter Workflow Pipeline Guide (Full Width 4-Step Grid) ── */}
        <section className="rd-panel rd-workflow-panel">
          <div className="rd-panel-header">
            <div className="rd-panel-title-group">
              <div className="rd-panel-icon-circle">
                <HiSparkles />
              </div>
              <div>
                <h2>Interview Process Workflow</h2>
                <p>Standard 4-step guideline for technical hiring and evaluation drills</p>
              </div>
            </div>
          </div>

          <div className="rd-workflow-grid">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="rd-workflow-card"
                onClick={() => navigate(item.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(item.route)}
              >
                <div
                  className="rd-step-badge"
                  style={{ background: `${item.color}18`, color: item.color }}
                >
                  Step {item.step}
                </div>
                <h4 style={{ color: 'var(--color-text)' }}>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;