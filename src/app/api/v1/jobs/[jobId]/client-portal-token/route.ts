import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientPortalTokens, jobMandates } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { randomBytes, createHash } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const { jobId } = await params;

    // Check if job mandate exists
    const job = await db
      .select()
      .from(jobMandates)
      .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, context.agencyId)))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json({ error: "Job mandate not found" }, { status: 404 });
    }

    // Check for existing valid active token
    const existingTokens = await db
      .select()
      .from(clientPortalTokens)
      .where(
        and(
          eq(clientPortalTokens.jobId, jobId),
          eq(clientPortalTokens.agencyId, context.agencyId),
          gt(clientPortalTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    let rawToken: string;
    let tokenHash: string;
    let expiresAt: Date;

    if (existingTokens.length > 0) {
      // Re-use token identifier (for demo URL format)
      rawToken = existingTokens[0].tokenHash.substring(0, 32);
      expiresAt = existingTokens[0].expiresAt;
    } else {
      // Generate new 14-day token
      rawToken = randomBytes(24).toString("hex");
      tokenHash = createHash("sha256").update(rawToken).digest("hex");
      expiresAt = new Date(Date.now() + 14 * 24 * 3600 * 1000); // 14 Days expiration

      await db.insert(clientPortalTokens).values({
        agencyId: context.agencyId,
        jobId,
        tokenHash: rawToken, // Store raw token for public lookup matching
        expiresAt,
      });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const reviewUrl = `${protocol}://${host}/portal/${rawToken}`;

    return NextResponse.json({
      success: true,
      token: rawToken,
      expiresAt: expiresAt.toISOString(),
      reviewUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate client portal token" },
      { status: 500 }
    );
  }
}
