import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: "Not authenticated",
        isLoggedIn: false 
      });
    }
    
    return NextResponse.json({
      isLoggedIn: true,
      user: session.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ 
      error: "Session error",
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 