const { Client } = require("pg");

async function testOwnerConversion() {
  console.log("=== STARTING AS-02 OWNER VERIFICATION & CLIENT CREATION TEST ===");
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  try {
    // 1. Resolve Apex Agency & Mandate
    const agencyRes = await pgClient.query("SELECT agency_id FROM agencies WHERE agency_name = $1 LIMIT 1", ["Apex Recruitment Partners"]);
    const agencyId = agencyRes.rows[0].agency_id;

    // Create an unreviewed mandate for testing
    const jobId = "77777777-7777-7777-7777-777777777777";
    await pgClient.query(`
      INSERT INTO job_mandates (job_id, agency_id, title, client_name, primary_hr_name, primary_hr_email, primary_hr_phone, selected_terms, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (job_id) DO UPDATE SET status = 'Unreviewed Inbound', client_id = NULL
    `, [
      jobId, agencyId, "Lead AI Engineer", "Horizon Tech Labs", "Sarah Jenkins", "sarah@horizontech.com", "+971509998888", "Priority Retainer (5% Upfront)", "Unreviewed Inbound"
    ]);

    console.log(`Created Unreviewed Mandate for Horizon Tech Labs (${jobId})`);

    // --- Test 1: Role Enforcement (Recruiter should fail with 403) ---
    console.log("\n--- Test 1: Role Enforcement Guard ---");
    const forbiddenRes = await fetch(`http://localhost:3000/api/v1/mandates/${jobId}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agency-id": agencyId,
        "x-user-id": "11111111-1111-4111-8111-111111111112",
        "x-user-role": "recruiter" // Standard Recruiter
      },
      body: JSON.stringify({ agreedFeePercentage: "8.33" })
    });
    const forbiddenData = await forbiddenRes.json();
    console.log(`Recruiter Attempt Status: ${forbiddenRes.status} (Expected: 403)`);
    if (forbiddenRes.status !== 403) {
      throw new Error("Role enforcement failed! Standard recruiter was allowed to convert mandate.");
    }
    console.log("Role Enforcement: PASSED (Restricted to Owner/TL)");

    // --- Test 2: Owner Acceptance & Client Account Creation ---
    console.log("\n--- Test 2: Owner Acceptance & Client Creation ---");
    const convertRes = await fetch(`http://localhost:3000/api/v1/mandates/${jobId}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agency-id": agencyId,
        "x-user-id": "11111111-1111-4111-8111-111111111112",
        "x-user-role": "owner" // Owner Role
      },
      body: JSON.stringify({ agreedFeePercentage: "10.00" })
    });
    const convertData = await convertRes.json();
    console.log(`Owner Attempt Status: ${convertRes.status}`);
    console.log("API Response:", JSON.stringify(convertData));

    if (!convertData.success || convertData.status !== "Active") {
      throw new Error("Owner mandate conversion failed.");
    }

    // Verify Client record created in DB
    const clientCheck = await pgClient.query("SELECT * FROM client_records WHERE client_id = $1", [convertData.clientId]);
    console.log(`Client Record Created: Company='${clientCheck.rows[0].company_name}', HR Email='${clientCheck.rows[0].primary_hr_email}'`);

    // --- Test 3: Client Duplication Guard ---
    console.log("\n--- Test 3: Client Duplication Guard ---");
    const jobId2 = "88888888-8888-8888-8888-888888888888";
    await pgClient.query(`
      INSERT INTO job_mandates (job_id, agency_id, title, client_name, primary_hr_name, primary_hr_email, primary_hr_phone, selected_terms, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (job_id) DO UPDATE SET status = 'Unreviewed Inbound', client_id = NULL
    `, [
      jobId2, agencyId, "Principal Cloud Architect", "Horizon Tech Labs", "Sarah Jenkins", "sarah@horizontech.com", "+971509998888", "Standard Contingency", "Unreviewed Inbound"
    ]);

    const dupRes = await fetch(`http://localhost:3000/api/v1/mandates/${jobId2}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agency-id": agencyId,
        "x-user-id": "11111111-1111-4111-8111-111111111112",
        "x-user-role": "owner"
      },
      body: JSON.stringify({ agreedFeePercentage: "10.00" })
    });
    const dupData = await dupRes.json();
    console.log(`Second Inbound Conversion Response: isNewClient=${dupData.isNewClient}`);
    if (dupData.clientId !== convertData.clientId) {
      throw new Error("Client Duplication Guard failed! Duplicated client record instead of reusing existing client_id.");
    }
    console.log("Client Duplication Guard: PASSED (Reused existing client_id)");

    // --- Test 4: Verify Multi-channel Onboarding Dispatches ---
    console.log("\n--- Test 4: Automated Multi-channel Dispatches ---");
    const commsRes = await pgClient.query("SELECT channel, to_address, body FROM communication_log WHERE to_address IN ($1, $2) ORDER BY created_at DESC LIMIT 2", ["sarah@horizontech.com", "+971509998888"]);
    console.log(`Dispatched Messages Count: ${commsRes.rows.length}`);
    commsRes.rows.forEach(c => console.log(` [${c.channel.toUpperCase()}] To: ${c.to_address} -> ${c.body.substring(0, 70)}...`));

    console.log("\n=== ALL AS-02 TESTS COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("\n*** TEST FAILED ***");
    console.error(err.message);
  } finally {
    await pgClient.end();
  }
}

testOwnerConversion();
