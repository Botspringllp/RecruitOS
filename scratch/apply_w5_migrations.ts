import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function applyW5Migrations() {
  console.log("Adding Workflow 5 tables to Postgres...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS interview_schedules (
      interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES candidate_submissions(submission_id) ON DELETE CASCADE,
      confirmed_slot_id UUID REFERENCES proposed_interview_slots(slot_id) ON DELETE SET NULL,
      meeting_link VARCHAR(512),
      outcome_status VARCHAR(50) DEFAULT 'Scheduled' NOT NULL,
      candidate_prep_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
      prep_token VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS interview_debriefs (
      debrief_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      interview_id UUID NOT NULL REFERENCES interview_schedules(interview_id) ON DELETE CASCADE,
      rating INT CHECK (rating >= 1 AND rating <= 5),
      interest_level VARCHAR(50) NOT NULL,
      candidate_notes TEXT,
      voice_note_url VARCHAR(512),
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("✔ Workflow 5 database tables successfully created!");
}

applyW5Migrations()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Migration Error:", e);
    process.exit(1);
  });
