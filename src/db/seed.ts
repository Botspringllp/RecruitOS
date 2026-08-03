import { db } from "./index";
import { agencies, users, agencyChannels } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  const demoAgencies = [
    { agencyId: "11111111-1111-1111-1111-111111111111", agencyName: "Apex Recruitment Partners" },
    { agencyId: "22222222-2222-2222-2222-222222222222", agencyName: "TechCorp Sourcing" },
  ];

  for (const agency of demoAgencies) {
    // 1. Seed Agency
    const existing = await db
      .select()
      .from(agencies)
      .where(eq(agencies.agencyId, agency.agencyId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(agencies).values(agency);
      console.log(`Seeded agency: ${agency.agencyName}`);

      // 2. Seed default admin user for this agency
      const userId = crypto.randomUUID();
      await db.insert(users).values({
        userId,
        agencyId: agency.agencyId,
        email: `admin@${agency.agencyName.toLowerCase().replace(/\s+/g, "")}.com`,
        fullName: `${agency.agencyName} Admin`,
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
          address: agency.agencyId === "11111111-1111-1111-1111-111111111111" ? "+919876543210" : "+918888888888",
        },
        {
          channelId: crypto.randomUUID(),
          agencyId: agency.agencyId,
          channel: "email",
          address: agency.agencyId === "11111111-1111-1111-1111-111111111111" ? "inbox@apex.recruitos.com" : "inbox@techcorp.recruitos.com",
        },
      ]);
      console.log(`Seeded messaging channels for ${agency.agencyName}`);
    } else {
      console.log(`Agency ${agency.agencyName} already exists, skipping seed.`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
