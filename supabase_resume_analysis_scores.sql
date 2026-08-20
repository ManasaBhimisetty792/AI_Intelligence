-- ============================================================================
-- RESUME ANALYSIS SCORES — Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.resume_analysis_scores (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Core scores (0-100)
  overall_score        NUMERIC(5,2) NOT NULL,
  job_match_score      NUMERIC(5,2),
  completeness_score   NUMERIC(5,2),
  structure_score      NUMERIC(5,2),

  -- Qualitative readiness level: 'High' | 'Medium' | 'Low' | 'Ready' etc.
  interview_readiness  TEXT,

  -- Job Description storage
  jd_text              TEXT,        -- populated when the student pastes JD text
  jd_file_name         TEXT,        -- populated when the student uploads a JD file

  -- Candidate info extracted from the resume
  candidate_name       TEXT,
  candidate_email      TEXT,

  -- When the analysis was run
  analyzed_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.resume_analysis_scores ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Drop old/existing policies if they already exist to avoid 42710 error
DROP POLICY IF EXISTS "student reads own scores" ON public.resume_analysis_scores;
DROP POLICY IF EXISTS "authenticated users read scores" ON public.resume_analysis_scores;
DROP POLICY IF EXISTS "student inserts own scores" ON public.resume_analysis_scores;

-- Allow authenticated users (students to see their own, recruiters to inspect candidates) to read scores
CREATE POLICY "authenticated users read scores"
  ON public.resume_analysis_scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow a student to insert their own scores
CREATE POLICY "student inserts own scores"
  ON public.resume_analysis_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- 4. Index for fast lookup of a student's latest score
CREATE INDEX IF NOT EXISTS idx_resume_scores_student_analyzed
  ON public.resume_analysis_scores (student_id, analyzed_at DESC);

-- 5. Ensure recruiters can read candidate names & emails from public.profiles
DROP POLICY IF EXISTS "authenticated users read profiles" ON public.profiles;
CREATE POLICY "authenticated users read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- VERIFICATION QUERY
-- After running this migration, verify with:
--   SELECT * FROM public.resume_analysis_scores LIMIT 10;
-- ============================================================================
