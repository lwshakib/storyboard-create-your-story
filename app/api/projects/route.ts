import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

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
        slides: slides || [],
        userId: session?.user?.id || null,
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

    // Delete all projects marked as deleted for this user (Empty Trash)
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
