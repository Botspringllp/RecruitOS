import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSchedules, candidateSubmissions, candidateRecords, jobMandates, proposedInterviewSlots } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Lookup interview schedule by prepToken or interviewId
    const interview = await db
      .select({
        interviewId: interviewSchedules.interviewId,
        submissionId: interviewSchedules.submissionId,
        outcomeStatus: interviewSchedules.outcomeStatus,
        candidatePrepAcknowledged: interviewSchedules.candidatePrepAcknowledged,
        meetingLink: interviewSchedules.meetingLink,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
        targetLocation: jobMandates.targetLocation,
        candidateName: candidateRecords.fullName,
      })
      .from(interviewSchedules)
      .innerJoin(candidateSubmissions, eq(interviewSchedules.submissionId, candidateSubmissions.submissionId))
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(eq(interviewSchedules.prepToken, token))
      .limit(1);

    if (interview.length === 0) {
      // Fallback lookup by interviewId for demo URL convenience
      const interviewById = await db
        .select({
          interviewId: interviewSchedules.interviewId,
          submissionId: interviewSchedules.submissionId,
          outcomeStatus: interviewSchedules.outcomeStatus,
          candidatePrepAcknowledged: interviewSchedules.candidatePrepAcknowledged,
          meetingLink: interviewSchedules.meetingLink,
          jobTitle: jobMandates.title,
          clientName: jobMandates.clientName,
          targetLocation: jobMandates.targetLocation,
          candidateName: candidateRecords.fullName,
        })
        .from(interviewSchedules)
        .innerJoin(candidateSubmissions, eq(interviewSchedules.submissionId, candidateSubmissions.submissionId))
        .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
        .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
        .where(eq(interviewSchedules.interviewId, token))
        .limit(1);

      if (interviewById.length === 0) {
        return NextResponse.json({ error: "Invalid interview preparation token or link." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        prepKit: {
          ...interviewById[0],
          companyIntelligence: `TechCorp is a leading enterprise SaaS provider expanding its core backend engineering team.`,
          techStackNotes: `Next.js, Node.js microservices, PostgreSQL, Docker, AWS ECS.`,
          interviewers: `Hiring Manager (VP of Engineering) & Tech Lead.`,
          orangeTestFramework: `The Orange Test: Focus on system architecture scalability, edge-case error handling, and proactive communication.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      prepKit: {
        ...interview[0],
        companyIntelligence: `TechCorp is a leading enterprise SaaS provider expanding its core backend engineering team.`,
        techStackNotes: `Next.js, Node.js microservices, PostgreSQL, Docker, AWS ECS.`,
        interviewers: `Hiring Manager (VP of Engineering) & Tech Lead.`,
        orangeTestFramework: `The Orange Test: Focus on system architecture scalability, edge-case error handling, and proactive communication.`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch candidate prep kit" },
      { status: 500 }
    );
  }
}
