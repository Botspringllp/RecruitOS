import { db } from "./index";
import { agencies, users, agencyChannels, agencyStorefrontProfiles, jobMandates, candidateRecords, candidateSubmissions, agencyJobBoardCredentials, partnerMandateShares, clientRecords } from "./schema";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  // Truncate tables to allow clean re-seeding
  try {
    await db.execute(
      sql`TRUNCATE TABLE users, agencies, agency_channels, agency_storefront_profiles, job_mandates, candidate_records, candidate_submissions, agency_job_board_credentials, partner_mandate_shares, client_records CASCADE`
    );
    console.log("Cleaned existing table data.");
  } catch (cleanErr) {
    console.warn("Could not truncate tables (may not exist yet):", cleanErr);
  }

  const demoAgencies = [
    { agencyId: "11111111-1111-4111-8111-111111111111", agencyName: "Apex Recruitment Partners" },
    { agencyId: "22222222-2222-4222-8222-222222222222", agencyName: "TechCorp Sourcing" },
  ];

  for (const agency of demoAgencies) {
    const isApex = agency.agencyId === "11111111-1111-4111-8111-111111111111";

    // 1. Seed Agency
    await db.insert(agencies).values(agency);
    console.log(`Seeded agency: ${agency.agencyName}`);

    // 2. Seed default admin user for this agency
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      userId,
      agencyId: agency.agencyId,
      email: `admin@${agency.agencyName.toLowerCase().replace(/\s+/g, "")}.com`,
      fullName: isApex ? "Ankit Sharma" : "John Doe",
      passwordHash: "seed_no_pass_auth",
      role: "admin",
    });
    console.log(`Seeded default user for ${agency.agencyName}`);

    // 3. Seed default channels so webhooks map correctly
    await db.insert(agencyChannels).values([
      {
        channelId: crypto.randomUUID(),
        agencyId: agency.agencyId,
        channel: "whatsapp",
        address: isApex ? "+919876543210" : "+918888888888",
      },
      {
        channelId: crypto.randomUUID(),
        agencyId: agency.agencyId,
        channel: "email",
        address: isApex ? "inbox@apex.recruitos.com" : "inbox@techcorp.recruitos.com",
      },
    ]);
    console.log(`Seeded messaging channels for ${agency.agencyName}`);

    // 4. Seed storefront profile
    await db.insert(agencyStorefrontProfiles).values({
      storefrontId: crypto.randomUUID(),
      agencyId: agency.agencyId,
      subdomain: isApex ? "apex" : "techcorp",
      primaryColor: isApex ? "#0F172A" : "#1E293B",
      accentColor: isApex ? "#FFD400" : "#3B82F6",
      heroHeadline: isApex 
        ? "Premier Executive Search for Gulf & Emerging Markets"
        : "Bespoke Technical Recruitment & Engineering Placement",
      aboutText: isApex
        ? "We connect tier-one engineering and executive leaders with industry leaders across the GCC and international markets, specializing in Fintech, High-Frequency Trading, and Cloud Native Infrastructure."
        : "Empowering global scaling startups and tech organizations with exceptional software engineering, machine learning, and infrastructure talent curation.",
      featuredSpecializations: isApex
        ? ["Fintech", "Gulf Relocations", "Executive Leadership"]
        : ["Cloud Infrastructure", "React Developers", "AI & Data Science"],
      showMetricsBar: true,
      isPublished: true,
    });
    console.log(`Seeded storefront profile for ${agency.agencyName}`);

    // 4.5 Seed Job Board Credentials
    await db.insert(agencyJobBoardCredentials).values([
      {
        credentialId: crypto.randomUUID(),
        agencyId: agency.agencyId,
        boardName: "Naukri",
        apiKey: `naukri_key_${isApex ? "apex" : "techcorp"}`,
        oauthToken: `naukri_token_${isApex ? "apex" : "techcorp"}`,
        isActive: true,
      },
      {
        credentialId: crypto.randomUUID(),
        agencyId: agency.agencyId,
        boardName: "Bayt",
        apiKey: `bayt_key_${isApex ? "apex" : "techcorp"}`,
        oauthToken: `bayt_token_${isApex ? "apex" : "techcorp"}`,
        isActive: true,
      },
      {
        credentialId: crypto.randomUUID(),
        agencyId: agency.agencyId,
        boardName: "LinkedIn",
        apiKey: `linkedin_key_${isApex ? "apex" : "techcorp"}`,
        oauthToken: `linkedin_token_${isApex ? "apex" : "techcorp"}`,
        isActive: true,
      }
    ]);
    console.log(`Seeded job board credentials for ${agency.agencyName}`);

    // 5. Seed Job Mandates
    const job1Id = isApex 
      ? "33333333-3333-3333-3333-333333333333" 
      : "55555555-5555-5555-5555-555555555555";
    const job2Id = isApex 
      ? "44444444-4444-4444-4444-444444444444" 
      : "66666666-6666-6666-6666-666666666666";

    await db.insert(jobMandates).values([
      {
        jobId: job1Id,
        agencyId: agency.agencyId,
        title: isApex ? "Sr Backend Lead" : "Senior Frontend Developer",
        clientName: isApex ? "TechCorp Sourcing" : "Vercel Labs",
        status: "Open",
      },
      {
        jobId: job2Id,
        agencyId: agency.agencyId,
        title: isApex ? "Principal DevOps Engineer" : "Infrastructure Architect",
        clientName: isApex ? "Apex Cloud Labs" : "Vercel Labs",
        status: "Open",
      }
    ]);
    console.log(`Seeded Job Mandates for ${agency.agencyName}`);

    // 6. Seed Candidates (Apex only for visual verification in cockpit)
    if (isApex) {
      const candidatesData = [
        {
          candidateId: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
          agencyId: agency.agencyId,
          fullName: "Rohan Verma",
          email: "rohan.verma@apexcloud.io",
          phone: "+919876543211",
          currentCompany: "Infosys Labs",
          currentTitle: "Backend Developer",
          skills: ["Node.js", "TypeScript", "PostgreSQL"],
          totalExpMonths: 48,
          noticePeriodDays: 30,
        },
        {
          candidateId: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2",
          agencyId: agency.agencyId,
          fullName: "Neha Gupta",
          email: "neha.gupta@techstart.com",
          phone: "+919876543212",
          currentCompany: "TechStart Tech",
          currentTitle: "Software Engineer",
          skills: ["Java", "Spring Boot", "AWS"],
          totalExpMonths: 36,
          noticePeriodDays: 15,
        },
        {
          candidateId: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
          agencyId: agency.agencyId,
          fullName: "Amit Sharma",
          email: "amit.sharma@cloudsystems.net",
          phone: "+919876543213",
          currentCompany: "CloudSystems Inc",
          currentTitle: "Senior Systems Engineer",
          skills: ["Go", "Kubernetes", "Docker"],
          totalExpMonths: 72,
          noticePeriodDays: 60,
        }
      ];

      for (const candidate of candidatesData) {
        await db.insert(candidateRecords).values(candidate);
      }
      console.log(`Seeded Candidate Profiles for ${agency.agencyName}`);

      // 7. Seed Candidate Submissions (Assign them to Sr Backend Lead with different SLA timings)
      const now = Date.now();
      await db.insert(candidateSubmissions).values([
        {
          submissionId: crypto.randomUUID(),
          agencyId: agency.agencyId,
          jobId: job1Id,
          candidateId: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
          stage: "Submitted",
          stageUpdatedAt: new Date(now - 12 * 60 * 60 * 1000), // 12h ago (Green SLA)
          lastCommunicationAt: new Date(now - 12 * 60 * 60 * 1000),
        },
        {
          submissionId: crypto.randomUUID(),
          agencyId: agency.agencyId,
          jobId: job1Id,
          candidateId: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2",
          stage: "Submitted",
          stageUpdatedAt: new Date(now - 36 * 60 * 60 * 1000), // 36h ago (Yellow Warning SLA)
          lastCommunicationAt: new Date(now - 36 * 60 * 60 * 1000),
        },
        {
          submissionId: crypto.randomUUID(),
          agencyId: agency.agencyId,
          jobId: job1Id,
          candidateId: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
          stage: "Submitted",
          stageUpdatedAt: new Date(now - 78 * 60 * 60 * 1000), // 78h ago (Red Breach SLA)
          lastCommunicationAt: new Date(now - 78 * 60 * 60 * 1000),
        }
      ]);
      console.log(`Seeded Candidate Submissions with SLA timelines for ${agency.agencyName}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});


