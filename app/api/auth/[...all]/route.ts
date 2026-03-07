import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

/**
 * Better-Auth Catch-all Route:
 * Handles all authentication-related requests (sign-in, sign-up, session check, etc.)
 * by mapping them to the Better-Auth handler logic.
 */
export const { POST, GET } = toNextJsHandler(auth)
