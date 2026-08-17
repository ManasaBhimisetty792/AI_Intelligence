import React, { useState, useEffect, useCallback } from 'react';
import {
  FiCheckCircle, FiLinkedin, FiExternalLink, FiShield, FiX,
  FiLoader, FiRefreshCw, FiUser, FiBriefcase, FiFileText, FiMail,
  FiMapPin,
  FiTag,
} from 'react-icons/fi';
import { FaIndustry } from 'react-icons/fa';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import AdminDataTable from '../../components/Admin/AdminDataTable';
import adminService from '../../services/adminService';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

const RecruiterCard = ({ r, onApprove, onReject, processing }) => (
  <div
    style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '1.5rem',
      display: 'flex',
      gap: '1.25rem',
      flexWrap: 'wrap',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-normal)',
    }}
  >
    {/* Avatar / Brand */}
    <div
  style={{
    width: 58,
    height: 58,
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}
>
  {r.avatar_url ? (
    <img
      src={r.avatar_url}
      alt={r.name || r.company || 'Recruiter'}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  ) : (
    <span
      style={{
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 900,
      }}
    >
      {(r.name || r.company || 'R')[0].toUpperCase()}
    </span>
  )}
</div>

    {/* Info Details */}
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>{r.name}</h4>
        <span
          style={{
            background: 'var(--color-warning-light)',
            color: 'var(--color-warning)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 800,
          }}
        >
          ⏳ PENDING VERIFICATION
        </span>
      </div>

      <div style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginBottom: '0.6rem' }}>
        <strong style={{ color: 'var(--color-text)' }}>{r.designation}</strong>
        {r.company && <> at <strong style={{ color: 'var(--color-primary)' }}>{r.company}</strong></>}
      </div>

    <div
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.85rem',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    marginBottom: '0.85rem',
  }}
>
  {r.email && (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <FiMail size={14} />
      {r.email}
    </span>
  )}

  {r.industry && (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <FaIndustry size={14} />
      {r.industry}
    </span>
  )}

  {r.location && (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <FiMapPin size={14} />
      {r.location}
    </span>
  )}

  {r.tax_id && (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <FiTag size={14} />
      Tax ID:
      <code
        style={{
          background: 'var(--color-surface-sec)',
          padding: '2px 6px',
          borderRadius: 4,
        }}
      >
        {r.tax_id}
      </code>
    </span>
  )}
</div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {r.linkedinUrl && (
          <a
            href={r.linkedinUrl.startsWith('http') ? r.linkedinUrl : `https://${r.linkedinUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <FiLinkedin /> Verify LinkedIn Profile <FiExternalLink style={{ fontSize: '0.7rem' }} />
          </a>
        )}
        {r.registration_doc_url && (
          <a
            href={r.registration_doc_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <FiFileText /> View Verification Docs <FiExternalLink style={{ fontSize: '0.7rem' }} />
          </a>
        )}
      </div>

      <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)', marginTop: '0.6rem' }}>Submitted: {r.date}</div>
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'center', flexShrink: 0 }}>
      <button
        onClick={() => onApprove(r)}
        disabled={processing === r.id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.65rem 1.3rem',
          background: 'var(--color-primary-light)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-primary)',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: processing === r.id ? 'not-allowed' : 'pointer',
        }}
      >
        {processing === r.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle />} Approve
      </button>
      <button
        onClick={() => onReject(r)}
        disabled={processing === r.id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.65rem 1.3rem',
          background: 'var(--color-danger-light)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger)',
          fontWeight: 800,
          fontSize: '0.85rem',
          cursor: processing === r.id ? 'not-allowed' : 'pointer',
        }}
      >
        <FiX /> Reject
      </button>
    </div>
  </div>
);

export const RecruiterVerification = () => {
  const [pending, setPending] = useState([]);
  const [allRecruiters, setAllRecruiters] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRecruiterData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        adminService.fetchPendingRecruiters(),
        adminService.fetchAllRecruiters(),
      ]);
      setPending(p);
      setAllRecruiters(a);
    } catch (err) {
      toast.error('Failed to load recruiter dataset.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruiterData();
  }, [loadRecruiterData]);

  useRealtime(['recruiter_profiles', 'profiles'], loadRecruiterData);

  const handleApprove = async (r) => {
    setProcessing(r.id);
    try {
      await adminService.approveRecruiter(r.id, r.user_id);
      if (r.user_id) {
        await notificationService
          .dispatchEvent({
            event_type: 'recruiter_approved',
            recipient_id: r.user_id,
            recipient_email: r.email,
            recipient_name: r.name,
            sender_role: 'admin',
            receiver_role: 'recruiter',
            title: '🎉 Recruiter Verification Approved!',
            message: `Your recruiter account for ${r.company} has been verified by SkillTrack AI administration. You can now publish job postings and schedule candidate interviews.`,
            action_url: '/recruiter/dashboard',
            action_text: 'Go to Recruiter Dashboard',
          })
          .catch(() => {});
      }
      setPending((prev) => prev.filter((x) => x.id !== r.id));
      toast.success(`✅ ${r.name} (${r.company}) verified and notified.`);
    } catch (err) {
      toast.error('Failed to approve recruiter: ' + err.message);
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
        await notificationService
          .dispatchEvent({
            event_type: 'recruiter_rejected',
            recipient_id: rejectModal.user_id,
            recipient_email: rejectModal.email,
            recipient_name: rejectModal.name,
            sender_role: 'admin',
            receiver_role: 'recruiter',
            title: 'Recruiter Verification Update',
            message: `Your recruiter verification request for ${rejectModal.company} was not approved. Reason: ${rejectReason || 'Incomplete verification documents'}.`,
            action_url: '/recruiter/settings',
            action_text: 'Update Profile Info',
          })
          .catch(() => {});
      }
      setPending((prev) => prev.filter((x) => x.id !== rejectModal.id));
      toast.error(`❌ Verification for ${rejectModal.name} rejected.`);
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error('Failed to reject: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const verifiedCount = allRecruiters.filter((r) => r.verification_status === 'Verified' || r.verification_status === 'approved').length;
  const rejectedCount = allRecruiters.filter((r) => r.verification_status === 'Rejected').length;

  const stats = [
    { label: 'Pending Verification', value: pending.length, accent: 'var(--color-warning)' },
    { label: 'Verified Recruiters', value: verifiedCount, accent: 'var(--color-primary)' },
    { label: 'Total Recruiter Profiles', value: allRecruiters.length, accent: 'var(--color-secondary)' },
    { label: 'Rejected', value: rejectedCount, accent: 'var(--color-danger)' },
  ];

  const columns = [
    {
      header: 'Recruiter Name',
      accessor: 'name',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{r.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{r.designation}</div>
        </div>
      ),
    },
    {
      header: 'Company Name',
      accessor: 'company',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <FiBriefcase style={{ color: 'var(--color-primary)' }} /> {r.company}
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (r) => <span style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>{r.email}</span>,
    },
    {
      header: 'Status',
      render: (r) => {
        const isVerified = r.verification_status === 'Verified' || r.verification_status === 'approved';
        const isRejected = r.verification_status === 'Rejected';
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.74rem',
              fontWeight: 800,
              background: isVerified ? 'var(--color-primary-light)' : isRejected ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
              color: isVerified ? 'var(--color-success)' : isRejected ? 'var(--color-danger)' : 'var(--color-warning)',
            }}
          >
            {isVerified ? '✓ Verified' : isRejected ? '⊘ Rejected' : '⏳ Pending'}
          </span>
        );
      },
    },
    {
      header: 'Registration Date',
      render: (r) => <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{r.date}</span>,
    },
  ];

  return (
    <AdminLayout
      title="Recruiter Verification & Management"
      subtitle="Review employer profile verification applications and manage partner accounts."
      onRefresh={loadRecruiterData}
      refreshing={loading}
    >
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {stats.map((s) => (
          <AdminStatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'pending', label: 'Pending Queue', count: pending.length, accent: 'var(--color-warning)' },
          { id: 'all', label: 'All Recruiter Directory', count: allRecruiters.length, accent: 'var(--color-primary)' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              background: activeTab === t.id ? 'var(--color-surface-sec)' : 'transparent',
              border: activeTab === t.id ? '1px solid var(--color-border)' : '1px solid transparent',
              borderBottom: activeTab === t.id ? `3px solid ${t.accent}` : '3px solid transparent',
              color: activeTab === t.id ? 'var(--color-text)' : 'var(--color-muted)',
              fontWeight: activeTab === t.id ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {t.label}
            <span
              style={{
                background: activeTab === t.id ? t.accent : 'var(--color-border)',
                color: activeTab === t.id ? '#fff' : 'var(--color-muted)',
                padding: '1px 7px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiLoader style={{ fontSize: '2rem', color: 'var(--color-warning)', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
              Loading pending verification queue from Supabase...
            </div>
          ) : pending.length === 0 ? (
            <div
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <FiCheckCircle style={{ fontSize: '3rem', color: 'var(--color-success)', marginBottom: '0.75rem', opacity: 0.8 }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>No Pending Verification Requests!</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                All employer profiles have been reviewed. New verification submissions will appear automatically.
              </div>
            </div>
          ) : (
            pending.map((r) => (
              <RecruiterCard key={r.id} r={r} onApprove={handleApprove} onReject={setRejectModal} processing={processing} />
            ))
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={allRecruiters}
          loading={loading}
          searchPlaceholder="Search recruiters by name, company, or email..."
          emptyTitle="No recruiters found"
          emptySub="No recruiter profiles exist in the database."
        />
      )}

      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 480,
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-danger)' }}>Reject Recruiter Profile</h3>
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: '1.2rem' }}
              >
                <FiX />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
              You are rejecting <strong style={{ color: 'var(--color-text)' }}>{rejectModal.name}</strong> from{' '}
              <strong style={{ color: 'var(--color-primary)' }}>{rejectModal.company}</strong>. An email notification will be dispatched.
            </p>

            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text)' }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide specific feedback (e.g. Invalid tax document, unverified company website)..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-sec)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason('');
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'var(--color-surface-sec)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing === rejectModal.id}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'var(--color-danger)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {processing === rejectModal.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiX />} Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RecruiterVerification;
