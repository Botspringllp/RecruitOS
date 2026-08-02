-- =========================================================
-- RECRUITOS — CORE MULTI-TENANT SCHEMA (V1)
-- Model: Shared database, Row-Level Security (RLS) tenant isolation
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------
-- 1. AGENCIES (Tenants)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS agencies (
    agency_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name     VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 2. USERS (Recruiters, Owners, Admins — belong to one agency)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'recruiter', -- owner | recruiter | finance | admin
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 3. CANDIDATE RECORDS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_records (
    candidate_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id         UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    full_name         VARCHAR(255) NOT NULL,
    email             VARCHAR(255),
    phone             VARCHAR(20),         -- E.164 format e.g. +919876543210
    current_company   VARCHAR(255),
    current_title     VARCHAR(255),
    skills            TEXT[],
    total_exp_months  INT,
    notice_period_days INT,
    current_ctc       NUMERIC(12,2),
    expected_ctc      NUMERIC(12,2),
    resume_url        TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_phone ON candidate_records(agency_id, phone);
CREATE INDEX IF NOT EXISTS idx_candidate_email ON candidate_records(agency_id, email);

-- ---------------------------------------------------------
-- 4. JOB MANDATES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_mandates (
    job_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    client_name     VARCHAR(255),
    status          VARCHAR(50) DEFAULT 'Open',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 5. RC-01 — UNIFIED COMMUNICATION LOG
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_log (
    message_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id           UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    candidate_id        UUID REFERENCES candidate_records(candidate_id) ON DELETE SET NULL,
    channel             VARCHAR(20) NOT NULL,   -- 'whatsapp' | 'email'
    direction           VARCHAR(10) NOT NULL,   -- 'inbound' | 'outbound'
    from_address        VARCHAR(255),           -- phone or email of sender
    to_address          VARCHAR(255),           -- phone or email of recipient
    body                TEXT,
    external_message_id VARCHAR(255),           -- provider's message id (WABA / SMTP)
    status              VARCHAR(20) DEFAULT 'sent', -- sent | delivered | read | failed | received
    matched             BOOLEAN DEFAULT TRUE,   -- false = "Unlinked Lead"
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_candidate ON communication_log(agency_id, candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_unmatched ON communication_log(agency_id, matched) WHERE matched = FALSE;

-- ---------------------------------------------------------
-- 6. AGENCY CHANNELS — maps a WABA number / inbox email to an agency
--    so inbound webhooks (no user session) can be routed correctly.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS agency_channels (
    channel_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id       UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
    channel         VARCHAR(20) NOT NULL,  -- 'whatsapp' | 'email'
    address         VARCHAR(255) NOT NULL, -- WABA phone number or inbox email
    UNIQUE (channel, address)
);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY — enable + policy on every tenant table
-- ---------------------------------------------------------
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_mandates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log   ENABLE ROW LEVEL SECURITY;

-- Check and create policy for users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_users') THEN
        CREATE POLICY tenant_isolation_users ON users
            AS RESTRICTIVE
            USING (agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::UUID);
    END IF;
END
$$;

-- Check and create policy for candidate_records
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_candidates') THEN
        CREATE POLICY tenant_isolation_candidates ON candidate_records
            AS RESTRICTIVE
            USING (agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::UUID);
    END IF;
END
$$;

-- Check and create policy for job_mandates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_jobs') THEN
        CREATE POLICY tenant_isolation_jobs ON job_mandates
            AS RESTRICTIVE
            USING (agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::UUID);
    END IF;
END
$$;

-- Check and create policy for communication_log
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_comms') THEN
        CREATE POLICY tenant_isolation_comms ON communication_log
            AS RESTRICTIVE
            USING (agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::UUID);
    END IF;
END
$$;
