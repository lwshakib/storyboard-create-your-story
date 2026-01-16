import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    const { title, slides } = await req.json()

    const project = await prisma.advancedProject.create({
      data: {
        title: title || "Advanced Storyboard",
        slides: slides,
        userId: session?.user?.id || null,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error("Failed to create advanced project:", error)
    return NextResponse.json({ error: "Failed to create advanced project" }, { status: 500 })
  }
}

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
          headers: await headers()
        })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const projects = await prisma.advancedProject.findMany({
            where: {
                userId: session.user.id,
                isDeleted: false
            },
            orderBy: {
                updatedAt: "desc"
            }
        })

        return NextResponse.json(projects)
    } catch (error) {
        console.error("Failed to fetch advanced projects:", error)
        return NextResponse.json({ error: "Failed to fetch advanced projects" }, { status: 500 })
    }
}
