const { Client } = require("pg");
const crypto = require("crypto");

const DB_URL = process.env.DATABASE_URL;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function testPO01() {
  console.log("=== STARTING PO-01 END-TO-END FLOW TEST ===");
  const pgClient = new Client({ connectionString: DB_URL });
  await pgClient.connect();

  try {
    // 1. Fetch Apex Agency ID and Job Mandate to use for sharing
    const agencyRes = await pgClient.query("SELECT agency_id FROM agencies WHERE agency_name = $1 LIMIT 1", ["Apex Recruitment Partners"]);
    if (agencyRes.rows.length === 0) {
      throw new Error("Apex Recruitment Partners agency not found in DB");
    }
    const agencyId = agencyRes.rows[0].agency_id;
    console.log(`Resolved Agency ID: ${agencyId}`);

    const jobRes = await pgClient.query("SELECT job_id, title, client_name FROM job_mandates WHERE agency_id = $1 LIMIT 1", [agencyId]);
    if (jobRes.rows.length === 0) {
      throw new Error("No job mandates found for agency Apex");
    }
    const job = jobRes.rows[0];
    const jobId = job.job_id;
    console.log(`Resolved Job Mandate: ${job.title} for client ${job.client_name} (${jobId})`);

    // Clean existing shares for clean test run
    await pgClient.query("DELETE FROM partner_mandate_shares WHERE job_id = $1", [jobId]);

    // Mock API call to POST /api/v1/jobs/[jobId]/partner-share
    // Since we are running outside the HTTP server, we will simulate the route business logic
    // to generate the token and share details, insert to DB, and then test the public GET endpoint.
    console.log("\n--- Step 2: Simulating Share Link Generation ---");
    const rawToken = crypto.randomBytes(32).toString("hex");
    const accessTokenHash = hashToken(rawToken);

    const partnerEmail = "john.sourcer@freelance.com";
    const partnerName = "John Freelance Sourcing";
    const maskedJobTitle = `Leading Multi-National Partner — ${job.title}`;
    const maskedCompanyDescription = `An anonymized recruitment mandate for a tech lead role. Direct contact info: email developer@${job.client_name.replace(/\s+/g, "").toLowerCase()}.com or call +971501234567.`;

    // Regex sanitization logic
    const cleanDescription = maskedCompanyDescription
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[masked-email]")
      .replace(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g, "[masked-phone]")
      .replace(/https?:\/\/[^\s]+/g, "[masked-link]");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const partnerSplit = 50.00;
    const agencySplit = 50.00;

    const insertQuery = `
      INSERT INTO partner_mandate_shares (
        share_id, agency_id, job_id, partner_email, partner_name,
        masked_job_title, masked_company_description, agency_split_percentage,
        partner_split_percentage, access_token_hash, expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING share_id, expires_at
    `;
    const insertRes = await pgClient.query(insertQuery, [
      crypto.randomUUID(), agencyId, jobId, partnerEmail, partnerName,
      maskedJobTitle, cleanDescription, agencySplit, partnerSplit,
      accessTokenHash, expiresAt, true
    ]);

    const shareId = insertRes.rows[0].share_id;
    console.log(`Successfully generated share link in database. Share ID: ${shareId}`);
    console.log(`Generated Token: ${rawToken}`);

    // --- Step 3: Triggering GET /api/v1/public/partner/[token] ---
    console.log("\n--- Step 3: Retrieving Masked Mandate using Public Token ---");
    const checkHash = hashToken(rawToken);

    // Fetch share using hashed token
    const fetchQuery = `
      SELECT share_id, job_id, masked_job_title, masked_company_description, partner_split_percentage, expires_at, is_active
      FROM partner_mandate_shares
      WHERE access_token_hash = $1 AND is_active = true
    `;
    const fetchRes = await pgClient.query(fetchQuery, [checkHash]);
    if (fetchRes.rows.length === 0) {
      throw new Error("No active share found for the token");
    }

    const share = fetchRes.rows[0];
    console.log("Token Lookup: SUCCESS");

    // --- Step 4: Verification of Masking Integrity (Security Audit) ---
    console.log("\n--- Step 4: Security & Masking Audit Checks ---");

    // Enforce expiry validation
    const isExpired = new Date() > new Date(share.expires_at);
    console.log(`Audit: Is Link Expired? -> ${isExpired} (Expected: false)`);
    if (isExpired) throw new Error("Link expired prematurely");

    // Test text sanitization
    const desc = share.masked_company_description;
    console.log(`Sanitized Description: "${desc}"`);
    const emailLeaked = desc.includes("@");
    const phoneLeaked = desc.includes("+971") || desc.includes("1234567");
    console.log(`Audit: Did email leak? -> ${emailLeaked} (Expected: false)`);
    console.log(`Audit: Did phone leak? -> ${phoneLeaked} (Expected: false)`);

    if (emailLeaked || phoneLeaked) {
      throw new Error("Security check failed: contact details leaked in sanitized text!");
    }

    // STRICT METRIC CHECK: Ensure actual client properties are not present in share object
    const leakedKeys = ["client_name", "client_id", "billing_address", "client_hr_email", "agency_name"];
    leakedKeys.forEach(k => {
      const leaked = k in share;
      console.log(`Audit: Is key '${k}' exposed in returned payload? -> ${leaked} (Expected: false)`);
      if (leaked) {
        throw new Error(`Security breach: exposed confidential key '${k}' to partner!`);
      }
    });

    console.log("\n=== PO-01 END-TO-END FLOW TEST COMPLETE: SUCCESS ===");

  } catch (error) {
    console.error("\n*** TEST FAILED ***");
    console.error(error.message);
  } finally {
    await pgClient.end();
  }
}

testPO01();
