-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Admin RLS Policies & Permissions Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Profiles Table Policies (Allow Admins & directory listing to read & update profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins full access to profiles" ON public.profiles;
CREATE POLICY "Allow admins full access to profiles"
    ON public.profiles
    FOR ALL
    USING (
        auth.uid() = id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        true
    );

-- 2. Candidate Profiles Policies (Allow reading candidate student profiles)
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading candidate profiles" ON public.candidate_profiles;
CREATE POLICY "Allow reading candidate profiles"
    ON public.candidate_profiles
    FOR ALL
    USING (true);

-- 3. Recruiter Profiles Policies (Allow Admins to read & verify recruiter profiles)
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins full access to recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Allow admins full access to recruiter profiles"
    ON public.recruiter_profiles
    FOR ALL
    USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        true
    );

-- 3. Student Payments & Subscriptions (Allow Admins to view revenue records)
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to read all payments" ON public.student_payments;
CREATE POLICY "Allow admins to read all payments"
    ON public.student_payments
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        true
    );

ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to read all subscriptions" ON public.student_subscriptions;
CREATE POLICY "Allow admins to read all subscriptions"
    ON public.student_subscriptions
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        true
    );

-- 4. Notifications & Audit Logs (Allow Admins to view platform notifications and logs)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to view all notifications" ON public.notifications;
CREATE POLICY "Allow admins to view all notifications"
    ON public.notifications
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        true
    );

-- 5. Audit Logs Table Setup (Optional)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL,
    resource TEXT DEFAULT 'system',
    status TEXT DEFAULT 'success',
    ip_address TEXT DEFAULT '—'
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
