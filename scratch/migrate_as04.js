const { Client } = require("pg");

async function migrate() {
  const pgClient = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  try {
    console.log("Creating storefront_candidate_applications table...");
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS storefront_candidate_applications (
        application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
        candidate_id UUID NOT NULL REFERENCES candidate_records(candidate_id) ON DELETE CASCADE,
        source_channel VARCHAR(50) DEFAULT 'Storefront_Direct' NOT NULL,
        parsed_successfully BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Creating index idx_storefront_cand_agency...");
    await pgClient.query(`
      CREATE INDEX IF NOT EXISTS idx_storefront_cand_agency 
      ON storefront_candidate_applications(agency_id);
    `);

    console.log("Enabling Row Level Security (RLS) on storefront_candidate_applications...");
    await pgClient.query(`
      ALTER TABLE storefront_candidate_applications ENABLE ROW LEVEL SECURITY;
    `);

    console.log("Setting default security policy to block public access...");
    await pgClient.query(`
      DROP POLICY IF EXISTS storefront_cand_no_public_access ON storefront_candidate_applications;
      CREATE POLICY storefront_cand_no_public_access 
      ON storefront_candidate_applications FOR ALL TO anon, authenticated USING (false);
    `);

    console.log("AS-04 database migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pgClient.end();
  }
}

migrate();
