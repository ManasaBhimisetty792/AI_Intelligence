import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import {
  FiCreditCard, FiDollarSign, FiUsers, FiAward, FiDownload, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import AdminDataTable from '../../components/Admin/AdminDataTable';
import adminService from '../../services/adminService';
import useRealtime from '../../hooks/useRealtime';

const CustomTooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

const exportTransactionsCSV = (transactions) => {
  const headers = ['Order ID', 'Payment ID', 'User Name', 'User Email', 'Plan Name', 'Amount', 'Currency', 'Status', 'Invoice Number', 'Transaction Date'];
  const rows = transactions.map((t) => [
    t.order_id || '',
    t.payment_id || '',
    t.user_name || 'User',
    t.user_email || '',
    t.plan_name || 'Student Premium',
    t.amount || 0,
    t.currency || 'INR',
    t.status || 'success',
    t.invoice_number || '',
    t.created_at ? new Date(t.created_at).toLocaleString() : '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subscription_payments_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const SubscriptionManagement = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [tierDistribution, setTierDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadSubscriptionData = useCallback(async () => {
    setLoading(true);
    try {
      const [st, tx, rev, dist] = await Promise.all([
        adminService.fetchSubscriptionStats(),
        adminService.fetchSubscriptionTransactions(150),
        adminService.fetchRevenueTrendChart(),
        adminService.fetchSubscriptionDistributionChart(),
      ]);
      setStats(st);
      setTransactions(tx);
      setRevenueTrend(rev);
      setTierDistribution(dist);
    } catch (err) {
      toast.error('Failed to load subscription metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  useRealtime(['student_payments', 'student_subscriptions', 'profiles', 'candidate_profiles'], loadSubscriptionData);

  const filteredTransactions = transactions.filter((t) => {
    const matchPlan = planFilter === 'all' || (t.plan_name || '').toLowerCase().includes(planFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || (t.status || 'success').toLowerCase() === statusFilter.toLowerCase();
    return matchPlan && matchStatus;
  });

  const kpis = [
    {
      icon: <FiDollarSign />,
      label: 'Total Revenue Generated',
      value: stats ? `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '—',
      sub: `₹999 × ${stats?.premiumSubscribers ?? 0} premium members`,
      accent: 'var(--color-success)',
    },
    // {
    //   icon: <FiTrendingUp />,
    //   label: 'This Month Revenue',
    //   value: stats ? `₹${(stats.monthlyRevenue || 0).toLocaleString('en-IN')}` : '—',
    //   sub: 'Current month revenue',
    //   accent: 'var(--color-primary)',
    // },
    {
      icon: <FiAward />,
      label: 'Pro Premium Subscribers',
      value: stats?.premiumSubscribers ?? '—',
      sub: '₹999/member • Active premium plans',
      accent: '#059669',
    },
    {
      icon: <FiUsers />,
      label: 'Free Students',
      value: stats?.freeStudents ?? stats?.freeUsers ?? '—',
      sub: 'On free starter plan',
      accent: '#64748b',
    },
    {
      icon: <FiCreditCard />,
      label: 'Payment Records',
      value: transactions.length,
      sub: `${transactions.length} verified transactions`,
      accent: 'var(--color-warning)',
    },
  ];

  const columns = [
    {
      header: 'Invoice / Order ID',
      accessor: 'order_id',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.85rem' }}>{r.invoice_number || r.order_id}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>{r.order_id}</div>
        </div>
      ),
    },
    {
      header: 'Subscriber',
      searchValue: (r) => `${r.user_name || ''} ${r.user_email || ''}`,
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.87rem' }}>{r.user_name}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>{r.user_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan_name',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#059669',
              background: 'rgba(5,150,105,0.1)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
            }}
          >
            {r.plan_name || 'Student Premium'}
          </span>
        </div>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      render: (r) => (
        <span style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.9rem' }}>
          ₹{Number(r.amount || 999).toLocaleString('en-IN')}
          <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginLeft: 4 }}>{r.currency || 'INR'}</span>
        </span>
      ),
    },
    {
      header: 'Subscription Period',
      render: (r) => (
        <div style={{ fontSize: '0.77rem', color: 'var(--color-muted)' }}>
          <div>Start: <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{r.premium_start_date ? new Date(r.premium_start_date).toLocaleDateString('en-IN') : '—'}</span></div>
          <div>End: <span style={{ fontWeight: 700, color: r.premium_end_date ? 'var(--color-text)' : 'var(--color-muted)' }}>{r.premium_end_date ? new Date(r.premium_end_date).toLocaleDateString('en-IN') : 'Lifetime'}</span></div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (r) => {
        const isSuccess = (r.status || 'success').toLowerCase() === 'success';
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              background: isSuccess ? 'rgba(5,150,105,0.12)' : 'var(--color-danger-light)',
              color: isSuccess ? '#059669' : 'var(--color-danger)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {isSuccess ? <FiCheckCircle /> : <FiXCircle />} {isSuccess ? 'Paid' : r.status}
          </span>
        );
      },
    },
    {
      header: 'Transaction Date',
      render: (r) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
          {r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Subscription Tiers & Revenue Analytics"
      subtitle="Track active student plans, recurring billing revenue, and Razorpay transaction records."
      onRefresh={loadSubscriptionData}
      refreshing={loading}
      actions={
        <button
          onClick={() => exportTransactionsCSV(filteredTransactions)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <FiDownload /> Export Payments CSV
        </button>
      }
    >
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {kpis.map((k) => (
          <AdminStatCard key={k.label} {...k} loading={loading} />
        ))}
      </div>

      {/* Revenue & Distribution Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Revenue Trend */}
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
            Monthly Revenue Trend (INR)
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Revenue generated — ₹999 per premium subscriber
          </div>
          {revenueTrend.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No revenue data recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  formatter={(value, name) => name === 'Revenue' ? [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'] : [value, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Revenue" stroke="#059669" fillOpacity={1} fill="url(#revenueGrad2)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Subscribers" stroke="#2563EB" fill="none" strokeWidth={2} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subscription Tier Distribution */}
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
            Subscription Tier Breakdown
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Free Students vs Pro Premium (₹999) vs Recruiters
          </div>
          {tierDistribution.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No tier breakdown data
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="55%" height={190}>
                <PieChart>
                  <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {tierDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill || 'var(--color-primary)'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {tierDistribution.map((d) => (
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
      </div>

      {/* Filter Control Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)' }}>Plan Filter:</label>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Plans</option>
            <option value="premium">Student Premium ₹999</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)' }}>Payment Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <AdminDataTable
        columns={columns}
        data={filteredTransactions}
        loading={loading}
        searchPlaceholder="Search by subscriber name, email, or invoice ID..."
        emptyTitle="No premium subscriptions found"
        emptySub="No users have purchased the ₹999 premium plan yet."
      />
    </AdminLayout>
  );
};

export default SubscriptionManagement;
