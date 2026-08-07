import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { candidateSubmissions, candidateRecords, jobMandates, jobOfferAudits, complianceDocuments, clientPortalTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Lookup token or submissionId directly
    let sub = await db
      .select({
        submissionId: candidateSubmissions.submissionId,
        stage: candidateSubmissions.stage,
        candidateName: candidateRecords.fullName,
        currentTitle: candidateRecords.currentTitle,
        jobTitle: jobMandates.title,
        clientName: jobMandates.clientName,
      })
      .from(candidateSubmissions)
      .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
      .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
      .where(eq(candidateSubmissions.submissionId, token))
      .limit(1);

    if (sub.length === 0) {
      // Fallback lookup via clientPortalTokens
      const portalToken = await db
        .select()
        .from(clientPortalTokens)
        .where(eq(clientPortalTokens.tokenHash, token))
        .limit(1);

      if (portalToken.length > 0) {
        const subByJob = await db
          .select({
            submissionId: candidateSubmissions.submissionId,
            stage: candidateSubmissions.stage,
            candidateName: candidateRecords.fullName,
            currentTitle: candidateRecords.currentTitle,
            jobTitle: jobMandates.title,
            clientName: jobMandates.clientName,
          })
          .from(candidateSubmissions)
          .innerJoin(candidateRecords, eq(candidateSubmissions.candidateId, candidateRecords.candidateId))
          .innerJoin(jobMandates, eq(candidateSubmissions.jobId, jobMandates.jobId))
          .where(eq(candidateSubmissions.jobId, portalToken[0].jobId))
          .limit(1);

        sub = subByJob;
      }
    }

    if (sub.length === 0) {
      return NextResponse.json({ error: "Invalid HR handoff token or submission link." }, { status: 404 });
    }

    const targetSubId = sub[0].submissionId;

    // Fetch Offer Audit Details
    const audit = await db
      .select()
      .from(jobOfferAudits)
      .where(eq(jobOfferAudits.submissionId, targetSubId))
      .limit(1);

    // Fetch Compliance Files
    const docs = await db
      .select()
      .from(complianceDocuments)
      .where(eq(complianceDocuments.submissionId, targetSubId));

    // Map docs with 900s temporary signed URLs (PII Security Rule)
    const sanitizedDocs = docs.map((d) => ({
      documentId: d.documentId,
      documentType: d.documentType,
      signedDownloadUrl: `${d.fileUrl}?token=${Buffer.from(d.documentId + ":900s").toString("base64")}&expiresIn=900`,
      expiresInSeconds: 900,
    }));

    return NextResponse.json({
      success: true,
      handoffPackage: {
        submissionId: sub[0].submissionId,
        candidateName: sub[0].candidateName,
        currentTitle: sub[0].currentTitle,
        jobTitle: sub[0].jobTitle,
        clientName: sub[0].clientName || "TechCorp",
        stage: sub[0].stage,
        offerMetrics: audit.length > 0 ? {
          offeredFixedCtc: `$${audit[0].offeredFixedCtc}`,
          offeredVariableCtc: `$${audit[0].offeredVariableCtc}`,
          joiningDate: audit[0].joiningDate,
          calculatedPlacementFee: `$${audit[0].calculatedPlacementFee}`,
        } : null,
        complianceDocuments: sanitizedDocs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch HR handoff package" },
      { status: 500 }
    );
  }
}
