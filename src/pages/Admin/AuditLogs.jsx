import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  FiActivity, FiRefreshCw, FiLoader, FiSearch, FiShield,
  FiUser, FiFileText, FiVideo, FiDollarSign, FiDownload,
  FiBell, FiCalendar,
} from 'react-icons/fi';
import adminService from '../../services/adminService';
import useRealtime from '../../hooks/useRealtime';

// ─── Icon per resource ────────────────────────────────────────────────────────
const RESOURCE_MAP = {
  auth:               { icon: <FiUser />,      color: '#818CF8', label: 'Auth' },
  interview_request:  { icon: <FiVideo />,     color: '#10B981', label: 'Interview' },
  interview_requests: { icon: <FiVideo />,     color: '#10B981', label: 'Interview' },
  recruiter_profiles: { icon: <FiShield />,    color: '#7C3AED', label: 'Recruiter' },
  resumes:            { icon: <FiFileText />,  color: '#F59E0B', label: 'Resume' },
  payments:           { icon: <FiDollarSign />, color: '#0EA5E9', label: 'Payment' },
  feedback_submitted: { icon: <FiBell />,      color: '#F59E0B', label: 'Feedback' },
  notification:       { icon: <FiBell />,      color: '#64748B', label: 'System' },
  system:             { icon: <FiActivity />,  color: '#64748B', label: 'System' },
};

function getResource(type = '') {
  const t = type.toLowerCase();
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

// ─── Export logs ──────────────────────────────────────────────────────────────
function exportLogs(logs) {
  const headers = ['Time', 'User', 'Action', 'Resource', 'Status'];
  const rows = logs.map(l => [
    l.created_at ? new Date(l.created_at).toLocaleString() : '',
    l.user_email || l.user_id || '',
    l.action || '',
    l.resource || '',
    l.status || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `audit_logs_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── AuditLogs ────────────────────────────────────────────────────────────────
export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'today' | '7d' | '30d' | 'all'

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAuditLogs(200);
      setLogs(data);
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useRealtime(['audit_logs', 'notifications', 'interview_requests'], fetchLogs);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (l.action || '').toLowerCase().includes(q) ||
      (l.user_email || '').toLowerCase().includes(q) ||
      (l.resource || '').toLowerCase().includes(q);

    const matchResource = resourceFilter === 'all' || (l.resource || '').toLowerCase().includes(resourceFilter);

    let matchDate = true;
    if (dateFilter !== 'all' && l.created_at) {
      const d = new Date(l.created_at);
      const now = new Date();
      if (dateFilter === 'today') matchDate = d.toDateString() === now.toDateString();
      else if (dateFilter === '7d') matchDate = now - d < 7 * 864e5;
      else if (dateFilter === '30d') matchDate = now - d < 30 * 864e5;
    }

    return matchSearch && matchResource && matchDate;
  });

  const resources = [...new Set(logs.map(l => (l.resource || 'system').toLowerCase()).filter(Boolean))];

  const todayCount = logs.filter(l => l.created_at && new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const authCount = logs.filter(l => (l.resource || '').toLowerCase().includes('auth')).length;
  const interviewCount = logs.filter(l => (l.resource || '').toLowerCase().includes('interview')).length;

  return (
    <DashboardLayout title="Security Audit Logs">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Header Banner ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(79,70,229,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShield style={{ color: '#10B981' }} /> Security Audit Trail
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Real-time platform events synced from Supabase — {logs.length} total events.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => exportLogs(filtered)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10B981', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
              <FiDownload /> Export
            </button>
            <button onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Events', value: logs.length, accent: '#4F46E5' },
            { label: 'Today', value: todayCount, accent: '#10B981' },
            { label: 'Auth Events', value: authCount, accent: '#818CF8' },
            { label: 'Interview Events', value: interviewCount, accent: '#06B6D4' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.accent}33`, borderRadius: 14, padding: '1rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, background: `radial-gradient(circle, ${s.accent}25 0%, transparent 70%)` }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.accent }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters + Table ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.85rem' }} />
              <input type="text" placeholder="Search action or user..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.2rem', width: '100%' }} />
            </div>
            <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)} className="input-field" style={{ minWidth: 150 }}>
              <option value="all">All Resources</option>
              {resources.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field" style={{ minWidth: 130 }}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiLoader style={{ fontSize: '2rem', color: '#10B981', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
              Loading audit logs from Supabase...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              <FiActivity style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem' }} />
              <div>No audit log entries match your filters.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Time', 'User / Identity', 'Action Executed', 'Resource', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, idx) => {
                    const res = getResource(l.resource);
                    return (
                      <tr key={l.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-muted)' }}>{formatTime(l.created_at)}</div>
                          <div style={{ fontSize: '0.68rem', opacity: 0.6, color: 'var(--color-muted)' }}>{l.created_at ? new Date(l.created_at).toLocaleTimeString() : ''}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text)' }}>
                          {l.user_email || (l.user_id ? l.user_id.slice(0, 12) + '…' : 'System')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', maxWidth: 280 }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>{l.action || '—'}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', background: `${res.color}18`, color: res.color, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                            {res.icon} {res.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                            background: l.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: l.status === 'success' ? '#10B981' : '#EF4444',
                          }}>
                            {l.status === 'success' ? '✓ Success' : l.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default AuditLogs;
