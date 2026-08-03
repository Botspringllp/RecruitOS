import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  agencyId: z.string().uuid("Invalid Agency ID format. Must be a valid UUID."),
});

export async function login(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { agencyId } = result.data;

    // Check if the agency exists in the database
    const agencyList = await db
      .select({ id: agencies.agencyId })
      .from(agencies)
      .where(eq(agencies.agencyId, agencyId))
      .limit(1);

    if (agencyList.length === 0) {
      return NextResponse.json(
        { error: "Agency not found. Please ensure this tenant ID is seeded in the database." },
        { status: 404 }
      );
    }

    // Find the first user in this agency to bind the session context to,
    // or seed a default user if none exists.
    let userList = await db
      .select({ id: users.userId, email: users.email })
      .from(users)
      .where(eq(users.agencyId, agencyId))
      .limit(1);

    let userId: string;

    if (userList.length === 0) {
      // Auto-seed a default user for local testing purposes
      userId = crypto.randomUUID();
      await db.insert(users).values({
        userId,
        agencyId,
        email: `recruiter@agency-${agencyId.slice(0, 8)}.com`,
        fullName: "Default Recruiter Admin",
        passwordHash: "dev_seed_bypass_hash",
        role: "admin",
      });
    } else {
      userId = userList[0].id;
    }

    // Sign the JWT token
    const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_change_me_in_prod';
    const token = jwt.sign(
      { agencyId, userId },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true, agencyId, userId });

    // Set secure HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login controller error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during authentication" },
      { status: 500 }
    );
  }
}
