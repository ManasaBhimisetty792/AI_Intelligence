-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Fix Row-Level Security (RLS) Policy for recruiter_profiles
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable RLS on recruiter_profiles if not already enabled
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive single-user SELECT policy
DROP POLICY IF EXISTS "Recruiters can view their own profile" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Public and students can view recruiter profiles" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.recruiter_profiles;

-- 3. Create public SELECT policy so Students can view Recruiter Marketplace cards
CREATE POLICY "Allow public read access"
    ON public.recruiter_profiles
    FOR SELECT
    USING (true);

-- 4. Preserve UPDATE and INSERT policies for the recruiter owner
DROP POLICY IF EXISTS "Recruiters can update their own profile" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can update their own profile"
    ON public.recruiter_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can insert their profile" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can insert their profile"
    ON public.recruiter_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. Verify policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'recruiter_profiles';
