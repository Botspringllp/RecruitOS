import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partnerMandateShares, candidateRecords, candidateSubmissions } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import crypto from "crypto";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizePhone(phone: string): string {
  // Strip spaces, dashes, parentheses — strips country code formatting
  return phone.replace(/[\s\-\(\)]/g, "");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, email, phone } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const accessTokenHash = hashToken(token);

    // 1. Verify Partner Share Token (PO-02: Isolated Partner Vault Access)
    const activeShares = await db
      .select()
      .from(partnerMandateShares)
      .where(
        and(
          eq(partnerMandateShares.accessTokenHash, accessTokenHash),
          eq(partnerMandateShares.isActive, true)
        )
      )
      .limit(1);

    if (activeShares.length === 0) {
      return NextResponse.json({ error: "Invalid or expired sharing link." }, { status: 403 });
    }

    const share = activeShares[0];
    if (new Date() > new Date(share.expiresAt)) {
      return NextResponse.json({ error: "This partner mandate share link has expired." }, { status: 403 });
    }

    const { agencyId, jobId, shareId, partnerEmail } = share;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone ? normalizePhone(phone) : null;

    // 2. PO-03: Automated Candidate Ownership & Duplicate Arbitrator (200ms First-Touch Rule)
    //    Normalize email and phone, then check against existing records.
    const phoneCondition = normalizedPhone
      ? eq(candidateRecords.phone, normalizedPhone)
      : sql`false`;

    const existingCandidates = await db
      .select({
        candidateId: candidateRecords.candidateId,
        sourceType: candidateRecords.sourceType,
        createdAt: candidateRecords.createdAt,
        lastActivityAt: sql<string>`"candidate_records"."last_activity_at"`,
      })
      .from(candidateRecords)
      .where(
        and(
          eq(candidateRecords.agencyId, agencyId),
          or(
            eq(sql`LOWER(${candidateRecords.email})`, normalizedEmail),
            phoneCondition
          )
        )
      )
      .orderBy(candidateRecords.createdAt)
      .limit(1);

    let candidateId: string;
    const now = new Date();

    if (existingCandidates.length > 0) {
      const existing = existingCandidates[0];

      // Use lastActivityAt if available, else fallback to createdAt
      const referenceDate = existing.lastActivityAt ?? existing.createdAt;
      const daysSinceLastActivity = referenceDate
        ? (now.getTime() - new Date(referenceDate).getTime()) / (1000 * 3600 * 24)
        : 0;

      if (daysSinceLastActivity < 180) {
        // Rule 1: Candidate is active In-House (< 180 days)
        if (existing.sourceType === "Direct_Upload" || existing.sourceType === "Job_Board") {
          return NextResponse.json(
            { error: "Candidate active in client pipeline. (Rule 1)" },
            { status: 409 }
          );
        }

        // Rule 2: Another partner already submitted this candidate (First-touch wins)
        if (existing.sourceType === "Partner_Vault") {
          return NextResponse.json(
            { error: "Candidate already submitted by a partner. First-touch arbitrator block. (Rule 2)" },
            { status: 409 }
          );
        }
      }

      // Rule 3: Stale lead (> 180 days) — Partner gets the ownership credit
      candidateId = existing.candidateId;
      await db
        .update(candidateRecords)
        .set({
          sourceType: "Partner_Vault",
          sourcePartnerEmail: partnerEmail,
          lastActivityAt: now,
          updatedAt: now,
        })
        .where(eq(candidateRecords.candidateId, candidateId));

    } else {
      // Completely new candidate — insert and assign to this partner
      const [newCandidate] = await db
        .insert(candidateRecords)
        .values({
          agencyId,
          fullName,
          email: normalizedEmail,
          phone: normalizedPhone,
          sourceType: "Partner_Vault",
          sourcePartnerEmail: partnerEmail,
          lastActivityAt: now,
        })
        .returning();
      candidateId = newCandidate.candidateId;
    }

    // 3. Create the Candidate Submission linked to this Partner Share (PO-02)
    await db.insert(candidateSubmissions).values({
      agencyId,
      jobId,
      candidateId,
      sourceShareId: shareId,
      stage: "Screened",
      stageUpdatedAt: now,
      lastCommunicationAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Candidate submitted successfully. Ownership tracked under your partner link.",
      candidateId,
    });

  } catch (error: any) {
    const msg = error?.message ?? String(error);
    console.error("Partner Submission Error:", msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
