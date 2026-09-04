-- ====================================================================
-- RecruitOS Multi-Tenant Setup & Public Agency Portals Script
-- Run this in your Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. Extend Agencies Table with Slug and Branding Metadata
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0284c7';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#0f172a';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Connecting Top Talent with Leading Organizations';
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS mission_text TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS vision_text TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 2. Employer Inquiries Table (For /agency/:slug/employers)
CREATE TABLE IF NOT EXISTS public.employer_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    hiring_needs TEXT NOT NULL,
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    agency_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'RECRUITER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT,
    agency_id TEXT,
    match_score INT DEFAULT 85,
    matched_skills TEXT[],
    missing_skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS agency_id TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS agency_id TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS agency_id TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS job_id TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS match_score INT;

-- 5. Enable Public Permissions for Development & App Usage
GRANT ALL ON TABLE public.agencies TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.jobs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.candidates TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.applications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.employer_inquiries TO anon, authenticated, service_role;

-- 6. Enable Row Level Security Policies for Public Access
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public insert on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public update on agencies" ON public.agencies;
DROP POLICY IF EXISTS "Allow public delete on agencies" ON public.agencies;

CREATE POLICY "Allow public select on agencies" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agencies" ON public.agencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on agencies" ON public.agencies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on agencies" ON public.agencies FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete on profiles" ON public.profiles;

CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on profiles" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select on applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public insert on applications" ON public.applications;

CREATE POLICY "Allow public select on applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert on applications" ON public.applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on employer_inquiries" ON public.employer_inquiries;
DROP POLICY IF EXISTS "Allow public insert on employer_inquiries" ON public.employer_inquiries;

CREATE POLICY "Allow public select on employer_inquiries" ON public.employer_inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on employer_inquiries" ON public.employer_inquiries FOR INSERT WITH CHECK (true);
