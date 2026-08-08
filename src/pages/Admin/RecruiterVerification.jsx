import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  FiCheckCircle, FiLinkedin, FiExternalLink, FiShield, FiX,
  FiLoader, FiRefreshCw, FiUser, FiGrid, FiList,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

// ─── Recruiter Card ───────────────────────────────────────────────────────────
const RecruiterCard = ({ r, onApprove, onReject, processing }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: 16,
    padding: '1.5rem',
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(245,158,11,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    {/* Avatar */}
    <div style={{ flexShrink: 0 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 900 }}>
        {(r.name || 'R')[0].toUpperCase()}
      </div>
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>{r.name}</h4>
        <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', padding: '2px 10px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 800 }}>
          ⏳ PENDING VERIFICATION
        </span>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
        <strong style={{ color: 'var(--color-text)' }}>{r.designation}</strong>
        {r.company && <> at <strong style={{ color: '#4F46E5' }}>{r.company}</strong></>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
        {r.email && <span>📧 {r.email}</span>}
        {r.industry && <span>🏭 {r.industry}</span>}
        {r.location && <span>📍 {r.location}</span>}
        {r.tax_id && <span>🔖 Tax: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, fontSize: '0.72rem' }}>{r.tax_id}</code></span>}
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {r.linkedinUrl && (
          <a href={r.linkedinUrl.startsWith('http') ? r.linkedinUrl : `https://${r.linkedinUrl}`} target="_blank" rel="noopener noreferrer"
            style={{ color: '#0077b5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}>
            <FiLinkedin /> Verify LinkedIn <FiExternalLink style={{ fontSize: '0.7rem' }} />
          </a>
        )}
        {r.registration_doc_url && (
          <a href={r.registration_doc_url} target="_blank" rel="noopener noreferrer"
            style={{ color: '#4F46E5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}>
            View Docs <FiExternalLink style={{ fontSize: '0.7rem' }} />
          </a>
        )}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>Submitted: {r.date}</div>
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', flexShrink: 0 }}>
      <button
        onClick={() => onApprove(r)} disabled={processing === r.id}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 10, color: '#10B981', fontWeight: 800, fontSize: '0.85rem', cursor: processing === r.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
      >
        {processing === r.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle />} Approve
      </button>
      <button
        onClick={() => onReject(r)} disabled={processing === r.id}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#EF4444', fontWeight: 800, fontSize: '0.85rem', cursor: processing === r.id ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        <FiX /> Reject
      </button>
    </div>
  </div>
);

// ─── RecruiterVerification ────────────────────────────────────────────────────
export const RecruiterVerification = () => {
  const [pending, setPending] = useState([]);
  const [allRecruiters, setAllRecruiters] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' | 'all'
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        adminService.fetchPendingRecruiters(),
        adminService.fetchAllRecruiters(),
      ]);
      setPending(p);
      setAllRecruiters(a);
    } catch (err) {
      toast.error('Failed to load recruiter data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useRealtime(['recruiter_profiles', 'profiles'], loadData);

  const handleApprove = async (r) => {
    setProcessing(r.id);
    try {
      await adminService.approveRecruiter(r.id, r.user_id);
      if (r.user_id) {
        await notificationService.dispatchEvent({
          event_type: 'recruiter_approved',
          recipient_id: r.user_id, recipient_email: r.email, recipient_name: r.name,
          sender_role: 'admin', receiver_role: 'recruiter',
          title: '🎉 Recruiter Account Verified!',
          message: `Your recruiter profile for ${r.company} has been verified. You can now post jobs and schedule interviews.`,
          action_url: '/recruiter/dashboard', action_text: 'Go to Dashboard',
          metadata: { company: r.company, approved_date: new Date().toLocaleDateString() },
        }).catch(() => {});
      }
      setPending(prev => prev.filter(x => x.id !== r.id));
      toast.success(`✅ ${r.name} (${r.company}) approved!`);
    } catch (err) {
      toast.error('Failed to approve: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      await adminService.rejectRecruiter(rejectModal.id, rejectModal.user_id);
      if (rejectModal.user_id) {
        await notificationService.dispatchEvent({
          event_type: 'recruiter_rejected',
          recipient_id: rejectModal.user_id, recipient_email: rejectModal.email, recipient_name: rejectModal.name,
          sender_role: 'admin', receiver_role: 'recruiter',
          title: 'Recruiter Verification Decision',
          message: `Your verification for ${rejectModal.company} was not approved. Reason: ${rejectReason || 'Documents incomplete'}.`,
          action_url: '/recruiter/settings', action_text: 'Update Profile',
        }).catch(() => {});
      }
      setPending(prev => prev.filter(x => x.id !== rejectModal.id));
      toast.error(`❌ ${rejectModal.name} rejected and notified.`);
      setRejectModal(null); setRejectReason('');
    } catch (err) {
      toast.error('Failed to reject: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const filteredAll = allRecruiters.filter(r => {
    const q = search.toLowerCase();
    return !q || (r.name || '').toLowerCase().includes(q) || (r.company || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q);
  });

  return (
    <DashboardLayout title="Recruiter Verification">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(124,58,237,0.08))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShield style={{ color: '#F59E0B' }} /> Recruiter Verification Queue
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Review and approve recruiter profiles before they can post jobs.
            </p>
          </div>
          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
          {[
            { id: 'pending', label: 'Pending Approval', count: pending.length, accent: '#F59E0B' },
            { id: 'all', label: 'All Recruiters', count: allRecruiters.length, accent: '#4F46E5' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 1.1rem', borderRadius: '8px 8px 0 0',
                background: tab === t.id ? `${t.accent}15` : 'transparent',
                border: tab === t.id ? `1px solid ${t.accent}40` : '1px solid transparent',
                borderBottom: tab === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
                color: tab === t.id ? t.accent : 'var(--color-muted)',
                fontWeight: tab === t.id ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              {t.label}
              <span style={{ background: `${t.accent}20`, color: t.accent, padding: '0 7px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 900 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-muted)' }}>
            <FiLoader style={{ fontSize: '2.5rem', color: '#F59E0B', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
            Loading from Supabase...
          </div>
        ) : tab === 'pending' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                <FiCheckCircle style={{ fontSize: '3rem', color: '#10B981', opacity: 0.6, display: 'block', margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>No pending verifications!</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>New requests appear here automatically via Supabase Realtime.</div>
              </div>
            ) : (
              pending.map(r => <RecruiterCard key={r.id} r={r} onApprove={handleApprove} onReject={setRejectModal} processing={processing} />)
            )}
          </div>
        ) : (
          /* All Recruiters */
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input type="text" placeholder="Search recruiters..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.2rem', width: '100%' }} />
            </div>
            {filteredAll.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>No recruiters found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Name', 'Company', 'Email', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAll.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{r.name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)' }}>{r.company}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.8rem' }}>{r.email}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800,
                            background: r.verification_status === 'Verified' ? 'rgba(16,185,129,0.15)' : r.verification_status === 'Rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                            color: r.verification_status === 'Verified' ? '#10B981' : r.verification_status === 'Rejected' ? '#EF4444' : '#F59E0B',
                          }}>
                            {r.verification_status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--color-muted)', fontSize: '0.78rem' }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'rgba(15,15,25,0.97)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 18, width: '100%', maxWidth: 480, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>Reject Recruiter</h3>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
              Rejecting <strong style={{ color: 'var(--color-text)' }}>{rejectModal.name}</strong> from <strong style={{ color: '#4F46E5' }}>{rejectModal.company}</strong>. They will be notified.
            </p>
            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text)' }}>Rejection Reason *</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Incomplete documents, invalid company info..."
                  rows={4} required className="input-field" style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'var(--color-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
                <button type="submit" disabled={processing === rejectModal.id} style={{ padding: '0.6rem 1.25rem', background: '#EF4444', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {processing === rejectModal.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiX />} Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default RecruiterVerification;
