import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencyStorefrontProfiles, candidateRecords, storefrontCandidateApplications } from "@/db/schema";
import { eq, or, and, sql } from "drizzle-orm";
import { parseResumeText } from "@/backend/services/gemini-parser";
import * as pdfParse from "pdf-parse";
import path from "path";
import { pathToFileURL } from "url";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB as per wireframe prompt

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

export async function POST(
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

    // 2. Parse Multipart Form
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string | null;
    const email = formData.get("email") as string | null;
    const phone = formData.get("phone") as string | null;
    const noticePeriodDays = formData.get("noticePeriodDays") ? parseInt(formData.get("noticePeriodDays") as string, 10) : null;
    const desiredTitle = formData.get("desiredTitle") as string | null;
    const expectedCtc = formData.get("expectedCtc") ? parseFloat(formData.get("expectedCtc") as string) : null;
    const file = formData.get("file") as File | null;

    if (!fullName || !email) {
      return NextResponse.json({ error: "Full Name and Email are required" }, { status: 400 });
    }

    // 3. Security Checks on Uploaded CV file
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
      }
      const allowedTypes = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx") && !file.name.endsWith(".txt")) {
        return NextResponse.json({ error: "Invalid file type. Only PDF, DOCX and TXT are allowed." }, { status: 400 });
      }
    }

    // 4. Extract Text & Parse CV (RC-02 Logic integration)
    let parsedData: any = {};
    let parsedSuccessfully = false;

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let rawText = "";

        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // Use pdf-parse with worker
          // @ts-ignore
          const PDFParseClass = pdfParse.PDFParse || pdfParse.default?.PDFParse || pdfParse;
          const workerPath = pathToFileURL(path.resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs")).href;
          PDFParseClass.setWorker(workerPath);

          const parserInstance = new PDFParseClass({ data: buffer });
          const parsedPdf = await parserInstance.getText();
          rawText = parsedPdf.text || "";
          await parserInstance.destroy();
        } else {
          rawText = buffer.toString("utf-8");
        }

        if (rawText.trim()) {
          parsedData = await parseResumeText(rawText);
          parsedSuccessfully = true;
        }
      } catch (parseErr) {
        console.error("CV Parsing error:", parseErr);
        // Fallback to manual form inputs if parsing fails
      }
    }

    // 5. Normalize Inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone ? normalizePhone(phone) : null;

    // 6. Duplicate Arbitration check
    const phoneCondition = normalizedPhone
      ? eq(candidateRecords.phone, normalizedPhone)
      : sql`false`;

    const existingCandidates = await db
      .select()
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
      .limit(1);

    let candidateId: string;
    const now = new Date();

    // Generate simulated Supabase Storage Public URL
    const fileName = file ? `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}` : null;
    const resumeUrl = fileName
      ? `https://svrsgenuykbpkiqksehg.supabase.co/storage/v1/object/public/candidates/raw_cvs/${agencyId}/${fileName}`
      : null;

    if (existingCandidates.length > 0) {
      // Update existing candidate activity
      const existing = existingCandidates[0];
      candidateId = existing.candidateId;

      await db.update(candidateRecords)
        .set({
          fullName: fullName || existing.fullName,
          phone: normalizedPhone || existing.phone,
          currentTitle: desiredTitle || parsedData.currentTitle || existing.currentTitle,
          noticePeriodDays: noticePeriodDays !== null ? noticePeriodDays : (parsedData.noticePeriodDays || existing.noticePeriodDays),
          expectedCtc: expectedCtc !== null ? expectedCtc.toString() : (parsedData.expectedCtc ? parsedData.expectedCtc.toString() : existing.expectedCtc),
          resumeUrl: resumeUrl || existing.resumeUrl,
          skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : existing.skills,
          lastActivityAt: now,
          updatedAt: now
        })
        .where(eq(candidateRecords.candidateId, candidateId));
    } else {
      // Create new candidate record
      const [newCand] = await db.insert(candidateRecords).values({
        agencyId,
        fullName,
        email: normalizedEmail,
        phone: normalizedPhone,
        currentTitle: desiredTitle || parsedData.currentTitle || null,
        currentCompany: parsedData.currentCompany || null,
        skills: parsedData.skills || [],
        totalExpMonths: parsedData.totalExpMonths || null,
        noticePeriodDays: noticePeriodDays !== null ? noticePeriodDays : (parsedData.noticePeriodDays || null),
        currentCtc: parsedData.currentCtc ? parsedData.currentCtc.toString() : null,
        expectedCtc: expectedCtc !== null ? expectedCtc.toString() : (parsedData.expectedCtc ? parsedData.expectedCtc.toString() : null),
        resumeUrl,
        sourceType: "Storefront_Inbound",
        lastActivityAt: now
      }).returning();

      candidateId = newCand.candidateId;
    }

    // 7. Log to storefront candidate applications
    await db.insert(storefrontCandidateApplications).values({
      agencyId,
      candidateId,
      sourceChannel: "Storefront_Direct",
      parsedSuccessfully
    });

    return NextResponse.json({
      success: true,
      message: "Application received! We have added you to our active talent database.",
      candidateId,
      parsedData: parsedSuccessfully ? parsedData : null
    }, { status: 201 });

  } catch (error: any) {
    console.error("Storefront candidate application error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during submission." },
      { status: 500 }
    );
  }
}
