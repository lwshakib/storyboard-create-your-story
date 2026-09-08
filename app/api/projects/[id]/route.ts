import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromS3 } from "@/lib/s3"

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
 * S3 assets are automatically purged to save storage space.
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
        include: { slides: true },
      })

      if (currentProject) {
        // Find slide IDs that exist in the DB but NOT in the incoming update
        const incomingIds = new Set(
          (slides as { id?: string }[])
            .map((s) => s.id)
            .filter((id) => typeof id === "string")
        )
        const removedSlides = currentProject.slides.filter(
          (s) => !incomingIds.has(s.id)
        )

        // Extract assets (images) from these removed slides
        const assetsToPurge = removedSlides.flatMap(
          (s) => (s.assets as { key?: string; url?: string }[]) || []
        )
        if (assetsToPurge.length > 0) {
          const keys = assetsToPurge
            .map((a) => a.key || a.url)
            .filter((k): k is string => !!k)
          try {
            // Permanently remove files from S3
            await deleteMultipleFromS3(keys)
            console.log(
              `[PROJECT_PATCH] Purged ${keys.length} assets for ${removedSlides.length} removed slides from S3.`
            )
          } catch (err) {
            console.error("[PROJECT_PATCH] Asset purge failed:", err)
          }
        }
      }
    }

    // 2. DATABASE UPDATE: Update project fields and preserve slide IDs
    if (slides && Array.isArray(slides)) {
      const currentProject = await prisma.project.findUnique({
        where: { id },
        include: { slides: true },
      })

      if (currentProject) {
        const existingSlideIds = new Set(currentProject.slides.map((s) => s.id))
        const incomingIds = new Set(
          (slides as { id?: string }[])
            .map((s) => s.id)
            .filter((slideId): slideId is string => typeof slideId === "string")
        )

        // Slides that were genuinely removed
        const slidesToDelete = currentProject.slides.filter(
          (s) => !incomingIds.has(s.id)
        )

        await prisma.$transaction(async (tx) => {
          if (slidesToDelete.length > 0) {
            await tx.slide.deleteMany({
              where: { id: { in: slidesToDelete.map((s) => s.id) } },
            })
          }

          for (let idx = 0; idx < slides.length; idx++) {
            const s = slides[idx] as {
              id?: string
              title?: string
              description?: string
              prompt?: string
              html?: string
              assets?: { url: string; key?: string }[]
            }

            if (s.id && existingSlideIds.has(s.id)) {
              await tx.slide.update({
                where: { id: s.id },
                data: {
                  index: idx,
                  title: s.title,
                  description: s.description,
                  prompt: s.prompt,
                  html: s.html,
                  assets: s.assets || [],
                },
              })
            } else {
              await tx.slide.create({
                data: {
                  projectId: id,
                  index: idx,
                  title: s.title || "New Slide",
                  description: s.description || "",
                  prompt: s.prompt || "",
                  html: s.html || "",
                  assets: s.assets || [],
                },
              })
            }
          }

          await tx.project.update({
            where: { id },
            data: {
              title,
              description,
              isDeleted,
              deletedAt:
                isDeleted === false ? null : isDeleted ? new Date() : undefined,
            },
          })
        })
      }
    } else {
      await prisma.project.update({
        where: { id },
        data: {
          title,
          description,
          isDeleted,
          deletedAt:
            isDeleted === false ? null : isDeleted ? new Date() : undefined,
        },
      })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: {
            index: "asc",
          },
        },
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
        slides: true,
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

      // 1. ASSET PURGE: Remove all S3 assets associated with this project's slides
      const allAssets = project.slides.flatMap(
        (slide) => (slide.assets as { key?: string; url?: string }[]) || []
      )
      if (allAssets.length > 0) {
        const keys = allAssets
          .map((asset) => asset.key || asset.url)
          .filter((k): k is string => !!k)
        // Perform S3 cleanup, let it throw if it fails to prevent orphaned assets
        await deleteMultipleFromS3(keys)
        console.log(
          `[PROJECT_DELETE] Automatically cleared ${keys.length} assets from S3 for project ${id}.`
        )
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
