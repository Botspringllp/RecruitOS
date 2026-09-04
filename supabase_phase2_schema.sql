-- ================================================================
-- RECRUITOS PHASE 2 DATABASE SCHEMA MIGRATION
-- ================================================================

-- 1. Create candidate_submissions Table
CREATE TABLE IF NOT EXISTS candidate_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id TEXT,
  job_id TEXT,
  candidate_id TEXT,
  source_name TEXT DEFAULT 'Naukri',
  date_of_sourcing DATE DEFAULT CURRENT_DATE,
  ready_to_relocate TEXT DEFAULT 'Yes',
  relevant_experience TEXT DEFAULT '3 Years',
  current_salary NUMERIC,
  expected_salary NUMERIC,
  notice_period TEXT DEFAULT '30 Days',
  reason_for_leaving TEXT DEFAULT 'Career Growth',
  offer_in_hand TEXT DEFAULT 'No',
  status TEXT DEFAULT 'Hold', -- Approved, Hold, Rejected
  magic_link_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update candidates Table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS current_company TEXT,
ADD COLUMN IF NOT EXISTS previous_company TEXT,
ADD COLUMN IF NOT EXISTS current_ctc NUMERIC,
ADD COLUMN IF NOT EXISTS expected_ctc NUMERIC,
ADD COLUMN IF NOT EXISTS notice_period TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Applied';

-- 3. Update applications Table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS match_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS matched_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS missing_skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shortlisted BOOLEAN DEFAULT FALSE;

-- Index for magic link lookups
CREATE INDEX IF NOT EXISTS idx_submissions_magic_token ON candidate_submissions (magic_link_token);
