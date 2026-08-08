import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiShield, FiUsers, FiCheckCircle, FiCreditCard, FiAlertCircle,
  FiActivity, FiTrendingUp, FiServer, FiBell, FiUserCheck,
  FiFileText, FiRefreshCw, FiLoader, FiAward, FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import useRealtime from '../../hooks/useRealtime';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, accent, loading }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${accent}22`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: '1.1rem' }}>
        {icon}
      </div>
    </div>
    {loading ? (
      <div style={{ height: 32, background: 'rgba(255,255,255,0.06)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
    ) : (
      <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{value}</div>
    )}
    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: accent, fontWeight: 600 }}>{sub}</div>}
  </div>
);

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
const ChartWrapper = ({ title, subtitle, children, action }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const CustomTooltipStyle = { background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: '0.8rem', color: '#fff' };

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, g, p, t, a] = await Promise.all([
        adminService.fetchDashboardStats(),
        adminService.fetchUserGrowthChart(),
        adminService.fetchRoleDistribution(),
        adminService.fetchInterviewTrend(),
        adminService.fetchRecentActivity(12),
      ]);
      setStats(s);
      setGrowthData(g);
      setPieData(p);
      setTrendData(t);
      setActivity(a);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useRealtime(['profiles', 'interview_requests', 'notifications'], loadAll);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const kpis = [
    { icon: <FiUsers />, label: 'Total Students', value: stats?.totalStudents ?? '—', sub: 'Registered learners', accent: '#4F46E5' },
    { icon: <FiCheckCircle />, label: 'Total Recruiters', value: stats?.totalRecruiters ?? '—', sub: `${stats?.pendingVerifications ?? 0} pending approval`, accent: '#10B981' },
    { icon: <FiAlertCircle />, label: 'Pending Verifications', value: stats?.pendingVerifications ?? '—', sub: 'Recruiter queue', accent: '#F59E0B' },
    { icon: <FiActivity />, label: 'Interviews Scheduled', value: stats?.totalInterviews ?? '—', sub: 'All time requests', accent: '#06B6D4' },
    { icon: <FiBell />, label: 'Unread Notifications', value: stats?.unreadNotifications ?? '—', sub: 'Platform-wide', accent: '#EF4444' },
  ];

  const quickActions = [
    { label: 'Verify Recruiters', icon: <FiUserCheck />, accent: '#7C3AED', path: '/admin/recruiter-verification' },
    { label: 'Manage Users', icon: <FiUsers />, accent: '#4F46E5', path: '/admin/user-management' },
    { label: 'Audit Logs', icon: <FiShield />, accent: '#10B981', path: '/admin/audit-logs' },
    { label: 'Notifications', icon: <FiBell />, accent: '#F59E0B', path: '/admin/notifications' },
    { label: 'Settings', icon: <FiServer />, accent: '#06B6D4', path: '/admin/platform-settings' },
  ];

  const typeColors = {
    interview_request: '#4F46E5', interview_accepted: '#10B981',
    interview_rejected: '#EF4444', feedback_submitted: '#F59E0B',
    admin: '#7C3AED', system: '#64748B',
  };
  const getColor = (t) => {
    const type = (t || '').toLowerCase();
    for (const [k, v] of Object.entries(typeColors)) { if (type.includes(k)) return v; }
    return '#64748B';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const mins = Math.floor((Date.now() - d) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* ── Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.1) 50%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid rgba(79,70,229,0.25)',
        borderRadius: 20,
        padding: '2rem 2.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FiShield /> ADMIN PORTAL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{currentDate}</span>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '0 0 0.3rem', color: 'var(--color-text)' }}>
              Welcome back, {user?.name || 'Administrator'} 👋
            </h2>
            <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.88rem' }}>
              Platform overview — all metrics pulling live from Supabase.
            </p>
          </div>
          <button
            onClick={loadAll}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} loading={loading} />)}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {quickActions.map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.25rem', borderRadius: 10,
              background: `${q.accent}15`, border: `1px solid ${q.accent}40`,
              color: q.accent, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${q.accent}25`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${q.accent}15`; e.currentTarget.style.transform = 'none'; }}
          >
            {q.icon} {q.label}
          </button>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>

        {/* User Growth Line Chart */}
        <ChartWrapper title="User Growth" subtitle="Monthly student & recruiter registrations">
          {growthData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              {loading ? <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem', color: '#4F46E5' }} /> : 'No growth data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="Students" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3, fill: '#4F46E5' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Recruiters" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartWrapper>

        {/* Role Distribution Donut */}
        <ChartWrapper title="Role Distribution" subtitle="Platform account breakdown">
          {pieData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              {loading ? <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem', color: '#7C3AED' }} /> : 'No data yet'}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)' }}>{d.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{d.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartWrapper>

        {/* Interview Trend Bar Chart */}
        <ChartWrapper title="Interview Requests" subtitle="Weekly activity from Supabase">
          {trendData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              {loading ? <FiLoader style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem', color: '#06B6D4' }} /> : 'No interview data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Total" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Accepted" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartWrapper>
      </div>

      {/* ── Live Activity Feed ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiZap style={{ color: '#F59E0B' }} /> Live Activity Feed
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 2 }}>Real-time platform events from Supabase</div>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '0.2rem 0.6rem', borderRadius: 999, fontWeight: 700 }}>
            ● LIVE
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 56, background: 'rgba(255,255,255,0.04)', borderRadius: 10, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            No recent activity. Events will appear here in real-time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {activity.map((n) => {
              const color = getColor(n.notification_type);
              return (
                <div key={n.id} style={{
                  display: 'flex', gap: '0.85rem', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: 10,
                  background: `${color}0D`, border: `1px solid ${color}22`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{formatTime(n.created_at)}</div>
                    <div style={{ fontSize: '0.65rem', color, fontWeight: 700, marginTop: 2, textTransform: 'uppercase' }}>{n.notification_type || 'system'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminDashboard;
