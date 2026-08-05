import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { parseResumeText } from "@/backend/services/gemini-parser";
import { db, withTenantTx } from "@/db";
import { candidateRecords } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import path from "path";
import { pathToFileURL } from "url";
import * as pdfParse from "pdf-parse";

// Strict file limits for security
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "text/plain"];

export async function parseResume(req: NextRequest) {
  try {
    // 1. Authenticate and enforce RLS boundary
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    // 2. Parse Multipart Form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file uploaded" }, { status: 400 });
    }

    // Security: Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    // Security: Check file type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and TXT files are allowed." }, { status: 400 });
    }

    // 3. Extract Raw Text
    let rawText = "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        // @ts-ignore
        const PDFParseClass = pdfParse.PDFParse || pdfParse.default?.PDFParse || pdfParse;
        
        // Resolve worker path to a file:// URL to bypass Next.js Windows ESM bundling issues
        const workerPath = pathToFileURL(path.resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs")).href;
        PDFParseClass.setWorker(workerPath);

        const parserInstance = new PDFParseClass({ data: buffer });
        const parsedPdf = await parserInstance.getText();
        rawText = parsedPdf.text || "";
        await parserInstance.destroy();
      } catch (pdfErr) {
        console.error("Error reading PDF stream:", pdfErr);
        return NextResponse.json({ error: "Failed to read PDF file content" }, { status: 422 });
      }
    } else {
      // Text file
      rawText = buffer.toString("utf-8");
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Uploaded document is empty or unreadable" }, { status: 422 });
    }

    // 4. Run Gemini Parsing Engine
    const parsedCandidate = await parseResumeText(rawText);

    // 5. Duplicate Arbitration Check (Scoped to current Agency ID)
    let duplicateDetected = false;
    let duplicateCandidateName: string | null = null;

    if (parsedCandidate.email || parsedCandidate.phone) {
      const duplicates = await withTenantTx(context.agencyId, async (tx: any) => {
        const conditions = [];
        if (parsedCandidate.email) {
          conditions.push(eq(candidateRecords.email, parsedCandidate.email));
        }
        if (parsedCandidate.phone) {
          conditions.push(eq(candidateRecords.phone, parsedCandidate.phone));
        }

        if (conditions.length === 0) return [];

        return await tx
          .select({ fullName: candidateRecords.fullName })
          .from(candidateRecords)
          .where(or(...conditions))
          .limit(1);
      });

      if (duplicates.length > 0) {
        duplicateDetected = true;
        duplicateCandidateName = duplicates[0].fullName;
      }
    }

    // Return structured payload
    return NextResponse.json({
      success: true,
      data: parsedCandidate,
      duplicateDetected,
      duplicateCandidateName,
    });
  } catch (error: any) {
    console.error("Parser controller error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process and parse resume" },
      { status: 500 }
    );
  }
}
