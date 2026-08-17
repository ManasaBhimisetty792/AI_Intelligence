import React, { useEffect, useState, useCallback } from 'react';
import {
  FiBell, FiClock, FiCheckCircle, FiDollarSign, FiFilter, FiLoader, FiRefreshCw,
  FiCalendar, FiMessageSquare, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

export const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const notifsData = await notificationService.getNotifications('recruiter');
      setNotifications(Array.isArray(notifsData) ? notifsData : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtime(['notifications', 'interview_feedback'], () => fetchNotifications(true));

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotifIcon = (n) => {
    const type = (n.notification_type || n.type || '').toLowerCase();
    const title = (n.title || '').toLowerCase();

    if (type.includes('feedback') || title.includes('feedback')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', icon: <FiMessageSquare /> };
    }
    if (type.includes('schedule') || title.includes('schedule') || title.includes('assigned')) {
      return { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', icon: <FiCalendar /> };
    }
    if (type.includes('request') || title.includes('request')) {
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', icon: <FiClock /> };
    }
    if (type.includes('payout') || title.includes('payout') || title.includes('revenue')) {
      return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', icon: <FiDollarSign /> };
    }
    if (type.includes('reject') || type.includes('cancel')) {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', icon: <FiAlertCircle /> };
    }
    return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)', icon: <FiBell /> };
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return ts;
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const filteredNotifs = notifications.filter((n) => {
    const isUnread = !n.is_read && !n.read;
    const type = (n.notification_type || n.type || '').toLowerCase();
    const title = (n.title || '').toLowerCase();

    if (tab === 'Unread') return isUnread;
    if (tab === 'Interviews') return type.includes('interview') || type.includes('request') || type.includes('schedule');
    if (tab === 'Feedback') return type.includes('feedback') || title.includes('feedback');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

  return (
    <DashboardLayout title="Notifications">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        
        {/* Header card with filters & mark all as read */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {['All', 'Unread', 'Interviews', 'Feedback'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: tab === t ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: tab === t ? 'var(--color-primary)' : 'transparent',
                  color: tab === t ? '#ffffff' : 'var(--color-muted)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {t}
                {t === 'Unread' && unreadCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '0.68rem', fontWeight: 800 }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => fetchNotifications(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Refresh notifications"
            >
              <FiRefreshCw className={refreshing ? 'spin-animation' : ''} /> Refresh
            </button>
            <button
              onClick={handleMarkAllRead}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBell style={{ color: 'var(--color-primary)' }} /> Notification Feed ({filteredNotifs.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiLoader className="spin-animation" style={{ fontSize: '2rem', marginBottom: '0.6rem' }} />
              <div>Loading notifications...</div>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-muted)' }}>
              <FiBell size={42} style={{ opacity: 0.3, marginBottom: '0.85rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>No notifications to display</div>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.84rem' }}>
                You're all caught up! New requests, feedback, and session updates will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredNotifs.map((n) => {
                const { bg, color, icon } = getNotifIcon(n);
                const isUnread = !n.is_read && !n.read;
                const isFeedback = (n.notification_type || '').includes('feedback') || (n.title || '').includes('Feedback');
                
                // Determine destination URL
                let actionPath = n.action_path || n.action_url;
                let actionLabel = n.action_label || n.action_text || 'View Details';
                if (!actionPath) {
                  if ((n.notification_type || '').includes('request') || (n.title || '').includes('Request')) {
                    actionPath = '/recruiter/candidates';
                    actionLabel = 'View Interview Requests';
                  } else if ((n.notification_type || '').includes('feedback')) {
                    actionPath = '/recruiter/interviews';
                    actionLabel = 'View Interviews';
                  } else if ((n.notification_type || '').includes('schedule')) {
                    actionPath = '/recruiter/schedule';
                    actionLabel = 'View Schedule';
                  }
                }

                return (
                  <div
                    key={n.id || Math.random()}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      background: isUnread ? 'rgba(99, 102, 241, 0.07)' : 'var(--color-surface)',
                      border: isUnread ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--color-border)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: bg,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '1.1rem',
                      }}
                    >
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: isUnread ? 800 : 600, color: 'var(--color-text)' }}>
                          {n.title || 'Notification'}
                        </span>
                        {isUnread && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1', display: 'inline-block' }} />
                        )}
                        {n.priority === 'high' && (
                          <span style={{ fontSize: '0.68rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            HIGH
                          </span>
                        )}
                      </div>

                      {n.message && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-muted)', marginBottom: '0.4rem', lineHeight: 1.5 }}>
                          {n.message}
                        </div>
                      )}

                      {/* Star Rating for Feedback */}
                      {isFeedback && n.metadata?.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.4rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= n.metadata.rating ? '#F59E0B' : 'var(--color-border)', fontSize: '1rem' }}>
                              ★
                            </span>
                          ))}
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginLeft: '0.4rem', fontWeight: 700 }}>
                            {n.metadata.rating}/5 Rating
                          </span>
                        </div>
                      )}

                      {isFeedback && n.metadata?.comments && (
                        <div style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid #F59E0B', padding: '0.4rem 0.65rem', borderRadius: '0 6px 6px 0', color: 'var(--color-text)', fontStyle: 'italic', marginBottom: '0.4rem' }}>
                          "{n.metadata.comments}"
                        </div>
                      )}

                      {actionPath && (
                        <Link
                          to={actionPath}
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--color-primary)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            marginTop: '0.2rem',
                          }}
                        >
                          {actionLabel} <FiArrowRight />
                        </Link>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
                      {formatTime(n.created_at || n.time)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterNotifications;
