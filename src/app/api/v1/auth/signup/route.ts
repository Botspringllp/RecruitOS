import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agencies, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  agencyName: z.string().trim().min(2, "Agency name is required."),
  tenantId: z.string().trim().optional(),
  ownerName: z.string().trim().min(2, "Owner name is required."),
  email: z.string().trim().email("Invalid email address format."),
  mobile: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { agencyName, tenantId, ownerName, email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    let targetAgencyId = tenantId;

    // Verify or create agency
    if (targetAgencyId && targetAgencyId.trim() !== "") {
      const existingAgency = await db
        .select({ agencyId: agencies.agencyId })
        .from(agencies)
        .where(eq(agencies.agencyId, targetAgencyId))
        .limit(1);

      if (existingAgency.length === 0) {
        const [newAgency] = await db
          .insert(agencies)
          .values({
            agencyId: targetAgencyId,
            agencyName,
          })
          .returning();
        targetAgencyId = newAgency.agencyId;
      }
    } else {
      const [newAgency] = await db
        .insert(agencies)
        .values({
          agencyName,
        })
        .returning();
      targetAgencyId = newAgency.agencyId;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user record
    const [newUser] = await db
      .insert(users)
      .values({
        agencyId: targetAgencyId,
        email: normalizedEmail,
        fullName: ownerName,
        passwordHash,
        role: "owner",
      })
      .returning();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }

    // Sign JWT session token
    const token = jwt.sign(
      {
        agencyId: newUser.agencyId,
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        userId: newUser.userId,
        agencyId: newUser.agencyId,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });

    // Set HTTP-only secure session cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error during registration" },
      { status: 500 }
    );
  }
}
