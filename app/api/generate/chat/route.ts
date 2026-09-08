import { NextResponse } from "next/server"
import { streamText } from "@/llm/stream-text"
import { CHAT_REFINEMENT_SYSTEM_PROMPT } from "@/llm/prompts"
import { STORYBOARD_TOOLS } from "@/llm/tools"
import { Message } from "@/llm/types"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getOrResetCredits } from "@/lib/credits"
import { Content } from "@/llm/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 120

interface ProjectSlide {
  id: string
  title: string
  description: string
  prompt: string
  index: number
  html?: string
}

interface ProjectData {
  title: string
  description: string
  slides: ProjectSlide[]
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      projectId,
      message,
      history: chatHistory,
      projectData,
    }: {
      projectId: string
      message: string
      history: Message[]
      projectData: ProjectData
    } = await req.json()

    // 1. Credit Check
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 1) {
      return NextResponse.json(
        { error: "INSUFFICIENT_CREDITS" },
        { status: 403 }
      )
    }

    const slidesList = Array.isArray(projectData?.slides) ? projectData.slides : []
    const userContent = `PROJECT CONTEXT:
Title: ${projectData?.title || "Storyboard Project"}
Description: ${projectData?.description || ""}
Slides: ${JSON.stringify(
      slidesList.map((s, i: number) => ({
        index: i,
        id: s.id,
        title: s.title,
        description: s.description,
        prompt: s.prompt,
        html: s.html || "",
      })),
      null,
      2
    )}

USER FEEDBACK: "${message}"`

    const validHistory = (chatHistory || []).filter(
      (m) => m && typeof m.content === "string" && m.content.trim().length > 0
    )

    const contents: Content[] = [
      ...validHistory.map((m) => ({
        role: (m.role === "assistant" ? "model" : "user") as "model" | "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: userContent }] },
    ]

    const stream = streamText({
      contents,
      projectId,
      userId: session.user.id,
      systemInstruction: CHAT_REFINEMENT_SYSTEM_PROMPT,
      tools: STORYBOARD_TOOLS,
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Chat fatal error:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to process chat request",
      },
      { status: 500 }
    )
  }
}
