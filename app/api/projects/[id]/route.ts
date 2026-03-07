import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromCloudinary } from "@/lib/cloudinary"

/**
 * GET: Fetches a single project by ID, including its ordered slides.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        slides: {
          orderBy: {
            index: "asc",
          },
        },
      },
    })

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PATCH: Updates project metadata or slides.
 * Includes "Asset Cleanup" logic: if slides are removed, their associated 
 * Cloudinary assets are automatically purged to save storage space.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const body = await req.json()
    const { title, description, slides, isDeleted } = body
    const { id } = await params

    // 1. ASSET CLEANUP: Identify slides that are being removed in this update
    if (slides) {
      const currentProject = await prisma.project.findUnique({
        where: { id },
        include: { slides: true }
      })
      
      if (currentProject) {
        // Find slide IDs that exist in the DB but NOT in the incoming update
        const incomingIds = new Set((slides as any[]).map(s => s.id).filter(id => typeof id === "string"))
        const removedSlides = currentProject.slides.filter(s => !incomingIds.has(s.id))
        
        // Extract assets (images) from these removed slides
        const assetsToPurge = removedSlides.flatMap(s => (s.assets as any[]) || [])
        if (assetsToPurge.length > 0) {
          const publicIds = assetsToPurge.map(a => a.publicId)
          try {
            // Permanently remove files from Cloudinary
            await deleteMultipleFromCloudinary(publicIds)
            console.log(`[PROJECT_PATCH] Purged ${publicIds.length} assets for ${removedSlides.length} removed slides.`)
          } catch (err) {
            console.error("[PROJECT_PATCH] Asset purge failed:", err)
          }
        }
      }
    }

    // 2. DATABASE UPDATE: Update project fields and replace slides
    const project = await prisma.project.update({
      where: {
        id,
        userId: session?.user?.id,
      },
      data: {
        title,
        description,
        isDeleted,
        deletedAt:
          isDeleted === false ? null : isDeleted ? new Date() : undefined,
        slides: slides ? {
          deleteMany: {}, // Atomic replacement: wipe existing slides...
          create: (slides as any[]).map((s, idx) => ({ // ...and create new ones
            index: idx,
            title: s.title,
            description: s.description,
            content: s.content,
            prompt: s.prompt,
            html: s.html,
            assets: s.assets || [], // Maintain assets if they exist in the incoming data
          }))
        } : undefined
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("[PROJECT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE: Handles both soft-deletion (moving to trash) and permanent deletion.
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

    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id },
      include: { 
        slides: true
      },
    })

    if (!project) {
      return new NextResponse("Not Found", { status: 404 })
    }

    if (!project.isDeleted) {
      // PHASE 1: Soft delete - Move to trash
      await prisma.project.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })
    } else {
      // PHASE 2: Permanent delete - Actual removal
      
      // 1. ASSET PURGE: Remove all Cloudinary assets associated with this project's slides
      const allAssets = project.slides.flatMap(slide => (slide.assets as any[]) || [])
      if (allAssets.length > 0) {
        const publicIds = allAssets.map((asset) => asset.publicId)
        try {
          await deleteMultipleFromCloudinary(publicIds)
          console.log(
            `[PROJECT_DELETE] Automatically cleared ${publicIds.length} assets from Cloudinary for project ${id}.`
          )
        } catch (cloudinaryError) {
          console.error(
            "[PROJECT_DELETE] Failed to delete assets from Cloudinary:",
            cloudinaryError
          )
        }
      }

      // 2. DATABASE REMOVAL: Delete the project record
      await prisma.project.delete({
        where: { id },
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROJECT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
