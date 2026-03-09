import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * POST: Adds a new slide at a specific index and re-indexes the project.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id: projectId } = await params
    const { index } = await req.json()

    // 1. Ownership check
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id }
    })

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // 2. Insert and re-index
    await prisma.$transaction(async (tx) => {
      // Find current slides
      const currentSlides = await tx.slide.findMany({
        where: { projectId },
        orderBy: { index: "asc" }
      })

      // Insert the new slide
      await tx.slide.create({
        data: {
          index: index ?? currentSlides.length,
          title: "New Section",
          content: "",
          prompt: "",
          html: "",
          projectId
        }
      })

      // Re-fetch all and re-index
      const allSlides = await tx.slide.findMany({
        where: { projectId },
        orderBy: { index: "asc" }
      })

      for (let i = 0; i < allSlides.length; i++) {
        await tx.slide.update({
          where: { id: allSlides[i].id },
          data: { index: i }
        })
      }
    })

    // 3. Return fresh project
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { index: "asc" } } }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("[SLIDE_CREATE] Fatal Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
