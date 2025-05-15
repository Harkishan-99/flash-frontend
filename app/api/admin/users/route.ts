import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendUserApprovalEmail, sendUserRejectionEmail } from "@/lib/email";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to check if user is admin
async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// Get all users
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// Update user status
export async function PATCH(req: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request. User ID and valid status are required." },
        { status: 400 }
      );
    }

    // Get the user to update
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // Send notification email to user
    if (status === "approved" && userToUpdate.status !== "approved") {
      await sendUserApprovalEmail(userToUpdate.email, userToUpdate.name || "");
    } else if (status === "rejected" && userToUpdate.status !== "rejected") {
      await sendUserRejectionEmail(userToUpdate.email, userToUpdate.name || "");
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 