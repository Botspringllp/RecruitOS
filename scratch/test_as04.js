// AS-04 Candidate Inbound Application & Auto-Parsing API Test
const BASE = "http://localhost:3000";
const SUBDOMAIN = "apex"; // Resolves to Apex Recruitment Partners

async function run() {
  console.log("=== AS-04 CANDIDATE APPLICATION & PARSING TEST ===\n");

  // Create a mock text file
  const createMockFile = (name, content) => {
    return new Blob([content], { type: "text/plain" });
  };

  // TEST 1: Fresh Candidate storefront drop (Expected: 201 Created)
  console.log("--- Test 1: Fresh Candidate Application ---");
  const form1 = new FormData();
  form1.append("fullName", "Priya Mehta");
  form1.append("email", "priya_as04_test@example.com");
  form1.append("phone", "+919876543210");
  form1.append("noticePeriodDays", "30");
  form1.append("desiredTitle", "Senior Software Engineer");
  form1.append("expectedCtc", "2400000");
  
  // Attach simulated resume text file
  const resumeBlob = createMockFile("priya_resume.txt", "Priya Mehta resume profile. Current title: Senior Software Engineer at FinTech Solutions Corp.");
  form1.append("file", resumeBlob, "priya_resume.txt");

  const r1 = await fetch(`${BASE}/api/v1/public/storefront/${SUBDOMAIN}/apply`, {
    method: "POST",
    body: form1
  });
  const d1 = await r1.json();
  console.log(`Status: ${r1.status}`);
  if (r1.status !== 201 || !d1.success) {
    throw new Error(`Test 1 Failed: Expected Success. Got ${JSON.stringify(d1)}`);
  }
  console.log("✅ PASSED: Fresh candidate applied & parsed successfully!");
  console.log("Parsed Data:", JSON.stringify(d1.parsedData));

  // TEST 2: Existing candidate drop (Expected: 201 Created with updated fields and NO duplicate candidate ID)
  console.log("\n--- Test 2: Existing Candidate Re-Application (Duplicate Arbitration) ---");
  const form2 = new FormData();
  form2.append("fullName", "Priya Mehta Updated");
  form2.append("email", "priya_as04_test@example.com"); // Same email
  form2.append("phone", "+919876543210");
  form2.append("noticePeriodDays", "15"); // Changed notice period
  form2.append("desiredTitle", "Principal Engineer"); // Changed desired title
  
  const resumeBlob2 = createMockFile("priya_updated_resume.pdf", "Priya Mehta Updated, Principal Software Engineer");
  form2.append("file", resumeBlob2, "priya_updated_resume.pdf");

  const r2 = await fetch(`${BASE}/api/v1/public/storefront/${SUBDOMAIN}/apply`, {
    method: "POST",
    body: form2
  });
  const d2 = await r2.json();
  console.log(`Status: ${r2.status}`);
  if (r2.status !== 201 || !d2.success) {
    throw new Error(`Test 2 Failed: Expected Success. Got ${JSON.stringify(d2)}`);
  }

  // Verify candidate IDs match (no duplicate record was created)
  if (d1.candidateId !== d2.candidateId) {
    throw new Error(`Duplicate Arbitration Failed: Expected candidate ID ${d1.candidateId} to match ${d2.candidateId}`);
  }
  console.log("✅ PASSED: Duplicate candidate checked. Existing candidate record was updated instead of duplicating!");

  console.log("\n=== AS-04 TESTS COMPLETE ===");
}

run().catch(e => {
  console.error("Test run error:", e.message);
  process.exit(1);
});
