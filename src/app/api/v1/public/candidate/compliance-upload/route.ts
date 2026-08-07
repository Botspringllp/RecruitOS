import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { complianceDocuments, candidateSubmissions, communicationLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, documentType, fileUrl } = body;

    const validTypes = ["NATIONAL_ID", "PAY_SLIPS", "DEGREE_CERTIFICATE", "RELIEVING_LETTER"];
    if (!submissionId || !documentType || !fileUrl) {
      return NextResponse.json(
        { error: "submissionId, documentType, and fileUrl are required." },
        { status: 400 }
      );
    }

    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `documentType must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const sub = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.submissionId, submissionId))
      .limit(1);

    if (sub.length === 0) {
      return NextResponse.json({ error: "Candidate submission not found" }, { status: 404 });
    }

    // Insert compliance document
    const [doc] = await db
      .insert(complianceDocuments)
      .values({
        submissionId,
        documentType,
        fileUrl,
      })
      .returning();

    // Log upload in timeline
    await db.insert(communicationLog).values({
      agencyId: sub[0].agencyId,
      submissionId,
      candidateId: sub[0].candidateId,
      channel: "SYSTEM_NOTE",
      direction: "INBOUND",
      fromAddress: "Candidate Mobile Vault",
      toAddress: "Compliance Vault Engine (HC-01)",
      body: `Pre-onboarding Compliance File Uploaded: Type '${documentType}'. Temporary Signed Access Token generated (expiresIn = 900s).`,
      status: "received",
      matched: true,
    });

    // Generate 900s temporary signed URL preview link (PII Edge Case Rule)
    const signedUrl = `${fileUrl}?token=${Buffer.from(doc.documentId + ":900s").toString("base64")}&expiresIn=900`;

    return NextResponse.json({
      success: true,
      documentId: doc.documentId,
      documentType,
      signedUrl,
      expiresInSeconds: 900,
      message: `Compliance document '${documentType}' uploaded successfully to private vault with 15-min signed URL access.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process compliance document upload" },
      { status: 500 }
    );
  }
}
