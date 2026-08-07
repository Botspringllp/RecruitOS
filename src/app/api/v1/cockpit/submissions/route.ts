import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { withTenantTx } from "@/db";
import { candidateSubmissions, candidateRecords, jobMandates, jobBoardPostings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce tenant isolation via context middleware
    const tenant = await getTenantContext();
    if (!tenant.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }
    const { agencyId } = tenant;

    // 2. Query within isolated Postgres session context transaction
    const data = await withTenantTx(agencyId, async (tx) => {
      // Fetch all active job mandates under the tenant
      const jobs = await tx
        .select()
        .from(jobMandates)
        .where(eq(jobMandates.agencyId, agencyId));

      // Fetch candidate submissions with full candidate profiles
      const submissions = await tx
        .select({
          submissionId: candidateSubmissions.submissionId,
          jobId: candidateSubmissions.jobId,
          candidateId: candidateSubmissions.candidateId,
          stage: candidateSubmissions.stage,
          stageUpdatedAt: candidateSubmissions.stageUpdatedAt,
          lastCommunicationAt: candidateSubmissions.lastCommunicationAt,
          fullName: candidateRecords.fullName,
          currentTitle: candidateRecords.currentTitle,
          currentCompany: candidateRecords.currentCompany,
          email: candidateRecords.email,
          phone: candidateRecords.phone,
          skills: candidateRecords.skills,
          totalExpMonths: candidateRecords.totalExpMonths,
          noticePeriodDays: candidateRecords.noticePeriodDays,
        })
        .from(candidateSubmissions)
        .innerJoin(
          candidateRecords, 
          eq(candidateSubmissions.candidateId, candidateRecords.candidateId)
        )
        .where(eq(candidateSubmissions.agencyId, agencyId));

      // Fetch all external job board postings for the agency
      const postings = await tx
        .select({
          postingId: jobBoardPostings.postingId,
          jobId: jobBoardPostings.jobId,
          boardName: jobBoardPostings.boardName,
          externalJobId: jobBoardPostings.externalJobId,
          postingStatus: jobBoardPostings.postingStatus,
          applicationsCount: jobBoardPostings.applicationsCount,
          publishedAt: jobBoardPostings.publishedAt,
        })
        .from(jobBoardPostings)
        .innerJoin(jobMandates, eq(jobBoardPostings.jobId, jobMandates.jobId))
        .where(eq(jobMandates.agencyId, agencyId));

      return { jobs, submissions, postings };
    });

    return NextResponse.json({
      success: true,
      jobs: data.jobs,
      submissions: data.submissions,
      postings: data.postings,
    });

  } catch (error: any) {
    console.error("Cockpit submissions API fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve cockpit submissions" },
      { status: 500 }
    );
  }
}
