import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const project = await prisma.advancedProject.findUnique({
            where: {
                id: id,
                userId: session.user.id
            }
        })

        if (!project) {
            return new NextResponse("Not Found", { status: 404 })
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error("[ADVANCED_PROJECT_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { title, slides, isDeleted } = body

        const project = await prisma.advancedProject.update({
            where: {
                id: id,
                userId: session.user.id
            },
            data: {
                title,
                slides,
                isDeleted,
                deletedAt: isDeleted ? new Date() : null
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error("[ADVANCED_PROJECT_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        await prisma.advancedProject.delete({
            where: {
                id: id,
                userId: session.user.id
            }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[ADVANCED_PROJECT_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
