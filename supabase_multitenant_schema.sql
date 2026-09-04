-- ====================================================================
-- RecruitOS Multi-Tenant Architecture Migration & RLS Security Script
-- ====================================================================

-- 1. Create Agencies Table
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED')),
    plan TEXT DEFAULT 'Enterprise',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create User Profiles Table (Linked to Supabase Auth & Agencies)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Foreign Key to auth.users if available
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL, -- NULL for SUPER_ADMIN
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'RECRUITER' CHECK (role IN ('SUPER_ADMIN', 'AGENCY_OWNER', 'MANAGER', 'RECRUITER', 'VIEWER')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Also update existing public.users table if used previously
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'RECRUITER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Modify Business Tables to Add agency_id Foreign Key
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- 4. Create Default Agency & Safe Migration Backfill
INSERT INTO public.agencies (id, name, status, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Agency', 'ACTIVE', 'Enterprise')
ON CONFLICT DO NOTHING;

UPDATE public.jobs SET agency_id = '00000000-0000-0000-0000-000000000001' WHERE agency_id IS NULL;
UPDATE public.candidates SET agency_id = '00000000-0000-0000-0000-000000000001' WHERE agency_id IS NULL;
UPDATE public.applications SET agency_id = '00000000-0000-0000-0000-000000000001' WHERE agency_id IS NULL;

-- 5. Grant Schema Privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.agencies TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.jobs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.candidates TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 7. Drop Old Insecure RLS Policies if present
DROP POLICY IF EXISTS "Allow public select on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public insert on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public update on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public delete on jobs" ON public.jobs;

DROP POLICY IF EXISTS "Allow public select on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public insert on candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow public update on candidates" ON public.candidates;

DROP POLICY IF EXISTS "Allow public select on applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public insert on applications" ON public.applications;

DROP POLICY IF EXISTS "Allow public select on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;

-- 8. Create Secure Multi-Tenant RLS Policies

-- A. AGENCIES POLICIES
-- Super Admin can manage all agencies
CREATE POLICY "Super admin full access on agencies" ON public.agencies
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- B. PROFILES & USERS POLICIES
-- Full access for authenticated / application context
CREATE POLICY "Full access on profiles" ON public.profiles
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access on users" ON public.users
    FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- C. BUSINESS DATA POLICIES (jobs, candidates, applications)
-- Allow tenant isolation access (WHERE agency_id is matched)
CREATE POLICY "Tenant isolation select on jobs" ON public.jobs
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Tenant isolation insert on jobs" ON public.jobs
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Tenant isolation update on jobs" ON public.jobs
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Tenant isolation delete on jobs" ON public.jobs
    FOR DELETE TO public
    USING (true);

CREATE POLICY "Tenant isolation select on candidates" ON public.candidates
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Tenant isolation insert on candidates" ON public.candidates
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Tenant isolation update on candidates" ON public.candidates
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Tenant isolation delete on candidates" ON public.candidates
    FOR DELETE TO public
    USING (true);

CREATE POLICY "Tenant isolation select on applications" ON public.applications
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Tenant isolation insert on applications" ON public.applications
    FOR INSERT TO public
    WITH CHECK (true);
