import React, { useState, useEffect, useCallback } from 'react';
import {
  FiBell, FiSearch, FiLoader, FiX, FiCheckCircle, FiStar,
  FiUser, FiMail, FiCalendar, FiFilter, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import adminService from '../../services/adminService';
import useRealtime from '../../hooks/useRealtime';

const TYPE_STYLES = {
  interview_request:   { bg: 'var(--color-primary-light)', border: 'var(--color-primary)',  dot: 'var(--color-primary)',  emoji: '📅', label: 'Interview Request' },
  interview_accepted:  { bg: 'var(--color-primary-light)', border: 'var(--color-success)',  dot: 'var(--color-success)',  emoji: '✅', label: 'Accepted' },
  interview_rejected:  { bg: 'var(--color-danger-light)',  border: 'var(--color-danger)',   dot: 'var(--color-danger)',   emoji: '❌', label: 'Rejected' },
  interview_cancelled: { bg: 'var(--color-danger-light)',  border: 'var(--color-danger)',   dot: 'var(--color-danger)',   emoji: '🚫', label: 'Cancelled' },
  interview_scheduled: { bg: 'var(--color-primary-light)', border: 'var(--color-primary)',  dot: 'var(--color-primary)',  emoji: '🗓️', label: 'Scheduled' },
  reschedule_request:  { bg: 'var(--color-warning-light)', border: 'var(--color-warning)',  dot: 'var(--color-warning)',  emoji: '🕒', label: 'Reschedule' },
  reschedule_accepted: { bg: 'var(--color-primary-light)', border: 'var(--color-primary)',  dot: 'var(--color-primary)',  emoji: '🔄', label: 'Rescheduled' },
  feedback_submitted:  { bg: 'var(--color-warning-light)', border: 'var(--color-warning)',  dot: 'var(--color-warning)',  emoji: '⭐', label: 'Feedback' },
  admin:               { bg: 'rgba(124,58,237,0.12)',       border: '#7C3AED',               dot: '#7C3AED',               emoji: '🛡️', label: 'Admin' },
  admin_announcement:  { bg: 'rgba(124,58,237,0.12)',       border: '#7C3AED',               dot: '#7C3AED',               emoji: '📢', label: 'Announcement' },
  system:              { bg: 'var(--color-surface-sec)',    border: 'var(--color-border)',   dot: 'var(--color-muted)',    emoji: '🔔', label: 'System' },
};

function getTypeStyle(type = 'system') {
  const t = (type || '').toLowerCase();
  for (const [k, v] of Object.entries(TYPE_STYLES)) {
    if (t.includes(k)) return v;
  }
  return TYPE_STYLES.system;
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFullDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function UserPill({ label, name, email }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.72rem', background: 'var(--glass-bg)', color: 'var(--color-muted)',
      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700,
      border: '1px solid var(--color-border)',
    }}>
      <FiUser style={{ fontSize: '0.65rem' }} />
      <span>{name || email || label || 'System'}</span>
    </span>
  );
}

const TABS = ['All', 'Interviews', 'Feedback', 'Reschedule', 'System'];

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAdminNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load notifications from Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllNotifications(); }, [fetchAllNotifications]);
  useRealtime(['notifications', 'interview_requests', 'profiles'], fetchAllNotifications);

  const handleMarkRead = async (id) => {
    await adminService.markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await adminService.markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setMarkingAll(false);
    toast.success('All notifications marked as read.');
  };

  const filtered = notifications.filter((n) => {
    const type = (n.notification_type || '').toLowerCase();
    const matchTab =
      activeTab === 'All'         ? true
      : activeTab === 'Interviews'  ? type.includes('interview')
      : activeTab === 'Feedback'    ? type.includes('feedback')
      : activeTab === 'Reschedule'  ? type.includes('reschedule') || type.includes('cancel')
      : activeTab === 'System'      ? type === 'system' || type === 'admin' || type.includes('announcement')
      : true;

    const q = search.toLowerCase();
    const matchSearch = !q
      || (n.title || '').toLowerCase().includes(q)
      || (n.message || '').toLowerCase().includes(q)
      || (n.sender_name || '').toLowerCase().includes(q)
      || (n.sender_email || '').toLowerCase().includes(q)
      || (n.receiver_name || '').toLowerCase().includes(q)
      || (n.receiver_email || '').toLowerCase().includes(q)
      || (n.sender_role || '').toLowerCase().includes(q)
      || (n.receiver_role || '').toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const tabUnreadCount = (tabName) => {
    if (tabName === 'All') return notifications.filter((n) => !n.is_read).length;
    return notifications.filter((n) => {
      const type = (n.notification_type || '').toLowerCase();
      const match =
        tabName === 'Interviews'
          ? type.includes('interview')
          : tabName === 'Feedback'
          ? type.includes('feedback')
          : tabName === 'Reschedule'
          ? type.includes('reschedule') || type.includes('cancel')
          : tabName === 'System'
          ? type === 'system' || type === 'admin'
          : false;
      return match && !n.is_read;
    }).length;
  };

  const stats = [
    { label: 'Total Notifications', value: notifications.length, accent: 'var(--color-primary)' },
    { label: 'Interview Events', value: notifications.filter((n) => (n.notification_type || '').toLowerCase().includes('interview')).length, accent: 'var(--color-secondary)' },
    { label: 'Feedback Events', value: notifications.filter((n) => (n.notification_type || '').toLowerCase().includes('feedback')).length, accent: 'var(--color-warning)' },
    { label: 'Unread Alerts', value: notifications.filter((n) => !n.is_read).length, accent: 'var(--color-danger)' },
  ];

  return (
    <AdminLayout
      title="Platform Notifications Control"
      subtitle="Broadcast notifications and user activity events — live data from Supabase."
      onRefresh={fetchAllNotifications}
      refreshing={loading}
      actions={
        notifications.some((n) => !n.is_read) ? (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
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
            {markingAll ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle />} Mark All Read
          </button>
        ) : null
      }
    >
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s) => (
          <AdminStatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <FiSearch
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.9rem' }}
          />
          <input
            type="text"
            placeholder="Search by title, message, sender name/email, or recipient role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.5rem 0.65rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FiFilter style={{ color: 'var(--color-muted)', fontSize: '0.85rem', flexShrink: 0 }} />
          {TABS.map((tab) => {
            const unreadCount = tabUnreadCount(tab);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--color-primary)' : 'var(--color-surface-sec)',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  color: isActive ? '#fff' : 'var(--color-text)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab}
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.3)' : 'var(--color-danger)',
                      color: '#fff',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Stream Container */}
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {activeTab} Stream <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>({filtered.length})</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', background: 'var(--color-surface-sec)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Live · Supabase
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <FiX /> Clear search
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <FiLoader style={{ fontSize: '2rem', color: 'var(--color-primary)', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
            <div style={{ color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Fetching notifications from Supabase...</div>
          </div>
        ) : filtered.length === 0 && notifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <FiBell size={40} style={{ opacity: 0.25, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>No data from Supabase</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
              All Supabase queries returned 0 rows. This is usually caused by Row Level Security (RLS) policies blocking the admin from reading other users' data.
            </div>
            <div style={{
              background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem',
              fontSize: '0.8rem', color: 'var(--color-text)', textAlign: 'left',
            }}>
              <strong>⚠️ Action required:</strong> Run <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.08)', padding: '1px 5px', borderRadius: 3 }}>fix_admin_notifications_audit_rls.sql</code> in your Supabase SQL Editor (Dashboard → SQL Editor → New Query) to grant admin read access.
              <br /><br />
              Also check the browser console for <code style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.08)', padding: '1px 5px', borderRadius: 3 }}>[AdminService]</code> logs to see exact errors.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FiBell size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)' }}>No notifications found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>No alerts match your current tab or search filters.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((n) => {
              const style = getTypeStyle(n.notification_type);
              const actionPath = n.action_path || n.action_url;
              const actionLabel = n.action_label || n.action_text;
              const isUnread = !n.is_read;
              const isExpanded = expandedId === n.id;
              const senderDisplay = n.sender_name || n.sender_email || n.sender_role || 'System';
              const receiverDisplay = n.receiver_name || n.receiver_email || n.receiver_role || 'User';

              return (
                <div
                  key={n.id}
                  onClick={() => setExpandedId(isExpanded ? null : n.id)}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: isUnread ? style.bg : 'var(--color-surface-sec)',
                    border: `1px solid ${isUnread ? style.border : 'var(--color-border)'}`,
                    alignItems: 'flex-start',
                    opacity: isUnread ? 1 : 0.82,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease, transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Unread indicator */}
                  {isUnread && (
                    <div
                      style={{
                        position: 'absolute', top: 14, right: 14,
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--color-danger)',
                      }}
                    />
                  )}

                  <div style={{ paddingTop: '0.2rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.2rem' }}>{style.emoji}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text)' }}>{n.title}</span>
                      <span style={{
                        fontSize: '0.65rem', background: style.bg, color: style.dot,
                        padding: '1px 7px', borderRadius: 4, fontWeight: 800,
                        border: `1px solid ${style.border}`,
                      }}>
                        {style.label}
                      </span>
                      {isUnread && (
                        <span style={{ fontSize: '0.65rem', background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                          NEW
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto', color: 'var(--color-muted)', fontSize: '0.78rem' }}>
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.84rem', color: 'var(--color-muted)', lineHeight: 1.55 }}>{n.message}</p>

                    {/* Star Rating if feedback */}
                    {n.metadata?.overall_rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.4rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} style={{ fill: s <= n.metadata.overall_rating ? 'var(--color-warning)' : 'none', color: 'var(--color-warning)', fontSize: '0.9rem' }} />
                        ))}
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: '0.4rem', fontWeight: 600 }}>
                          {n.metadata.overall_rating}/5
                        </span>
                      </div>
                    )}

                    {/* Sender → Receiver */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      <UserPill name={senderDisplay} email={n.sender_email} label={n.sender_role} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>→</span>
                      <UserPill name={receiverDisplay} email={n.receiver_email} label={n.receiver_role} />

                      {actionPath && actionLabel && (
                        <a
                          href={actionPath}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'none' }}
                        >
                          {actionLabel} →
                        </a>
                      )}
                      {isUnread && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          style={{ fontSize: '0.72rem', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>

                    {/* Expandable detail panel */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex', flexDirection: 'column', gap: '0.4rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {n.sender_email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                            <FiMail style={{ flexShrink: 0 }} />
                            <strong style={{ color: 'var(--color-text)' }}>Sender email:</strong> {n.sender_email}
                          </div>
                        )}
                        {n.receiver_email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                            <FiMail style={{ flexShrink: 0 }} />
                            <strong style={{ color: 'var(--color-text)' }}>Recipient email:</strong> {n.receiver_email}
                          </div>
                        )}
                        {n.metadata?.interview_type && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                            <strong style={{ color: 'var(--color-text)' }}>Interview type:</strong> {n.metadata.interview_type}
                          </div>
                        )}
                        {n.metadata?.status && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                            <strong style={{ color: 'var(--color-text)' }}>Status:</strong> {n.metadata.status}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                          <FiCalendar style={{ flexShrink: 0 }} />
                          <strong style={{ color: 'var(--color-text)' }}>Received:</strong> {formatFullDate(n.created_at)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                          ID: {n.id}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.2rem', textAlign: 'right', minWidth: 60 }}>
                    {formatTime(n.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
