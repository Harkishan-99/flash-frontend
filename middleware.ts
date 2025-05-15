import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define paths that are protected for all authenticated users
  const protectedPaths = ["/dashboard"];
  
  // Define paths that are only accessible for admin users
  const adminOnlyPaths = ["/admin", "/admin/dashboard", "/admin/users"];
  
  // Check if the path is protected or admin only
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp));
  const isAdminPath = adminOnlyPaths.some((aop) => path.startsWith(aop) || path === aop);
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("Middleware token:", token);
  
  // If the path is protected and the user is not logged in, redirect to login
  if ((isProtectedPath || isAdminPath) && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If the path is for admin only and the user is not an admin, redirect to dashboard
  if (isAdminPath && token?.role !== "admin") {
    console.log(`User with role ${token?.role} attempted to access admin path ${path}`);
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

// Configure the matcher for specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}; 