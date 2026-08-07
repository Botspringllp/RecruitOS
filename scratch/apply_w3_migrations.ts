import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function applyMigrations() {
  console.log("Adding missing Workflow 3 columns to Postgres schema if not present...");
  
  await db.execute(sql`
    ALTER TABLE candidate_submissions 
    ADD COLUMN IF NOT EXISTS risk_status text DEFAULT 'NORMAL',
    ADD COLUMN IF NOT EXISTS risk_reason text;
  `);

  await db.execute(sql`
    ALTER TABLE communication_log 
    ADD COLUMN IF NOT EXISTS submission_id uuid REFERENCES candidate_submissions(submission_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS sent_by_user_id uuid REFERENCES users(user_id) ON DELETE SET NULL;
  `);

  console.log("✔ Database schema successfully updated with Workflow 3 columns!");
}

applyMigrations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration Error:", e);
    process.exit(1);
  });
