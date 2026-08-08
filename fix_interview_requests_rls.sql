-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Fix Row-Level Security (RLS) for interview_requests
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable RLS on interview_requests
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop any restrictive policies
DROP POLICY IF EXISTS "Students can view own interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Recruiters can view incoming interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Students can insert interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Recruiters can update incoming interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Allow authenticated read interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Allow authenticated insert interview requests" ON public.interview_requests;
DROP POLICY IF EXISTS "Allow authenticated update interview requests" ON public.interview_requests;

-- 3. Create permissive policies for authenticated users
CREATE POLICY "Allow authenticated read interview requests"
    ON public.interview_requests
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert interview requests"
    ON public.interview_requests
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update interview requests"
    ON public.interview_requests
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 4. Verify policies
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'interview_requests';
