import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobMandates, clientRecords, communicationLog, users } from "@/db/schema";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const tenantCtx = await getTenantContext();
    const { jobId } = await params;

    // 1. Role Enforcement (LOCKED RULE: Owner / Team Lead / Admin permission required)
    const userRoleHeader = req.headers.get("x-user-role");
    let userRole = userRoleHeader || "recruiter";

    // Lookup user role if not passed in dev header
    const userRes = await db
      .select({ role: users.role })
      .from(users)
      .where(and(eq(users.userId, tenantCtx.userId), eq(users.agencyId, tenantCtx.agencyId)))
      .limit(1);

    if (userRes.length > 0) {
      userRole = userRes[0].role;
    }

    const allowedRoles = ["owner", "admin", "team_lead"];
    if (!allowedRoles.includes(userRole.toLowerCase())) {
      return NextResponse.json(
        { error: "Forbidden: Restricted strictly to Agency Owners and Team Leads (AS-02 Locked Rule)." },
        { status: 403 }
      );
    }

    // 2. Fetch the target inbound mandate
    const body = await req.json().catch(() => ({}));
    const existingJobs = await db
      .select()
      .from(jobMandates)
      .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, tenantCtx.agencyId)))
      .limit(1);

    if (existingJobs.length === 0) {
      return NextResponse.json({ error: "Job mandate not found" }, { status: 404 });
    }

    const job = existingJobs[0];

    const companyName = body.companyName || job.clientName || "Apex Clients";
    const primaryHrName = body.primaryHrName || job.primaryHrName || "Hiring Lead";
    const primaryHrEmail = body.primaryHrEmail || job.primaryHrEmail || "hr@client.com";
    const primaryHrPhone = body.primaryHrPhone || job.primaryHrPhone || "+919876543210";
    const agreedFeePercentage = body.agreedFeePercentage || "8.33";

    // 3. Client Duplication Guard (AS-02)
    // Perform exact case-insensitive check on company_name AND primary_hr_email
    const existingClients = await db
      .select()
      .from(clientRecords)
      .where(
        and(
          eq(clientRecords.agencyId, tenantCtx.agencyId),
          eq(sql`LOWER(${clientRecords.companyName})`, companyName.toLowerCase()),
          eq(sql`LOWER(${clientRecords.primaryHrEmail})`, primaryHrEmail.toLowerCase())
        )
      )
      .limit(1);

    let resolvedClientId: string;
    let isNewClient = false;

    if (existingClients.length > 0) {
      resolvedClientId = existingClients[0].clientId;
    } else {
      const [newClient] = await db
        .insert(clientRecords)
        .values({
          agencyId: tenantCtx.agencyId,
          companyName,
          primaryHrName,
          primaryHrEmail,
          primaryHrPhone,
          agreedFeePercentage,
          billingAddress: body.billingAddress || null,
        })
        .returning();
      resolvedClientId = newClient.clientId;
      isNewClient = true;
    }

    // 4. Mandate Status Conversion & Assignment (RC-03: 48h SLA)
    let assignedRecruiterId = body.assignedRecruiterId || job.assignedRecruiterId || tenantCtx.userId;
    
    const validUser = await db
      .select({ userId: users.userId })
      .from(users)
      .where(and(eq(users.userId, assignedRecruiterId), eq(users.agencyId, tenantCtx.agencyId)))
      .limit(1);

    if (validUser.length === 0) {
      const firstUser = await db
        .select({ userId: users.userId })
        .from(users)
        .where(eq(users.agencyId, tenantCtx.agencyId))
        .limit(1);
      assignedRecruiterId = firstUser.length > 0 ? firstUser[0].userId : null;
    }

    const slaDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 Hours SLA window

    await db
      .update(jobMandates)
      .set({
        status: "Active",
        clientId: resolvedClientId,
        clientName: companyName,
        primaryHrName,
        primaryHrEmail,
        primaryHrPhone,
        assignedRecruiterId,
        slaDeadline,
        stageUpdatedAt: new Date(),
      })
      .where(eq(jobMandates.jobId, jobId));

    // 5. Automated Multi-channel Onboarding Confirmation Dispatch (Email & WhatsApp)
    const emailBody = `Welcome to RecruitOS! Your hiring mandate for "${job.title}" has been approved by our Agency Owner. Your dedicated recruiter has been assigned with a 48-hour shortlist SLA target.`;
    const whatsappBody = `Hi ${primaryHrName}, your hiring requirement for "${job.title}" at ${companyName} is now ACTIVE on RecruitOS. Shortlist presentation target: 48 hours.`;

    await db.insert(communicationLog).values([
      {
        agencyId: tenantCtx.agencyId,
        channel: "email",
        direction: "outbound",
        toAddress: primaryHrEmail,
        body: emailBody,
        status: "sent",
        matched: true,
      },
      {
        agencyId: tenantCtx.agencyId,
        channel: "whatsapp",
        direction: "outbound",
        toAddress: primaryHrPhone,
        body: whatsappBody,
        status: "sent",
        matched: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Inbound mandate successfully approved and converted to Active status.",
      jobId,
      clientId: resolvedClientId,
      isNewClient,
      status: "Active",
      assignedRecruiterId,
      slaDeadline,
    });

  } catch (error: any) {
    console.error("Mandate conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to convert mandate" },
      { status: 500 }
    );
  }
}
