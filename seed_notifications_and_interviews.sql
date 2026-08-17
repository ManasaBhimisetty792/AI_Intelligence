-- =============================================================================
-- SkillTrack AI — Seed Notifications & Interview Requests in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================
-- This script populates sample rows into `notifications` and `interview_requests`
-- tables linked to your existing profiles in Supabase.
-- =============================================================================

-- 1. Insert sample interview requests linked to first student & recruiter profiles
DO $$
DECLARE
  student_uuid UUID;
  recruiter_uuid UUID;
BEGIN
  -- Grab first student profile ID
  SELECT id INTO student_uuid FROM public.profiles WHERE role = 'student' LIMIT 1;
  -- Grab first recruiter profile ID
  SELECT id INTO recruiter_uuid FROM public.profiles WHERE role = 'recruiter' LIMIT 1;

  IF student_uuid IS NOT NULL AND recruiter_uuid IS NOT NULL THEN
    INSERT INTO public.interview_requests (
      student_id,
      recruiter_user_id,
      interview_type,
      message,
      status,
      meeting_date,
      meeting_time,
      created_at
    ) VALUES
    (
      student_uuid,
      recruiter_uuid,
      'Full Stack React & Node.js System Architecture',
      'Candidate requested mock technical drill for Senior Full Stack Engineer role.',
      'accepted',
      '2026-08-20',
      '10:00 AM IST',
      NOW() - INTERVAL '2 hours'
    ),
    (
      student_uuid,
      recruiter_uuid,
      'FastAPI Microservices & Distributed Systems',
      'Drill focus on REST API scalability, Redis caching, and PostgreSQL queries.',
      'pending',
      '2026-08-22',
      '02:30 PM IST',
      NOW() - INTERVAL '30 minutes'
    ),
    (
      student_uuid,
      recruiter_uuid,
      'AI / LLM Model Integration & RAG Pipelines',
      'Mock interview covering LangChain, OpenAI API embeddings, and vector databases.',
      'completed',
      '2026-08-10',
      '11:00 AM IST',
      NOW() - INTERVAL '3 days'
    );
  END IF;
END $$;


-- 2. Insert sample notifications for all users
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id, name, role FROM public.profiles LIMIT 10 LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      category,
      notification_type,
      is_read,
      priority,
      sender_role,
      receiver_role,
      created_at
    ) VALUES
    (
      u.id,
      'Welcome to SkillTrack AI Platform',
      'Your account profile is active. You can now participate in live technical interview drills.',
      'system',
      'system',
      FALSE,
      'normal',
      'system',
      COALESCE(u.role, 'student'),
      NOW() - INTERVAL '1 day'
    );
  END FOR;
END $$;


-- 3. Verification query
SELECT 'Notifications table count:' AS metric, count(*) FROM public.notifications
UNION ALL
SELECT 'Interview Requests table count:', count(*) FROM public.interview_requests;
