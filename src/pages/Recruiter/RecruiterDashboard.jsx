import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiArrowRight,
  FiVideo,
  FiBell,
  FiAward,
  FiTrendingUp,
  FiSearch,
  FiFileText,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import StatCard from '../../components/Dashboard/cards/StatCard';
import recruiterService from '../../services/recruiterService';

export const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await recruiterService.getDashboardOverview();
        if (isMounted) setData(res);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = data?.metrics || {
    pending_requests: 0,
    todays_interviews: 0,
    upcoming_interviews: 0,
    completed_interviews: 0,
    active_jobs: 0,
    total_applicants: 0,
  };

  const applicants = data?.recent_applicants || [];
  const schedule = data?.today_schedule || [];
  const profile = data?.profile;

  const rightSidebarContent = (
    <>
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
          <img
            src={
              profile?.avatar_url ||
              'https://i.pravatar.cc/120?img=68'
            }
            alt={profile?.full_name || 'Recruiter'}
            onError={(e) => {
              e.currentTarget.src = 'https://i.pravatar.cc/120?img=68';
            }}
            style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              {profile?.full_name || 'Recruiter'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {profile?.designation || 'Talent Acquisition Manager'}
              {profile?.company_name ? ` • ${profile.company_name}` : ''}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Verification Status:</span>
            <span className="badge-glass" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              {profile?.verification_status || 'Pending'} ✓
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Monthly Ranking:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Rank #4 (Top 5%)</span>
          </div>
        </div>
      </div>

      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCalendar style={{ color: 'var(--color-primary)' }} /> Today's Interviews
          </h4>
          <Link
            to="/recruiter/schedule"
            style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            View All
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {schedule.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>No interviews scheduled for today.</div>
          ) : (
            schedule.map((item, idx) => (
              <div
                key={idx}
                style={{ padding: '0.75rem', background: 'rgba(241, 245, 249, 0.8)', borderRadius: 'var(--radius-md)' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--color-muted)',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span>{item.time}</span>
                  <span className={`badge-${item.status === 'completed' ? 'success' : 'warning'}`}>
                    {item.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={item.img}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{item.role}</div>
                  </div>
                  <Link to="/recruiter/interviews" className="btn btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                    <FiVideo /> Join
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout title="Recruiter Dashboard" rightSidebar={rightSidebarContent}>
      <div
        className="glass-card mb-4"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(26, 188, 156, 0.1) 0%, rgba(11, 21, 51, 0.05) 100%)',
          border: '1px solid rgba(26, 188, 156, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge-glass" style={{ color: 'var(--color-primary)' }}>
                <HiSparkles /> Recruiter Portal
              </span>
              <span className="badge-glass" style={{ fontSize: '0.72rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--color-text)' }}>
              Welcome back, {profile?.full_name || 'Recruiter'} 👋
            </h2>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              Here is your talent pipeline summary for today.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/recruiter/jobs" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiPlus /> Post New Job
            </Link>
            <Link to="/recruiter/candidates" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiUsers /> Browse Candidates
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-responsive grid-col-4 mb-4">
        <StatCard icon={<FiClock />} title="Pending Requests" value={metrics.pending_requests} change="New requests" trend="up" />
        <StatCard icon={<FiCalendar />} title="Today's Interviews" value={metrics.todays_interviews} change="Today" trend="up" />
        <StatCard icon={<FiUsers />} title="Upcoming Interviews" value={metrics.upcoming_interviews} change="Next 7 Days" trend="up" />
        <StatCard icon={<FiCheckCircle />} title="Completed Interviews" value={metrics.completed_interviews} change="Total" trend="up" />
      </div>

      <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Pending Candidate Requests</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Candidates awaiting screening decision</span>
          </div>
          <Link to="/recruiter/candidates" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            View All Candidates →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applicants.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>No recent applicants yet.</div>
          ) : (
            applicants.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 240px' }}>
                  <img src={c.img} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                      {c.role} • {c.exp}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>{c.loc}</div>
                  </div>
                </div>

                <div style={{ minWidth: 100 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>ATS Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: c.ats >= 85 ? '#149174' : '#d97706' }}>
                    {c.ats}% Match
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxWidth: 200 }}>
                  {c.skills?.map((s) => (
                    <span key={s} className="badge-glass" style={{ fontSize: '0.7rem' }}>
                      {s}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/recruiter/candidates" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    View Profile
                  </Link>
                  <button
                    onClick={() => alert(`Interview request accepted for ${c.name}`)}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;