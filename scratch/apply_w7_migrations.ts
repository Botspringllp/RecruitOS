import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function applyW7Migrations() {
  console.log("Adding Workflow 7 tables to Postgres...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS invoice_records (
      invoice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
      client_id UUID NOT NULL REFERENCES client_records(client_id),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id),
      invoice_number VARCHAR(100) UNIQUE NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
      issued_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS probation_guarantee_trackers (
      guarantee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      joining_date TIMESTAMPTZ NOT NULL,
      expiry_date TIMESTAMPTZ NOT NULL,
      status VARCHAR(50) DEFAULT 'Active_Probation' NOT NULL,
      replacement_mandate_id UUID REFERENCES job_mandates(job_id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS partner_split_ledgers (
      ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      share_id UUID NOT NULL REFERENCES partner_mandate_shares(share_id),
      partner_share_amount NUMERIC(12,2) NOT NULL,
      payout_status VARCHAR(50) DEFAULT 'Pending_Client_Payment' NOT NULL,
      updated_by_user_id UUID REFERENCES users(user_id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✔ Workflow 7 database tables successfully created!");
}

applyW7Migrations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration Error:", e);
    process.exit(1);
  });
