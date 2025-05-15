"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Zap } from "lucide-react"
import { PrivacyDialog } from "@/components/privacy-dialog"
import { TermsDialog } from "@/components/terms-dialog"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(searchParams.get("error") || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [forgotPassword, setForgotPassword] = useState<boolean>(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("")
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the user's role after successful login using our custom endpoint
      const session = await fetch("/api/auth/custom-session")
      const sessionData = await session.json()
      
      console.log("Session data:", sessionData)
      
      // Redirect based on role
      if (sessionData?.user?.role === "admin") {
        console.log("Redirecting to admin dashboard")
        router.push("/admin/dashboard")
      } else {
        console.log("Redirecting to user dashboard")
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)
    setForgotPasswordMessage(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No account exists with this email address")
        } else {
          throw new Error(data.error || "Something went wrong")
        }
      }

      setForgotPasswordMessage("Password reset instructions have been sent to your email")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle className="text-2xl font-bold">
            {forgotPassword ? "Reset Password" : "Login"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {forgotPassword
              ? "Enter your email address to receive a password reset link"
              : "Enter your email and password to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!forgotPassword ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  autoComplete="email"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-yellow-400 hover:underline p-0 h-auto font-normal"
                    onClick={() => setForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  autoComplete="current-password"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {forgotPasswordMessage && (
                <Alert className="bg-green-900 border-green-800 text-white">
                  <AlertDescription>{forgotPasswordMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white">
                  Email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setForgotPassword(false)}
                >
                  Back to Login
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Reset Password"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-gray-400 mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-yellow-400 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <footer className="mt-8 flex gap-4">
        <TermsDialog 
          trigger={
            <button className="text-xs text-gray-400 hover:underline underline-offset-4">
              Terms of Service
            </button>
          }
        />
        <PrivacyDialog 
          trigger={
            <button className="text-xs text-gray-400 hover:underline underline-offset-4">
              Privacy
            </button>
          }
        />
      </footer>
    </div>
  )
}
