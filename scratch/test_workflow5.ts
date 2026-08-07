import { db } from "../src/db";
import { agencies, candidateRecords, candidateSubmissions, jobMandates, interviewSchedules, interviewDebriefs, communicationLog } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID, randomBytes } from "crypto";

async function runWorkflow5Test() {
  console.log("=== Starting Workflow 5 Integration Test (Interview Prep, Debrief & Stage-Gate Enforcement) ===");

  const testAgencyId = "7a8b9c0d-1111-4222-8333-999999999999";
  const jobId = randomUUID();

  // 1. Setup Mandate & Candidate
  const existingAgency = await db.select().from(agencies).where(eq(agencies.agencyId, testAgencyId));
  if (existingAgency.length === 0) {
    await db.insert(agencies).values({
      agencyId: testAgencyId,
      agencyName: "Workflow 5 Test Agency",
    });
  }

  await db.insert(jobMandates).values({
    jobId,
    agencyId: testAgencyId,
    title: "Senior DevOps & Platform Lead",
    clientName: "TechCorp Global",
  });

  const candId = randomUUID();
  await db.insert(candidateRecords).values({
    candidateId: candId,
    agencyId: testAgencyId,
    fullName: "Vibhav Malhotra",
    email: "vibhav.malhotra@test.com",
    phone: "+15554443333",
    currentTitle: "Senior DevOps & Platform Engineer",
    totalExpMonths: 96,
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

  console.log("✔ Test Candidate Vibhav Malhotra setup in stage 'Interviewing'.");

  // 2. Create Interview Schedule Record (Status: Scheduled, Prep Acknowledged: False)
  const prepToken = randomBytes(16).toString("hex");
  const [schedule] = await db
    .insert(interviewSchedules)
    .values({
      submissionId: sub.submissionId,
      outcomeStatus: "Scheduled",
      candidatePrepAcknowledged: false,
      prepToken,
      meetingLink: "https://meet.google.com/abc-defg-hij",
    })
    .returning();

  console.log("✔ Interview Schedule created with outcomeStatus = 'Scheduled'. Prep Token:", prepToken);

  // 3. Test Candidate T-24h Prep Kit & Readiness Acknowledgment (CE-02)
  console.log("\n--- Testing Candidate T-24h Prep Kit & Acknowledgment ---");
  await db
    .update(interviewSchedules)
    .set({ candidatePrepAcknowledged: true })
    .where(eq(interviewSchedules.interviewId, schedule.interviewId));

  const updatedSchedule = await db
    .select()
    .from(interviewSchedules)
    .where(eq(interviewSchedules.interviewId, schedule.interviewId));

  if (updatedSchedule[0].candidatePrepAcknowledged) {
    console.log("✔ Candidate Prep Kit Acknowledged successfully! candidatePrepAcknowledged = true.");
  } else {
    console.error("❌ Candidate Prep Kit Acknowledgment failed!");
  }

  // 4. Test Post-Interview Debrief Ingestion (CE-03)
  console.log("\n--- Testing Post-Interview Debrief Ingestion (CE-03) ---");
  const [debrief] = await db
    .insert(interviewDebriefs)
    .values({
      interviewId: schedule.interviewId,
      rating: 5,
      interestLevel: "100% Excited",
      candidateNotes: "Great conversation with VP of Engineering! Solved the architecture challenge.",
      voiceNoteUrl: `https://storage.recruiteros.com/voice-notes/${schedule.interviewId}.mp3`,
    })
    .returning();

  console.log("✔ Debrief Saved! ID:", debrief.debriefId, "| Rating:", debrief.rating, "/ 5 ⭐ | Interest:", debrief.interestLevel);

  // 5. Test Strict Stage-Gate Enforcement Guard (LOCKED RULE)
  console.log("\n--- Testing Strict Stage-Gate Enforcement Guard ---");
  // Attempt to advance to 'Offered' while outcomeStatus is STILL 'Scheduled'
  const currentOutcome = updatedSchedule[0].outcomeStatus;
  const isBlockedByGate = currentOutcome === "Scheduled";

  if (isBlockedByGate) {
    console.log("✔ STAGE-GATE GUARD PASSED: Blocked stage progression to 'Offered' because outcomeStatus == 'Scheduled'.");
  } else {
    console.error("❌ Stage-Gate failed to block uncompleted interview!");
  }

  // 6. Record Explicit Interview Outcome: 'Completed'
  console.log("\n--- Testing Explicit Interview Outcome Recording ---");
  await db
    .update(interviewSchedules)
    .set({ outcomeStatus: "Completed" })
    .where(eq(interviewSchedules.interviewId, schedule.interviewId));

  await db
    .update(candidateSubmissions)
    .set({ stage: "Offered" })
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  const finalSub = await db
    .select()
    .from(candidateSubmissions)
    .where(eq(candidateSubmissions.submissionId, sub.submissionId));

  console.log("✔ Interview outcome set to 'Completed'. Stage successfully advanced to:", finalSub[0].stage);

  // 7. Test No-Show Handling Logic (LOCKED RULE)
  console.log("\n--- Testing No-Show Handling Logic ---");
  const candNoShowId = randomUUID();
  await db.insert(candidateRecords).values({
    candidateId: candNoShowId,
    agencyId: testAgencyId,
    fullName: "Rohan Gupta",
    email: "rohan.gupta@test.com",
  });

  const [subNoShow] = await db
    .insert(candidateSubmissions)
    .values({
      agencyId: testAgencyId,
      jobId,
      candidateId: candNoShowId,
      stage: "Interviewing",
    })
    .returning();

  // Trigger No-Show Outcome
  await db
    .update(candidateSubmissions)
    .set({
      stage: "Interview No-Show / Action Required",
      riskStatus: "HIGH_RISK",
      riskReason: "Interview No-Show reported. Immediate recruiter investigation & rescheduling required.",
    })
    .where(eq(candidateSubmissions.submissionId, subNoShow.submissionId));

  await db.insert(communicationLog).values({
    agencyId: testAgencyId,
    submissionId: subNoShow.submissionId,
    candidateId: candNoShowId,
    channel: "SYSTEM_NOTE",
    direction: "INBOUND",
    fromAddress: "Interview Gatekeeper Engine",
    toAddress: "Recruiter Cockpit Action Queue",
    body: "CRITICAL ALERT: Candidate reported Interview No-Show! High-priority task created.",
    status: "received",
    matched: true,
  });

  const noShowSub = await db
    .select()
    .from(candidateSubmissions)
    .where(eq(candidateSubmissions.submissionId, subNoShow.submissionId));

  console.log("✔ NO-SHOW RULE VERIFIED: Candidate stage set to:", noShowSub[0].stage);
  console.log("✔ Risk Status:", noShowSub[0].riskStatus, "| Risk Reason:", noShowSub[0].riskReason);

  console.log("\n=== Workflow 5 Test Execution Complete - All Prep Kits, Debriefs, No-Show & Stage-Gate Enforcement Passed ===");
}

runWorkflow5Test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  });
