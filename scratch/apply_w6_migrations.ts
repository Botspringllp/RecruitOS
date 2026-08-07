import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function applyW6Migrations() {
  console.log("Adding Workflow 6 tables to Postgres...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS job_offer_audits (
      audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      offered_fixed_ctc NUMERIC(12,2) NOT NULL,
      offered_variable_ctc NUMERIC(12,2) DEFAULT 0.00,
      agreed_fee_percentage NUMERIC(5,2) NOT NULL,
      calculated_placement_fee NUMERIC(12,2) NOT NULL,
      joining_date TIMESTAMPTZ NOT NULL,
      signed_offer_url VARCHAR(512) NOT NULL,
      approval_status VARCHAR(50) DEFAULT 'Approved' NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notice_period_pulse_logs (
      pulse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      touchpoint_day INT NOT NULL,
      response_status VARCHAR(50) DEFAULT 'Pending' NOT NULL,
      unresponded_attempts INT DEFAULT 0 NOT NULL,
      escalated_to_role VARCHAR(50),
      pulse_token VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS compliance_documents (
      document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      file_url VARCHAR(512) NOT NULL,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✔ Workflow 6 database tables successfully created!");
}

applyW6Migrations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration Error:", e);
    process.exit(1);
  });
