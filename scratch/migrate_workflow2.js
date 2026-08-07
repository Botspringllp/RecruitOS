const { Client } = require("pg");
const dns = require("dns");
dns.setDefaultResultOrder('verbatim');

async function migrate() {
  const pgClient = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  try {
    console.log("Adding columns to candidate_records if they do not exist...");
    await pgClient.query(`
      ALTER TABLE candidate_records ADD COLUMN IF NOT EXISTS sanitized_cv_url TEXT;
      ALTER TABLE candidate_records ADD COLUMN IF NOT EXISTS current_location VARCHAR(255);
      ALTER TABLE candidate_records ADD COLUMN IF NOT EXISTS tags TEXT[];
      ALTER TABLE candidate_records ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
    `);

    console.log("Creating candidate_relational_links table...");
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS candidate_relational_links (
        link_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        primary_candidate_id UUID NOT NULL REFERENCES candidate_records(candidate_id) ON DELETE CASCADE,
        related_candidate_id UUID NOT NULL REFERENCES candidate_records(candidate_id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('SPOUSE', 'COLLEAGUE', 'REFERRAL')),
        inherited_target_location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Creating indexes for candidate_relational_links...");
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_primary_cand_link ON candidate_relational_links(primary_candidate_id);
      CREATE INDEX IF NOT EXISTS idx_related_cand_link ON candidate_relational_links(related_candidate_id);
    `);

    console.log("Enabling RLS on candidate_relational_links...");
    await pgClient.query(`
      ALTER TABLE candidate_relational_links ENABLE ROW LEVEL SECURITY;
    `);

    console.log("Setting security policy to block public access on candidate_relational_links...");
    await pgClient.query(`
      DROP POLICY IF EXISTS relational_links_no_public_access ON candidate_relational_links;
      CREATE POLICY relational_links_no_public_access 
      ON candidate_relational_links FOR ALL TO anon, authenticated USING (false);
    `);

    console.log("Workflow 2 database migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pgClient.end();
  }
}

migrate();
