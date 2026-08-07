import { NextRequest, NextResponse } from "next/server";
import { saveCandidate } from "@/backend/controllers/candidate-controller";
import { db } from "@/db";
import { candidateRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const list = await db
      .select()
      .from(candidateRecords)
      .where(eq(candidateRecords.agencyId, context.agencyId));

    return NextResponse.json({ success: true, candidates: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list candidates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return saveCandidate(req);
}
