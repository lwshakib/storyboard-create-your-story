import { generateObject } from "@/llm/generate-object"
import { z } from "zod"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  deductCredits,
  getOrResetCredits,
} from "@/lib/credits"

// Allow long-running AI generation (up to 60s)
export const maxDuration = 60

/**
 * POST: Orchestrates the AI generation of a storyboard outline.
 * Process:
 * 1. Checks user credits (requires a 5,000 credit reserve).
 * 2. Uses an LLM to generate a structured JSON object (title, slides).
 * 3. Calculates the dynamic credit cost based on the generated text length.
 * 4. Deducts credits and persists the project structure to the database.
 */
export async function POST(req: Request) {
  try {
    const { prompt, projectId } = await req.json()

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    // 1. PRELIMINARY CREDIT CHECK: Ensure the user has enough 'fuel' to start
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 1) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "Minimum 1 credit required for outline generation.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // 2. INSPIRATION INJECTION: Pull agency-level design patterns from the registry
    const designInspirations = formatInspirationsForPrompt()

    // 3. AI GENERATION: Use 'generateObject' to enforce a strict JSON schema
    const outlineSchema = z.object({
      title: z.string(),
      description: z.string(),
      slides: z.array(
        z.object({
          title: z.string(),
          prompt: z
            .string()
            .describe(
              "DETAILED visual and stylistic guide. Must specify if an image is needed, the EXACT image prompt if so, the layout structure (sidebar, bento, etc.), and maintain theme/font/color consistency with all other slides."
            ),
          content: z
            .string()
            .describe(
              "COMPREHENSIVE textual content for this slide. Should be detailed and ready for the final slide."
            ),
        })
      ),
    })

    const { object } = (await generateObject({
      schema: outlineSchema,
      messages: [
        {
          role: "system",
          content: `You are a professional Content Architect. 
          Use the following design inspirations to guide the visual and structural descriptions of the slides:
          ${designInspirations}
          
          You output ONLY valid JSON following the provided schema. No markdown, no conversational filler.`,
        },
        {
          role: "user",
          content: `
          TASK: Create a detailed storyboard outline for: "${prompt}".
          
          REQUIRED STRUTURE (JSON):
          - title: string
          - description: string
          - slides: Array<{ title: string, prompt: string, content: string }>

          CONSTRAINTS:
          1. Provide 5-7 slides.
          2. Each slide 'prompt' must be a professional design blueprint (e.g., "A clean sidebar layout with a dark theme, using Roboto for headings. Key visual: a 3D icon of a globe.")
          3. Each slide 'content' must be the full narrative text.
          4. Ensure all slides follow a unified visual theme.
          5. NO markdown headers, NO conversational filler, ONLY the JSON object.
          `,
        },
      ],
      temperature: 0.7,
    })) as { object: z.infer<typeof outlineSchema> }


    // 4. DYNAMIC COST CALCULATION: Outline generation costs 1 credit
    const finalTextCost = 1

    // 5. CREDIT DEDUCTION: Finalize the payment
    try {
      await deductCredits(session.user.id, finalTextCost)
      console.log(
        `[OUTLINE_GEN] Deducted ${finalTextCost} credit for outline generation.`
      )
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // 6. DB PERSISTENCE: Save the new structure to the database
    const reindexedSlides = object.slides.map((s, idx: number) => ({
      index: idx,
      title: s.title,
      prompt: s.prompt,
      content: s.content,
      html: "",
      assets: []
    }))

    if (projectId) {
      try {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: {
            title: object.title,
            description: object.description,
            slides: {
              deleteMany: {}, // Clean slate for the new outline
              create: reindexedSlides
            },
          },
          include: {
            slides: {
              orderBy: { index: "asc" }
            }
          }
        })
        return Response.json(updatedProject)
      } catch (dbError) {
        console.error("Failed to update project in DB:", dbError)
        // Fallback: return generated object if DB fails but generation succeeded
        return Response.json({ ...object, slides: reindexedSlides })
      }
    }

    return Response.json({ ...object, slides: reindexedSlides })
  } catch (error) {
    console.error("Outline Generation Error:", error)
    return new Response("Outline Generation Failed", { status: 500 })
  }
}
