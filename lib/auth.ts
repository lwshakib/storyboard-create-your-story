import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { Resend } from "resend";
import { AuthEmailTemplate } from "@/components/emails/auth-email-template";

import { multiSession } from "better-auth/plugins";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { error } = await resend.emails.send({
          from: 'Storyboard <noreply@lwshakib.site>',
          to: user.email,
          subject: 'Reset your password',
          react: AuthEmailTemplate({ type: 'forgot-password', url }),
        });

        if (error) {
          console.error('Failed to send email via Resend:', error);
          throw new Error('Failed to send authentication email.');
        }
      } catch (err) {
        console.error('Resend error:', err);
        throw err;
      }
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;
        await resend.emails.send({
          from: 'Storyboard <noreply@lwshakib.site>',
          to: user.email,
          subject: 'Verify your email address',
          react: AuthEmailTemplate({ type: 'email-verification', url: verificationUrl }),
        });
      } catch (err) {
        console.error('Verification email error:', err);
      }
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  plugins: [],
});

