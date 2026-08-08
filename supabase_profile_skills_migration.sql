-- ============================================================================
-- SKILLTRACK AI - PROFILE SKILLS & RECRUITER EXTENSION MIGRATION
-- ============================================================================

-- 1. Add skills column to candidate_profiles table
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 2. Add skills & extended fields to recruiter_profiles table if missing
ALTER TABLE public.recruiter_profiles
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Senior Recruiter',
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS specialization TEXT DEFAULT 'Full Stack & AI',
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Storage bucket policies for avatars and resumes (Public Read, Authenticated Write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_images', 'profile_images', true),
       ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Access Profile Images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile_images');

CREATE POLICY "Authenticated Upload Profile Images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile_images' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access Resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Authenticated Upload Resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');
