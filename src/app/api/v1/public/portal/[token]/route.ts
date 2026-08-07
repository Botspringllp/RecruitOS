import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientPortalTokens, jobMandates, candidateSubmissions, candidateRecords, proposedInterviewSlots } from "@/db/schema";
import { eq, and, gt, inArray } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token and check expiration (CF-01: Token Scoping & 14-day expiry)
    const portalToken = await db
      .select()
      .from(clientPortalTokens)
      .where(
        and(
          eq(clientPortalTokens.tokenHash, token),
          gt(clientPortalTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (portalToken.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired client review link (14-day token policy)." },
        { status: 404 }
      );
    }

    const { jobId, agencyId } = portalToken[0];

    // Fetch Job Details
    const job = await db
      .select()
      .from(jobMandates)
      .where(eq(jobMandates.jobId, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json({ error: "Associated job mandate not found" }, { status: 404 });
    }

    // Fetch Candidate Submissions for this Job (Screened, Submitted, Interviewing, Rejected)
    const submissions = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        candidateId: candidateSubmissions.candidateId,
        stage: candidateSubmissions.stage,
        riskStatus: candidateSubmissions.riskStatus,
        stageUpdatedAt: candidateSubmissions.stageUpdatedAt,
        fullName: candidateRecords.fullName,
        currentTitle: candidateRecords.currentTitle,
        currentCompany: candidateRecords.currentCompany,
        totalExpMonths: candidateRecords.totalExpMonths,
        noticePeriodDays: candidateRecords.noticePeriodDays,
        skills: candidateRecords.skills,
        currentLocation: candidateRecords.currentLocation,
        // PII FIELDS OMITTED (phone, email) AS PER WORKFLOW 4 LOCKED RULES
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .where(
        and(
          eq(candidateSubmissions.jobId, jobId),
          eq(candidateSubmissions.agencyId, agencyId)
        )
      );

    // Fetch any proposed interview slots for these submissions
    const subIds = submissions.map((s) => s.submissionId);
    let slotsMap: Record<string, any[]> = {};

    if (subIds.length > 0) {
      const slots = await db
        .select()
        .from(proposedInterviewSlots)
        .where(inArray(proposedInterviewSlots.submissionId, subIds));

      slots.forEach((slot) => {
        if (!slotsMap[slot.submissionId]) {
          slotsMap[slot.submissionId] = [];
        }
        slotsMap[slot.submissionId].push(slot);
      });
    }

    // Sanitize candidates array (Strict PII Removal)
    const sanitizedCandidates = submissions.map((s) => ({
      submissionId: s.submissionId,
      candidateId: s.candidateId,
      fullName: s.fullName, // Display name for client
      currentTitle: s.currentTitle || "Senior Software Engineer",
      currentCompany: s.currentCompany || "Confidential SaaS Enterprise",
      experienceYears: s.totalExpMonths ? `${Math.round(s.totalExpMonths / 12)} Years` : "N/A",
      noticePeriod: s.noticePeriodDays ? `${s.noticePeriodDays} Days` : "Immediate",
      stage: s.stage,
      summaryText: s.skills && s.skills.length > 0
        ? `Primary Technical Competencies: ${s.skills.join(", ")}. Location: ${s.currentLocation || "Flexible"}.`
        : "Vetted candidate profile with strong domain expertise.",
      proposedSlots: slotsMap[s.submissionId] || [],
    }));

    return NextResponse.json({
      success: true,
      job: {
        jobId: job[0].jobId,
        title: job[0].title,
        clientName: job[0].clientName || "TechCorp",
        primaryHrName: job[0].primaryHrName,
      },
      candidates: sanitizedCandidates,
      expiresAt: portalToken[0].expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch portal shortlist" },
      { status: 500 }
    );
  }
}
