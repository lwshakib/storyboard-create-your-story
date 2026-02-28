import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrResetCredits } from "@/lib/credits";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const credits = await getOrResetCredits(session.user.id);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error("[USER_CREDITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
