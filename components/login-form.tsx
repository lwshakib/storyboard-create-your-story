"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

/**
 * LoginForm Component: Handles user authentication via email or social providers.
 * Integration: Uses 'authClient' for robust sessions and password management.
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  /**
   * EMAIL SIGN-IN FLOW:
   * 1. Clear previous errors.
   * 2. Attempt authentication via authClient.
   * 3. On success, redirect to the home dashboard and refresh the server state.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError(error.message || "Failed to sign in")
        setIsLoading(false)
        return
      }

      router.push("/home")
      router.refresh()
    } catch {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  /**
   * SOCIAL LOGIN: Currently supports Google.
   */
  const handleSocialLogin = async (provider: "google") => {
    setSocialLoading(provider)
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/home",
      })
    } catch {
      setError(`Failed to sign in with ${provider}`)
      setSocialLoading(null)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Login to your account
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your credentials to continue your storytelling journey
          </p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* EMAIL FIELD */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="rounded-xl"
          />
        </Field>

        {/* PASSWORD FIELD */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-primary ml-auto text-sm font-medium underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="rounded-xl"
          />
        </Field>

        {/* ACTION BUTTON */}
        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 rounded-xl font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Field>

        <FieldSeparator className="text-[10px] font-black tracking-widest uppercase opacity-40">
          Or continue with
        </FieldSeparator>

        {/* SOCIAL LOGIN SECTION */}
        <Field className="gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={socialLoading !== null}
            onClick={() => handleSocialLogin("google")}
            className="h-11 rounded-xl font-bold"
          >
            {socialLoading === "google" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="size-4"
              />
            )}
            Login with Google
          </Button>

          <FieldDescription className="mt-4 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-bold underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
