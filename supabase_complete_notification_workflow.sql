-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Complete Notification & Interview Workflow SQL Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Core Notifications Table (with exact schema requested by user & aliases)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    message           TEXT NOT NULL,
    category          TEXT DEFAULT 'system',
    notification_type TEXT DEFAULT 'system',
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    priority          TEXT DEFAULT 'normal', -- 'low' | 'normal' | 'high' | 'urgent'
    action_label      TEXT,                  -- e.g. 'Join Meeting', 'Accept Reschedule'
    action_path       TEXT,                  -- e.g. '/student/live-interview', '/recruiter/candidates'
    action_url        TEXT,                  -- Backward compatibility alias
    action_text       TEXT,                  -- Backward compatibility alias
    sender_id         UUID,
    receiver_id       UUID,
    sender_role       TEXT DEFAULT 'system', -- 'student' | 'recruiter' | 'admin' | 'system'
    receiver_role     TEXT DEFAULT 'student',-- 'student' | 'recruiter' | 'admin'
    is_admin_viewable BOOLEAN DEFAULT TRUE,
    metadata          JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS notification_type TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS action_label TEXT,
ADD COLUMN IF NOT EXISTS action_path TEXT,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS action_text TEXT,
ADD COLUMN IF NOT EXISTS sender_id UUID,
ADD COLUMN IF NOT EXISTS receiver_id UUID,
ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS receiver_role TEXT DEFAULT 'student',
ADD COLUMN IF NOT EXISTS is_admin_viewable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);

-- RLS Policies for Notifications Table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select notifications" ON public.notifications;
CREATE POLICY "Allow authenticated select notifications"
    ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated insert notifications"
    ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update notifications" ON public.notifications;
CREATE POLICY "Allow authenticated update notifications"
    ON public.notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete notifications" ON public.notifications;
CREATE POLICY "Allow authenticated delete notifications"
    ON public.notifications FOR DELETE USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Enhance interview_requests Table for Complete Workflow & Meeting Links
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.interview_requests (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recruiter_id         UUID,
    recruiter_user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_type       TEXT DEFAULT 'Technical Deep Dive',
    preferred_datetime   TIMESTAMPTZ,
    message              TEXT,
    status               TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'reschedule_requested' | 'reschedule_accepted' | 'completed' | 'cancelled'
    meeting_id           TEXT,
    meeting_link         TEXT,
    meeting_date         TEXT,
    meeting_time         TEXT,
    duration             TEXT DEFAULT '60 mins',
    reject_reason        TEXT,
    reschedule_datetime  TIMESTAMPTZ,
    reschedule_reason    TEXT,
    reschedule_status    TEXT, -- 'pending_student' | 'accepted_student' | 'rejected_student'
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_requests
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_date TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '60 mins',
ADD COLUMN IF NOT EXISTS reject_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_status TEXT;

CREATE INDEX IF NOT EXISTS idx_interview_requests_student_id ON public.interview_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_recruiter_user_id ON public.interview_requests(recruiter_user_id);
CREATE INDEX IF NOT EXISTS idx_interview_requests_status ON public.interview_requests(status);

ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select interview requests" ON public.interview_requests;
CREATE POLICY "Allow authenticated select interview requests"
    ON public.interview_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert interview requests" ON public.interview_requests;
CREATE POLICY "Allow authenticated insert interview requests"
    ON public.interview_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update interview requests" ON public.interview_requests;
CREATE POLICY "Allow authenticated update interview requests"
    ON public.interview_requests FOR UPDATE USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Dedicated interview_feedback Table for Student Reviews
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_request_id UUID REFERENCES public.interview_requests(id) ON DELETE CASCADE,
    student_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recruiter_user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating       NUMERIC DEFAULT 5,
    technical_rating     NUMERIC DEFAULT 5,
    communication_rating NUMERIC DEFAULT 5,
    behaviour_rating     NUMERIC DEFAULT 5,
    comments             TEXT,
    recommendation       TEXT DEFAULT 'Highly Recommended',
    is_anonymous         BOOLEAN DEFAULT FALSE,
    submitted_by_role    TEXT DEFAULT 'student',
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select interview feedback" ON public.interview_feedback;
CREATE POLICY "Allow authenticated select interview feedback"
    ON public.interview_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert interview feedback" ON public.interview_feedback;
CREATE POLICY "Allow authenticated insert interview feedback"
    ON public.interview_feedback FOR INSERT WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Verification Query
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'Notification and interview workflow tables initialized successfully.' AS result;
