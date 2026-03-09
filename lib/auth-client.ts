// Import the client-side instantiation factory from better-auth
import { createAuthClient } from "better-auth/react"

// Create and export the configured authentication client instance mapped for React frontends
export const authClient = createAuthClient({
  /**
   * The base URL of the auth server (optional if you're using the same domain).
   * Used to route all frontend auth payloads to the core API router layer.
   */
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
})
