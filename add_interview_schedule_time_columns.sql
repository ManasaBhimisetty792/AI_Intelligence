-- =============================================================================
-- SkillTrack AI — Complete Interview Requests Schema Migration
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================================

ALTER TABLE public.interview_requests
ADD COLUMN IF NOT EXISTS meeting_date TEXT,
ADD COLUMN IF NOT EXISTS meeting_time TEXT,
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS end_time TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '60 mins',
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS reject_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_datetime TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_status TEXT;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'interview_requests'
ORDER BY ordinal_position;
