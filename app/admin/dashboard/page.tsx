"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";

type UserStats = {
  totalUsers: number;
  pendingApprovals: number;
  approvedUsers: number;
  rejectedUsers: number;
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Admin Dashboard - Session:", session);
    
    // Redirect if not admin
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      console.log("Not admin, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const users = await response.json();
        
        // Calculate stats
        const totalUsers = users.length;
        const pendingApprovals = users.filter((user: any) => user.status === "pending").length;
        const approvedUsers = users.filter((user: any) => user.status === "approved").length;
        const rejectedUsers = users.filter((user: any) => user.status === "rejected").length;
        
        setStats({
          totalUsers,
          pendingApprovals,
          approvedUsers,
          rejectedUsers,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchStats();
    }
  }, [status, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Users awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Rejected accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.pendingApprovals > 0 && (
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>There are pending registrations that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have {stats.pendingApprovals} user registration{stats.pendingApprovals !== 1 ? "s" : ""} waiting for approval.
            </p>
            <div className="mt-4">
              <a 
                href="/admin/users" 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
              >
                Manage Users
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 