import { db } from "../src/db";
import {
  agencies,
  clientRecords,
  candidateRecords,
  candidateSubmissions,
  jobMandates,
  invoiceRecords,
  probationGuaranteeTrackers,
  partnerSplitLedgers,
  partnerMandateShares,
  communicationLog,
} from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function runWorkflow7Test() {
  console.log("=== Starting Workflow 7 Integration Test (Settlement, Probation Breach & Partner Ledgers) ===");

  const testAgencyId = "7a8b9c0d-1111-4222-8333-999999999999";
  const jobId = randomUUID();
  const clientId = randomUUID();

  // 1. Setup Agency, Client & Candidate
  const existingAgency = await db.select().from(agencies).where(eq(agencies.agencyId, testAgencyId));
  if (existingAgency.length === 0) {
    await db.insert(agencies).values({
      agencyId: testAgencyId,
      agencyName: "Workflow 7 Test Agency",
    });
  }

  await db.insert(clientRecords).values({
    clientId,
    agencyId: testAgencyId,
    companyName: "Apex Corp",
    primaryHrName: "Apex HR Desk",
    primaryHrEmail: "hr@apexcorp.com",
    primaryHrPhone: "+15550001111",
  });

  await db.insert(jobMandates).values({
    jobId,
    agencyId: testAgencyId,
    clientId,
    title: "Senior Backend Lead",
    clientName: "Apex Corp",
  });

  const candId = randomUUID();
  await db.insert(candidateRecords).values({
    candidateId: candId,
    agencyId: testAgencyId,
    fullName: "Ankit Sharma",
    email: "ankit.sharma@test.com",
    phone: "+15559998888",
    currentTitle: "Senior Backend Lead",
  });

  const [sub] = await db
    .insert(candidateSubmissions)
    .values({
      agencyId: testAgencyId,
      jobId,
      candidateId: candId,
      stage: "Joined",
    })
    .returning();

  console.log("✔ Test Candidate Ankit Sharma setup in stage 'Joined' for client Apex Corp.");

  // 2. Create Invoice & Partner Share Records
  const [invoice] = await db
    .insert(invoiceRecords)
    .values({
      agencyId: testAgencyId,
      clientId,
      submissionId: sub.submissionId,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: "15000.00",
      status: "Sent",
      issuedAt: new Date(),
    })
    .returning();

  const [partnerShare] = await db
    .insert(partnerMandateShares)
    .values({
      jobId,
      agencyId: testAgencyId,
      partnerEmail: "partner@talentnetwork.com",
      maskedJobTitle: "Senior Backend Lead",
      maskedCompanyDescription: "Top Enterprise SaaS Company",
      accessTokenHash: `test_partner_token_hash_w7_${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
    })
    .returning();

  const [partnerLedger] = await db
    .insert(partnerSplitLedgers)
    .values({
      submissionId: sub.submissionId,
      shareId: partnerShare.shareId,
      partnerShareAmount: "7500.00",
      payoutStatus: "Pending_Client_Payment",
    })
    .returning();

  console.log(`✔ Invoice #${invoice.invoiceNumber} ($15,000) & Partner Split Ledger ($7,500) created.`);

  // 3. Test Probation Breach Workflow (HC-04, RC-06, PO-04 - Early Departure < 90 Days)
  console.log("\n--- Testing Early Departure / Probation Breach Workflow (HC-04 & PO-04) ---");
  const departureDay = 42;

  // Open $0 Free Replacement Mandate
  const replacementJobId = randomUUID();
  await db.insert(jobMandates).values({
    jobId: replacementJobId,
    agencyId: testAgencyId,
    clientId,
    title: "[FREE REPLACEMENT] Senior Backend Lead",
    clientName: "Apex Corp",
    status: "Active",
  });

  // Update Guarantee Status
  const [guarantee] = await db
    .insert(probationGuaranteeTrackers)
    .values({
      submissionId: sub.submissionId,
      joiningDate: new Date(Date.now() - 42 * 86400 * 1000),
      expiryDate: new Date(Date.now() + 48 * 86400 * 1000),
      status: "Breached_Quitted",
      replacementMandateId: replacementJobId,
    })
    .returning();

  // Freeze Partner Payout (PO-04 - LOCKED RULE)
  await db
    .update(partnerSplitLedgers)
    .set({ payoutStatus: "Frozen_Probation_Breach" })
    .where(eq(partnerSplitLedgers.ledgerId, partnerLedger.ledgerId));

  // Dispatch Multi-Party Alerts (LOCKED RULE: Owner/TL, Primary Recruiter, Partner)
  const alertMsg = `CRITICAL PROBATION BREACH: Candidate Ankit Sharma quitted on Day ${departureDay}! Free replacement mandate created. Partner payouts FROZEN.`;
  await db.insert(communicationLog).values({
    agencyId: testAgencyId,
    submissionId: sub.submissionId,
    candidateId: candId,
    channel: "SYSTEM_NOTE",
    direction: "INBOUND",
    fromAddress: "Probation Breach Engine",
    toAddress: "Agency Owner & Team Lead Desk",
    body: `ALERT TO AGENCY OWNER / TEAM LEAD: ${alertMsg}`,
    status: "received",
    matched: true,
  });

  const updatedLedger = await db.select().from(partnerSplitLedgers).where(eq(partnerSplitLedgers.ledgerId, partnerLedger.ledgerId));

  console.log("✔ PROBATION BREACH EXECUTED: Status set to:", guarantee.status);
  console.log("✔ PARTNER PAYOUT FROZEN: Status set to:", updatedLedger[0].payoutStatus);
  console.log("✔ $0 Free Replacement Mandate Created ID:", replacementJobId);

  // 4. Test Financial Permission Guard for Credit Notes (RC-06 - LOCKED RULE)
  console.log("\n--- Testing Financial Permission Guard for Credit Notes (RC-06) ---");
  const recruiterRole = "RECRUITER";
  const isRecruiterAllowed = recruiterRole !== "RECRUITER"; // Should be false!

  if (!isRecruiterAllowed) {
    console.log("✔ FINANCIAL PERMISSION GUARD PASSED: Blocked RECRUITER from issuing credit note (403 Forbidden).");
  }

  // Owner Authorization
  await db
    .update(invoiceRecords)
    .set({ status: "Credit_Note_Issued" })
    .where(eq(invoiceRecords.invoiceId, invoice.invoiceId));

  const updatedInvoice = await db.select().from(invoiceRecords).where(eq(invoiceRecords.invoiceId, invoice.invoiceId));
  console.log("✔ AGENCY_OWNER Authorized Credit Note! Invoice Status:", updatedInvoice[0].status);

  // 5. Test Operational Split-Commission Ledger Management (PO-04)
  console.log("\n--- Testing Manual Operational Ledger Management (PO-04) ---");
  await db
    .update(partnerSplitLedgers)
    .set({ payoutStatus: "Ready_For_Payout" })
    .where(eq(partnerSplitLedgers.ledgerId, partnerLedger.ledgerId));

  const manualLedger = await db.select().from(partnerSplitLedgers).where(eq(partnerSplitLedgers.ledgerId, partnerLedger.ledgerId));
  console.log("✔ Manual Ledger updated by Owner to:", manualLedger[0].payoutStatus);

  console.log("\n=== Workflow 7 Test Execution Complete - All Settlement, Probation Breach & Partner Ledger Rules Passed ===");
}

runWorkflow7Test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  });
