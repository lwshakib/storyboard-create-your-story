"use client"

import { useEffect, useState, Suspense } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Logo } from "@/components/logo"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )
  const [error, setError] = useState("")

  const token = searchParams.get("token")

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error")
        setError("Missing verification token.")
        return
      }

      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token: token,
          },
        })

        if (error) {
          setStatus("error")
          setError(error.message || "Email verification failed.")
          return
        }

        setStatus("success")
      } catch {
        setStatus("error")
        setError("An unexpected error occurred during verification.")
      }
    }

    verify()
  }, [token])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 text-center md:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="text-primary mx-auto size-12 animate-spin" />
              <h1 className="text-2xl font-bold">Verifying your email...</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">
                Email verified successfully
              </h1>
              <p className="text-muted-foreground">
                Your email has been verified. You can now access all features of
                Storyboard.
              </p>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href="/sign-in">Go to Login</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-destructive/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <XCircle className="text-destructive size-8" />
              </div>
              <h1 className="text-2xl font-bold">Verification failed</h1>
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-muted-foreground text-sm">
                The link might be expired or invalid. Please try signing up
                again or contact support.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="w-full">
                  <Link href="/sign-up">Back to Sign Up</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/sign-in">Back to Login</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/verify-email-bg.png"
          alt="Verify Email Background"
          className="absolute inset-0 h-full w-full object-cover"
          fill
        />
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
