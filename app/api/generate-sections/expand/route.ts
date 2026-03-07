import { generateObject } from "@/llm/generate-object"
import { generateHtmlStoryboardPrompt } from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  deductCredits,
  calculateTextCost,
  getOrResetCredits,
} from "@/lib/credits"

// Allow up to 60s for the AI to reason about the expansion
export const maxDuration = 60

/**
 * POST: Generates a NEW section (slide) for an existing project.
 * Unlike initial outline generation, this requires 'Theme Inheritance' logic 
 * to ensure the new slide looks like it belongs to the same deck.
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

    // 1. CREDIT CHECK: Expansion is a lightweight operation (2,000 credit reserve)
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 2000) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "Minimum 2,000 credits required for section expansion.",
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
      include: { slides: { orderBy: { index: "asc" } } }
    })

    if (!project) {
      return new Response("Project not found", { status: 404 })
    }

    const existingSlides = project.slides

    // 3. THEME INHERITANCE: Find a slide that already has HTML to use as a style template
    const themeDriver = existingSlides.find(s => s.html && s.html.length > 50)
    const themeContext = themeDriver 
      ? `THEME TEMPLATE FROM SLIDE ${themeDriver.index + 1}:\n${themeDriver.html}` 
      : ""
    
    const inspirations = formatInspirationsForPrompt()
    const systemPrompt = generateHtmlStoryboardPrompt(inspirations, themeContext)

    // 4. AI GENERATION: Create the new slide metadata
    const { object } = await generateObject<{
      title: string
      description: string
      content: string
    }>({
      system: systemPrompt,
      schema: z.object({
        title: z.string(),
        description: z.string(),
        content: z.string(),
      }),
      prompt: `
      You are an elite Content Strategist. 
      The user wants to add a NEW logical section (slide) to their storyboard.
      
      STORYBOARD CONTEXT:
      Title: ${project.title}
      Description: ${project.description}
      
      EXISTING SECTIONS:
      ${existingSlides.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join("\n")}
      
      TASK:
      Create ONE new section that logically follows or fits into this flow.
      Provide:
      1. A short, punchy title.
      2. A COMPREHENSIVE design guide (description). Must specify layout and visual style consistent with the rest.
      3. The full, detailed narrative text for the slide.
      `,
    })

    // 5. CREDIT DEDUCTION
    const totalText = object.title + object.description + object.content
    const textCost = calculateTextCost(totalText)
    await deductCredits(session.user.id, textCost)

    const newSlide = {
      title: object.title,
      description: object.description,
      content: object.content,
      html: "",
      prompt: ""
    }

    // 6. SPLICE & REINDEX: Insert the new slide into the correct position
    const updatedSlides = [...existingSlides] as any[]
    const insertIndex = typeof index === "number" ? index + 1 : updatedSlides.length
    updatedSlides.splice(insertIndex, 0, newSlide)

    const reindexedSlides = updatedSlides.map((s, i) => ({
      index: i,
      title: s.title,
      description: s.description,
      content: s.content,
      html: s.html || "",
      prompt: s.prompt || "",
      assets: s.assets || []
    }))

    // 7. DB PERSISTENCE
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        slides: {
          deleteMany: {}, // Clean wipe...
          create: reindexedSlides // ...and re-insert the expanded array
        },
      },
      include: {
        slides: {
          orderBy: { index: "asc" }
        }
      }
    })

    return Response.json(updatedProject)
  } catch (error) {
    console.error("Expand Section Error:", error)
    return new Response("Failed to expand section", { status: 500 })
  }
}
