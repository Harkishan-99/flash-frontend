import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, getTokenExpiry } from "@/lib/auth-utils";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Be explicit about whether the user exists
    if (!user) {
      return NextResponse.json({
        error: "No account exists with this email address",
        userExists: false
      }, { status: 404 });
    }

    // Generate reset token
    const token = generateToken(32);
    const expires = getTokenExpiry();

    // Store the token in the database
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message: "Password reset email has been sent",
      userExists: true
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Password reset request failed: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 