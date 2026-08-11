import React, { useEffect, useState, useCallback } from 'react';
import {
  FiBell, FiCheck, FiClock, FiX, FiCheckCircle, FiDollarSign, FiFilter, FiLoader, FiRefreshCw
} from 'react-icons/fi';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import recruiterService from '../../services/recruiterService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

export const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);

  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [rescheduleDateText, setRescheduleDateText] = useState('');
  const [rescheduleTimeText, setRescheduleTimeText] = useState('');
  const [isRescheduleOption, setIsRescheduleOption] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifsData, requestsData] = await Promise.all([
        notificationService.getNotifications('recruiter'),
        recruiterService.getInterviewRequestsForRecruiter ? recruiterService.getInterviewRequestsForRecruiter() : Promise.resolve([]),
      ]);
      setNotifications(notifsData || []);
      setRequests(requestsData || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useRealtime(['notifications', 'interview_requests', 'interview_feedback'], fetchData);

  const handleResponse = async (requestId, action, studentUserId) => {
    try {
      const recruiterName = 'Recruiter';

      if (action === 'accepted') {
        await recruiterService.acceptInterviewRequest(requestId, studentUserId, recruiterName);
        toast.success('✅ Interview accepted! Meeting link generated and student notified.');
      } else if (action === 'rejected') {
        await recruiterService.rejectOrRescheduleRequest(requestId, studentUserId, {
          action: 'reject',
          rejectReason: '',
          recruiterName,
        });
        toast.error('❌ Request declined. Student has been notified.');
      }

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action } : r));
    } catch (err) {
      console.error('handleResponse error:', err);
      toast.error('Failed to process request.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      toast.success('All marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };
  const openCandidateProfile = async (req) => {
    if (!req) return;
    setLoadingProfile(true);
    setSelectedCandidateModal(req);

    if (isSupabaseConfigured() && req.student_id) {
      try {
        const { data: profileData } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', req.student_id)
          .maybeSingle();

        if (profileData) {
          setCandidateProfile(profileData);
          setLoadingProfile(false);
          return;
        }

        const { data: fallbackData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', req.student_id)
          .maybeSingle();

        setCandidateProfile(fallbackData || null);
      } catch (e) {
        console.warn('Profile fetch warning:', e);
      } finally {
        setLoadingProfile(false);
      }
    } else {
      setCandidateProfile(null);
      setLoadingProfile(false);
    }
  };

  const handleConfirmRejectModal = async (e) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    try {
      await recruiterService.rejectOrRescheduleRequest(
        rejectModalReq.id,
        rejectModalReq.student_id,
        {
          action: isRescheduleOption ? 'reschedule' : 'reject',
          rejectReason: rejectReasonText,
          newDate: rescheduleDateText,
          newTime: rescheduleTimeText,
          recruiterName: 'Recruiter',
        }
      );

      if (isRescheduleOption) {
        toast.success('🔄 Reschedule proposal sent to candidate!');
      } else {
        toast.error('❌ Request declined. Candidate notified.');
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectModalReq.id
            ? { ...r, status: isRescheduleOption ? 'reschedule_requested' : 'rejected' }
            : r
        )
      );

      setRejectModalReq(null);
      setRejectReasonText('');
      setRescheduleDateText('');
      setRescheduleTimeText('');
      setIsRescheduleOption(false);
    } catch (err) {
      console.error('Reject modal error:', err);
      toast.error(err.message || 'Failed to process request.');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    const notifType = (n.notification_type || '').toLowerCase();
    const notifCat = (n.category || '').toLowerCase();
    if (tab === 'Unread') return !n.is_read && !n.read;
    if (tab === 'Interviews') return notifType.includes('interview') || notifCat.includes('interview');
    if (tab === 'Feedback') return notifType.includes('feedback') || notifCat.includes('feedback');
    if (tab === 'Reschedule') return notifType.includes('reschedule') || notifCat.includes('reschedule') || notifType.includes('cancel');
    if (tab === 'System') return notifType.includes('system') || notifType.includes('admin') || notifCat.includes('system');
    return true;
  });


  const getNotifIcon = (n) => {
    const type = (n.notification_type || n.category || '').toLowerCase();
    if (type.includes('feedback')) return { bg: '#fef9c3', color: '#B45309' };
    if (type.includes('reschedule') || type.includes('cancelled')) return { bg: '#fef3c7', color: '#D97706' };
    if (type.includes('accepted') || type.includes('scheduled')) return { bg: '#d1fae5', color: '#059669' };
    if (type.includes('rejected') || type.includes('declined')) return { bg: '#fee2e2', color: '#DC2626' };
    if (type.includes('request') || type.includes('interview')) return { bg: '#e0e7ff', color: '#4F46E5' };
    if (type === 'admin') return { bg: '#f3e8ff', color: '#7C3AED' };
    return { bg: 'rgba(255,255,255,0.05)', color: '#64748b' };
  };

  const getNotifEmoji = (n) => {
    const type = (n.notification_type || n.category || '').toLowerCase();
    if (type.includes('feedback')) return '⭐';
    if (type.includes('reschedule')) return '🕒';
    if (type.includes('cancelled')) return '❌';
    if (type.includes('accepted')) return '✅';
    if (type.includes('rejected')) return '❌';
    if (type.includes('request')) return '📅';
    if (type === 'admin') return '🛡️';
    return '🔔';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };


  return (
    <DashboardLayout title="Recruiter Notifications & Alerts">
      <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Requests', 'Unread', 'Interviews', 'Feedback', 'Reschedule'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  border: tab === t ? '1px solid #1abc9c' : '1px solid rgba(255,255,255,0.15)',
                  background: tab === t ? '#1abc9c' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--color-muted)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                {t} {t === 'Requests' && requests.filter(r => r.status === 'pending').length > 0 && (
                  <span style={{ marginLeft: 4, background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>


          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
            Mark all as read
          </button>
        </div>
      </div>

      {/* Live Interview Requests from Supabase */}
      {(tab === 'All' || tab === 'Requests') && (
        <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            📅 Candidate Interview Requests ({requests.length})
          </h3>
          {requests.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: 0 }}>No pending interview requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
                    <img
                      src={req.candidate_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.candidate_name || 'Candidate')}&background=4f46e5&color=fff`}
                      alt=""
                      style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-text)' }}>
                        {req.candidate_name || 'Candidate'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {req.interview_type || 'Technical Deep Dive'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.15rem' }}>
                        📅 Slot: {new Date(req.preferred_datetime).toLocaleString()}
                      </div>
                      {req.message && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          "{req.message}"
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span>Resume Match Score: <strong style={{ color: '#10B981' }}>{req.ats_score || 88}%</strong></span>
                        <span>Status: <strong style={{ textTransform: 'capitalize', color: req.status === 'accepted' ? '#10B981' : req.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>{req.status}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openCandidateProfile(req)}
                      className="btn btn-outline"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                    >
                      View Profile
                    </button>


                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleResponse(req.id, 'accepted', req.student_id)}
                          className="btn-primary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <FiCheck /> Accept
                        </button>
                        <button
                          onClick={() => setRejectModalReq(req)}
                          className="btn-secondary"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <FiX /> Decline / Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notification History */}
      {(tab !== 'Requests') && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Notification History ({filteredNotifs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-muted)' }}>
                <FiBell size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600 }}>No notifications found</div>
              </div>
            ) : filteredNotifs.map((n) => {
              const { bg, color } = getNotifIcon(n);
              const emoji = getNotifEmoji(n);
              const isUnread = !n.is_read && !n.read;
              const actionPath = n.action_path || n.action_url;
              const actionLabel = n.action_label || n.action_text;
              const isFeedback = (n.notification_type || '').includes('feedback');
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem 1.1rem',
                    borderRadius: '10px',
                    background: isUnread ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    border: isUnread ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1rem',
                    }}
                  >
                    {emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: isUnread ? 700 : 500, color: 'var(--color-text)' }}>
                        {n.title || 'Notification'}
                      </span>
                      {isUnread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />}
                      {n.priority === 'high' && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>HIGH</span>
                      )}
                    </div>
                    {n.message && <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{n.message}</div>}

                    {/* Star Rating for Feedback Notifications */}
                    {isFeedback && n.metadata?.overall_rating && (
                      <div style={{ display: 'flex', gap: '0.1rem', marginBottom: '0.4rem' }}>
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} style={{ color: star <= n.metadata.overall_rating ? '#F59E0B' : 'rgba(255,255,255,0.2)', fontSize: '1.1rem' }}>★</span>
                        ))}
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginLeft: '0.4rem' }}>{n.metadata.overall_rating}/5</span>
                      </div>
                    )}
                    {isFeedback && n.metadata?.comments && (
                      <div style={{ fontSize: '0.78rem', background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid #F59E0B', padding: '0.4rem 0.65rem', borderRadius: '0 6px 6px 0', color: 'var(--color-muted)', fontStyle: 'italic', marginBottom: '0.4rem' }}>
                        "{n.metadata.comments}"
                      </div>
                    )}

                    {actionPath && actionLabel && (
                      <a
                        href={actionPath}
                        style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {actionLabel} →
                      </a>
                    )}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', flexShrink: 0, marginTop: '0.1rem' }}>
                    {formatTime(n.created_at) || n.time || ''}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Candidate View Profile Modal */}
      {selectedCandidateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Candidate Profile</h3>
              <button onClick={() => setSelectedCandidateModal(null)} style={{ border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img
                src={selectedCandidateModal.candidate_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidateModal.candidate_name || 'Candidate')}&background=4f46e5&color=fff`}
                alt=""
                style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.5rem', border: '2px solid var(--color-primary)' }}
              />
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{selectedCandidateModal.candidate_name || 'Candidate'}</h4>
              <div style={{ fontSize: '0.84rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{selectedCandidateModal.interview_type || 'Technical Deep Dive'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                <div><strong>Resume Match Score:</strong> <span style={{ color: '#10B981', fontWeight: 800 }}>{selectedCandidateModal.ats_score || 88}%</span></div>
                <div style={{ marginTop: '0.25rem' }}><strong>Requested Slot:</strong> {new Date(selectedCandidateModal.preferred_datetime).toLocaleString()}</div>
                {selectedCandidateModal.message && <div style={{ marginTop: '0.25rem' }}><strong>Note:</strong> "{selectedCandidateModal.message}"</div>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
              <button onClick={() => setSelectedCandidateModal(null)} className="btn-secondary">Close</button>
              <button onClick={() => { handleResponse(selectedCandidateModal.id, 'accepted', selectedCandidateModal.student_id); setSelectedCandidateModal(null); }} className="btn-primary">
                Accept Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject / Reschedule Modal */}
      {rejectModalReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Decline or Reschedule Request</h3>
              <button onClick={() => setRejectModalReq(null)} style={{ border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleConfirmRejectModal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>Reschedule Option</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input type="radio" name="reschedule_opt" checked={!isRescheduleOption} onChange={() => setIsRescheduleOption(false)} /> Reject Only
                  </label>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input type="radio" name="reschedule_opt" checked={isRescheduleOption} onChange={() => setIsRescheduleOption(true)} /> Propose Reschedule
                  </label>
                </div>
              </div>

              {isRescheduleOption && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>New Date</label>
                    <input type="date" value={rescheduleDateText} onChange={(e) => setRescheduleDateText(e.target.value)} required className="input-field" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem' }}>New Time</label>
                    <input type="time" value={rescheduleTimeText} onChange={(e) => setRescheduleTimeText(e.target.value)} required className="input-field" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.4rem' }}>Reason / Message</label>
                <textarea
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  placeholder="Explain reason for rejection or reschedule note..."
                  rows={3}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRejectModalReq(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: isRescheduleOption ? '#10B981' : '#EF4444' }}>
                  {isRescheduleOption ? 'Send Reschedule Proposal' : 'Decline Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RecruiterNotifications;
