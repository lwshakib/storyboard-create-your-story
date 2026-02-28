"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Loader2, MailCheck } from "lucide-react"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })

      if (error) {
        setError(error.message || "Failed to send reset email")
        setIsLoading(false)
        return
      }

      setIsSent(true)
      setIsLoading(false)
    } catch {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="mb-8 flex justify-center">
              <Logo />
            </div>
            <div className="bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
              <MailCheck className="text-primary size-8" />
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to{" "}
              <span className="text-foreground font-medium">{email}</span>.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild>
                <a
                  href="https://gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to Gmail
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-in">Back to Login</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/forgot-password-bg.png"
            alt="Forgot Password Background"
            className="absolute inset-0 h-full w-full object-cover"
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
            <h1 className="text-2xl font-bold">Forgot password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email address and we'll send you a link to reset your
              password.
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </FieldGroup>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Remember your password?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/forgot-password-bg.png"
          alt="Forgot Password Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
