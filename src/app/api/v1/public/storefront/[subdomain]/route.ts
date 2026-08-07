import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencyStorefrontProfiles, agencies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: any }
) {
  try {
    // Safely await params to support Next.js 15+ / 16+ App Router constraints
    const params = await context.params;
    const subdomain = params?.subdomain;

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }

    // 1. Query the storefront profile
    const profileResult = await db
      .select({
        storefrontId: agencyStorefrontProfiles.storefrontId,
        agencyId: agencyStorefrontProfiles.agencyId,
        subdomain: agencyStorefrontProfiles.subdomain,
        brandLogoUrl: agencyStorefrontProfiles.brandLogoUrl,
        primaryColor: agencyStorefrontProfiles.primaryColor,
        accentColor: agencyStorefrontProfiles.accentColor,
        heroHeadline: agencyStorefrontProfiles.heroHeadline,
        aboutText: agencyStorefrontProfiles.aboutText,
        featuredSpecializations: agencyStorefrontProfiles.featuredSpecializations,
        showMetricsBar: agencyStorefrontProfiles.showMetricsBar,
        isPublished: agencyStorefrontProfiles.isPublished,
      })
      .from(agencyStorefrontProfiles)
      .where(eq(agencyStorefrontProfiles.subdomain, subdomain))
      .limit(1);

    if (profileResult.length === 0 || !profileResult[0].isPublished) {
      return NextResponse.json({ error: "Storefront not found or unpublished" }, { status: 404 });
    }

    const profile = profileResult[0];

    // 2. Fetch the agency name
    const agencyResult = await db
      .select({ agencyName: agencies.agencyName })
      .from(agencies)
      .where(eq(agencies.agencyId, profile.agencyId))
      .limit(1);

    const agencyName = agencyResult[0]?.agencyName || "RecruitOS Partner";

    // 3. Return sanitized public payload (strictly removing internal PII/secrets)
    return NextResponse.json({
      success: true,
      data: {
        storefrontId: profile.storefrontId,
        agencyId: profile.agencyId,
        subdomain: profile.subdomain,
        brandLogoUrl: profile.brandLogoUrl,
        primaryColor: profile.primaryColor,
        accentColor: profile.accentColor,
        heroHeadline: profile.heroHeadline,
        aboutText: profile.aboutText,
        featuredSpecializations: profile.featuredSpecializations || [],
        showMetricsBar: profile.showMetricsBar,
        agencyName,
        stats: {
          placements: 142,
          slaHours: 72,
          retentionRate: 98,
        }
      }
    });
  } catch (error: any) {
    console.error("Public storefront API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
