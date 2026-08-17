import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiUsers, FiUserX, FiUserCheck, FiDownload, FiRefreshCw, FiShield, FiStar,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout';
import AdminStatCard from '../../components/Admin/AdminStatCard';
import AdminDataTable from '../../components/Admin/AdminDataTable';
import adminService, { normalizeRole } from '../../services/adminService';
import notificationService from '../../services/notificationService';
import useRealtime from '../../hooks/useRealtime';

const getNormalizedRole = (role) => {
  if (typeof normalizeRole === 'function') {
    return normalizeRole(role);
  }
  if (!role) return 'student';
  const r = String(role).toLowerCase().trim();
  if (r === 'recruiter' || r === 'employer') return 'recruiter';
  if (r === 'admin' || r === 'administrator' || r === 'superadmin') return 'admin';
  return 'student';
};

const ROLE_STYLES = {
  admin: { bg: 'rgba(124,58,237,0.15)', color: '#7C3AED', label: 'ADMIN' },
  recruiter: { bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)', label: 'RECRUITER' },
  student: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)', label: 'STUDENT' },
};

const RoleBadge = ({ role }) => {
  const normRole = getNormalizedRole(role);
  const style = ROLE_STYLES[normRole] || ROLE_STYLES.student;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
      }}
    >
      {style.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const isApproved = status === 'approved' || status === 'active';
  const isSuspended = status === 'suspended';

  const bg = isApproved
    ? 'var(--color-primary-light)'
    : isSuspended
    ? 'var(--color-danger-light)'
    : 'var(--color-warning-light)';

  const color = isApproved
    ? 'var(--color-success)'
    : isSuspended
    ? 'var(--color-danger)'
    : 'var(--color-warning)';

  const label = isApproved ? '✓ Active' : isSuspended ? '⊘ Suspended' : '⏳ Pending';

  return (
    <span
      style={{
        background: bg,
        color: color,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.74rem',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
};

const CustomTooltipStyle = {
  background: 'var(--color-surface, #ffffff)',
  border: '1px solid var(--color-border, #e5e7eb)',
  borderRadius: 'var(--radius-md, 8px)',
  fontSize: '0.8rem',
  color: 'var(--color-text, #111827)',
  boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
};

const exportUsersCSV = (users) => {
  const headers = ['Name', 'Email', 'Role', 'Membership', 'Status', 'Joined Date'];
  const rows = users.map((u) => [
    u.name || u.full_name || 'User',
    u.email || '',
    getNormalizedRole(u.role).toUpperCase(),
    u.is_premium || u.membership_type === 'premium' ? 'Premium Pro' : 'Free Tier',
    u.approval_status || 'active',
    u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `skilltrack_users_export_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchAllUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useRealtime(['profiles', 'candidate_profiles', 'recruiter_profiles'], fetchUsers);

  const handleSuspend = async (u) => {
    setActionId(u.id);
    try {
      await adminService.updateUserStatus(u.id, 'suspended');
      await notificationService
        .createNotification({
          receiver_id: u.id,
          sender_role: 'admin',
          receiver_role: u.role,
          title: 'Account Status Updated',
          message: 'Your account has been suspended by the platform administrator.',
          notification_type: 'admin_announcement',
        })
        .catch(() => {});

      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, approval_status: 'suspended' } : x)));
      toast.success(`${u.name || 'User'} suspended successfully.`);
    } catch (err) {
      toast.error('Failed to suspend user.');
    } finally {
      setActionId(null);
    }
  };

  const handleReactivate = async (u) => {
    setActionId(u.id);
    try {
      await adminService.updateUserStatus(u.id, 'approved');
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, approval_status: 'approved' } : x)));
      toast.success(`${u.name || 'User'} account reactivated.`);
    } catch (err) {
      toast.error('Failed to reactivate user account.');
    } finally {
      setActionId(null);
    }
  };

  // KPI Calculations with role normalization
  const totalUsers = users.length;
  const studentCount = useMemo(
    () => users.filter((u) => getNormalizedRole(u.role) === 'student').length,
    [users]
  );
  const recruiterCount = useMemo(
    () => users.filter((u) => getNormalizedRole(u.role) === 'recruiter').length,
    [users]
  );
  const suspendedCount = useMemo(
    () => users.filter((u) => (u.approval_status || '').toLowerCase() === 'suspended').length,
    [users]
  );

  const statsList = [
    { label: 'Total Users', value: totalUsers, accent: 'var(--color-primary)' },
    { label: 'Students', value: studentCount, accent: 'var(--color-primary)' },
    { label: 'Recruiters', value: recruiterCount, accent: 'var(--color-secondary)' },
    { label: 'Suspended', value: suspendedCount, accent: 'var(--color-danger)' },
  ];

  // Chart 1: Donut Chart Data (Students vs Recruiters Ratio ONLY - No Admin)
  const roleChartData = useMemo(() => {
    return [
      { name: 'Students', value: studentCount, fill: '#059669' },
      { name: 'Recruiters', value: recruiterCount, fill: '#2563EB' },
    ];
  }, [studentCount, recruiterCount]);

  const totalStudentRecruiter = studentCount + recruiterCount;

  // Chart 2: Account Overview Data (Students vs Recruiters ONLY - No Admin)
  const accountOverviewData = useMemo(() => {
    const activeStudents = users.filter(
      (u) => getNormalizedRole(u.role) === 'student' && (u.approval_status || 'active').toLowerCase() !== 'suspended'
    ).length;
    const activeRecruiters = users.filter(
      (u) => getNormalizedRole(u.role) === 'recruiter' && (u.approval_status || 'active').toLowerCase() !== 'suspended'
    ).length;
    const proStudents = users.filter(
      (u) => getNormalizedRole(u.role) === 'student' && (u.is_premium || u.membership_type === 'premium')
    ).length;
    const proRecruiters = users.filter(
      (u) => getNormalizedRole(u.role) === 'recruiter' && (u.is_premium || u.membership_type === 'premium')
    ).length;

    return [
      { category: 'Total Registered', Students: studentCount, Recruiters: recruiterCount },
      { category: 'Active Accounts', Students: activeStudents, Recruiters: activeRecruiters },
      { category: 'Pro Premium', Students: proStudents, Recruiters: proRecruiters },
    ];
  }, [users, studentCount, recruiterCount]);

  // Chart 3: Monthly Registrations Bar Chart (Students vs Recruiters ONLY - No Admin)
  const monthlyRegistrationData = useMemo(() => {
    if (!users || users.length === 0) return [];

    const monthsMap = {};
    const sorted = [...users].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

    sorted.forEach((u) => {
      const role = getNormalizedRole(u.role);
      if (role !== 'student' && role !== 'recruiter') return; // Exclude Admins!

      const d = u.created_at ? new Date(u.created_at) : new Date();
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, Students: 0, Recruiters: 0 };
      }
      if (role === 'student') monthsMap[key].Students++;
      else if (role === 'recruiter') monthsMap[key].Recruiters++;
    });

    return Object.values(monthsMap);
  }, [users]);

  // Filtered Users Table Data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const normRole = getNormalizedRole(u.role);
      const matchRole = roleFilter === 'all' || normRole === roleFilter;
      const currentStatus = (u.approval_status || 'active').toLowerCase();
      const matchStatus = statusFilter === 'all' || currentStatus === statusFilter;
      return matchRole && matchStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const columns = [
    {
      header: 'User Account',
      searchValue: (r) => `${r.name || ''} ${r.email || ''} ${r.company || ''}`,
      render: (r) => {
        const isRecruiter = getNormalizedRole(r.role) === 'recruiter';
        const defaultBg = isRecruiter ? '2563EB' : '059669';
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || r.email || 'U')}&background=${defaultBg}&color=fff`;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={r.avatar_url || r.avatar || r.logo_url || fallbackAvatar}
              alt={r.name || 'User'}
              onError={(e) => {
                e.currentTarget.src = fallbackAvatar;
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${isRecruiter ? '#2563EB' : '#059669'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.88rem' }}>{r.name || 'User'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                {isRecruiter && r.company ? <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>{r.company} • </span> : null}
                ID: {r.id?.slice(0, 8)}…
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (r) => <span style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>{r.email}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (r) => <RoleBadge role={r.role} />,
    },
    {
      header: 'Membership Tier',
      render: (r) => (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: r.is_premium || r.membership_type === 'premium' ? 'var(--color-primary)' : 'var(--color-muted)',
          }}
        >
          {r.is_premium || r.membership_type === 'premium' ? <><FiStar style={{ fill: 'currentColor' }} /> Pro Premium</> : 'Free Tier'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.approval_status || 'active'} />,
    },
    {
      header: 'Joined Date',
      render: (r) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (r) =>
        getNormalizedRole(r.role) === 'admin' ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontWeight: 700 }}>System Admin</span>
        ) : (r.approval_status || '').toLowerCase() === 'suspended' ? (
          <button
            onClick={() => handleReactivate(r)}
            disabled={actionId === r.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <FiUserCheck /> Reactivate
          </button>
        ) : (
          <button
            onClick={() => handleSuspend(r)}
            disabled={actionId === r.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <FiUserX /> Suspend
          </button>
        ),
    },
  ];

  return (
    <AdminLayout
      title="User Account Directory"
      subtitle="Manage all student, recruiter, and administrator profiles stored in Supabase."
      onRefresh={fetchUsers}
      refreshing={loading}
      actions={
        <button
          onClick={() => exportUsersCSV(filteredUsers)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary)',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <FiDownload /> Export CSV
        </button>
      }
    >
      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
        {statsList.map((s) => (
          <AdminStatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Analytics & Charts Section (Students vs Recruiters ONLY) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Students vs Recruiters Ratio (Donut Chart) */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Students vs Recruiters Ratio
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Direct proportion of Student & Recruiter user accounts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 210 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CustomTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ width: '42%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roleChartData.map((item) => {
                const pct = totalStudentRecruiter > 0 ? Math.round((item.value / totalStudentRecruiter) * 100) : 0;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.fill, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
                        {item.value} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-muted)' }}>({pct}%)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--color-muted)', fontWeight: 600 }}>{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Account Overview (Side-by-Side Bar Chart) */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Account Status & Tiers
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Students vs Recruiters by Status & Plan
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={accountOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
              <XAxis dataKey="category" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="Students" name="Students" fill="#059669" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Recruiters" name="Recruiters" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Card 3: Monthly User Registrations (Grouped Bar Chart) */}
        <div
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
            Monthly Registrations
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Student vs Recruiter sign-ups per month
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyRegistrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="Students" name="Students" fill="#059669" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Recruiters" name="Recruiters" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role & Status Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'var(--glass-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)' }}>Role Filter:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)' }}>Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="approved">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <AdminDataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        searchPlaceholder="Search by name or email..."
        emptyTitle="No users found"
        emptySub="No user profiles match your selected search query or role filter."
      />
    </AdminLayout>
  );
};

export default UserManagement;
