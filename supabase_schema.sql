-- ============================================================================
-- SKILLTRACK AI — SUPABASE DATABASE SCHEMA (Refactored Profile Architecture)
-- ============================================================================

-- 1. BASE PROFILES TABLE (linked to auth.users by same UUID)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'recruiter')) DEFAULT 'student',
  avatar_url TEXT,
  membership_type TEXT DEFAULT 'free' CHECK (membership_type IN ('free', 'premium')),
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  current_plan TEXT DEFAULT 'Free Plan',
  premium_start_date TIMESTAMPTZ,
  premium_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CANDIDATE PROFILES TABLE (id references profiles.id)
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  current_status TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  resume_file_name TEXT,
  resume_file_url TEXT,
  profile_completion_pct INTEGER DEFAULT 0,
  website TEXT,
  linkedin_url TEXT,
  -- Premium Membership & Payment Tracking Columns
  is_premium BOOLEAN DEFAULT FALSE,
  membership_type TEXT DEFAULT 'free',
  current_plan TEXT DEFAULT 'Free Plan',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan_id TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  billing_cycle TEXT DEFAULT 'yearly',
  last_payment_id TEXT,
  last_payment_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECRUITER PROFILES TABLE (id references profiles.id)
CREATE TABLE IF NOT EXISTS public.recruiter_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  company TEXT,
  approval_status TEXT DEFAULT 'pending',
  is_approved BOOLEAN DEFAULT FALSE,
  linkedin_url TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENT PAYMENTS TABLE (Permanent transaction history)
CREATE TABLE IF NOT EXISTS public.student_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  signature TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  plan_name TEXT DEFAULT 'Student Premium',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('created', 'success', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'Razorpay',
  invoice_number TEXT,
  transaction_reference TEXT,
  razorpay_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.student_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Student Premium',
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_id UUID REFERENCES public.student_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RECRUITER INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  interview_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECRUITER EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_interviews INT DEFAULT 0,
  amount_per_interview NUMERIC(10, 2) DEFAULT 500.00,
  total_earned NUMERIC(10, 2) DEFAULT 0.00,
  total_paid NUMERIC(10, 2) DEFAULT 0.00,
  remaining_balance NUMERIC(10, 2) DEFAULT 0.00,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECRUITER PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'rejected')),
  payment_mode TEXT DEFAULT 'manual_bank_transfer',
  reference_number TEXT,
  paid_by_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRIGGER: Auto-create base profiles row on auth signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_payouts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Candidate Profiles Policies
CREATE POLICY "read own candidate profile" ON public.candidate_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own candidate profile" ON public.candidate_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own candidate profile" ON public.candidate_profiles FOR UPDATE USING (auth.uid() = id);

-- Recruiter Profiles Policies
CREATE POLICY "read own recruiter profile" ON public.recruiter_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own recruiter profile" ON public.recruiter_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own recruiter profile" ON public.recruiter_profiles FOR UPDATE USING (auth.uid() = id);

-- Student Payments Policies
CREATE POLICY "Students view own payments" ON public.student_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role insert payments" ON public.student_payments FOR INSERT WITH CHECK (true);

-- Student Subscriptions Policies
CREATE POLICY "Students view own subscriptions" ON public.student_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Recruiter Policies
CREATE POLICY "Recruiters view own interviews" ON public.recruiter_interviews FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters view own earnings" ON public.recruiter_earnings FOR SELECT USING (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters view own payouts" ON public.recruiter_payouts FOR SELECT USING (auth.uid() = recruiter_id);
