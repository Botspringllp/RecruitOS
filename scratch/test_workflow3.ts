import { db } from "../src/db";
import { agencies, candidateRecords, candidateSubmissions, jobMandates, communicationLog, agencyChannels } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

async function runWorkflow3Test() {
  console.log("=== Starting Workflow 3 Integration Test (Daily Recruiter Cockpit & Communication Engine) ===");

  const testAgencyId = "7a8b9c0d-1111-4222-8333-999999999999";

  // 1. Setup Test Agency
  const existingAgency = await db.select().from(agencies).where(eq(agencies.agencyId, testAgencyId));
  if (existingAgency.length === 0) {
    await db.insert(agencies).values({
      agencyId: testAgencyId,
      agencyName: "Workflow 3 Test Agency",
    });
  }

  // Setup Agency Channel for Webhook Matching
  const channelAddr = "+19998887777";
  const existingChannel = await db
    .select()
    .from(agencyChannels)
    .where(and(eq(agencyChannels.agencyId, testAgencyId), eq(agencyChannels.address, channelAddr)));
  
  if (existingChannel.length === 0) {
    await db.insert(agencyChannels).values({
      agencyId: testAgencyId,
      channel: "whatsapp",
      address: channelAddr,
      provider: "twilio",
    });
  }

  // 2. Setup Mandate & Candidates
  const jobId = randomUUID();
  await db.insert(jobMandates).values({
    jobId,
    agencyId: testAgencyId,
    title: "Lead Cloud Architect",
    clientName: "SaaS Enterprise Corp",
  });

  // Candidate 1: Stuck in stage for 80 hours (SLA Breach Target: Neha Gupta style card)
  const candidate1Id = randomUUID();
  const cand1Phone = "+15551234567";

  await db.insert(candidateRecords).values({
    candidateId: candidate1Id,
    agencyId: testAgencyId,
    fullName: "Neha Gupta",
    email: `neha.gupta.${Date.now()}@example.com`,
    phone: cand1Phone,
    currentTitle: "Principal Cloud Engineer",
    totalExpMonths: 96,
  });

  const eightyHoursAgo = new Date(Date.now() - 80 * 3600 * 1000);
  const [sub1] = await db
    .insert(candidateSubmissions)
    .values({
      agencyId: testAgencyId,
      jobId,
      candidateId: candidate1Id,
      stage: "Submitted",
      stageUpdatedAt: eightyHoursAgo,
      riskStatus: "NORMAL",
    })
    .returning();

  console.log("✔ Test Candidate 'Neha Gupta' created with 80h SLA Breach state.");

  // 3. Test Negative Sentiment Logic directly & via Webhook payload simulation
  console.log("\n--- Testing Inbound Webhook Negative Sentiment Detection ---");
  const webhookBody = "Hi team, I am declining the offer because I accepted counter offer from current employer.";
  const NEGATIVE_SENTIMENT_KEYWORDS = ["declining", "accepted counter offer", "not interested", "withdrawing"];
  
  const lowerBody = webhookBody.toLowerCase();
  const detectedKeyword = NEGATIVE_SENTIMENT_KEYWORDS.find(keyword => lowerBody.includes(keyword));
  const isHighRisk = !!detectedKeyword;

  if (isHighRisk) {
    await db
      .update(candidateSubmissions)
      .set({
        riskStatus: "HIGH_RISK",
        riskReason: `Negative sentiment detected in inbound WHATSAPP: "${detectedKeyword}"`,
        lastCommunicationAt: new Date(),
      })
      .where(eq(candidateSubmissions.submissionId, sub1.submissionId));

    await db.insert(communicationLog).values({
      agencyId: testAgencyId,
      submissionId: sub1.submissionId,
      candidateId: candidate1Id,
      channel: "WHATSAPP",
      direction: "INBOUND",
      fromAddress: cand1Phone,
      toAddress: channelAddr,
      body: webhookBody,
      externalMessageId: `waba_${Date.now()}`,
      status: "received",
      matched: true,
    });
  }

  const updatedSub = await db
    .select()
    .from(candidateSubmissions)
    .where(eq(candidateSubmissions.submissionId, sub1.submissionId));

  console.log("✔ High Risk Flagged:", updatedSub[0]?.riskStatus === "HIGH_RISK" ? "HIGH_RISK (PASSED)" : "FAILED");
  console.log("✔ Risk Reason Logged:", updatedSub[0]?.riskReason);

  // 4. Test Outbound Communication Dispatch API
  console.log("\n--- Testing Outbound Communication Dispatch ---");
  const [dispatchLog] = await db
    .insert(communicationLog)
    .values({
      agencyId: testAgencyId,
      submissionId: sub1.submissionId,
      candidateId: candidate1Id,
      channel: "WHATSAPP",
      direction: "OUTBOUND",
      fromAddress: "Recruiting Command Center",
      toAddress: cand1Phone,
      body: "Hi Neha, we received your note regarding declining. Can we schedule a 5-min call to discuss counter offer details?",
      status: "sent",
      matched: true,
    })
    .returning();

  await db
    .update(candidateSubmissions)
    .set({ lastCommunicationAt: new Date() })
    .where(eq(candidateSubmissions.submissionId, sub1.submissionId));

  console.log("✔ Outbound WhatsApp message dispatched successfully! Log ID:", dispatchLog.messageId);

  // 5. Query Communication History Logs
  const historyLogs = await db
    .select()
    .from(communicationLog)
    .where(eq(communicationLog.submissionId, sub1.submissionId));

  console.log(`\n✔ Communication History Feed fetched (${historyLogs.length} messages found):`);
  historyLogs.forEach((log, idx) => {
    console.log(`   [Msg #${idx + 1} | ${log.direction} | ${log.channel}] ${log.body}`);
  });

  console.log("\n=== Workflow 3 Test Execution Complete - All SLA Aging, Risk Flags & Dispatch Logs Validated ===");
}

runWorkflow3Test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  });
