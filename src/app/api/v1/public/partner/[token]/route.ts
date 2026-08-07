import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPartnerShares, jobMandates } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { createHash } from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    // 1. Hash the token with SHA-256 to lookup the share record
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // 2. Query the share record (including validity window checks)
    const shareList = await db
      .select({
        shareId: jobPartnerShares.shareId,
        jobId: jobPartnerShares.jobId,
        maskedJobTitle: jobPartnerShares.maskedJobTitle,
        maskedCompanyDescription: jobPartnerShares.maskedCompanyDescription,
        partnerSplitPercentage: jobPartnerShares.partnerSplitPercentage,
        agencySplitPercentage: jobPartnerShares.agencySplitPercentage,
        expiresAt: jobPartnerShares.expiresAt,
      })
      .from(jobPartnerShares)
      .where(
        and(
          eq(jobPartnerShares.accessTokenHash, tokenHash),
          gt(jobPartnerShares.expiresAt, new Date())
        )
      )
      .limit(1);

    if (shareList.length === 0) {
      return NextResponse.json(
        { error: "Magic link is invalid, expired, or deactivated" },
        { status: 410 } // Gone
      );
    }
    const share = shareList[0];

    // 3. Fetch associated job information (excluding any client or billing variables)
    const jobList = await db
      .select({
        title: jobMandates.title,
        status: jobMandates.status,
      })
      .from(jobMandates)
      .where(eq(jobMandates.jobId, share.jobId))
      .limit(1);

    if (jobList.length === 0) {
      return NextResponse.json({ error: "Associated job mandate was removed" }, { status: 404 });
    }
    const job = jobList[0];

    // 4. Return secure client-masked response payload ( DevTools safe)
    return NextResponse.json({
      success: true,
      shareId: share.shareId,
      maskedJobTitle: share.maskedJobTitle,
      maskedCompanyDescription: share.maskedCompanyDescription,
      partnerSplitPercentage: share.partnerSplitPercentage,
      agencySplitPercentage: share.agencySplitPercentage,
      expiresAt: share.expiresAt,
      job: {
        roleTitle: job.title,
        status: job.status,
      }
    });

  } catch (error: any) {
    console.error("Public partner share fetch failure:", error);
    return NextResponse.json(
      { error: "Failed to load public partner mandate details" },
      { status: 500 }
    );
  }
}
