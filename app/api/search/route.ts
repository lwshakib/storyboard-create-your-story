import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = `%${query.toLowerCase()}%`

    // Full text search across project title, description, and the "slides" JSON field.
    // We use a raw query because Prisma doesn't have native full-text search 
    // for specific keys inside a JSON column in all versions/providers yet.
    const projects = await prisma.$queryRaw`
      SELECT * FROM project
      WHERE "userId" = ${session.user.id}
      AND "isDeleted" = false
      AND (
        title ILIKE ${searchTerm}
        OR description ILIKE ${searchTerm}
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(slides) AS slide
          WHERE slide->>'title' ILIKE ${searchTerm}
          OR slide->>'content' ILIKE ${searchTerm}
          OR slide->>'description' ILIKE ${searchTerm}
        )
      )
      ORDER BY "updatedAt" DESC
      LIMIT 10;
    `

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[SEARCH_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
