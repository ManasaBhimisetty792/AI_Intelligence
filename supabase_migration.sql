-- ====================================================================
-- SKILLTRACK AI — SUPABASE DATABASE MIGRATION (DEADLOCK-SAFE)
-- Run each STEP block separately in Supabase SQL Editor if needed.
-- ====================================================================

-- ══════════════════════════════════════════════════════════════════════
-- STEP 1  (Paste & run this block FIRST — no table locks)
-- Drop trigger + function only. Safe: never touches table rows.
-- ══════════════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();


-- ══════════════════════════════════════════════════════════════════════
-- STEP 2  (Paste & run AFTER Step 1 completes)
-- Drop child tables first (no CASCADE needed — parent still exists).
-- Then drop parent. Never use CASCADE on profiles; it fights auth.users.
-- ══════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS public.candidate_profiles;
DROP TABLE IF EXISTS public.recruiter_profiles;
DROP TABLE IF EXISTS public.profiles;


-- ══════════════════════════════════════════════════════════════════════
-- STEP 3  (Paste & run AFTER Step 2 completes)
-- Recreate tables in dependency order (parent first).
-- ══════════════════════════════════════════════════════════════════════

-- Shared base profile (same UUID as auth.users)
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        UNIQUE,
  name        TEXT,
  role        TEXT        NOT NULL DEFAULT 'student'
                          CHECK (role IN ('student', 'recruiter')),
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate-only fields (id = profiles.id = auth.users.id)
CREATE TABLE public.candidate_profiles (
  id                    UUID    PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  username              TEXT,
  phone                 TEXT,
  location              TEXT,
  bio                   TEXT,
  current_status        TEXT,
  github_url            TEXT,
  portfolio_url         TEXT,
  resume_file_name      TEXT,
  resume_file_url       TEXT,
  profile_completion_pct INTEGER DEFAULT 0,
  website               TEXT,
  linkedin_url          TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiter-only fields (id = profiles.id = auth.users.id)
CREATE TABLE public.recruiter_profiles (
  id              UUID    PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  username        TEXT,
  phone           TEXT,
  location        TEXT,
  bio             TEXT,
  company         TEXT,
  approval_status TEXT    DEFAULT 'pending',
  is_approved     BOOLEAN DEFAULT FALSE,
  linkedin_url    TEXT,
  website         TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ══════════════════════════════════════════════════════════════════════
-- STEP 4  (Paste & run AFTER Step 3 completes)
-- Trigger function: auto-insert profiles row on auth signup.
-- ══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Guard: ensure role is a valid CHECK value
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  IF v_role NOT IN ('student', 'recruiter') THEN
    v_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    v_role,
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ══════════════════════════════════════════════════════════════════════
-- STEP 5  (Paste & run AFTER Step 4 completes)
-- Enable RLS + add policies.
-- ══════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- candidate_profiles policies
CREATE POLICY "candidate_select_own" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "candidate_insert_own" ON public.candidate_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "candidate_update_own" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = id);

-- recruiter_profiles policies
CREATE POLICY "recruiter_select_own" ON public.recruiter_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "recruiter_insert_own" ON public.recruiter_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "recruiter_update_own" ON public.recruiter_profiles
  FOR UPDATE USING (auth.uid() = id);
