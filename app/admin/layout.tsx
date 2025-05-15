"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    }
  }, [status, session, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard" passHref>
            <Button
              variant={isActive("/admin/dashboard") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/users" passHref>
            <Button
              variant={isActive("/admin/users") ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-medium">
            Admin {pathname.split("/").pop()?.charAt(0).toUpperCase() ?? ''}{pathname.split("/").pop()?.slice(1) ?? ''}
          </h1>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-sm font-medium">{session?.user?.email}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 