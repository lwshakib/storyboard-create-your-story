"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/logo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setError("Missing verification token.");
        return;
      }

      try {
        const { error } = await authClient.verifyEmail({
          query: {
            token: token,
          },
        });

        if (error) {
          setStatus("error");
          setError(error.message || "Email verification failed.");
          return;
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError("An unexpected error occurred during verification.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-6 md:p-10 text-center">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center mb-8">
               <Logo />
          </div>

          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="size-12 animate-spin mx-auto text-primary" />
              <h1 className="text-2xl font-bold">Verifying your email...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-500/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Email verified successfully</h1>
              <p className="text-muted-foreground">
                Your email has been verified. You can now access all features of Storyboard.
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
              <div className="bg-destructive/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="size-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Verification failed</h1>
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-muted-foreground text-sm">
                The link might be expired or invalid. Please try signing up again or contact support.
              </p>
              <div className="pt-4 flex flex-col gap-2">
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
        <img
          src="/verify-email-bg.png"
          alt="Verify Email Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-svh">
                <Loader2 className="size-8 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
