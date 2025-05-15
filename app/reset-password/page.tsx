"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Zap } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token, email]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !email) {
      setError("Invalid or missing reset token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Password reset failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex flex-col items-start text-white">
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-yellow-400 mr-2" />
            <span className="font-bold text-xl">Flash</span>
          </div>
          <span className="text-xs text-gray-400 ml-8">by QuantHive</span>
        </Link>
      </div>
      <Card className="w-full max-w-md bg-gray-900 text-white border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="bg-green-900 border-green-800 text-white mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Password Reset Successful</AlertTitle>
              <AlertDescription>
                Your password has been reset. You can now log in with your new password.
              </AlertDescription>
              <div className="mt-4">
                <Link href="/login">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </Alert>
          ) : isValidToken ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  autoComplete="new-password"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  autoComplete="new-password"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">Invalid or expired reset link.</p>
              <Link href="/login">
                <Button variant="outline" className="mt-2">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-gray-400 mt-2">
            Remember your password?{" "}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 