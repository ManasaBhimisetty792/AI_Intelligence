-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Supabase Notifications Table Migration
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable UUID extension (already enabled in most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Notifications Table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    message         TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'system',
    -- notification_type values: 'system', 'Interviews', 'Reports', 'Payments',
    -- 'Profile', 'registration', 'login', 'admin_approval', 'admin_announcement',
    -- 'interview_scheduled', 'interview_cancelled', 'interview_completed',
    -- 'resume_uploaded', 'payment_success', 'profile_updated', 'feedback_submitted'
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    action_url      TEXT,
    action_text     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user queries (most common access pattern)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON public.notifications(user_id);

-- Index for unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications(user_id, is_read)
    WHERE is_read = FALSE;

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON public.notifications(created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Auto-update updated_at on row modification
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row-Level Security (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can mark their own notifications as read / delete them
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role (backend) can insert notifications for any user
CREATE POLICY "Service role can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (TRUE);
-- Note: This policy is permissive for INSERT because the backend
-- uses the service_role key which bypasses RLS. If you want stricter
-- control, change WITH CHECK to: auth.uid() = user_id


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Seed Sample Notifications (Optional — for development/testing)
-- ─────────────────────────────────────────────────────────────────────────────
-- Replace '00000000-0000-0000-0000-000000000000' with a real user UUID from
-- your auth.users table before running this block.

/*
INSERT INTO public.notifications (user_id, title, message, notification_type, is_read, action_url, action_text)
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        'Welcome to SkillTrack AI! 🎉',
        'Your account has been created. Start by completing your profile and uploading your resume.',
        'registration',
        false,
        '/student/profile',
        'Complete Profile'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'Interview Score Ready',
        'Your recent AI Full Stack React interview drill report is available with a 92% match score.',
        'Reports',
        false,
        '/student/reports',
        'View Report'
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'Skill Badge Verified',
        'You unlocked the "FastAPI & Modern Microservices" Advanced Skill Certification.',
        'Profile',
        true,
        null,
        null
    );
*/


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Verify
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notifications'
ORDER BY ordinal_position;
