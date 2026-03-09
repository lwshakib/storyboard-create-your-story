// Import the main core initialization block for better-auth
import { betterAuth } from "better-auth"
// Import the prisma adapter allowing better-auth to communicate with the PostgreSQL db
import { prismaAdapter } from "better-auth/adapters/prisma"
// Import the shared singleton Prisma client instance used across the app
import prisma from "./prisma"
// Import the Resend SDK for handling outgoing transactional emails
import { Resend } from "resend"
// Import the React component used to render visual emails for authentication
import { AuthEmailTemplate } from "@/components/emails/auth-email-template"

// Instantiate the Resend client using the server API key from env variables
const resend = new Resend(process.env.RESEND_API_KEY)

// Export the singleton instance of betterAuth to be used for router configurations
export const auth = betterAuth({
  // Configure the database connection using the Prisma adapter
  database: prismaAdapter(prisma, {
    // Explicitly define the database provider type mapped in Prisma
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  
  // Configure traditional Email & Password authentication
  emailAndPassword: {
    // Enable this authentication method
    enabled: true,
    // Require new users to click an email link before full account access
    requireEmailVerification: true,
    
    // Callback block triggered when a user requests a password reset
    sendResetPassword: async ({ user, url }) => {
      try {
        // Use Resend to send the password reset email
        const { error } = await resend.emails.send({
          // Set sender address 
          from: "Storyboard <noreply@lwshakib.site>",
          // Set recipient from the configured user object
          to: user.email,
          // Set subject line of the email
          subject: "Reset your password",
          // Render the body of the email using the local React AuthEmailTemplate
          react: AuthEmailTemplate({ type: "forgot-password", url }),
        })

        // Check if Resend SDK returned an error instead of succeeding
        if (error) {
          console.error("Failed to send email via Resend:", error)
          // Throw an error to bubble up to the authentication UI
          throw new Error("Failed to send authentication email.")
        }
      } catch (err) {
        // Catch any fatal errors that occur during the Resend communication pipeline
        console.error("Resend error:", err)
        throw err
      }
    },
  },
  
  // Configure third-party OAuth providers
  socialProviders: {
    // Setup for "Sign in with Google"
    google: {
      // Enable google login
      enabled: true,
      // Pull Google Client ID from environment variables
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      // Pull Google Secret from environment variables
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  // Email Verification pipeline block
  emailVerification: {
    // Attempt sending the verification email right after standard signup
    sendOnSignUp: true,
    // Callback trigger constructing the verification email content
    sendVerificationEmail: async ({ user, token }) => {
      try {
        // Construct the full callback URL the user will click in the email
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`
        
        // Dispatch the email using Resend
        await resend.emails.send({
          // Authorized sender domain
          from: "Storyboard <noreply@lwshakib.site>",
          // Delivery target
          to: user.email,
          // Email subject
          subject: "Verify your email address",
          // Render visual template tailored to email verification
          react: AuthEmailTemplate({
            type: "email-verification",
            url: verificationUrl,
          }),
        })
      } catch (err) {
        // Capture silently logging errors if email delivery fails, preventing breaking signup flow
        console.error("Verification email error:", err)
      }
    },
  },
  
  // Account state configurations
  account: {
    // Enable system attempting to link different credential types (e.g., Google + Standard) to same email
    accountLinking: {
      enabled: true,
    },
  },
  
  // No external auth plugins registered yet
  plugins: [],
})
