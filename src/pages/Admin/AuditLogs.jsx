import React, { useState, useEffect, useCallback } from 'react';
import {
  FiShield, FiActivity, FiUser, FiVideo, FiDollarSign, FiDownload,
  FiBell, FiCheckCircle, FiAlertCircle, FiSearch, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import AdminDataTable from '../../components/Admin/AdminDataTable';
import adminService from '../../services/adminService';
import useRealtime from '../../hooks/useRealtime';

const RESOURCE_MAP = {
  auth: { icon: <FiUser />, color: 'var(--color-primary)', label: 'Auth & Identity' },
  interview_request: { icon: <FiVideo />, color: 'var(--color-accent)', label: 'Interview' },
  interview_requests: { icon: <FiVideo />, color: 'var(--color-accent)', label: 'Interview' },
  recruiter_profiles: { icon: <FiShield />, color: 'var(--color-secondary)', label: 'Recruiter' },
  resumes: { icon: <FiActivity />, color: 'var(--color-warning)', label: 'Resume ATS' },
  payments: { icon: <FiDollarSign />, color: 'var(--color-success)', label: 'Payment' },
  feedback_submitted: { icon: <FiBell />, color: 'var(--color-warning)', label: 'Feedback' },
  notification: { icon: <FiBell />, color: 'var(--color-muted)', label: 'System Alert' },
  system: { icon: <FiActivity />, color: 'var(--color-muted)', label: 'System' },
};

function getResourceInfo(type = '') {
  const t = (type || '').toLowerCase();
  for (const [key, val] of Object.entries(RESOURCE_MAP)) {
    if (t.includes(key)) return val;
  }
  return RESOURCE_MAP.system;
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString();
}

const exportAuditLogsCSV = (logs) => {
  const headers = ['Timestamp', 'Identity / User', 'Action', 'Resource', 'Status'];
  const rows = logs.map((l) => [
    l.created_at ? new Date(l.created_at).toLocaleString() : '',
    l.user_email || l.user_id || 'System',
    l.action || '',
    l.resource || 'system',
    l.status || 'success',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `security_audit_logs_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAuditLogs(250);
      setLogs(data);
    } catch {
      toast.error('Failed to load security audit log history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useRealtime(['audit_logs', 'notifications', 'interview_requests', 'profiles'], fetchLogs);

  const filteredLogs = logs.filter((l) => {
    const matchResource =
      resourceFilter === 'all' || (l.resource || '').toLowerCase().includes(resourceFilter.toLowerCase());

    let matchDate = true;
    if (dateFilter !== 'all' && l.created_at) {
      const d = new Date(l.created_at);
      const now = new Date();
      if (dateFilter === 'today') matchDate = d.toDateString() === now.toDateString();
      else if (dateFilter === '7d') matchDate = now - d < 7 * 864e5;
      else if (dateFilter === '30d') matchDate = now - d < 30 * 864e5;
    }

    const q = (search || '').toLowerCase();
    const matchSearch = !q
      || (l.user_email || '').toLowerCase().includes(q)
      || (l.user_name || '').toLowerCase().includes(q)
      || (l.action || '').toLowerCase().includes(q)
      || (l.resource || '').toLowerCase().includes(q)
      || (l.status || '').toLowerCase().includes(q);

    return matchResource && matchDate && matchSearch;
  });

  const todayCount = logs.filter((l) => l.created_at && new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const authCount = logs.filter((l) => (l.resource || '').toLowerCase().includes('auth')).length;
  const interviewCount = logs.filter((l) => (l.resource || '').toLowerCase().includes('interview')).length;

  const stats = [
    { label: 'Total Audit Events', value: logs.length, accent: 'var(--color-primary)' },
    { label: 'Logged Today', value: todayCount, accent: 'var(--color-success)' },
    { label: 'Auth Security Events', value: authCount, accent: 'var(--color-secondary)' },
    { label: 'Interview Events', value: interviewCount, accent: 'var(--color-accent)' },
  ];

  const columns = [
    {
      header: 'Event Timestamp',
      render: (l) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.82rem' }}>{formatTime(l.created_at)}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
            {l.created_at ? new Date(l.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginTop: '0.1rem', opacity: 0.7 }}>
            {l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'User / Identity',
      searchValue: (l) => `${l.user_email || ''} ${l.user_id || ''} ${l.user_name || ''}`,
      render: (l) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.84rem' }}>
            {l.user_name || l.user_email || (l.user_id ? `${l.user_id.slice(0, 12)}…` : 'System Engine')}
          </div>
          {l.user_name && l.user_email && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>
              {l.user_email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Action Executed',
      accessor: 'action',
      render: (l) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {l.action || '—'}
          </div>
          {l.metadata?.interview_type && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>
              {l.metadata.interview_type}
            </div>
          )}
          {l.metadata?.recruiter && (
            <div style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginTop: '0.05rem' }}>
              with {l.metadata.recruiter}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Resource',
      render: (l) => {
        const res = getResourceInfo(l.resource);
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: res.color,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
            }}
          >
            {res.icon} {res.label}
          </span>
        );
      },
    },
    {
      header: 'Result Status',
      render: (l) => {
        const s = (l.status || 'success').toLowerCase();
        const isSuccess = s === 'success';
        const isWarning = s === 'rejected' || s === 'cancelled';
        const color = isSuccess ? 'var(--color-success)' : isWarning ? 'var(--color-warning)' : 'var(--color-danger)';
        const bg = isSuccess ? 'var(--color-primary-light)' : isWarning ? 'var(--color-warning-light)' : 'var(--color-danger-light)';
        return (
          <span
            style={{
              fontSize: '0.72rem', fontWeight: 800,
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: bg, color,
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            {isSuccess ? <FiCheckCircle /> : <FiAlertCircle />} {isSuccess ? 'Success' : s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      },
    },
  ];

  return (
    <AdminLayout
      title="Security & Platform Audit Logs"
      subtitle="Immutable security audit trail — syncing real-time events from interview requests, notifications and system activity."
      onRefresh={fetchLogs}
      refreshing={loading}
      actions={
        <button
          onClick={() => exportAuditLogsCSV(filteredLogs)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary)',
            fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
          }}
        >
          <FiDownload /> Export Audit CSV
        </button>
      }
    >
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s) => (
          <AdminStatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Filter Control Bar */}
      <div
        style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap',
          background: 'var(--glass-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.85rem' }} />
          <input
            type="text"
            placeholder="Search by user, action, or resource…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.45rem 2rem 0.45rem 2.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.82rem', outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><FiX /></button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Resource:</label>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
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
            <option value="all">All Resources</option>
            <option value="auth">Auth & Identity</option>
            <option value="interview">Interview Drills</option>
            <option value="payments">Payments & Billing</option>
            <option value="recruiter">Recruiter Profiles</option>
            <option value="notification">Notifications</option>
            <option value="system">System Alerts</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Date Horizon:</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600,
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Live badge */}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--color-muted)', background: 'var(--color-surface-sec)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid var(--color-border)' }}>
          Live · Supabase
        </span>
      </div>

      {/* Main Audit DataTable */}
      <AdminDataTable
        columns={columns}
        data={filteredLogs}
        loading={loading}
        searchPlaceholder="Search audit events by action description or user identity..."
        emptyTitle="No audit events found"
        emptySub="No security events match your selected resource or date horizon filters."
      />
    </AdminLayout>
  );
};

export default AuditLogs;
