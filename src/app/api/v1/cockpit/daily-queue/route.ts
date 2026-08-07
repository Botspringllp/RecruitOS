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

    const { agencyId, userId } = context;

    // Optional query params: filter recruiter or aggregate
    const { searchParams } = new URL(req.url);
    const viewMode = searchParams.get("viewMode") || "my_queue"; // 'my_queue' | 'agency_aggregate'
    const filterRecruiterId = searchParams.get("recruiterId");

    // Build base query
    let query = db
      .select({
        submissionId: candidateSubmissions.submissionId,
        jobId: candidateSubmissions.jobId,
        candidateId: candidateSubmissions.candidateId,
        stage: candidateSubmissions.stage,
        riskStatus: candidateSubmissions.riskStatus,
        riskReason: candidateSubmissions.riskReason,
        stageUpdatedAt: candidateSubmissions.stageUpdatedAt,
        lastCommunicationAt: candidateSubmissions.lastCommunicationAt,
        fullName: candidateRecords.fullName,
        email: candidateRecords.email,
        phone: candidateRecords.phone,
        currentTitle: candidateRecords.currentTitle,
        currentCompany: candidateRecords.currentCompany,
        totalExpMonths: candidateRecords.totalExpMonths,
        noticePeriodDays: candidateRecords.noticePeriodDays,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
        assignedRecruiterId: jobMandates.assignedRecruiterId,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(
        and(
          eq(candidateSubmissions.agencyId, agencyId),
          viewMode === "my_queue" && userId
            ? eq(jobMandates.assignedRecruiterId, userId)
            : filterRecruiterId
            ? eq(jobMandates.assignedRecruiterId, filterRecruiterId)
            : sql`true`
        )
      )
      .orderBy(asc(candidateSubmissions.stageUpdatedAt));

    const submissions = await query;

    const now = new Date();

    // Map SLA aging status & build Daily Focus Queue
    const processedSubmissions = submissions.map((sub) => {
      const stageDate = sub.stageUpdatedAt ? new Date(sub.stageUpdatedAt) : now;
      const hoursInStage = Math.max(0, Math.floor((now.getTime() - stageDate.getTime()) / (1000 * 3600)));
      
      let slaLevel: "green" | "warning" | "breach" = "green";
      let slaLabel = `${hoursInStage}h in stage`;

      if (hoursInStage >= 72) {
        slaLevel = "breach";
        slaLabel = `SLA BREACH: ${hoursInStage}h No Movement`;
      } else if (hoursInStage >= 36) {
        slaLevel = "warning";
        slaLabel = `Warning: ${hoursInStage}h Aging`;
      }

      return {
        ...sub,
        hoursInStage,
        slaLevel,
        slaLabel,
      };
    });

    // Daily Focus Queue Summary Calculation
    const slaBreaches = processedSubmissions.filter((s) => s.slaLevel === "breach");
    const highRiskLeads = processedSubmissions.filter((s) => s.riskStatus === "HIGH_RISK");
    const warningLeads = processedSubmissions.filter((s) => s.slaLevel === "warning");

    const dailyTasks = [
      ...slaBreaches.map((s) => ({
        id: `task-sla-${s.submissionId}`,
        type: "SLA_BREACH",
        title: `Follow up on ${s.fullName}`,
        description: `Candidate stuck in '${s.stage}' for ${s.hoursInStage} hours under mandate ${s.jobTitle}.`,
        priority: "CRITICAL",
        submissionId: s.submissionId,
      })),
      ...highRiskLeads.map((s) => ({
        id: `task-risk-${s.submissionId}`,
        type: "HIGH_RISK_ALERT",
        title: `High Risk Alert: ${s.fullName}`,
        description: s.riskReason || `Negative sentiment detected in communication logs.`,
        priority: "HIGH",
        submissionId: s.submissionId,
      })),
    ];

    return NextResponse.json({
      success: true,
      summary: {
        totalSubmissions: processedSubmissions.length,
        slaBreachCount: slaBreaches.length,
        warningCount: warningLeads.length,
        highRiskCount: highRiskLeads.length,
        dailyTasksCount: dailyTasks.length,
      },
      dailyTasks,
      submissions: processedSubmissions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch daily recruiter cockpit queue" },
      { status: 500 }
    );
  }
}
