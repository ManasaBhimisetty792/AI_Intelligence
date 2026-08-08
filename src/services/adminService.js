/**
 * adminService.js — Centralized Supabase data layer for all Admin pages.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function fetchDashboardStats() {
  if (!isSupabaseConfigured()) return { totalStudents: 0, totalRecruiters: 0, pendingVerifications: 0, totalInterviews: 0, unreadNotifications: 0 };

  const [studentsRes, recruitersRes, pendingRes, interviewRes, notifRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'recruiter'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'recruiter').eq('approval_status', 'pending'),
    supabase.from('interview_requests').select('id', { count: 'exact', head: true }),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
  ]);

  return {
    totalStudents: studentsRes.count ?? 0,
    totalRecruiters: recruitersRes.count ?? 0,
    pendingVerifications: pendingRes.count ?? 0,
    totalInterviews: interviewRes.count ?? 0,
    unreadNotifications: notifRes.count ?? 0,
  };
}

// ─── User Growth Chart (last 8 months grouped) ───────────────────────────────
export async function fetchUserGrowthChart() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('profiles').select('role, created_at').order('created_at', { ascending: true });
  if (error || !data) return [];

  const months = {};
  data.forEach((p) => {
    const d = new Date(p.created_at);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!months[key]) months[key] = { month: key, Students: 0, Recruiters: 0 };
    if (p.role === 'student') months[key].Students++;
    if (p.role === 'recruiter') months[key].Recruiters++;
  });

  return Object.values(months).slice(-8);
}

// ─── Role Distribution ────────────────────────────────────────────────────────
export async function fetchRoleDistribution() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('profiles').select('role');
  if (error || !data) return [];

  const counts = { student: 0, recruiter: 0, admin: 0 };
  data.forEach((p) => { if (p.role in counts) counts[p.role]++; });

  return [
    { name: 'Students', value: counts.student, fill: '#4F46E5' },
    { name: 'Recruiters', value: counts.recruiter, fill: '#10B981' },
    { name: 'Admins', value: counts.admin, fill: '#7C3AED' },
  ];
}

// ─── Interview Trend ──────────────────────────────────────────────────────────
export async function fetchInterviewTrend() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('interview_requests').select('status, created_at').order('created_at', { ascending: true });
  if (error || !data) return [];

  const weeks = {};
  data.forEach((r) => {
    const d = new Date(r.created_at);
    const wk = Math.ceil(d.getDate() / 7);
    const key = `W${wk} ${d.toLocaleString('default', { month: 'short' })}`;
    if (!weeks[key]) weeks[key] = { week: key, Total: 0, Accepted: 0, Pending: 0 };
    weeks[key].Total++;
    const st = (r.status || '').toLowerCase();
    if (st === 'accepted') weeks[key].Accepted++;
    else if (st === 'pending') weeks[key].Pending++;
  });

  return Object.values(weeks).slice(-8);
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
export async function fetchRecentActivity(limit = 15) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
  return error ? [] : (data || []);
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function fetchAllUsers() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return error ? [] : (data || []);
}

export async function updateUserStatus(userId, status) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from('profiles').update({ approval_status: status, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

export async function updateUserRole(userId, role) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

// ─── Recruiter Verification ───────────────────────────────────────────────────
const mapRecruiterProfile = (r) => ({
  id: r.id, user_id: r.user_id,
  name: r.full_name || 'Recruiter', company: r.company_name || r.company || 'Company',
  designation: r.designation || 'Recruiter', email: r.email || '',
  linkedinUrl: r.linkedin_url || '', industry: r.industry || '',
  location: r.location || '', tax_id: r.tax_id || '',
  registration_doc_url: r.registration_doc_url || '',
  date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Today',
  verification_status: r.verification_status || 'Pending',
});

export async function fetchPendingRecruiters() {
  if (!isSupabaseConfigured()) return [];
  const { data: rp } = await supabase.from('recruiter_profiles').select('*')
    .or('verification_status.eq.Pending,verification_status.eq.pending,verification_status.is.null')
    .order('created_at', { ascending: false });
  if (rp && rp.length > 0) return rp.map(mapRecruiterProfile);

  const { data: pf } = await supabase.from('profiles').select('*').eq('role', 'recruiter').eq('approval_status', 'pending');
  if (pf && pf.length > 0) return pf.map(mapRecruiterProfile);
  return [];
}

export async function fetchAllRecruiters() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('recruiter_profiles').select('*').order('created_at', { ascending: false });
  return error ? [] : (data || []).map(mapRecruiterProfile);
}

export async function approveRecruiter(id, userId) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('recruiter_profiles').update({ verification_status: 'Verified', verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', id);
  if (userId) await supabase.from('profiles').update({ approval_status: 'approved' }).eq('id', userId);
}

export async function rejectRecruiter(id) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('recruiter_profiles').update({ verification_status: 'Rejected', updated_at: new Date().toISOString() }).eq('id', id);
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export async function fetchAuditLogs(limit = 100) {
  if (!isSupabaseConfigured()) return [];

  const { data: auditData, error: auditError } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (!auditError && auditData && auditData.length > 0) return auditData;

  const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
  if (notifData && notifData.length > 0) {
    return notifData.map((n) => ({
      id: n.id, created_at: n.created_at,
      user_id: n.sender_id || n.user_id, user_email: n.sender_role || 'system',
      action: n.title || 'System Event', ip_address: '—',
      resource: n.notification_type || 'system', status: 'success',
    }));
  }
  return [];
}

// ─── Admin Notifications ──────────────────────────────────────────────────────
export async function fetchAdminNotifications() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(200);
  return error ? [] : (data || []);
}

export async function markNotificationRead(id) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead() {
  if (!isSupabaseConfigured()) return;
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
}

const adminService = {
  fetchDashboardStats, fetchUserGrowthChart, fetchRoleDistribution,
  fetchInterviewTrend, fetchRecentActivity, fetchAllUsers,
  updateUserStatus, updateUserRole, fetchPendingRecruiters,
  fetchAllRecruiters, approveRecruiter, rejectRecruiter,
  fetchAuditLogs, fetchAdminNotifications, markNotificationRead, markAllNotificationsRead,
};

export default adminService;
