import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerMandateShares } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

// SHA-256 Helper to secure tokens at rest
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const hashed = hashToken(token);

    // Query active partner shares matching the token
    const shareList = await db
      .select({
        shareId: partnerMandateShares.shareId,
        jobId: partnerMandateShares.jobId,
        maskedJobTitle: partnerMandateShares.maskedJobTitle,
        maskedCompanyDescription: partnerMandateShares.maskedCompanyDescription,
        partnerSplitPercentage: partnerMandateShares.partnerSplitPercentage,
        expiresAt: partnerMandateShares.expiresAt,
        isActive: partnerMandateShares.isActive,
      })
      .from(partnerMandateShares)
      .where(
        and(
          eq(partnerMandateShares.accessTokenHash, hashed),
          eq(partnerMandateShares.isActive, true)
        )
      )
      .limit(1);

    if (shareList.length === 0) {
      return NextResponse.json(
        { error: "Invalid or inactive magic link" },
        { status: 404 }
      );
    }

    const share = shareList[0];

    // Enforce expiry validation
    if (new Date() > new Date(share.expiresAt)) {
      return NextResponse.json(
        { error: "This magic sharing link has expired" },
        { status: 410 }
      );
    }

    // STRICT MASKING ENFORCEMENT:
    // Only return the masked job metadata. Do NOT join job_mandates to return client_name or agency info.
    return NextResponse.json({
      success: true,
      share: {
        shareId: share.shareId,
        jobId: share.jobId,
        maskedJobTitle: share.maskedJobTitle,
        maskedCompanyDescription: share.maskedCompanyDescription,
        partnerSplitPercentage: share.partnerSplitPercentage,
        expiresAt: share.expiresAt,
      }
    });

  } catch (error: any) {
    console.error("Public partner share retrieval failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve job sharing vault" },
      { status: 500 }
    );
  }
}
