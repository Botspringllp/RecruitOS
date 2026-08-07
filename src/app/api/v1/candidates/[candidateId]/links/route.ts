import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateRecords, candidateRelationalLinks } from "@/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { getTenantContext } from "@/backend/auth/tenant-context";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const links = await db
      .select({
        linkId: candidateRelationalLinks.linkId,
        primaryCandidateId: candidateRelationalLinks.primaryCandidateId,
        relatedCandidateId: candidateRelationalLinks.relatedCandidateId,
        relationshipType: candidateRelationalLinks.relationshipType,
        inheritedTargetLocation: candidateRelationalLinks.inheritedTargetLocation,
        relatedName: candidateRecords.fullName,
        relatedEmail: candidateRecords.email,
        relatedPhone: candidateRecords.phone,
        relatedLocation: candidateRecords.currentLocation,
        relatedTags: candidateRecords.tags
      })
      .from(candidateRelationalLinks)
      .innerJoin(
        candidateRecords,
        eq(candidateRelationalLinks.relatedCandidateId, candidateRecords.candidateId)
      )
      .where(eq(candidateRelationalLinks.primaryCandidateId, candidateId));

    return NextResponse.json({ success: true, links });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const { relatedCandidateId, relationshipType, inheritedTargetLocation } = body;

    if (!relatedCandidateId || !relationshipType) {
      return NextResponse.json({ error: "Missing required fields: relatedCandidateId, relationshipType" }, { status: 400 });
    }

    // 1. Insert relationship link
    const [link] = await db.insert(candidateRelationalLinks).values({
      primaryCandidateId: candidateId,
      relatedCandidateId,
      relationshipType,
      inheritedTargetLocation: inheritedTargetLocation || null
    }).returning();

    // 2. Fetch primary candidate details to copy location/tags for spousal/relational sync
    const primaryCands = await db
      .select()
      .from(candidateRecords)
      .where(eq(candidateRecords.candidateId, candidateId))
      .limit(1);

    if (primaryCands.length > 0) {
      const primary = primaryCands[0];
      const targetLocation = inheritedTargetLocation || primary.currentLocation;

      // 3. Spousal/relational tag sync
      // "If Candidate A accepts a Dubai offer, linked Candidate B (Spouse) inherits tag Geographically Mobile: Dubai (Hot Lead)."
      if (targetLocation) {
        const relatedCands = await db
          .select()
          .from(candidateRecords)
          .where(eq(candidateRecords.candidateId, relatedCandidateId))
          .limit(1);

        if (relatedCands.length > 0) {
          const related = relatedCands[0];
          const newTag = `Geographically Mobile: ${targetLocation}`;
          const currentTags = related.tags || [];
          
          const updatedTags = [...currentTags];
          if (!updatedTags.includes(newTag)) {
            updatedTags.push(newTag);
          }
          if (!updatedTags.includes("Hot Lead")) {
            updatedTags.push("Hot Lead");
          }

          await db.update(candidateRecords)
            .set({
              tags: updatedTags,
              currentLocation: targetLocation, // inherit location
              updatedAt: new Date()
            })
            .where(eq(candidateRecords.candidateId, relatedCandidateId));
        }
      }
    }

    return NextResponse.json({ success: true, link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create relational link" }, { status: 500 });
  }
}
