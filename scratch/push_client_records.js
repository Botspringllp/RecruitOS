const { Client } = require("pg");

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log("Creating client_records table if not exists...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_records (
        client_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID NOT NULL REFERENCES agencies(agency_id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        primary_hr_name VARCHAR(255) NOT NULL,
        primary_hr_email VARCHAR(255) NOT NULL,
        primary_hr_phone VARCHAR(50) NOT NULL,
        agreed_fee_percentage NUMERIC(5,2) DEFAULT 8.33,
        billing_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_client_company ON client_records(agency_id, company_name);
      CREATE INDEX IF NOT EXISTS idx_client_email ON client_records(agency_id, primary_hr_email);
    `);

    console.log("Updating job_mandates table with additional columns...");
    await client.query(`
      ALTER TABLE job_mandates
      ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES client_records(client_id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS assigned_recruiter_id UUID REFERENCES users(user_id),
      ADD COLUMN IF NOT EXISTS primary_hr_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS primary_hr_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS primary_hr_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS selected_terms VARCHAR(255),
      ADD COLUMN IF NOT EXISTS target_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS min_exp_years INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS max_exp_years INT,
      ADD COLUMN IF NOT EXISTS min_fixed_ctc NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS max_fixed_ctc NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS open_positions INT DEFAULT 1,
      ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS stage_updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    console.log("Schema update completed successfully.");
  } catch (err) {
    console.error("Failed to update schema:", err);
  } finally {
    await client.end();
  }
}

run();
