const { Client } = require("pg");
const dns = require("dns");
dns.setDefaultResultOrder('verbatim');

async function cleanup() {
  const pgClient = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  try {
    console.log("Cleaning up test candidates from AS-04...");
    const res = await pgClient.query(`
      DELETE FROM candidate_records 
      WHERE email IN ('priya_as04_test@example.com', 'unique_cand1@test.com', 'inhouse_cand@test.com')
      RETURNING candidate_id;
    `);
    console.log(`Deleted ${res.rowCount} test candidates.`);
    console.log("Cleanup completed successfully!");
  } catch (err) {
    console.error("Cleanup failed:", err.message);
  } finally {
    await pgClient.end();
  }
}

cleanup();
