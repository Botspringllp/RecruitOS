const { Client } = require("pg");

async function migrate() {
  const pgClient = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  try {
    console.log("Adding sourceType & sourcePartnerEmail to candidate_records...");
    await pgClient.query(`
      ALTER TABLE candidate_records
      ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'Direct_Upload',
      ADD COLUMN IF NOT EXISTS source_partner_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
    `);

    console.log("Adding source_share_id to candidate_submissions...");
    await pgClient.query(`
      ALTER TABLE candidate_submissions
      ADD COLUMN IF NOT EXISTS source_share_id UUID REFERENCES partner_mandate_shares(share_id) ON DELETE SET NULL;
    `);

    console.log("Schema migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pgClient.end();
  }
}

migrate();
