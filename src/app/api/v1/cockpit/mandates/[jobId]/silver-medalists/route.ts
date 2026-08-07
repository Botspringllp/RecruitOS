import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateRecords, candidateSubmissions, jobMandates } from "@/db/schema";
import { eq, and, notInArray, sql, or } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { agencyId } = context;

    // 1. Fetch current job mandate to get skills & title requirements
    const mandateList = await db
      .select()
      .from(jobMandates)
      .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, agencyId)))
      .limit(1);

    if (mandateList.length === 0) {
      return NextResponse.json({ error: "Job mandate not found" }, { status: 404 });
    }

    const mandate = mandateList[0];
    const mandateTitle = mandate.title.toLowerCase();

    // 2. Fetch candidates already submitted to this job to exclude them
    const existingSubmissions = await db
      .select({ candidateId: candidateSubmissions.candidateId })
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.jobId, jobId));

    const excludedIds = existingSubmissions.map(s => s.candidateId);

    // 3. Query past candidates (silver medalists) who match title or have prior submissions
    const query = db
      .select({
        candidateId: candidateRecords.candidateId,
        fullName: candidateRecords.fullName,
        currentTitle: candidateRecords.currentTitle,
        currentCompany: candidateRecords.currentCompany,
        skills: candidateRecords.skills,
        noticePeriodDays: candidateRecords.noticePeriodDays,
        totalExpMonths: candidateRecords.totalExpMonths
      })
      .from(candidateRecords)
      .where(
        and(
          eq(candidateRecords.agencyId, agencyId),
          excludedIds.length > 0 ? notInArray(candidateRecords.candidateId, excludedIds) : sql`true`
        )
      )
      .limit(20);

    const candidates = await query;

    // 4. Calculate matching score & prioritize past silver medalists
    const silverMedalists = candidates.map(cand => {
      let score = 0;
      const titleMatch = cand.currentTitle && (
        cand.currentTitle.toLowerCase().includes(mandateTitle) || 
        mandateTitle.includes(cand.currentTitle.toLowerCase())
      );
      
      if (titleMatch) score += 50;

      // Match skills
      const candSkills = cand.skills || [];
      const matchingSkills: string[] = [];
      
      // Let's assume some common terms or if title is matched
      if (candSkills.length > 0) {
        candSkills.forEach(skill => {
          if (mandateTitle.includes(skill.toLowerCase())) {
            score += 15;
            matchingSkills.push(skill);
          }
        });
      }

      return {
        ...cand,
        matchScore: Math.min(score, 100),
        matchingSkills
      };
    })
    .filter(item => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5); // return top 5 recommended candidates

    return NextResponse.json({ success: true, silverMedalists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch silver medalists" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    // Insert a new submission mapping candidate to the job mandate in 'Screened' stage
    const [sub] = await db.insert(candidateSubmissions).values({
      agencyId: context.agencyId,
      jobId,
      candidateId,
      stage: "Screened",
      stageUpdatedAt: new Date(),
      lastCommunicationAt: new Date()
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Candidate successfully recycled into the active pipeline!",
      submission: sub
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to recycle candidate" }, { status: 500 });
  }
}
