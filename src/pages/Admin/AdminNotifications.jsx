import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  FiBell, FiSearch, FiRefreshCw, FiLoader, FiX, FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import useRealtime from '../../hooks/useRealtime';

// ─── Type styling ─────────────────────────────────────────────────────────────
const TYPE_STYLES = {
  interview_request:   { bg: 'rgba(79,70,229,0.12)',  border: 'rgba(79,70,229,0.3)',   dot: '#4F46E5', emoji: '📅', label: 'Interview Request' },
  interview_accepted:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  dot: '#10B981', emoji: '✅', label: 'Accepted' },
  interview_rejected:  { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)', dot: '#EF4444', emoji: '❌', label: 'Rejected' },
  reschedule_request:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)', dot: '#F59E0B', emoji: '🕒', label: 'Reschedule' },
  reschedule_accepted: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)',dot: '#10B981', emoji: '🔄', label: 'Rescheduled' },
  interview_cancelled: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  dot: '#EF4444', emoji: '🚫', label: 'Cancelled' },
  feedback_submitted:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)',dot: '#F59E0B', emoji: '⭐', label: 'Feedback' },
  admin:               { bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.3)', dot: '#7C3AED', emoji: '🛡️', label: 'Admin' },
  admin_announcement:  { bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.3)', dot: '#7C3AED', emoji: '📢', label: 'Announcement' },
  system:              { bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)',dot: '#64748B', emoji: '🔔', label: 'System' },
};

function getTypeStyle(type = 'system') {
  const t = type.toLowerCase();
  for (const [k, v] of Object.entries(TYPE_STYLES)) { if (t.includes(k)) return v; }
  return TYPE_STYLES.system;
}

const ROLE_BADGE = {
  student:   { bg: '#e0e7ff', color: '#4338CA' },
  recruiter: { bg: '#d1fae5', color: '#065F46' },
  admin:     { bg: '#f3e8ff', color: '#6D28D9' },
  system:    { bg: '#f1f5f9', color: '#475569' },
};

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  if (Math.floor(mins / 1440) === 1) return 'Yesterday';
  if (mins < 10080) return `${Math.floor(mins / 1440)} days ago`;
  return d.toLocaleDateString();
}

const TABS = ['All', 'Interviews', 'Feedback', 'Reschedule', 'System'];

// ─── AdminNotifications ───────────────────────────────────────────────────────
export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAdminNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useRealtime(['notifications', 'interview_requests', 'interview_feedback'], fetchAll);

  const handleMarkRead = async (id) => {
    await adminService.markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await adminService.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
    toast.success('All notifications marked as read.');
  };

  const filtered = notifications.filter(n => {
    const type = (n.notification_type || '').toLowerCase();
    const matchTab =
      activeTab === 'All' ? true :
      activeTab === 'Interviews' ? type.includes('interview') :
      activeTab === 'Feedback' ? type.includes('feedback') :
      activeTab === 'Reschedule' ? (type.includes('reschedule') || type.includes('cancel')) :
      activeTab === 'System' ? (type === 'system' || type === 'admin' || type.includes('announcement')) :
      true;

    const q = search.toLowerCase();
    const matchSearch = !q ||
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || '').toLowerCase().includes(q) ||
      (n.sender_role || '').includes(q) ||
      (n.receiver_role || '').includes(q);

    return matchTab && matchSearch;
  });

  // Tab unread counts
  const tabCount = (tab) => {
    if (tab === 'All') return notifications.filter(n => !n.is_read).length;
    return notifications.filter(n => {
      const type = (n.notification_type || '').toLowerCase();
      const match =
        tab === 'Interviews' ? type.includes('interview') :
        tab === 'Feedback' ? type.includes('feedback') :
        tab === 'Reschedule' ? (type.includes('reschedule') || type.includes('cancel')) :
        tab === 'System' ? (type === 'system' || type === 'admin') : false;
      return match && !n.is_read;
    }).length;
  };

  const stats = {
    total: notifications.length,
    interviews: notifications.filter(n => (n.notification_type || '').toLowerCase().includes('interview')).length,
    feedback: notifications.filter(n => (n.notification_type || '').toLowerCase().includes('feedback')).length,
    unread: notifications.filter(n => !n.is_read).length,
  };

  return (
    <DashboardLayout title="Admin — Platform Notifications">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Notifications', value: stats.total, emoji: '🔔', accent: '#4F46E5' },
            { label: 'Interview Events', value: stats.interviews, emoji: '📅', accent: '#10B981' },
            { label: 'Feedback Received', value: stats.feedback, emoji: '⭐', accent: '#F59E0B' },
            { label: 'Unread Alerts', value: stats.unread, emoji: '🔴', accent: '#EF4444' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.accent}33`, borderRadius: 14, padding: '1.1rem 1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${s.accent}20 0%, transparent 70%)` }} />
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.emoji}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.accent, lineHeight: 1 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', fontWeight: 600, marginTop: '0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Controls Card ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Platform Notification Logs</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}>All student, recruiter, and system notifications in one view.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {stats.unread > 0 && (
                <button onClick={handleMarkAllRead} disabled={markingAll}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 9, color: '#10B981', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                  {markingAll ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle />} Mark all read
                </button>
              )}
              <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'var(--color-text)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.85rem' }} />
            <input type="text" placeholder="Search by title, message, role..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.2rem', width: '100%' }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {TABS.map(tab => {
              const uc = tabCount(tab);
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.9rem', borderRadius: 8,
                    background: isActive ? '#4F46E5' : 'rgba(255,255,255,0.04)',
                    border: isActive ? '1px solid #4F46E5' : '1px solid rgba(255,255,255,0.1)',
                    color: isActive ? '#fff' : 'var(--color-muted)',
                    fontWeight: isActive ? 800 : 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {tab}
                  {uc > 0 && <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#EF4444', color: '#fff', padding: '0 5px', borderRadius: 999, fontSize: '0.66rem', fontWeight: 900 }}>{uc}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notification List ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              {activeTab} Notifications <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>({filtered.length})</span>
            </h3>
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiX /> Clear</button>}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <FiLoader style={{ fontSize: '2rem', color: '#4F46E5', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
              <div style={{ color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Loading platform notifications...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiBell size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700 }}>No notifications found</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Try a different filter or search term.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filtered.map((n) => {
                const style = getTypeStyle(n.notification_type);
                const senderBadge = ROLE_BADGE[n.sender_role] || ROLE_BADGE.system;
                const receiverBadge = ROLE_BADGE[n.receiver_role] || ROLE_BADGE.system;
                const isFeedback = (n.notification_type || '').includes('feedback');
                const actionPath = n.action_path || n.action_url;
                const actionLabel = n.action_label || n.action_text;
                const isUnread = !n.is_read;

                return (
                  <div key={n.id} style={{
                    display: 'flex', gap: '0.85rem', padding: '1rem 1.1rem',
                    borderRadius: 12, background: style.bg, border: `1px solid ${style.border}`,
                    alignItems: 'flex-start', transition: 'opacity 0.2s',
                    opacity: isUnread ? 1 : 0.72,
                    position: 'relative',
                  }}>
                    {/* Unread dot */}
                    {isUnread && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />}

                    <div style={{ paddingTop: '0.3rem', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.dot }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.95rem' }}>{style.emoji}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{n.title}</span>
                        {isUnread && <span style={{ fontSize: '0.65rem', background: '#EF4444', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>UNREAD</span>}
                        {n.priority === 'high' && <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>HIGH</span>}
                      </div>

                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>{n.message}</p>

                      {/* Feedback star rating */}
                      {isFeedback && n.metadata?.overall_rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', marginBottom: '0.4rem' }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color: s <= n.metadata.overall_rating ? '#F59E0B' : 'rgba(255,255,255,0.15)', fontSize: '1rem' }}>★</span>
                          ))}
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: '0.3rem' }}>{n.metadata.overall_rating}/5</span>
                        </div>
                      )}
                      {isFeedback && n.metadata?.comments && (
                        <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--color-muted)', background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid #F59E0B', padding: '0.35rem 0.65rem', borderRadius: '0 6px 6px 0', marginBottom: '0.4rem' }}>
                          "{n.metadata.comments}"
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                        <span style={{ fontSize: '0.68rem', background: senderBadge.bg, color: senderBadge.color, padding: '1px 7px', borderRadius: 999, fontWeight: 800 }}>From: {n.sender_role || 'system'}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-muted)' }}>→</span>
                        <span style={{ fontSize: '0.68rem', background: receiverBadge.bg, color: receiverBadge.color, padding: '1px 7px', borderRadius: 999, fontWeight: 800 }}>To: {n.receiver_role || 'system'}</span>
                        {actionPath && actionLabel && (
                          <a href={actionPath} style={{ fontSize: '0.7rem', color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>{actionLabel} →</a>
                        )}
                        {isUnread && (
                          <button onClick={() => handleMarkRead(n.id)} style={{ fontSize: '0.68rem', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.15rem', textAlign: 'right', minWidth: 55 }}>
                      {formatTime(n.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default AdminNotifications;
