// PO-02 & PO-03 Test — API-only (no direct DB connection needed)
const BASE = "http://localhost:3000";
const AGENCY_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID   = "11111111-1111-4111-8111-111111111112";
const JOB_ID    = "33333333-3333-3333-3333-333333333333";

async function run() {
  console.log("=== PO-02 & PO-03 DUPLICATE ARBITRATION TEST ===\n");

  // STEP 1: Generate a fresh partner share token
  console.log("--- Setup: Generating Partner Share Token ---");
  const shareRes = await fetch(`${BASE}/api/v1/jobs/${JOB_ID}/partner-share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-agency-id": AGENCY_ID,
      "x-user-id": USER_ID,
      "x-user-role": "owner"
    },
    body: JSON.stringify({
      partner_email: "po02_partner@sourcers.com",
      partner_name: "PO-02 Test Partner",
      masked_job_title: "Test Masked Role",
      masked_company_description: "Test responsibilities"
    })
  });
  const shareData = await shareRes.json();
  if (!shareData.success) throw new Error("Could not create share token: " + JSON.stringify(shareData));
  const token = shareData.magicLink.split("/").pop();
  console.log("Token generated:", token.substring(0, 20) + "...");

  // TEST 1: Fresh Unique Candidate — Should PASS
  console.log("\n--- Test 1: Fresh Candidate Submission (Expected: 200 OK) ---");
  const r1 = await fetch(`${BASE}/api/v1/public/partner/${token}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "Fresh Candidate PO02", email: "fresh_po02_unique@test.com", phone: "+971501234567" })
  });
  const d1 = await r1.json();
  console.log(`Status: ${r1.status}`, d1.success ? "✅ PASSED" : `❌ FAILED: ${d1.error}`);

  // TEST 2: Same email again — Rule 2 (First-touch Arbitrator) Should return 409
  console.log("\n--- Test 2: Duplicate Partner Submission — Rule 2 (Expected: 409) ---");
  const r2 = await fetch(`${BASE}/api/v1/public/partner/${token}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "Fresh Candidate PO02 Again", email: "fresh_po02_unique@test.com" })
  });
  const d2 = await r2.json();
  const test2Pass = r2.status === 409 && d2.error?.includes("Rule 2");
  console.log(`Status: ${r2.status}`, test2Pass ? "✅ PASSED" : `❌ FAILED: ${d2.error}`);

  // TEST 3: Invalid/expired token — Should return 403
  console.log("\n--- Test 3: Invalid Token (Expected: 403) ---");
  const r3 = await fetch(`${BASE}/api/v1/public/partner/invalidtokenxyz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "Hacker", email: "hacker@test.com" })
  });
  const d3 = await r3.json();
  const test3Pass = r3.status === 403;
  console.log(`Status: ${r3.status}`, test3Pass ? "✅ PASSED" : `❌ FAILED: ${d3.error}`);

  console.log("\n=== PO-02 & PO-03 TESTS COMPLETE ===");
}

run().catch(e => {
  console.error("Test run error:", e.message);
  process.exit(1);
});
