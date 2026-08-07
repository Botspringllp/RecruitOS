import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobBoardPostings, candidateRecords, candidateSubmissions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ boardName: string }> }
) {
  try {
    const { boardName } = await params;
    if (!boardName) {
      return NextResponse.json({ error: "Job board name parameter is required" }, { status: 400 });
    }

    // 1. Parse webhook candidate payload
    const body = await req.json().catch(() => ({}));
    const {
      externalJobId,
      fullName,
      email,
      phone,
      skills,
      experienceMonths,
      noticePeriodDays,
      currentCompany,
      currentTitle
    } = body;

    if (!externalJobId || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required applicant fields: externalJobId, fullName, email" },
        { status: 400 }
      );
    }

    // 2. Resolve internal Job Mandate & Tenant Agency from externalJobId and boardName
    const postingList = await db
      .select()
      .from(jobBoardPostings)
      .where(
        and(
          eq(jobBoardPostings.externalJobId, externalJobId),
          eq(jobBoardPostings.boardName, boardName)
        )
      )
      .limit(1);

    if (postingList.length === 0) {
      return NextResponse.json(
        { error: `Posting mapping not found for external job ID: ${externalJobId} on ${boardName}` },
        { status: 404 }
      );
    }
    const posting = postingList[0];
    const { jobId } = posting;

    // Resolve agencyId by fetching job mandate (since webhooks are public and bypass RLS session context,
    // we query by joining job_mandates to find the associated agencyId).
    const jobDetail = await db.execute(
      sql`SELECT agency_id FROM job_mandates WHERE job_id = ${jobId}::uuid LIMIT 1`
    );
    if (jobDetail.rows.length === 0) {
      return NextResponse.json({ error: "Associated job mandate not found" }, { status: 404 });
    }
    const agencyId = jobDetail.rows[0].agency_id as string;

    // 3. Duplicate check arbitration service using raw check
    const existingCandidate = await db
      .select()
      .from(candidateRecords)
      .where(
        and(
          eq(candidateRecords.agencyId, agencyId),
          sql`(${candidateRecords.email} = ${email} OR ${candidateRecords.phone} = ${phone || ""})`
        )
      )
      .limit(1);

    let candidateId: string;

    if (existingCandidate.length > 0) {
      candidateId = existingCandidate[0].candidateId;
      console.log(`[RC-08 Webhook] Duplicate detected. Mapping applicant to existing candidate: ${fullName} (${candidateId})`);
    } else {
      // Create new candidate record
      candidateId = crypto.randomUUID();
      await db.insert(candidateRecords).values({
        candidateId,
        agencyId,
        fullName,
        email,
        phone: phone || null,
        skills: Array.isArray(skills) ? skills : [],
        totalExpMonths: experienceMonths || 0,
        noticePeriodDays: noticePeriodDays || 30,
        currentCompany: currentCompany || null,
        currentTitle: currentTitle || null,
      });
      console.log(`[RC-08 Webhook] Created new candidate record for: ${fullName} (${candidateId})`);
    }

    // 4. Create active submission linked to the job mandate in 'Screened' stage
    const submissionId = crypto.randomUUID();
    await db.insert(candidateSubmissions).values({
      submissionId,
      agencyId,
      jobId,
      candidateId,
      stage: "Screened",
      stageUpdatedAt: new Date(),
      lastCommunicationAt: new Date(),
    });

    // 5. Increment applications count in the job_board_postings table
    await db
      .update(jobBoardPostings)
      .set({
        applicationsCount: sql`${jobBoardPostings.applicationsCount} + 1`
      })
      .where(eq(jobBoardPostings.postingId, posting.postingId));

    console.log(`[RC-08 Webhook] Ingested candidate submission ${submissionId} for job ${jobId} via ${boardName}`);

    return NextResponse.json({
      success: true,
      message: "Candidate application successfully ingested and pipeline mapping updated",
      candidateId,
      submissionId
    });

  } catch (error: any) {
    console.error("Webhook ingestion failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process external webhook payload" },
      { status: 500 }
    );
  }
}
