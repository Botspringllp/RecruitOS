const { Client } = require("pg");

async function generate() {
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();
  try {
    const jobRes = await pgClient.query("SELECT job_id FROM job_mandates LIMIT 1");
    const jobId = jobRes.rows[0].job_id;
    console.log("Job ID:", jobId);

    // Call POST API from localhost
    const res = await fetch(`http://localhost:3000/api/v1/jobs/${jobId}/partner-share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agency-id": "11111111-1111-4111-8111-111111111111",
        "x-user-id": "11111111-1111-4111-8111-111111111112"
      },
      body: JSON.stringify({
        partner_email: "test-partner@sourcers.com",
        partner_name: "Verification Partner",
        masked_job_title: "Leading E-Commerce Organization - Software Engineer",
        masked_company_description: "Role responsibilities include JavaScript development.",
        partner_split_percentage: 50.00
      })
    });
    const data = await res.json();
    console.log("API Response:", JSON.stringify(data));
  } catch(e) {
    console.error(e);
  } finally {
    await pgClient.end();
  }
}
generate();
