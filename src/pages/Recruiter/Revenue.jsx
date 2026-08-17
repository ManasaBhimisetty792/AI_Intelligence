import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import {
  FiDollarSign, FiClock, FiCheckCircle, FiAward, FiDownload, FiFilter,
  FiTrendingUp, FiCreditCard, FiArrowUpRight, FiSearch, FiChevronLeft, FiChevronRight,
  FiPieChart, FiBarChart2, FiCheck, FiX, FiInfo, FiBriefcase, FiSend, FiLoader
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const CustomTooltipStyle = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  color: 'var(--color-text)',
  boxShadow: 'var(--shadow-md)',
};

export const Revenue = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('3200');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const itemsPerPage = 5;

  // Static Demonstration Overview Data
  const overview = {
    monthly_revenue: 14850.00,
    pending_payouts: 3200.00,
    paid_history: 48900.00,
    performance_bonus: 1500.00,
    expected_payout: 4700.00,
    ranking: 4,
  };

  // Chart 1: Monthly Revenue Trend (Jan - Jul 2026)
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 6200, bonus: 500, total: 6700 },
    { month: 'Feb', revenue: 7800, bonus: 500, total: 8300 },
    { month: 'Mar', revenue: 9100, bonus: 1000, total: 10100 },
    { month: 'Apr', revenue: 8400, bonus: 500, total: 8900 },
    { month: 'May', revenue: 11200, bonus: 1000, total: 12200 },
    { month: 'Jun', revenue: 13500, bonus: 1500, total: 15000 },
    { month: 'Jul', revenue: 14850, bonus: 1500, total: 16350 },
  ];

  // Chart 2: Earnings Breakdown by Interview Category
  const categoryBreakdownData = [
    { name: 'System Design & Arch', value: 5940, percentage: '40%', color: '#10b981' },
    { name: 'Full Stack React & Node', value: 4455, percentage: '30%', color: '#3b82f6' },
    { name: 'AI & LLM Integration', value: 2673, percentage: '18%', color: '#8b5cf6' },
    { name: 'Behavioral & Leadership', value: 1782, percentage: '12%', color: '#f59e0b' },
  ];

  // Chart 3: Monthly Conducted Drills vs Average Fee
  const sessionVolumeData = [
    { month: 'Jan', drills: 12, avgFee: 516 },
    { month: 'Feb', drills: 15, avgFee: 520 },
    { month: 'Mar', drills: 18, avgFee: 561 },
    { month: 'Apr', drills: 16, avgFee: 525 },
    { month: 'May', drills: 22, avgFee: 554 },
    { month: 'Jun', drills: 27, avgFee: 555 },
    { month: 'Jul', drills: 30, avgFee: 545 },
  ];

  // Transactions Ledger
  const transactions = [
    { id: 'TXN-9021', date: '2026-08-10', description: 'System Design Mock Drill — Akhila Reddy', type: 'Interview Fee', amount: 500.00, status: 'Completed' },
    { id: 'TXN-8994', date: '2026-08-08', description: 'Full Stack Technical Evaluation — Rahul Kumar', type: 'Interview Fee', amount: 500.00, status: 'Completed' },
    { id: 'TXN-8910', date: '2026-08-05', description: 'Monthly Top Recruiter Milestone Bonus', type: 'Bonus', amount: 1500.00, status: 'Completed' },
    { id: 'TXN-8842', date: '2026-08-01', description: 'Payout Withdrawal to HDFC Bank (****4821)', type: 'Withdrawal', amount: -5000.00, status: 'Completed' },
    { id: 'TXN-8790', date: '2026-07-28', description: 'AI & LLM Integration Drill — Sneha Patel', type: 'Interview Fee', amount: 500.00, status: 'Pending' },
    { id: 'TXN-8712', date: '2026-07-25', description: 'React & Frontend Deep Dive — Vikram Malhotra', type: 'Interview Fee', amount: 500.00, status: 'Completed' },
    { id: 'TXN-8650', date: '2026-07-20', description: 'Behavioral & Leadership Drill — Ananya Sharma', type: 'Interview Fee', amount: 500.00, status: 'Pending' },
  ];

  // Bank Accounts List
  const bankAccounts = [
    { id: 'hdfc', bankName: 'HDFC Bank', accNo: '****4821', holder: 'Priya Sharma', isPrimary: true },
    { id: 'icici', bankName: 'ICICI Bank', accNo: '****9012', holder: 'Priya Sharma', isPrimary: false },
  ];

  const withdrawHistory = [
    { date: '01 Aug, 2026', amount: '₹5,000.00', account: 'HDFC Bank (****4821)', status: 'Completed' },
    { date: '15 Jul, 2026', amount: '₹4,500.00', account: 'HDFC Bank (****4821)', status: 'Completed' },
    { date: '01 Jul, 2026', amount: '₹6,200.00', account: 'HDFC Bank (****4821)', status: 'Completed' },
  ];

  // Filter logic
  const filteredTxns = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter || t.type.includes(statusFilter);
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage) || 1;
  const paginatedTxns = filteredTxns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Transaction ID,Date,Description,Type,Amount (INR),Status\n'];
    const rows = filteredTxns.map((t) => `${t.id},${t.date},"${t.description}",${t.type},${t.amount},${t.status}`);
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiter_revenue_statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Financial statement downloaded as CSV');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    setSubmittingPayout(true);
    setTimeout(() => {
      setSubmittingPayout(false);
      setIsModalOpen(false);
      toast.success(`Payout withdrawal request of ₹${Number(withdrawAmount).toLocaleString()} submitted to HDFC Bank (****4821)!`);
    }, 800);
  };

  return (
    <DashboardLayout title="Recruiter Financial Intelligence & Revenue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

        {/* HERO BANNER & FUTURE ENHANCEMENT NOTICE */}
        <div
          style={{
            padding: '1.4rem 1.6rem',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(79, 70, 229, 0.12))',
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
              <HiSparkles /> Recruiter Earnings &amp; Compensation Analytics
            </div>
            <h1 style={{ margin: '0.2rem 0 0.4rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Revenue &amp; Payout Control Dashboard
            </h1>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.88rem', maxWidth: 680 }}>
              Track interview session fees (₹500/drill), milestone performance bonuses, monthly growth trends, and automated bank payouts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)', color: '#fff',
                fontWeight: 800, fontSize: '0.84rem', border: 'none', cursor: 'pointer',
                boxShadow: 'var(--shadow-glow-primary)',
              }}
            >
              <FiDollarSign /> Request Payout Withdrawal
            </button>
            <button
              onClick={exportCSV}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.7rem 1.1rem', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                color: 'var(--color-text)', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
              }}
            >
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* OVERVIEW STAT CARDS (4 CARDS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>
                <FiDollarSign />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700 }}>Monthly Revenue</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{overview.monthly_revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
              +18.4% vs previous month
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>
                <FiClock />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700 }}>Pending Payouts</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{overview.pending_payouts.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-warning)', fontWeight: 700, marginTop: '0.25rem' }}>
              Release Date: Aug 20, 2026
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>
                <FiCheckCircle />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700 }}>Paid History (Lifetime)</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{overview.paid_history.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
              Settled into bank account
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'grid', placeItems: 'center', fontSize: '1.1rem' }}>
                <FiAward />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 700 }}>Milestone Bonus</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{overview.performance_bonus.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '0.25rem' }}>
              Recruiter Rank: #{overview.ranking} (Top 5%)
            </div>
          </div>
        </div>

        {/* MULTI-CHART ANALYTICS ROW 1: REVENUE GROWTH (AREA) + CATEGORY BREAKDOWN (PIE) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>

          {/* CHART 1: MONTHLY REVENUE GROWTH (AREA CHART) */}
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiTrendingUp style={{ color: 'var(--color-primary)' }} /> Monthly Revenue Growth Trend
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Session fees vs milestone performance bonuses (Jan – Jul 2026)</span>
              </div>
              <span className="badge-glass" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                Next Forecast: ₹{overview.expected_payout.toLocaleString()}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="recruiterRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="recruiterBonusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'revenue' ? 'Interview Session Fees' : 'Milestone Bonus']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" name="Interview Session Fees" stroke="#10b981" fillOpacity={1} fill="url(#recruiterRevGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="bonus" name="Milestone Bonus" stroke="#6366f1" fillOpacity={1} fill="url(#recruiterBonusGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CHART 2: EARNINGS BREAKDOWN BY INTERVIEW CATEGORY (DONUT / PIE CHART) */}
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiPieChart style={{ color: 'var(--color-primary)' }} /> Category Earnings Breakdown
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Revenue share by technical interview domain</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="50%" height={210}>
                <PieChart>
                  <Pie data={categoryBreakdownData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={4} dataKey="value">
                    {categoryBreakdownData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {categoryBreakdownData.map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                        ₹{cat.value.toLocaleString()} ({cat.percentage})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* MULTI-CHART ROW 2: SESSION VOLUME (BAR) + WITHDRAW HISTORY & BANK ACCOUNTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>

          {/* CHART 3: MONTHLY CONDUCTED DRILLS (BAR CHART) */}
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiBarChart2 style={{ color: 'var(--color-primary)' }} /> Monthly Conducted Drill Volume
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Total student interview sessions conducted per month</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 4 }}>
                30 Drills in Jul
              </span>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(val, name) => [val, name === 'drills' ? 'Completed Sessions' : 'Avg Fee (₹)']} />
                <Bar dataKey="drills" name="Completed Sessions" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* WITHDRAWAL HISTORY & LINKED BANK ACCOUNTS CARD */}
          <div
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              backdropFilter: 'var(--glass-blur)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiCreditCard style={{ color: 'var(--color-primary)' }} /> Linked Payout Accounts
                </h3>
                <span className="badge-glass" style={{ color: 'var(--color-primary)', fontSize: '0.72rem', fontWeight: 800 }}>
                  Auto-Settlement Active
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-sec)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--color-text)' }}>
                        {b.bankName} ({b.accNo})
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                        Holder: {b.holder}
                      </div>
                    </div>
                    {b.isPrimary && (
                      <span style={{ fontSize: '0.68rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 9999, fontWeight: 800 }}>
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <FiDollarSign /> Request Payout Withdrawal (₹{overview.pending_payouts.toLocaleString()})
            </button>
          </div>

        </div>

        {/* DETAILED TRANSACTION HISTORY & LEDGER TABLE */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Transaction History &amp; Financial Ledger
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                Audit log of candidate session fees, performance bonuses, and bank withdrawals
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['All', 'Completed', 'Pending', 'Bonus'].map((st) => (
                  <button
                    key={st}
                    onClick={() => { setStatusFilter(st); setPage(1); }}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: statusFilter === st ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: statusFilter === st ? 'var(--gradient-primary)' : 'var(--color-surface)',
                      color: statusFilter === st ? '#fff' : 'var(--color-text)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: 200 }}>
                <FiSearch style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-muted)' }} />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{
                    width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                    fontSize: '0.8rem', background: 'var(--color-surface)', color: 'var(--color-text)',
                  }}
                />
              </div>

              <button
                onClick={exportCSV}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <FiDownload /> Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTxns.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{t.id}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>{t.date}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{t.description}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>{t.type}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: t.amount > 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                      {t.amount > 0 ? `+₹${t.amount.toFixed(2)}` : `-₹${Math.abs(t.amount).toFixed(2)}`}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: t.status === 'Completed' ? 'var(--color-primary-light)' : 'var(--color-warning-light)',
                          color: t.status === 'Completed' ? 'var(--color-primary)' : 'var(--color-warning)',
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              Showing Page {page} of {totalPages} ({filteredTxns.length} total ledger records)
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* PAYOUT WITHDRAWAL REQUEST MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: '1.75rem', width: '100%', maxWidth: '480px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiDollarSign style={{ color: 'var(--color-primary)' }} /> Request Payout Withdrawal
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem' }}>
                  Available Balance
                </label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{overview.pending_payouts.toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem' }}>
                  Withdrawal Amount (INR ₹)
                </label>
                <input
                  type="number"
                  max={overview.pending_payouts}
                  min={100}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-sec)',
                    color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 800, outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '0.35rem' }}>
                  Destination Bank Account
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', background: 'var(--color-surface-sec)',
                    color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 700, outline: 'none',
                  }}
                >
                  <option value="hdfc">HDFC Bank — ****4821 (Primary)</option>
                  <option value="icici">ICICI Bank — ****9012</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-sec)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  style={{
                    flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-primary)', border: 'none',
                    color: '#fff', fontWeight: 800, cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow-primary)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}
                >
                  {submittingPayout ? <FiLoader className="spin-animation" /> : <FiSend />} Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Revenue;