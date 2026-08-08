import React, { useEffect, useState } from 'react';
import {
  FiDollarSign, FiClock, FiCheckCircle, FiAward, FiDownload, FiFilter,
  FiTrendingUp, FiCreditCard, FiArrowUpRight, FiSearch, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';

export const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    recruiterService.getRevenueData().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.warn('Revenue data fetch error:', err);
      setLoading(false);
    });
  }, []);

  const overview = data?.overview || {
    monthly_revenue: 14850.00,
    pending_payouts: 3200.00,
    paid_history: 48900.00,
    performance_bonus: 1500.00,
    expected_payout: 4700.00,
    ranking: 4,
  };

  const monthlyChart = data?.monthly_chart || [
    { month: 'Jan', amount: 6200 },
    { month: 'Feb', amount: 7800 },
    { month: 'Mar', amount: 9100 },
    { month: 'Apr', amount: 8400 },
    { month: 'May', amount: 11200 },
    { month: 'Jun', amount: 13500 },
    { month: 'Jul', amount: 14850 },
  ];

  const transactions = data?.transactions || [
    { id: 'TXN-8091', date: '2026-07-28', description: 'Candidate Placement Fee - Akhila Reddy', type: 'Placement Commission', amount: 2500.00, status: 'Completed' },
    { id: 'TXN-8044', date: '2026-07-25', description: 'Monthly Performance Milestone Bonus', type: 'Bonus', amount: 1500.00, status: 'Completed' },
    { id: 'TXN-7982', date: '2026-07-20', description: 'Candidate Placement Fee - Rahul Kumar', type: 'Placement Commission', amount: 3200.00, status: 'Pending' },
    { id: 'TXN-7910', date: '2026-07-15', description: 'Withdrawal to Chase Bank (****4821)', type: 'Withdrawal', amount: -5000.00, status: 'Completed' },
    { id: 'TXN-7855', date: '2026-07-10', description: 'Candidate Placement Fee - Sneha Patel', type: 'Placement Commission', amount: 2100.00, status: 'Completed' },
  ];

  const withdrawHistory = data?.withdraw_history || [
    { date: '15 Jul, 2026', amount: '$5,000.00', account: 'Chase Bank (****4821)', status: 'Completed' },
    { date: '01 Jul, 2026', amount: '$4,500.00', account: 'Chase Bank (****4821)', status: 'Completed' },
    { date: '15 Jun, 2026', amount: '$6,200.00', account: 'Chase Bank (****4821)', status: 'Completed' },
  ];

  // Filtering transactions
  const filteredTxns = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage) || 1;
  const paginatedTxns = filteredTxns.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Transaction ID,Date,Description,Type,Amount,Status\n'];
    const rows = filteredTxns.map((t) => `${t.id},${t.date},"${t.description}",${t.type},${t.amount},${t.status}`);
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiter_revenue_statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const maxChartAmount = Math.max(...monthlyChart.map((m) => m.amount));

  return (
    <DashboardLayout title="Revenue & Payout Analytics">
      {/* Overview Stat Cards Grid */}
      <div className="grid-responsive grid-col-4 mb-4">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#e6f9f4', color: '#149174', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiDollarSign size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Monthly Revenue</div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>
            ${overview.monthly_revenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#149174', fontWeight: 600, marginTop: '0.2rem' }}>
            +18.4% vs last month
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#fef3e0', color: '#b8860b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiClock size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Pending Payouts</div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>
            ${overview.pending_payouts.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#b8860b', fontWeight: 600, marginTop: '0.2rem' }}>
            Release date: Aug 5, 2026
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCheckCircle size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Paid History (Lifetime)</div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>
            ${overview.paid_history.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
            Total payouts received
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAward size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Performance Bonus</div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text)' }}>
            ${overview.performance_bonus.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
            Recruiter Rank: #{overview.ranking}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Chart & Withdraw History Row */}
      <div className="grid-responsive grid-col-3 mb-4" style={{ gap: '1.5rem' }}>
        {/* Visual Revenue Growth Chart */}
        <div className="glass-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Monthly Revenue Growth</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Earnings breakdown across past 7 months</span>
            </div>
            <span className="badge-glass" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Expected Next: ${overview.expected_payout.toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: 180, paddingTop: '1rem', borderBottom: '1px solid #eef1f5' }}>
            {monthlyChart.map((m) => {
              const heightPct = Math.round((m.amount / maxChartAmount) * 100);
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)' }}>${(m.amount / 1000).toFixed(1)}k</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #1abc9c 0%, #149174 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdrawal History Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCreditCard style={{ color: 'var(--color-primary)' }} /> Withdraw History
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {withdrawHistory.map((w, idx) => (
              <div key={idx} style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #eef1f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{w.amount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{w.account} • {w.date}</div>
                </div>
                <span className="badge-success" style={{ fontSize: '0.7rem' }}>{w.status}</span>
              </div>
            ))}
          </div>

          <button onClick={() => alert('Withdrawal request modal opened')} className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.55rem', fontSize: '0.82rem' }}>
            Request Payout Withdrawal
          </button>
        </div>
      </div>

      {/* Detailed Transaction History Table with Filters, Pagination, & Export */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Transaction History & Ledger</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Complete audit trail of commissions and payouts</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['All', 'Completed', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setPage(1); }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: statusFilter === st ? '1px solid #1abc9c' : '1px solid #e2e8f0',
                    background: statusFilter === st ? '#1abc9c' : '#fff',
                    color: statusFilter === st ? '#fff' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>

            <button onClick={exportCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              <FiDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eef1f5', textAlign: 'left', color: '#64748b' }}>
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
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{t.id}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{t.date}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{t.description}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{t.type}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: t.amount > 0 ? '#149174' : '#ef4444' }}>
                    {t.amount > 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: t.status === 'Completed' ? '#e6f9f4' : '#fef3e0',
                        color: t.status === 'Completed' ? '#149174' : '#b8860b',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing Page {page} of {totalPages} ({filteredTxns.length} total transactions)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              <FiChevronLeft /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Revenue;
