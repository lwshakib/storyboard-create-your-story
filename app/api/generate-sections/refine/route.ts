import { generateObject, generateText } from "@/llm/generate-text"
import { generateHtmlStoryboardPrompt } from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import { generateImage } from "@/llm/generate-image"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import {
  deductCredits,
  COST_PER_IMAGE,
  calculateTextCost,
  getOrResetCredits,
} from "@/lib/credits"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const {
      prompt: initialPrompt,
      context,
      projectId,
      index,
    } = await req.json()

    if (!initialPrompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    if (!projectId || typeof index !== "number") {
      return new Response("projectId and index are required", { status: 400 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Preliminary Credit Check (10,000 credits reserve)
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 10000) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "Minimum 10,000 credits required for slide refinement.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    console.log("[SECTION_GEN] Initializing iterative generation loop...")

    const inspirations = formatInspirationsForPrompt()
    const systemPrompt = generateHtmlStoryboardPrompt(inspirations)

    let currentHtml = ""
    const stepResults: { action: string; status: string; result?: unknown; error?: string }[] = []
    let isFinished = false
    let loopCount = 0
    const MAX_STEPS = 5

    // Action Registry - maps AI actions to execution logic
    const handlers: Record<string, (decision: { action: string; thought: string; args?: { imagePrompt?: string } }) => Promise<void>> = {
      GENERATE_IMAGE: async (decision) => {
        try {
          // Deduct credits for image generation
          await deductCredits(session.user.id, COST_PER_IMAGE)

          const res = await generateImage({
            prompt: decision.args?.imagePrompt || decision.thought,
            width: 1792,
            height: 1024,
          })
          stepResults.push({
            action: "GENERATE_IMAGE",
            status: "SUCCESS",
            result: res,
          })
          console.log(
            `[SECTION_GEN] Deducted ${COST_PER_IMAGE} credits for image generation.`
          )
        } catch (err: unknown) {
          console.error("[SECTION_GEN] Image generation failed:", err)
          stepResults.push({
            action: "GENERATE_IMAGE",
            status: "FAILED",
            error: String(err),
          })

          // Note: Credits are deducted upfront for the attempt
        }
      },
      GENERATE_HTML: async (decision) => {
        const result = await generateText({
          system: systemPrompt,
          prompt: `
            GENERATE_FINAL_CODE:
            User Task: ${initialPrompt}
            Assets and Previous Progress: ${JSON.stringify(stepResults, null, 2)}
            
            Write the COMPLETE HTML for this slide. Ensure you use the image URLs from the assets above.
            
            SYNTHESIS MANDATE: DO NOT copy the source text verbatim. Instead, synthesize the narrative into a professional slide hierarchy (Headline, Sub-headline, 3-5 key bullet points/stats). Focus on high-fidelity, cinematic quality. Output ONLY the HTML document.
          `,
          temperature: 0.7,
        })
        currentHtml = result.text
        stepResults.push({
          action: "GENERATE_HTML",
          status: "SUCCESS",
          result: "HTML code updated in memory",
        })
      },
      END: async () => {
        isFinished = true
      },
    }

    while (!isFinished && loopCount < MAX_STEPS) {
      loopCount++
      console.log(`[SECTION_GEN] Starting loop iteration ${loopCount}...`)

      const step = await generateObject({
        schema: z.object({
          action: z.enum(["GENERATE_IMAGE", "GENERATE_HTML", "END"]),
          thought: z
            .string()
            .describe("What the AI is thinking about the current progress"),
          args: z.any().optional().describe("Arguments for the chosen action"),
        }),
        prompt: `
          GOAL: Generate a high-fidelity, agency-level storyboard slide.
          USER_PROMPT: ${initialPrompt}
          PROJECT_CONTEXT: ${context}
          
          PREVIOUS_ACTIONS_AND_RESULTS:
          ${JSON.stringify(stepResults, null, 2)}
          
          CURRENT_HTML: ${currentHtml ? "Present" : "Not yet generated"}
 
          INSTRUCTIONS:
          1. Evaluate the progress. If you need a cinematic background or specific visuals, use GENERATE_IMAGE.
          2. If you have all assets, use GENERATE_HTML to write the code.
          3. If the code is perfect and contains all assets, choose END.
          4. ALWAYS prioritize high-end design (8K, cinematic, professional layouts).
        `,
      })

      const decision = step.object as { action: string; thought: string; args?: { imagePrompt?: string } }
      console.log(
        `[SECTION_GEN] Iteration ${loopCount} Decision: ${decision.action} | Thought: ${decision.thought}`
      )

      const handler = handlers[decision.action]
      if (handler) {
        await handler(decision)
      } else {
        console.warn(
          `[SECTION_GEN] No handler found for action: ${decision.action}`
        )
        isFinished = true // Safety break
      }
    }

    const extractHtml = (text: string) => {
      let clean = text.trim()
      clean = clean
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
      clean = clean
        .replace(/<slide-\d+[^>]*>/gi, "")
        .replace(/<\/slide-\d+>/gi, "")
      clean = clean
        .replace(/<structured-data>[\s\S]*?<\/structured-data>/gi, "")
        .trim()

      const htmlDocRegex =
        /(<!DOCTYPE html[\s\S]*?<\/html>|<html[\s\S]*?<\/html>)/i
      const docMatch = clean.match(htmlDocRegex)
      if (docMatch) return docMatch[1].trim()

      const firstAngle = clean.indexOf("<")
      const lastAngle = clean.lastIndexOf(">")
      if (firstAngle !== -1 && lastAngle !== -1 && lastAngle > firstAngle) {
        return clean.substring(firstAngle, lastAngle + 1).trim()
      }
      return clean
    }

    let htmlOutput = extractHtml(currentHtml)

    // Deduct final HTML text cost
    if (htmlOutput) {
      const textCost = calculateTextCost(htmlOutput)
      try {
        await deductCredits(session.user.id, textCost)
        console.log(
          `[SECTION_GEN] Deducted ${textCost} credits for ${htmlOutput.length} characters of HTML.`
        )
      } catch (err) {
        console.error("[SECTION_GEN] Failed to deduct final text credits:", err)
      }
    }

    if (!htmlOutput || !htmlOutput.includes("<")) {
      console.warn(
        "[SECTION_GEN] Warning: Generated HTML is empty or invalid. Using fallback."
      )
      htmlOutput = `<div id="preview-root" class="w-[960px] h-[540px] flex items-center justify-center bg-muted/10 text-muted-foreground p-20 text-center flex-col gap-4">
            <h1 class="text-3xl font-black uppercase">Partial Creation</h1>
            <p class="max-w-md opacity-60">The generation loop finished but the HTML output was malformed. Please try refining again.</p>
        </div>`
    }

    // PERSIST TO DATABASE
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (project) {
        const slides = project.slides as { html?: string }[]
        if (slides[index]) {
          slides[index].html = htmlOutput
          await prisma.project.update({
            where: { id: projectId },
            data: { slides: slides },
          })
          console.log(
            `[SECTION_GEN] Successfully saved refined HTML for slide ${index + 1} to database.`
          )
        }
      }
    } catch (saveError) {
      console.error("[SECTION_GEN] Database save error:", saveError)
    }

    return new Response(JSON.stringify({ html: htmlOutput }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[SECTION_GEN] Fatal Error:", error)
    return new Response("Failed to generate section", { status: 500 })
  }
}
