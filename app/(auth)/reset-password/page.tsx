"use client"

import { useState, Suspense } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"

function ResetPasswordContent() {

  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Note: Better Auth forgot-password redirect usually appends ?token=... or uses a specific route.
  // The token is handled automatically by authClient.resetPassword if it's in the URL or provided.

  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!token) {
      setError("Invalid or missing reset token")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      })

      if (error) {
        setError(error.message || "Failed to reset password")
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      setIsLoading(false)
    } catch {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-6 text-center md:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="mb-8 flex justify-center">
              <Logo />
            </div>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="size-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Password reset successfully</h1>
            <p className="text-muted-foreground">
              Your password has been updated. You can now log in with your new
              password.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/sign-in">Back to Login</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/reset-password-bg.png"
            alt="Reset Password Background"
            className="absolute inset-0 h-full w-full object-cover"
            fill
          />
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Please enter your new password below.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/reset-password-bg.png"
          alt="Reset Password Background"
          className="absolute inset-0 h-full w-full object-cover"
          fill
        />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
