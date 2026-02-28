import prisma from "./prisma";
import { startOfDay } from "date-fns";

export const DEFAULT_DAILY_CREDITS = 50000;
export const COST_PER_IMAGE = 3000;
export const CREDITS_PER_CHARACTER = 0.2; // 1 credit per 5 characters

/**
 * Calculates credit cost based on text length.
 */
export function calculateTextCost(text: string): number {
  return Math.ceil(text.length * CREDITS_PER_CHARACTER);
}
/**
 * Checks if credits need to be reset (it's a new day)
 * and returns the current credit balance.
 */
export async function getOrResetCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, creditsLastReset: true },
  });

  if (!user) return 0;

  const lastReset = startOfDay(new Date(user.creditsLastReset));
  const now = startOfDay(new Date());

  if (now > lastReset) {
    // It's a new day! Reset credits to 50,000
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: DEFAULT_DAILY_CREDITS,
        creditsLastReset: new Date(),
      },
      select: { credits: true },
    });
    return updatedUser.credits;
  }

  return user.credits;
}

/**
 * Deducts credits from the user's balance.
 * Throws an error if insufficient credits.
 */
export async function deductCredits(userId: string, amount: number) {
  const currentCredits = await getOrResetCredits(userId);
  
  if (currentCredits < amount) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: amount
      }
    },
    select: { credits: true }
  });

  return updatedUser.credits;
}
