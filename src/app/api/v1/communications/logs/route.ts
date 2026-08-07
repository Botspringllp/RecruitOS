import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communicationLog } from "@/db/schema";
import { eq, and, or, asc } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get("candidateId");
    const submissionId = searchParams.get("submissionId");

    if (!candidateId && !submissionId) {
      return NextResponse.json({ error: "Candidate ID or Submission ID required" }, { status: 400 });
    }

    const logs = await db
      .select()
      .from(communicationLog)
      .where(
        and(
          eq(communicationLog.agencyId, context.agencyId),
          submissionId
            ? eq(communicationLog.submissionId, submissionId)
            : eq(communicationLog.candidateId, candidateId!)
        )
      )
      .orderBy(asc(communicationLog.createdAt));

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch communication logs" },
      { status: 500 }
    );
  }
}
