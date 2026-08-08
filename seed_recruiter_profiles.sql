-- ─────────────────────────────────────────────────────────────────────────────
-- SkillTrack AI — Seed Real Recruiter Profiles into Supabase
-- Run this script in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ensure recruiter_profiles table exists
CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    designation TEXT DEFAULT 'Senior Technical Recruiter',
    avatar_url TEXT,
    company_name TEXT DEFAULT 'SkillTrack Tech',
    company_logo TEXT,
    company_website TEXT,
    industry TEXT DEFAULT 'Software & AI',
    company_size TEXT DEFAULT '100-500',
    location TEXT DEFAULT 'San Francisco, CA',
    experience_years INTEGER DEFAULT 5,
    specialization TEXT DEFAULT 'Full Stack Engineering',
    bio TEXT DEFAULT 'Passionate tech recruiter connecting top candidates with industry leaders.',
    verification_status TEXT DEFAULT 'Verified',
    is_approved BOOLEAN DEFAULT TRUE,
    approval_status TEXT DEFAULT 'approved',
    hourly_fee NUMERIC DEFAULT 75,
    rating NUMERIC DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 28,
    completed_interviews INTEGER DEFAULT 64,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert 3 live sample recruiter records into recruiter_profiles
INSERT INTO public.recruiter_profiles (
    id,
    user_id,
    full_name,
    email,
    phone,
    designation,
    avatar_url,
    company_name,
    company_website,
    industry,
    location,
    experience_years,
    specialization,
    bio,
    verification_status,
    is_approved,
    approval_status,
    hourly_fee,
    rating,
    reviews_count,
    completed_interviews
)
VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    gen_random_uuid(),
    'Elena Rostova',
    'elena.rostova@techcorp.io',
    '+1 (555) 987-6543',
    'Head of Global AI Hiring',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'TechCorp AI Solutions',
    'https://techcorp.io',
    'Artificial Intelligence & Cloud',
    'San Francisco, CA (Hybrid)',
    9,
    'AI / ML & Full Stack React',
    'Leading technical hiring for high-growth AI startups and Fortune 500 engineering teams.',
    'Verified',
    TRUE,
    'approved',
    85,
    4.95,
    54,
    140
),
(
    'a1b2c3d4-0002-4000-8000-000000000002',
    gen_random_uuid(),
    'David Chen',
    'david.chen@cloudscale.dev',
    '+1 (555) 345-6789',
    'Principal Staff Recruiter',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'CloudScale Systems',
    'https://cloudscale.dev',
    'Distributed Systems & DevOps',
    'Austin, TX (Remote)',
    7,
    'FastAPI, Python & Cloud Architecture',
    'Specialist in backend engineering, distributed microservices, and system architecture drills.',
    'Verified',
    TRUE,
    'approved',
    70,
    4.88,
    39,
    98
),
(
    'a1b2c3d4-0003-4000-8000-000000000003',
    gen_random_uuid(),
    'Priya Sharma',
    'priya.sharma@nexuslabs.ai',
    '+1 (555) 234-5678',
    'Director of Talent Engineering',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    'Nexus Labs AI',
    'https://nexuslabs.ai',
    'Frontend & Full Stack Systems',
    'Bangalore & New York',
    11,
    'React, Next.js & UI Architecture',
    '11+ years guiding senior engineers through rigorous technical system design interviews.',
    'Verified',
    TRUE,
    'approved',
    95,
    4.98,
    82,
    215
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    company_name = EXCLUDED.company_name,
    is_approved = TRUE,
    verification_status = 'Verified';

-- 3. Verify inserted records
SELECT id, full_name, designation, company_name, location, experience_years, hourly_fee
FROM public.recruiter_profiles;
