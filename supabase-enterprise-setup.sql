-- DentAge Enterprise - Final Robust SQL Setup
-- This script handles Enterprise schema updates and fixes common Supabase type mismatches.

-- 1. Create Organization & Clinic Tables
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'professional',
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Robust Column Addition (Handles public schema explicitly)
DO $$
BEGIN
  -- Profiles updates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'practitioner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='org_id') THEN
    ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='clinic_id') THEN
    ALTER TABLE public.profiles ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
  END IF;

  -- Patients updates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='clinic_id') THEN
    ALTER TABLE public.patients ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
  END IF;

  -- Analyses updates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analyses' AND column_name='clinic_id') THEN
    ALTER TABLE public.analyses ADD COLUMN clinic_id UUID REFERENCES public.clinics(id);
  END IF;
END $$;

-- 3. Update Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Organization Policies
DROP POLICY IF EXISTS "Admins can view their organization" ON public.organizations;
CREATE POLICY "Admins can view their organization" ON public.organizations
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'enterprise_admin')
  );

-- Clinic Policies
DROP POLICY IF EXISTS "Users view clinics in their org" ON public.clinics;
CREATE POLICY "Users view clinics in their org" ON public.clinics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND public.profiles.org_id = public.clinics.org_id)
  );

-- Analysis Policies (Update to handle clinic_id if exists)
DROP POLICY IF EXISTS "Clinic-wide analysis access" ON public.analyses;
CREATE POLICY "Clinic-wide analysis access" ON public.analyses
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()
      AND public.profiles.role IN ('clinic_admin', 'enterprise_admin')
      AND public.profiles.clinic_id = public.analyses.clinic_id
    )
  );

-- 4. Population Maturity Trends View
-- Fixes: Column existence check and explicit type casting (UUID vs BigInt)
CREATE OR REPLACE VIEW public.population_maturity_trends AS
SELECT
  a.clinic_id,
  date_trunc('month', a.created_at) as month,
  avg(
    a.dental_age -
    date_part('year', age(a.created_at, p.date_of_birth))
  ) as age_variance,
  count(*) as case_count
FROM public.analyses a
JOIN public.patients p ON a.patient_id::text = p.id::text
GROUP BY a.clinic_id, month;
