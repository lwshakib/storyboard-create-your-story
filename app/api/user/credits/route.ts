import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getOrResetCredits } from "@/lib/credits"

/**
 * GET: Retrieves the current credit balance for the authenticated user.
 * It also triggers the 'Daily Reset' logic if the user's last reset
 * was more than 24 hours ago.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch credits and handle potential daily replenishment
    const credits = await getOrResetCredits(session.user.id)

    return NextResponse.json({ credits })
  } catch (error) {
    console.error("[USER_CREDITS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
