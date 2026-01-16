import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const project = await prisma.project.findUnique({
      where: {
        id,
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
        headers: await headers()
    })
    
    const body = await req.json()
    const { title, slides, isDeleted } = body
    const {id} = await params;

    const project = await prisma.project.update({
      where: {
        id,
        userId: session?.user?.id
      },
      data: {
        title,
        slides,
        isDeleted,
        deletedAt: isDeleted === false ? null : undefined
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
        headers: await headers()
    })
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id, userId: session.user.id }
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
                deletedAt: new Date()
            }
        })
    } else {
        // Permanent delete: Remove from DB
        await prisma.project.delete({
            where: { id }
        })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PROJECT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
