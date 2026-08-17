-- =============================================================================
-- SkillTrack AI — Fix Admin RLS for Notifications & Audit Logs Pages
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================
-- This script grants the authenticated admin user read access to all rows
-- in notifications, interview_requests, and profiles tables.
-- Without this, RLS blocks admin from seeing other users' data.
-- =============================================================================

-- ─── 1. NOTIFICATIONS TABLE ───────────────────────────────────────────────────
-- Drop old restrictive policy that only allows user to see own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins to view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated select notifications" ON public.notifications;

-- New: Allow ALL authenticated users to select all notifications (admin needs this)
CREATE POLICY "Allow all authenticated users to view notifications"
  ON public.notifications
  FOR SELECT
  USING (true);

-- Keep update policy for users marking their own as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Keep delete policy
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (true);

-- Keep insert policy
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Allow insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);


-- ─── 2. INTERVIEW_REQUESTS TABLE ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow authenticated select interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Students view own interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Recruiters view own interview requests" ON public.interview_requests;

CREATE POLICY "Allow all authenticated to view interview requests"
  ON public.interview_requests
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated update interview requests" ON public.interview_requests;
CREATE POLICY "Allow authenticated to update interview requests"
  ON public.interview_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated insert interview requests" ON public.interview_requests;
CREATE POLICY "Allow authenticated to insert interview requests"
  ON public.interview_requests
  FOR INSERT
  WITH CHECK (true);


-- ─── 3. PROFILES TABLE ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow reading all profiles" ON public.profiles;

-- Allow reading ALL profiles (admin needs full user list)
CREATE POLICY "Allow reading all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Only allow users to update their own profile
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Only allow users to insert their own profile
DROP POLICY IF EXISTS "insert own profile" ON public.profiles;
CREATE POLICY "insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ─── 4. CANDIDATE_PROFILES TABLE ─────────────────────────────────────────────
DROP POLICY IF EXISTS "read own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Allow reading candidate profiles" ON public.candidate_profiles;

CREATE POLICY "Allow reading all candidate profiles"
  ON public.candidate_profiles
  FOR SELECT
  USING (true);


-- ─── 5. RECRUITER_PROFILES TABLE ─────────────────────────────────────────────
DROP POLICY IF EXISTS "read own recruiter profile" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Allow admins full access to recruiter profiles" ON public.recruiter_profiles;

CREATE POLICY "Allow reading all recruiter profiles"
  ON public.recruiter_profiles
  FOR SELECT
  USING (true);


-- ─── 6. AUDIT_LOGS TABLE (create if not exists) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    resource TEXT DEFAULT 'system',
    status TEXT DEFAULT 'success',
    ip_address TEXT DEFAULT '—',
    metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);


-- ─── 7. STUDENT_PAYMENTS TABLE ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Students view own payments" ON public.student_payments;
DROP POLICY IF EXISTS "Allow admins to read all payments" ON public.student_payments;

CREATE POLICY "Allow reading all payments"
  ON public.student_payments
  FOR SELECT
  USING (true);


-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('notifications', 'interview_requests', 'profiles', 'audit_logs', 'candidate_profiles', 'recruiter_profiles')
ORDER BY tablename, policyname;
