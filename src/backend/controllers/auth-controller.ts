import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format."),
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

    // Strict check for JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing.");
    }

    // Lookup user by email in database
    const userList = await db
      .select({
        userId: users.userId,
        agencyId: users.agencyId,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        passwordHash: users.passwordHash,
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

    const user = userList[0];

    // Verify password hash with bcrypt
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign JWT Token
    const token = jwt.sign(
      {
        agencyId: user.agencyId,
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        agencyId: user.agencyId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    // Set HttpOnly authentication cookie
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
