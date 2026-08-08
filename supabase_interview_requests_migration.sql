-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Supabase Interview Requests Table Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Interview Requests Table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.interview_requests (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id       TEXT,
    recruiter_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_type     TEXT NOT NULL DEFAULT 'Technical Deep Dive',
    preferred_datetime TIMESTAMPTZ NOT NULL,
    message            TEXT,
    status             TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected | cancelled
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_requests_recruiter
    ON public.interview_requests(recruiter_user_id);

CREATE INDEX IF NOT EXISTS idx_interview_requests_student
    ON public.interview_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_interview_requests_status
    ON public.interview_requests(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Row-Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own sent requests
CREATE POLICY "Students can view own interview requests"
    ON public.interview_requests
    FOR SELECT
    USING (auth.uid() = student_id);

-- Recruiters can view requests sent to them
CREATE POLICY "Recruiters can view incoming interview requests"
    ON public.interview_requests
    FOR SELECT
    USING (auth.uid() = recruiter_user_id);

-- Students can insert requests
CREATE POLICY "Students can insert interview requests"
    ON public.interview_requests
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Recruiters can update (accept/reject) requests sent to them
CREATE POLICY "Recruiters can update incoming interview requests"
    ON public.interview_requests
    FOR UPDATE
    USING (auth.uid() = recruiter_user_id)
    WITH CHECK (auth.uid() = recruiter_user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Verify
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'interview_requests'
ORDER BY ordinal_position;
