import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromCloudinary } from "@/lib/cloudinary"

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

    // ASSET CLEANUP FOR REMOVED SLIDES
    if (slides) {
      const currentProject = await prisma.project.findUnique({
        where: { id },
        include: { slides: true }
      })
      
      if (currentProject) {
        const incomingIds = new Set((slides as any[]).map(s => s.id).filter(id => typeof id === "string"))
        const removedSlides = currentProject.slides.filter(s => !incomingIds.has(s.id))
        
        const assetsToPurge = removedSlides.flatMap(s => (s.assets as any[]) || [])
        if (assetsToPurge.length > 0) {
          const publicIds = assetsToPurge.map(a => a.publicId)
          try {
            await deleteMultipleFromCloudinary(publicIds)
            console.log(`[PROJECT_PATCH] Purged ${publicIds.length} assets for ${removedSlides.length} removed slides.`)
          } catch (err) {
            console.error("[PROJECT_PATCH] Asset purge failed:", err)
          }
        }
      }
    }

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
          deleteMany: {},
          create: (slides as any[]).map((s, idx) => ({
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
      // Soft delete: Move to trash
      await prisma.project.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })
    } else {
      // Permanent delete: Remove from DB
      // 1. Delete associated Cloudinary assets from all slides
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

      // 2. Delete from DB (onDelete: Cascade will handle Asset records)
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
