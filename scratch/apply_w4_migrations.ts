import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function applyW4Migrations() {
  console.log("Adding Workflow 4 tables and columns to Postgres...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS client_portal_tokens (
      token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
      job_id UUID NOT NULL REFERENCES job_mandates(job_id) ON DELETE CASCADE,
      token_hash VARCHAR(64) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS proposed_interview_slots (
      slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      interviewer_email VARCHAR(255) NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      status VARCHAR(30) DEFAULT 'Proposed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    ALTER TABLE candidate_submissions 
    ADD COLUMN IF NOT EXISTS rejection_reason text;
  `);

  console.log("✔ Workflow 4 database schema successfully updated!");
}

applyW4Migrations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration Error:", e);
    process.exit(1);
  });
