import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { db, withTenantTx } from "@/db";
import { candidateRecords } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { z } from "zod";

const candidateSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email format").nullable().optional(),
  phone: z.string().nullable().optional(),
  currentCompany: z.string().nullable().optional(),
  currentTitle: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  totalExpMonths: z.number().nullable().optional(),
  noticePeriodDays: z.number().nullable().optional(),
  currentCtc: z.union([z.number(), z.string()]).nullable().optional(),
  expectedCtc: z.union([z.number(), z.string()]).nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
});

export async function saveCandidate(req: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }

    const body = await req.json();
    const result = candidateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const candidateData = result.data;
    
    // Normalize numeric values
    const currentCtc = candidateData.currentCtc ? candidateData.currentCtc.toString() : null;
    const expectedCtc = candidateData.expectedCtc ? candidateData.expectedCtc.toString() : null;

    const savedCandidate = await withTenantTx(context.agencyId, async (tx) => {
      // Check for duplicate to determine if we update or insert
      let existingId: string | null = null;
      const conditions = [];
      if (candidateData.email) {
        conditions.push(eq(candidateRecords.email, candidateData.email));
      }
      if (candidateData.phone) {
        conditions.push(eq(candidateRecords.phone, candidateData.phone));
      }

      if (conditions.length > 0) {
        const duplicates = await tx
          .select({ id: candidateRecords.candidateId })
          .from(candidateRecords)
          .where(or(...conditions))
          .limit(1);

        if (duplicates.length > 0) {
          existingId = duplicates[0].id;
        }
      }

      const valuesToSave = {
        agencyId: context.agencyId,
        fullName: candidateData.fullName,
        email: candidateData.email || null,
        phone: candidateData.phone || null,
        currentCompany: candidateData.currentCompany || null,
        currentTitle: candidateData.currentTitle || null,
        skills: candidateData.skills || [],
        totalExpMonths: candidateData.totalExpMonths || null,
        noticePeriodDays: candidateData.noticePeriodDays || null,
        currentCtc,
        expectedCtc,
        resumeUrl: candidateData.resumeUrl || null,
        updatedAt: new Date(),
      };

      if (existingId) {
        // Upsert: Update existing record
        await tx
          .update(candidateRecords)
          .set(valuesToSave)
          .where(eq(candidateRecords.candidateId, existingId));

        return { id: existingId, isDuplicate: true };
      } else {
        // Insert new record
        const newId = crypto.randomUUID();
        await tx.insert(candidateRecords).values({
          candidateId: newId,
          ...valuesToSave,
          createdAt: new Date(),
        });

        return { id: newId, isDuplicate: false };
      }
    });

    return NextResponse.json({
      success: true,
      candidateId: savedCandidate.id,
      updatedExisting: savedCandidate.isDuplicate,
    });
  } catch (error: any) {
    console.error("Save candidate controller error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save candidate" },
      { status: 500 }
    );
  }
}
