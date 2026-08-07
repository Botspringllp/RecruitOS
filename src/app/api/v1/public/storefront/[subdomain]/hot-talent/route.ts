import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencyStorefrontProfiles, candidateRecords } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }

    // 1. Resolve agencyId from storefront subdomain
    const storefrontProfiles = await db
      .select({ agencyId: agencyStorefrontProfiles.agencyId })
      .from(agencyStorefrontProfiles)
      .where(eq(agencyStorefrontProfiles.subdomain, subdomain))
      .limit(1);

    if (storefrontProfiles.length === 0) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    const { agencyId } = storefrontProfiles[0];

    // 2. Fetch candidates with skills and title for showcase
    const candidates = await db
      .select({
        candidateId: candidateRecords.candidateId,
        currentTitle: candidateRecords.currentTitle,
        totalExpMonths: candidateRecords.totalExpMonths,
        noticePeriodDays: candidateRecords.noticePeriodDays,
        skills: candidateRecords.skills,
        expectedCtc: candidateRecords.expectedCtc,
        tags: candidateRecords.tags
      })
      .from(candidateRecords)
      .where(
        and(
          eq(candidateRecords.agencyId, agencyId),
          isNotNull(candidateRecords.currentTitle)
        )
      )
      .limit(10); // show top 10 profiles in gallery

    // 3. Mask name/identity for absolute anonymity
    const anonymousGallery = candidates.map((cand, idx) => {
      const expYears = cand.totalExpMonths ? Math.round(cand.totalExpMonths / 12) : null;
      const experienceStr = expYears ? `${expYears} Yr${expYears > 1 ? 's' : ''}` : 'Experienced';
      
      return {
        id: cand.candidateId,
        maskedName: `Candidate Profile Ref: #${cand.candidateId.substring(0, 6).toUpperCase()}`,
        title: cand.currentTitle || "Executive Talent",
        experience: experienceStr,
        notice: cand.noticePeriodDays === 0 ? "Immediate" : `${cand.noticePeriodDays} Days Notice`,
        skills: cand.skills || [],
        expectedCtc: cand.expectedCtc ? parseFloat(cand.expectedCtc.toString()) : null,
        tags: cand.tags || []
      };
    });

    return NextResponse.json({ success: true, gallery: anonymousGallery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch showcase gallery" }, { status: 500 });
  }
}
