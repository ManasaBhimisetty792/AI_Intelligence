import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  FiUsers, FiSearch, FiRefreshCw, FiLoader, FiUserX, FiUserCheck,
  FiShield, FiEdit3, FiX, FiCheck, FiDownload, FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

// ─── Role & Status helpers ────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin:     { bg: 'rgba(124,58,237,0.15)',  color: '#7C3AED' },
  recruiter: { bg: 'rgba(16,185,129,0.15)',  color: '#10B981' },
  student:   { bg: 'rgba(79,70,229,0.15)',   color: '#4F46E5' },
};

const STATUS_COLORS = {
  approved: { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', label: '✓ Active' },
  active:   { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', label: '✓ Active' },
  pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B', label: '⏳ Pending' },
  suspended:{ bg: 'rgba(239,68,68,0.12)',   color: '#EF4444', label: '⊘ Suspended' },
};

const RoleBadge = ({ role }) => {
  const c = ROLE_COLORS[role] || { bg: 'rgba(100,116,139,0.15)', color: '#64748B' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {role || 'unknown'}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: status || 'Unknown' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

// ─── CSV Export ───────────────────────────────────────────────────────────────
const exportCSV = (users) => {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
  const rows = users.map(u => [
    u.full_name || u.name || 'User',
    u.email || '',
    u.role || '',
    u.approval_status || '',
    u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'users_export.csv'; a.click();
  URL.revokeObjectURL(url);
};

// ─── UserManagement ───────────────────────────────────────────────────────────
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useRealtime(['profiles'], fetchUsers);

  const filtered = users.filter(u => {
    const name = (u.full_name || u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (u.approval_status || 'active') === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSuspend = async (u) => {
    setProcessingId(u.id);
    try {
      await adminService.updateUserStatus(u.id, 'suspended');
      await notificationService.createNotification({
        receiver_id: u.id, sender_role: 'admin', receiver_role: u.role,
        title: 'Account Suspended',
        message: 'Your account has been temporarily suspended by the platform admin. Contact support.',
        notification_type: 'admin_announcement', is_admin_viewable: true,
      }).catch(() => {});
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, approval_status: 'suspended' } : x));
      toast.success(`${u.full_name || 'User'} suspended.`);
    } catch { toast.error('Failed to suspend user.'); }
    finally { setProcessingId(null); }
  };

  const handleReactivate = async (u) => {
    setProcessingId(u.id);
    try {
      await adminService.updateUserStatus(u.id, 'approved');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, approval_status: 'approved' } : x));
      toast.success(`${u.full_name || 'User'} reactivated.`);
    } catch { toast.error('Failed to reactivate.'); }
    finally { setProcessingId(null); }
  };

  const roleCount = (role) => users.filter(u => u.role === role).length;

  return (
    <DashboardLayout title="User Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── KPI Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Users', value: users.length, accent: '#4F46E5' },
            { label: 'Students', value: roleCount('student'), accent: '#4F46E5' },
            { label: 'Recruiters', value: roleCount('recruiter'), accent: '#10B981' },
            { label: 'Admins', value: roleCount('admin'), accent: '#7C3AED' },
            { label: 'Suspended', value: users.filter(u => u.approval_status === 'suspended').length, accent: '#EF4444' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${stat.accent}33`, borderRadius: 14, padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${stat.accent}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stat.accent }}>{loading ? '—' : stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, marginTop: '0.2rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUsers style={{ color: '#4F46E5' }} /> Platform Account Directory
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', margin: '0.2rem 0 0' }}>
                {filtered.length} users found
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => exportCSV(filtered)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 8, color: '#4F46E5', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                <FiDownload /> Export CSV
              </button>
              <button onClick={fetchUsers} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--color-text)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', fontSize: '0.85rem' }} />
              <input
                type="text" placeholder="Search by name or email..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-field" style={{ paddingLeft: '2.2rem', width: '100%' }}
              />
            </div>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="input-field" style={{ minWidth: 130 }}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field" style={{ minWidth: 140 }}>
              <option value="all">All Status</option>
              <option value="approved">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiLoader style={{ fontSize: '2rem', color: '#4F46E5', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 0.75rem' }} />
              Loading users from Supabase...
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>
              <FiUsers style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.5rem' }} />
              <div>No users match your filters.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.name || 'U')}&background=4f46e5&color=fff&size=64`}
                            alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(79,70,229,0.3)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.88rem' }}>{u.full_name || u.name || 'User'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{u.id?.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--color-muted)', fontSize: '0.82rem' }}>{u.email}</td>
                      <td style={{ padding: '0.9rem 1rem' }}><RoleBadge role={u.role} /></td>
                      <td style={{ padding: '0.9rem 1rem' }}><StatusBadge status={u.approval_status || 'active'} /></td>
                      <td style={{ padding: '0.9rem 1rem', color: 'var(--color-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {u.role !== 'admin' && (
                          u.approval_status === 'suspended' ? (
                            <button
                              onClick={() => handleReactivate(u)}
                              disabled={processingId === u.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.75rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, color: '#10B981', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {processingId === u.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiUserCheck />} Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(u)}
                              disabled={processingId === u.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, color: '#EF4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {processingId === u.id ? <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> : <FiUserX />} Suspend
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '0.4rem 0.85rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontWeight: 600, fontSize: '0.82rem' }}>
                ← Prev
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '0.4rem 0.85rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, fontWeight: 600, fontSize: '0.82rem' }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default UserManagement;
