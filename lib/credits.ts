// Import prisma connected db module for direct database operations
import prisma from "./prisma"
// Helper function to calculate precise start marker of the current day
import { startOfDay } from "date-fns"

// Standard base allowance awarded to users automatically each day
export const DEFAULT_DAILY_CREDITS = 20
// System configured credit cost per generative AI image action
export const COST_PER_IMAGE = 0
// System configured credit cost associated with variable text length prompts
export const CREDITS_PER_CHARACTER = 0

/**
 * Calculates credit cost based on text length.
 * Note: Feature cost is currently deprecated returning 0 always
 */
export function calculateTextCost(text: string): number {
  return 0 // Removed scaling cost calculation
}

/**
 * Checks if credits need to be reset (it's a new day)
 * and returns the current credit balance.
 */
export async function getOrResetCredits(userId: string) {
  // Query for the specific user's balance and credit generation marker in the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, creditsLastReset: true },
  })

  // Failsafe returning 0 if user map lookup fails structurally
  if (!user) return 0

  // Standardize the recorded timestamp to the normalized start marker of the logged day
  const lastReset = startOfDay(new Date(user.creditsLastReset))
  // Calculate today's exact normalized start marker
  const now = startOfDay(new Date())

  // Check if today is strictly after the last known reset marker date
  if (now > lastReset) {
    // Top up the balance to 20 since it's a totally new day for the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: DEFAULT_DAILY_CREDITS,      // Reset baseline token pool to active standard
        creditsLastReset: new Date(),        // Save physical execution date-time 
      },
      select: { credits: true },             // Optimization return filter
    })
    // Immediately return updated pool balance
    return updatedUser.credits
  }

  // Return original pool array if day didn't rollover
  return user.credits
}

/**
 * Deducts credits from the user's balance.
 * Throws an error if insufficient credits.
 */
export async function deductCredits(userId: string, amount: number) {
  // Read up-to-date accurate database ledger state, resetting implicitly if due
  const currentCredits = await getOrResetCredits(userId)

  // Fail transaction check immediately if balance won't support operation cost limit
  if (currentCredits < amount) {
    throw new Error("INSUFFICIENT_CREDITS")
  }

  // Securely update PostgreSQL atomic ledger row decrementing tokens
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: amount, // Safe mathematical decrement managed natively avoiding race condition desyncs
      },
    },
    select: { credits: true }, // Optimization filter reducing mapped fields
  })

  // Return the remaining available system balance post deduction
  return updatedUser.credits
}
