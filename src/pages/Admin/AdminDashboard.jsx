import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiUsers, FiCheckCircle, FiAlertCircle, FiActivity, FiDollarSign,
  FiUserCheck, FiShield, FiBell, FiSliders, FiFileText, FiRefreshCw, FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import { useAuth } from '../../context/AuthContext';
import useRealtime from '../../hooks/useRealtime';
import adminService from '../../services/adminService';

const CustomTooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [subStats, setSubStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, sub, g, r, t, rev, a] = await Promise.all([
        adminService.fetchDashboardStats(),
        adminService.fetchSubscriptionStats(),
        adminService.fetchUserGrowthChart(),
        adminService.fetchRoleDistribution(),
        adminService.fetchInterviewTrend(),
        adminService.fetchRevenueTrendChart(),
        adminService.fetchRecentActivity(12),
      ]);
      setStats(s);
      setSubStats(sub);
      setGrowthData(g);
      setRoleData(r);
      setTrendData(t);
      setRevenueData(rev);
      setActivity(a);
    } catch (err) {
      toast.error('Failed to load admin telemetry data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useRealtime(['profiles', 'interview_requests', 'notifications', 'student_payments'], loadDashboardData);

  const kpis = [
    {
      icon: <FiUsers />,
      label: 'Total Students',
      value: stats?.totalStudents ?? '—',
      sub: `${subStats?.freeUsers ?? 0} Free · ${subStats?.premiumSubscribers ?? 0} Premium`,
      accent: 'var(--color-primary)',
    },
    {
      icon: <FiCheckCircle />,
      label: 'Total Recruiters',
      value: stats?.totalRecruiters ?? '—',
      sub: `${stats?.pendingVerifications ?? 0} pending verification`,
      accent: 'var(--color-secondary)',
    },
    {
      icon: <FiActivity />,
      label: 'Interviews Scheduled',
      value: stats?.totalInterviews ?? '—',
      sub: 'Total technical drills',
      accent: 'var(--color-accent)',
    },
    {
      icon: <FiDollarSign />,
      label: 'Total Platform Revenue',
      value: subStats ? `₹${(subStats.totalRevenue || 0).toLocaleString()}` : '—',
      sub: `₹${(subStats?.monthlyRevenue || 0).toLocaleString()} this month`,
      accent: 'var(--color-success)',
    },
    // {
    //   icon: <FiAlertCircle />,
    //   label: 'Pending Queue',
    //   value: stats?.pendingVerifications ?? '—',
    //   sub: 'Action required',
    //   accent: 'var(--color-warning)',
    // },
  ];

  const quickActions = [
    { label: 'Recruiter Queue', icon: <FiUserCheck />, accent: 'var(--color-warning)', path: '/admin/recruiter-verification' },
    { label: 'User Directory', icon: <FiUsers />, accent: 'var(--color-primary)', path: '/admin/users' },
    { label: 'Subscriptions', icon: <FiDollarSign />, accent: 'var(--color-success)', path: '/admin/subscriptions' },
    { label: 'Security Audit', icon: <FiShield />, accent: 'var(--color-secondary)', path: '/admin/audit-logs' },
    { label: 'Notifications', icon: <FiBell />, accent: 'var(--color-accent)', path: '/admin/notifications' },
    { label: 'Settings', icon: <FiSliders />, accent: 'var(--color-muted)', path: '/admin/settings' },
  ];

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
    <AdminLayout
      title={`Welcome back, ${user?.name || 'Administrator'} `}
      subtitle="Real-time SaaS administrative console pulling verified metrics from Supabase."
      onRefresh={loadDashboardData}
      refreshing={loading}
    >
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {kpis.map((k) => (
          <AdminStatCard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      {/* Quick Action Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--color-muted)',
            display: 'flex',
            alignItems: 'center',
            marginRight: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Quick Shortcuts:
        </span>
        {quickActions.map((q) => (
          <button
            key={q.label}
            onClick={() => navigate(q.path)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: `${q.accent}12`,
              border: `1px solid ${q.accent}33`,
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${q.accent}25`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${q.accent}12`;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{ color: q.accent }}>{q.icon}</span> {q.label}
          </button>
        ))}
      </div>

      {/* Charts Section Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* User Growth Line Chart */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            User Growth Trend
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Monthly student and recruiter account registrations
          </div>
          {growthData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No registration history available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="Students" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-primary)' }} />
                <Line type="monotone" dataKey="Recruiters" stroke="var(--color-secondary)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-secondary)' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Role Distribution Donut Chart */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Role Distribution
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Platform account composition
          </div>
          {roleData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No user role distribution data
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="55%" height={190}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {roleData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill || 'var(--color-primary)'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {roleData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>{d.value}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{d.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revenue Trend Area Chart */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Revenue Accumulation Trend
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Monthly gross subscription revenue (INR)
          </div>
          {revenueData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No payments recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Area type="monotone" dataKey="Revenue" stroke="var(--color-success)" fillOpacity={1} fill="url(#revenueGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Interview Requests Bar Chart */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Interview Request Activity
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Weekly scheduled technical mock drills
          </div>
          {trendData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No interview requests data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Total" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Accepted" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Live System Activity Feed */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
              <FiZap style={{ color: 'var(--color-warning)' }} /> Live Platform Activity Feed
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: 2 }}>
              Real-time events streaming from Supabase notification service
            </div>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
            }}
          >
            ● LIVE REALTIME
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 54,
                  background: 'var(--color-surface-sec)',
                  borderRadius: 'var(--radius-md)',
                  animation: 'adminPulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            No platform activity events recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activity.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'center',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-surface-sec)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.message}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{formatTime(n.created_at)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 800, marginTop: 2, textTransform: 'uppercase' }}>
                    {n.notification_type || 'system'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
