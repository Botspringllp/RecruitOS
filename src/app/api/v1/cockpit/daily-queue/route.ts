import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, candidateRecords, jobMandates, communicationLog } from "@/db/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { agencyId, userRole, userId } = context;
    const { searchParams } = new URL(req.url);
    const recruiterFilter = searchParams.get("recruiterId");

    // 1. Fetch submissions for the agency sorted by stage_updated_at ASC (oldest in stage first)
    const submissions = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        stage: candidateSubmissions.stage,
        stageUpdatedAt: candidateSubmissions.stageUpdatedAt,
        lastCommunicationAt: candidateSubmissions.lastCommunicationAt,
        jobId: candidateSubmissions.jobId,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
        assignedRecruiterId: jobMandates.assignedRecruiterId,
        candidateId: candidateRecords.candidateId,
        fullName: candidateRecords.fullName,
        email: candidateRecords.email,
        phone: candidateRecords.phone,
        currentTitle: candidateRecords.currentTitle,
        currentCompany: candidateRecords.currentCompany,
        tags: candidateRecords.tags,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(eq(candidateSubmissions.agencyId, agencyId))
      .orderBy(asc(candidateSubmissions.stageUpdatedAt));

    const now = new Date();

    // 2. Filter & Process SLA Aging Radar (RC-03) and Negative Sentiment Detection (RC-01)
    let filtered = submissions;
    if (userRole === "recruiter" && !recruiterFilter) {
      // Standard recruiter sees their assigned jobs
      filtered = submissions.filter(s => s.assignedRecruiterId === userId || !s.assignedRecruiterId);
    } else if (recruiterFilter && recruiterFilter !== "ALL") {
      filtered = submissions.filter(s => s.assignedRecruiterId === recruiterFilter);
    }

    const processedSubmissions = filtered.map((sub) => {
      const updatedAt = new Date(sub.stageUpdatedAt);
      const hoursInStage = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 3600));

      let slaStatus: "GREEN" | "YELLOW" | "RED_BREACH" = "GREEN";
      let slaLabel = `${hoursInStage}h in Stage`;

      if (hoursInStage >= 72) {
        slaStatus = "RED_BREACH";
        slaLabel = `SLA BREACH: ${hoursInStage}h No Movement`;
      } else if (hoursInStage >= 36) {
        slaStatus = "YELLOW";
        slaLabel = `SLA WARNING: ${hoursInStage}h`;
      } else {
        slaStatus = "GREEN";
        slaLabel = `< 24h (${hoursInStage}h)`;
      }

      // Check if candidate has High Risk or Negative Sentiment Tags
      const tagsList = sub.tags || [];
      const hasNegativeSentimentRisk = tagsList.some(t => 
        t.toLowerCase().includes("risk") || 
        t.toLowerCase().includes("declining") || 
        t.toLowerCase().includes("counter offer") ||
        t.toLowerCase().includes("not interested")
      );

      return {
        ...sub,
        hoursInStage,
        slaStatus,
        slaLabel,
        hasNegativeSentimentRisk
      };
    });

    // 3. Aggregate Morning Focus Queue Summary Metrics
    const totalQueueItems = processedSubmissions.length;
    const criticalBreaches = processedSubmissions.filter(s => s.slaStatus === "RED_BREACH").length;
    const slaWarnings = processedSubmissions.filter(s => s.slaStatus === "YELLOW").length;
    const highRiskItems = processedSubmissions.filter(s => s.hasNegativeSentimentRisk).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalQueueItems,
        criticalBreaches,
        slaWarnings,
        highRiskItems,
      },
      dailyQueue: processedSubmissions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load daily queue" }, { status: 500 });
  }
}
