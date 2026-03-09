import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromCloudinary } from "@/lib/cloudinary"

/**
 * DELETE: Deletes a specific slide and re-indexes the remaining slides.
 * Also cleans up any assets from the deleted slide.
 */
export async function DELETE(
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

    const { id: slideId } = await params

    // 1. Find the slide and verify ownership via project
    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
      include: { project: true }
    })

    if (!slide || slide.project.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const projectId = slide.projectId

    // 2. Asset Cleanup
    const assets = (slide.assets as { publicId: string }[]) || []
    if (assets.length > 0) {
      const publicIds = assets.map(a => a.publicId)
      try {
        await deleteMultipleFromCloudinary(publicIds)
      } catch (err) {
        console.error("[SLIDE_DELETE] Cloudinary cleanup failed:", err)
      }
    }

    // 3. Atomic Deletion & Re-indexing
    await prisma.$transaction(async (tx) => {
      // Delete the actual slide
      await tx.slide.delete({
        where: { id: slideId }
      })

      // Fetch remaining slides to re-index
      const remainingSlides = await tx.slide.findMany({
        where: { projectId },
        orderBy: { index: "asc" }
      })

      // Update all indices to ensure no gaps
      for (let i = 0; i < remainingSlides.length; i++) {
        await tx.slide.update({
          where: { id: remainingSlides[i].id },
          data: { index: i }
        })
      }
    })

    // 4. Return the fresh project state
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { index: "asc" } } }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("[SLIDE_DELETE] Fatal Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
