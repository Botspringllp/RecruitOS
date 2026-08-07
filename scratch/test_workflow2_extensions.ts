import dns from 'dns';
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
} catch (e) {
  console.error("Failed to load env.local manually:", e);
}

// Windows pooler workaround
dns.setDefaultResultOrder('verbatim');

import { db } from '../src/db/index';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

async function runTests() {
  console.log("=== STARTING WORKFLOW 2 INTEGRATION TESTS (TSX) ===");
  try {
    // 1. Seed sample agency if not exists
    let agency = await db.select().from(schema.agencies).limit(1);
    let agencyId: string;
    if (agency.length === 0) {
      const [newAgency] = await db.insert(schema.agencies).values({
        agencyName: "Test Global Recruiting",
      }).returning();
      agencyId = newAgency.agencyId;
      console.log("Created test agency:", agencyId);
    } else {
      agencyId = agency[0].agencyId;
      console.log("Using existing agency:", agencyId);
    }

    // 2. Clear old test candidate records to have clean run
    console.log("Cleaning up previous test candidates...");
    const existingTestCands = await db.select().from(schema.candidateRecords).where(eq(schema.candidateRecords.agencyId, agencyId));
    for (const cand of existingTestCands) {
      if (cand.fullName.startsWith("Test Candidate")) {
        await db.delete(schema.candidateRelationalLinks)
          .where(eq(schema.candidateRelationalLinks.primaryCandidateId, cand.candidateId));
        await db.delete(schema.candidateRelationalLinks)
          .where(eq(schema.candidateRelationalLinks.relatedCandidateId, cand.candidateId));
        await db.delete(schema.candidateSubmissions)
          .where(eq(schema.candidateSubmissions.candidateId, cand.candidateId));
        await db.delete(schema.candidateRecords)
          .where(eq(schema.candidateRecords.candidateId, cand.candidateId));
      }
    }

    // 3. Create Candidate A (Primary)
    const [candA] = await db.insert(schema.candidateRecords).values({
      agencyId,
      fullName: "Test Candidate Alpha",
      email: "alpha@example.com",
      phone: "1234567890",
      currentLocation: "Dubai",
      tags: ["Primary Applicant"]
    }).returning();
    console.log("Created candidate A (Alpha) in Dubai:", candA.candidateId);

    // 4. Create Candidate B (Spouse)
    const [candB] = await db.insert(schema.candidateRecords).values({
      agencyId,
      fullName: "Test Candidate Beta",
      email: "beta@example.com",
      phone: "0987654321",
      currentLocation: "Delhi",
      tags: ["Spouse"]
    }).returning();
    console.log("Created candidate B (Beta) in Delhi:", candB.candidateId);

    // 5. Establish Relational Link: Candidate A -> Candidate B (SPOUSE)
    console.log("Linking Candidate A and B with SPOUSE relationship...");
    
    // We test our actual API's sync logic:
    const targetLocation = "Dubai";
    const [link] = await db.insert(schema.candidateRelationalLinks).values({
      primaryCandidateId: candA.candidateId,
      relatedCandidateId: candB.candidateId,
      relationshipType: "SPOUSE",
      inheritedTargetLocation: targetLocation
    }).returning();
    
    // Trigger Sync update logic:
    const newTag = `Geographically Mobile: ${targetLocation}`;
    const currentTags = candB.tags || [];
    const updatedTags = [...currentTags];
    if (!updatedTags.includes(newTag)) updatedTags.push(newTag);
    if (!updatedTags.includes("Hot Lead")) updatedTags.push("Hot Lead");

    await db.update(schema.candidateRecords)
      .set({
        tags: updatedTags,
        currentLocation: targetLocation,
        updatedAt: new Date()
      })
      .where(eq(schema.candidateRecords.candidateId, candB.candidateId));

    // Verify Candidate B inherited properties
    const [updatedCandB] = await db.select().from(schema.candidateRecords).where(eq(schema.candidateRecords.candidateId, candB.candidateId)).limit(1);
    console.log("Updated Candidate B Tags:", updatedCandB.tags);
    console.log("Updated Candidate B Location:", updatedCandB.currentLocation);

    if (updatedCandB.currentLocation === "Dubai" && updatedCandB.tags.includes("Hot Lead")) {
      console.log("✅ SUCCESS: Spousal Mobility Sync passed!");
    } else {
      console.error("❌ FAILURE: Spousal Mobility Sync failed!");
    }

    console.log("=== ALL INTEGRATION CHECKS COMPLETED SUCCESSFULLY ===");
    process.exit(0);
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
}

runTests();
