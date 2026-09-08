import { generateText } from "@/llm/generate-text"

export const dynamic = "force-dynamic"
import {
  STORYBOARD_SYSTEM_PROMPT,
  EXPAND_USER_PROMPT_TEMPLATE,
} from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deductCredits, getOrResetCredits } from "@/lib/credits"

// Allow up to 90s for the AI to reason and generate full HTML
export const maxDuration = 90

/**
 * POST: Generates a NEW section (slide) for an existing project.
 * Now generates the full HTML directly using generateText.
 */
export async function POST(req: Request) {
  try {
    const { projectId, index } = await req.json()

    if (!projectId) {
      return new Response("projectId is required", { status: 400 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    // 1. CREDIT CHECK: Expansion costs 1 credit
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 1) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "Minimum 1 credit required for section expansion.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // 2. CONTEXT LOADING: Fetch existing slides to understand current narrative/theme
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { index: "asc" } } },
    })

    if (!project) {
      return new Response("Project not found", { status: 404 })
    }

    const existingSlides = project.slides

    // 3. THEME INHERITANCE: Find a slide that already has HTML to use as a style template
    const themeDriver = existingSlides.find((s) => s.html && s.html.length > 50)
    const themeContext = themeDriver
      ? `THEME TEMPLATE FROM SLIDE ${themeDriver.index + 1}:\n${themeDriver.html}`
      : "No theme established yet. Set the design language with this slide."

    const inspirations = formatInspirationsForPrompt()

    // 4. INSERTION CONTEXT: Determine what slides surround the new one
    const targetIdx =
      typeof index === "number" ? index : existingSlides.length - 1
    const prevSlide = existingSlides[targetIdx]
    const nextSlide = existingSlides[targetIdx + 1]

    const insertionContext = prevSlide
      ? `INSERT AFTER SLIDE ${targetIdx + 1}: "${prevSlide.title}"`
      : "INSERT AT START"

    const flowContext = nextSlide
      ? `This new section MUST bridge the transition BETWEEN:\n1. PREV SLIDE: "${prevSlide?.title}" (Description: ${prevSlide?.description})\nAND\n2. NEXT SLIDE: "${nextSlide.title}" (Description: ${nextSlide.description})`
      : `This new section follows "${prevSlide?.title}" (Description: ${prevSlide?.description}) and should continue the narrative flow to its next logic step.`

    const messages: Array<{
      role: "system" | "user" | "assistant"
      content: string
    }> = [
      { role: "system", content: STORYBOARD_SYSTEM_PROMPT },
      {
        role: "system",
        content: `###  Bento Grid & Reference Architectures:\n${inspirations}`,
      },
      { role: "system", content: `### 🏁 THEME CONTEXT:\n${themeContext}` },
      {
        role: "user",
        content: EXPAND_USER_PROMPT_TEMPLATE(
          project.title,
          project.description || "",
          insertionContext,
          flowContext,
          existingSlides.map((s, i) => `${i + 1}. ${s.title}`).join("\n"),
          targetIdx
        ),
      },
    ]

    // 5. AI GENERATION: Create the new slide HTML
    const result = await generateText({
      messages,
      abortSignal: req.signal,
      temperature: 0.8,
    })

    const htmlOutput = result.text
      .trim()
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/(?<!\*)\*([^*\n<]+)\*(?!\*)/g, '<em class="italic">$1</em>')
      .replace(/\*\*/g, "")

    // 6. CREDIT DEDUCTION
    await deductCredits(session.user.id, 1)

    // Helper to extract a title from the prompt or generated content if possible
    const newSlide = {
      title: "New Slide",
      description: "AI Generated Content",
      prompt: "Executive presentation slide layout",
      html: htmlOutput,
    }

    // 7. SPLICE & REINDEX: Insert the new slide into the correct position
    const updatedSlides = [...existingSlides] as unknown as {
      title: string
      prompt: string
      description: string
      html?: string
      assets?: {
        url: string
        publicId?: string
        type?: string
        prompt?: string
      }[]
    }[]
    const insertIndex =
      typeof index === "number" ? index + 1 : updatedSlides.length
    updatedSlides.splice(insertIndex, 0, newSlide)

    const reindexedSlides = updatedSlides.map((s, i) => ({
      index: i,
      title: s.title,
      description: s.description,
      prompt: s.prompt,
      html: s.html || "",
      assets: s.assets || [],
    }))

    // 8. DB PERSISTENCE
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        slides: {
          deleteMany: {}, // Clean wipe...
          create: reindexedSlides, // ...and re-insert the expanded array
        },
      },
      include: {
        slides: {
          orderBy: { index: "asc" },
        },
      },
    })

    return Response.json(updatedProject)
  } catch (error) {
    const err = error as Error
    if (
      req.signal.aborted ||
      err.name === "AbortError" ||
      err.name === "ResponseAborted" ||
      err.message?.includes("aborted")
    ) {
      console.log(`[EXPAND] AI Expansion was stopped by user.`)
      return new Response("Operation cancelled", { status: 200 })
    }
    console.error("[EXPAND] Fatal Error:", error)
    return new Response("Failed to expand section", { status: 500 })
  }
}
