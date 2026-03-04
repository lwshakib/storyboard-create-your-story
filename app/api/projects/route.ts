import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromCloudinary } from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const body = await req.json()
    const { title, slides, description } = body

    const project = await prisma.project.create({
      data: {
        title: title || "Untitled Storyboard",
        description: description || null,
        userId: session?.user?.id || null,
        slides: {
          create: (slides || []).map((slide: any, idx: number) => ({
            index: idx,
            title: slide.title || null,
            description: slide.description || null,
            content: slide.content || null,
            prompt: slide.prompt || null,
            html: slide.html || null,
          })),
        },
      },
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
    console.error("[PROJECTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isDeleted = searchParams.get("deleted") === "true"

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        isDeleted,
      },
      include: {
        slides: {
          orderBy: {
            index: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[PROJECTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 1. Fetch all projects to be deleted with their slides
    const trashProjects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        isDeleted: true,
      },
      include: {
        slides: true,
      },
    })

    // 2. Collect all assets from all slides of these projects
    const allPublicIds = trashProjects.flatMap(project => 
      project.slides.flatMap(slide => {
        const assets = (slide.assets as any[]) || []
        return assets.map(a => a.publicId).filter(Boolean)
      })
    )

    // 3. Purge from Cloudinary
    if (allPublicIds.length > 0) {
      try {
        await deleteMultipleFromCloudinary(allPublicIds)
        console.log(`[PROJECTS_DELETE_ALL] Purged ${allPublicIds.length} assets from Cloudinary during trash empty.`)
      } catch (err) {
        console.error("[PROJECTS_DELETE_ALL] Cloudinary purge failed:", err)
      }
    }

    // 4. Delete from DB
    await prisma.project.deleteMany({
      where: {
        userId: session.user.id,
        isDeleted: true,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROJECTS_DELETE_ALL]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
