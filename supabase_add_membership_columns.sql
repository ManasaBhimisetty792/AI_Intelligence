-- ============================================================================
-- SKILLTRACK AI — ADD MEMBERSHIP & PAYMENT COLUMNS TO CANDIDATE_PROFILES
-- Run this SQL in your Supabase SQL Editor to add the missing columns.
-- ============================================================================

-- 1. Add membership and payment tracking columns to public.candidate_profiles
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'Free Plan',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'yearly',
ADD COLUMN IF NOT EXISTS last_payment_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- 2. Also add to public.profiles table for redundancy & performance
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'Free Plan',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS premium_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS premium_end_date TIMESTAMPTZ;
