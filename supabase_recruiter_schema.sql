-- ==========================================
-- SKILLTRACK AI - RECRUITER MODULE SCHEMA
-- Database: Supabase PostgreSQL
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. RECRUITER PROFILES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(100) DEFAULT 'Talent Acquisition Manager',
    avatar_url TEXT,
    
    -- Company Information
    company_name VARCHAR(255) NOT NULL DEFAULT 'TechCorp Solutions',
    company_logo TEXT,
    company_website VARCHAR(255),
    industry VARCHAR(100) DEFAULT 'Information Technology',
    company_size VARCHAR(50) DEFAULT '50-200 Employees',
    location VARCHAR(255) DEFAULT 'San Francisco, CA',
    
    -- Professional Information
    experience_years INTEGER DEFAULT 5,
    specialization VARCHAR(255) DEFAULT 'Full Stack & Cloud Engineering',
    bio TEXT DEFAULT 'Senior Technical Recruiter passionate about matching top tech talent with innovative teams.',
    
    -- Verification & Status
    verification_status VARCHAR(50) DEFAULT 'Verified', -- 'Pending', 'Verified', 'Rejected'
    tax_id VARCHAR(100),
    registration_doc_url TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 2. RECRUITER JOBS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'Engineering',
    location VARCHAR(100) DEFAULT 'Remote',
    job_type VARCHAR(50) DEFAULT 'Full-Time', -- 'Full-Time', 'Part-Time', 'Contract'
    salary_range VARCHAR(100),
    applicants_count INTEGER DEFAULT 0,
    ai_score_threshold INTEGER DEFAULT 80,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Paused', 'Closed'
    description TEXT,
    requirements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 3. RECRUITER CANDIDATES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    experience VARCHAR(100),
    location VARCHAR(255),
    ats_score INTEGER DEFAULT 85,
    fit_status VARCHAR(50) DEFAULT 'Suitable', -- 'Suitable', 'Maybe', 'Unsuitable'
    skills TEXT[],
    applied_date DATE DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 4. RECRUITER APPLICATIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES recruiter_candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES recruiter_jobs(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    fit_status VARCHAR(50) DEFAULT 'Suitable',
    ats_score INTEGER DEFAULT 85,
    status VARCHAR(50) DEFAULT 'Applied', -- 'Applied', 'Screening', 'Interviewing', 'Offered', 'Rejected'
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 5. RECRUITER INTERVIEWS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES recruiter_candidates(id) ON DELETE SET NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_avatar TEXT,
    role VARCHAR(255) NOT NULL,
    interview_date DATE NOT NULL,
    interview_time VARCHAR(50) NOT NULL,
    duration VARCHAR(50) DEFAULT '60 min',
    status VARCHAR(50) DEFAULT 'Confirmed', -- 'Confirmed', 'Pending', 'Completed', 'Cancelled'
    meeting_link TEXT,
    feedback TEXT,
    rating NUMERIC(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 6. RECRUITER REVENUE TABLE & TRANSACTIONS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE UNIQUE,
    monthly_revenue NUMERIC(12, 2) DEFAULT 14850.00,
    pending_payouts NUMERIC(12, 2) DEFAULT 3200.00,
    paid_history NUMERIC(12, 2) DEFAULT 48900.00,
    performance_bonus NUMERIC(12, 2) DEFAULT 1500.00,
    expected_payout NUMERIC(12, 2) DEFAULT 4700.00,
    ranking INTEGER DEFAULT 4,
    bank_account_info JSONB DEFAULT '{"bank_name": "Chase Bank", "account_ending": "4821", "holder": "John Doe"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruiter_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Placement Commission', -- 'Placement Commission', 'Bonus', 'Withdrawal'
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed', -- 'Completed', 'Pending', 'Processing', 'Failed'
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- 7. RECRUITER NOTIFICATIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS recruiter_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    icon VARCHAR(50) DEFAULT 'request', -- 'request', 'accept', 'reminder', 'cancel', 'complete', 'payout'
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Interviews', -- 'Requests', 'Interviews', 'System', 'Revenue'
    is_read BOOLEAN DEFAULT FALSE,
    time_ago VARCHAR(100) DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------
-- INDEXES
-- ------------------------------------------
CREATE INDEX IF NOT EXISTS idx_recruiter_jobs_recruiter ON recruiter_jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_recruiter ON recruiter_candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_applications_recruiter ON recruiter_applications(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_interviews_recruiter ON recruiter_interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_transactions_recruiter ON recruiter_transactions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notifications_recruiter ON recruiter_notifications(recruiter_id);

-- ------------------------------------------
-- TRIGGER FOR UPDATED_AT
-- ------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trg_recruiter_profiles_updated BEFORE UPDATE ON recruiter_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_recruiter_jobs_updated BEFORE UPDATE ON recruiter_jobs FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_recruiter_candidates_updated BEFORE UPDATE ON recruiter_candidates FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_recruiter_applications_updated BEFORE UPDATE ON recruiter_applications FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_recruiter_interviews_updated BEFORE UPDATE ON recruiter_interviews FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE OR REPLACE TRIGGER trg_recruiter_revenue_updated BEFORE UPDATE ON recruiter_revenue FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_notifications ENABLE ROW LEVEL SECURITY;

-- Recruiter Profiles Policy
CREATE POLICY "Recruiters can view their own profile" ON recruiter_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can update their own profile" ON recruiter_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can insert their profile" ON recruiter_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recruiter Jobs Policy
CREATE POLICY "Recruiters can CRUD their own jobs" ON recruiter_jobs FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- Recruiter Candidates Policy
CREATE POLICY "Recruiters can CRUD their own candidate pool" ON recruiter_candidates FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- Recruiter Applications Policy
CREATE POLICY "Recruiters can CRUD applications" ON recruiter_applications FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- Recruiter Interviews Policy
CREATE POLICY "Recruiters can CRUD interviews" ON recruiter_interviews FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- Recruiter Revenue & Transactions Policy
CREATE POLICY "Recruiters can view their revenue" ON recruiter_revenue FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Recruiters can view their transactions" ON recruiter_transactions FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- Recruiter Notifications Policy
CREATE POLICY "Recruiters can manage their notifications" ON recruiter_notifications FOR ALL USING (
    recruiter_id IN (SELECT id FROM recruiter_profiles WHERE user_id = auth.uid())
);

-- ------------------------------------------
-- STORAGE BUCKETS SETUP
-- ------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_images', 'profile_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('company_documents', 'company_documents', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Profile Images
CREATE POLICY "Public profile images read access" ON storage.objects FOR SELECT USING (bucket_id = 'profile_images');
CREATE POLICY "Authenticated profile images upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile_images' AND auth.role() = 'authenticated');
