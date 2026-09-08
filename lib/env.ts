import { z } from "zod"

const shouldSkip =
  process.env.SKIP_ENV_VALIDATION === "true" ||
  process.env.SKIP_ENV_VALIDATION === "1"

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  GEMINI_API_KEY: z
    .string()
    .min(1)
    .optional()
    .transform((val) => val || process.env.GOOGLE_API_KEY || "")
    .refine((val) => val.length > 0, {
      message: "GEMINI_API_KEY is required",
    }),

  // AWS S3 configurations
  AWS_REGION: z.string().default("auto"),
  AWS_ENDPOINT: z.string().min(1, "AWS_ENDPOINT is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  AWS_S3_BUCKET_NAME: z.string().min(1, "AWS_S3_BUCKET_NAME is required"),
})

const parsedEnv = shouldSkip
  ? {
      success: true as const,
      data: {
        RESEND_API_KEY: process.env.RESEND_API_KEY || "dummy_resend_api_key",
        GEMINI_API_KEY:
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_API_KEY ||
          "dummy_gemini_api_key",
        AWS_REGION: process.env.AWS_REGION || "auto",
        AWS_ENDPOINT:
          process.env.AWS_ENDPOINT || "https://dummy.r2.cloudflarestorage.com",
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "dummy_access_key",
        AWS_SECRET_ACCESS_KEY:
          process.env.AWS_SECRET_ACCESS_KEY || "dummy_secret_key",
        AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "dummy-bucket",
      },
    }
  : envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 2)
  )
  throw new Error(
    `Missing or invalid environment variables: ${Object.keys(
      parsedEnv.error.flatten().fieldErrors
    ).join(", ")}`
  )
}

export const {
  RESEND_API_KEY,
  GEMINI_API_KEY,
  AWS_REGION,
  AWS_ENDPOINT,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} = parsedEnv.data
