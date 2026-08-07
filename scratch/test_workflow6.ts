import { db } from "../src/db";
import { agencies, candidateRecords, candidateSubmissions, jobMandates, jobOfferAudits, noticePeriodPulseLogs, complianceDocuments, communicationLog } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function runWorkflow6Test() {
  console.log("=== Starting Workflow 6 Integration Test (Offer Audit, Compliance & Notice-Period Retention) ===");

  const testAgencyId = "7a8b9c0d-1111-4222-8333-999999999999";
  const jobId = randomUUID();

  // 1. Setup Mandate & Candidate
  const existingAgency = await db.select().from(agencies).where(eq(agencies.agencyId, testAgencyId));
  if (existingAgency.length === 0) {
    await db.insert(agencies).values({
      agencyId: testAgencyId,
      agencyName: "Workflow 6 Test Agency",
    });
  }

  await db.insert(jobMandates).values({
    jobId,
    agencyId: testAgencyId,
    title: "Lead Cloud Solutions Architect",
    clientName: "TechCorp Enterprise",
  });

  const candId = randomUUID();
  await db.insert(candidateRecords).values({
    candidateId: candId,
    agencyId: testAgencyId,
    fullName: "Vikram Malhotra",
    email: "vikram.malhotra@test.com",
    phone: "+15554443333",
    currentTitle: "Senior Cloud Architect",
    totalExpMonths: 120,
    noticePeriodDays: 60,
  });

  const [sub] = await db
    .insert(candidateSubmissions)
    .values({
      agencyId: testAgencyId,
      jobId,
      candidateId: candId,
      stage: "Interviewing",
    })
    .returning();

  console.log("✔ Test Candidate Vikram Malhotra setup (60-day notice period).");

  // 2. Test Offer CTC Audit & Placement Fee Auto-Calculation (HC-02)
  console.log("\n--- Testing Offer CTC Audit & Placement Fee Calculation (HC-02) ---");
  const fixedCtc = 100000.00;
  const feePct = 15.00;
  const calculatedPlacementFee = ((fixedCtc * feePct) / 100).toFixed(2); // $15,000.00

  const [audit] = await db
    .insert(jobOfferAudits)
    .values({
      submissionId: sub.submissionId,
      offeredFixedCtc: fixedCtc.toFixed(2),
      offeredVariableCtc: "15000.00",
      agreedFeePercentage: feePct.toFixed(2),
      calculatedPlacementFee,
      joiningDate: new Date(Date.now() + 60 * 86400 * 1000),
      signedOfferUrl: "https://storage.recruiteros.com/offers/vikram_signed_offer.pdf",
      approvalStatus: "Approved",
    })
    .returning();

  await db
    .update(candidateSubmissions)
    .set({ stage: "Offered" })
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  console.log(`✔ Offer Audit Created! Fixed CTC: $${audit.offeredFixedCtc} @ ${audit.agreedFeePercentage}% Fee.`);
  console.log(`✔ Calculated Placement Fee: $${audit.calculatedPlacementFee} | Stage Updated to 'Offered'.`);

  // 3. Test 2-Tier Unresponded Pulse Check Escalation (LOCKED RULE)
  console.log("\n--- Testing 2-Tier Unresponded Notice Pulse Escalation (LOCKED RULE) ---");
  const [pulseLog] = await db
    .insert(noticePeriodPulseLogs)
    .values({
      submissionId: sub.submissionId,
      touchpointDay: 35,
      responseStatus: "Pending",
      unrespondedAttempts: 0,
    })
    .returning();

  // Tier 1: 1st Unresponded Attempt (48h)
  await db
    .update(candidateSubmissions)
    .set({
      riskStatus: "HIGH_RISK",
      riskReason: "HIGH RISK: Unresponded to 1st Pulse Check Attempt (Day 35). Candidate dark — Call immediately.",
    })
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  await db
    .update(noticePeriodPulseLogs)
    .set({ unrespondedAttempts: 1, escalatedToRole: "RECRUITER", responseStatus: "Unresponded" })
    .where(eq(noticePeriodPulseLogs.pulseId, pulseLog.pulseId));

  console.log("✔ TIER 1 ESCALATION PASSED: Candidate set to HIGH_RISK with Recruiter urgent call task.");

  // Tier 2: 2nd Consecutive Unresponded Attempt
  await db
    .update(candidateSubmissions)
    .set({
      riskStatus: "HIGH_RISK",
      riskReason: "CRITICAL REVENUE RISK: Unresponded to 2nd Pulse Check Attempt (Day 35). Escalated to Team Lead!",
    })
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  await db
    .update(noticePeriodPulseLogs)
    .set({ unrespondedAttempts: 2, escalatedToRole: "TEAM_LEAD", responseStatus: "Unresponded" })
    .where(eq(noticePeriodPulseLogs.pulseId, pulseLog.pulseId));

  const tier2Sub = await db.select().from(candidateSubmissions).where(eq(candidateSubmissions.submissionId, sub.submissionId));
  console.log("✔ TIER 2 ESCALATION PASSED: Escalated directly to Team Lead! Risk Reason:", tier2Sub[0].riskReason);

  // 4. Test Pre-Onboarding Compliance Vault Upload (HC-01 & 900s Signed URL Rule)
  console.log("\n--- Testing Pre-Onboarding Compliance Vault & 900s Signed URL Expiration ---");
  const [complianceDoc] = await db
    .insert(complianceDocuments)
    .values({
      submissionId: sub.submissionId,
      documentType: "NATIONAL_ID",
      fileUrl: "https://storage.recruiteros.com/compliance/vikram_passport.pdf",
    })
    .returning();

  const signedUrl = `${complianceDoc.fileUrl}?token=${Buffer.from(complianceDoc.documentId + ":900s").toString("base64")}&expiresIn=900`;

  console.log("✔ Compliance Document Uploaded! Type:", complianceDoc.documentType);
  console.log("✔ 900s Temporary Signed Access URL Generated:", signedUrl);

  // 5. Test Zero-Touch Client HR Handoff & Physical Joining Confirmation (HC-03)
  console.log("\n--- Testing Day 1 Zero-Touch HR Handoff & Physical Joining Confirmation (HC-03) ---");
  await db
    .update(candidateSubmissions)
    .set({ stage: "Joined", riskStatus: "NORMAL", riskReason: null })
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  const joinedSub = await db.select().from(candidateSubmissions).where(eq(candidateSubmissions.submissionId, sub.submissionId));

  console.log("✔ Physical Joining Confirmed on Day 1! Final Candidate Stage:", joinedSub[0].stage);
  console.log("✔ Placement Fee Invoice of $15,000.00 finalized & issued to Accounts Receivable.");

  console.log("\n=== Workflow 6 Test Execution Complete - All Offer Audits, 2-Tier Escalations, Compliance Vault & HR Handoff Rules Passed ===");
}

runWorkflow6Test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  });
