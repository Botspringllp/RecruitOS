import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/backend/auth/tenant-context";
import { withTenantTx } from "@/db";
import { jobMandates, agencyJobBoardCredentials, jobBoardPostings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID parameter is required" }, { status: 400 });
    }

    // 1. Resolve and enforce tenant isolation context
    const tenant = await getTenantContext();
    if (!tenant.agencyId) {
      return NextResponse.json({ error: "Unauthorized tenant session" }, { status: 401 });
    }
    const { agencyId } = tenant;

    // 2. Parse request payload
    const body = await req.json().catch(() => ({}));
    const { selected_boards } = body;
    if (!Array.isArray(selected_boards) || selected_boards.length === 0) {
      return NextResponse.json({ error: "selected_boards array is required" }, { status: 400 });
    }

    // 3. Execute transactional publication validation and logging
    const result = await withTenantTx(agencyId, async (tx) => {
      // Verify job mandate exists under the agency
      const jobList = await tx
        .select()
        .from(jobMandates)
        .where(and(eq(jobMandates.jobId, jobId), eq(jobMandates.agencyId, agencyId)))
        .limit(1);

      if (jobList.length === 0) {
        throw new Error("Job mandate not found or unauthorized");
      }
      const job = jobList[0];

      const postingsCreated = [];

      for (const board of selected_boards) {
        // Enforce board validation (supported: Naukri, Bayt, LinkedIn)
        if (!["Naukri", "Bayt", "LinkedIn"].includes(board)) {
          throw new Error(`Unsupported job board: ${board}`);
        }

        // Verify credentials exist and are active
        const creds = await tx
          .select()
          .from(agencyJobBoardCredentials)
          .where(
            and(
              eq(agencyJobBoardCredentials.agencyId, agencyId),
              eq(agencyJobBoardCredentials.boardName, board),
              eq(agencyJobBoardCredentials.isActive, true)
            )
          )
          .limit(1);

        if (creds.length === 0) {
          throw new Error(`Integration credentials not active or not configured for ${board}`);
        }

        // Generate simulated external job portal ID
        const externalJobId = `${board.toLowerCase()}_job_${Math.floor(100000 + Math.random() * 900000)}`;

        // Simulated Portal API request formatting
        console.log(`[RC-08 Sync Engine] Formatted payload for ${board} API:`, {
          externalId: externalJobId,
          title: job.title,
          client: job.clientName,
          credentials: { apiKey: creds[0].apiKey, token: creds[0].oauthToken }
        });

        // Insert new active posting record in database
        const newPosting = await tx
          .insert(jobBoardPostings)
          .values({
            postingId: crypto.randomUUID(),
            jobId,
            boardName: board,
            externalJobId,
            postingStatus: "Published",
            applicationsCount: 0,
          })
          .returning();

        postingsCreated.push(newPosting[0]);
      }

      return postingsCreated;
    });

    return NextResponse.json({
      success: true,
      message: `Job mandate successfully broadcast across ${selected_boards.join(", ")}`,
      postings: result,
    });

  } catch (error: any) {
    console.error("Job broadcast failure:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast job mandate" },
      { status: 500 }
    );
  }
}
