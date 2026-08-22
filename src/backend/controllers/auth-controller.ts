import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address format."),
  password: z.string().min(1, "Password is required."),
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

    const { email, password } = result.data;

    // Check if JWT_SECRET environment variable is configured
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }
    const jwtSecret = process.env.JWT_SECRET;

    // Query user by email
    const userList = await db
      .select({
        userId: users.userId,
        agencyId: users.agencyId,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const targetUser = userList[0];

    // Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, targetUser.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const token = jwt.sign(
      {
        agencyId: targetUser.agencyId,
        userId: targetUser.userId,
        role: targetUser.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        userId: targetUser.userId,
        agencyId: targetUser.agencyId,
        email: targetUser.email,
        role: targetUser.role,
      },
    });

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
      { error: error.message || "Internal Server Error during authentication" },
      { status: 500 }
    );
  }
}
