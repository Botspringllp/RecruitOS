import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communicationLog } from "@/db/schema";
import { eq, or, and, asc } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");
    const candidateId = searchParams.get("candidateId");

    if (!submissionId && !candidateId) {
      return NextResponse.json({ error: "Either submissionId or candidateId is required." }, { status: 400 });
    }

    const { agencyId } = context;

    // Fetch timeline entries sorted chronologically
    const conditions = [];
    if (submissionId) conditions.push(eq(communicationLog.submissionId, submissionId));
    if (candidateId) conditions.push(eq(communicationLog.candidateId, candidateId));

    const logs = await db
      .select()
      .from(communicationLog)
      .where(and(eq(communicationLog.agencyId, agencyId), or(...conditions)))
      .orderBy(asc(communicationLog.createdAt));

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load communication timeline" }, { status: 500 });
  }
}
