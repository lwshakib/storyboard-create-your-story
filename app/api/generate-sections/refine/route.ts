import { generateText } from "@/llm/generate-text"
import { generateObject } from "@/llm/generate-object"
import { generateHtmlStoryboardPrompt } from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import { generateImage } from "@/lib/a4f"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromCloudinary } from "@/lib/cloudinary"
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

    // 1. PRE-FETCH SLIDE DATA for Context, Reuse & Cleanup
    const allSlides = await prisma.slide.findMany({
      where: { projectId: projectId },
      orderBy: { index: "asc" }
    })
    
    // 2. Identify Theme Context (The first slide that actually has code sets the theme)
    const themeDriver = allSlides.find(s => s.html && s.html.length > 50)
    const themeContext = themeDriver 
      ? `THEME TEMPLATE FROM SLIDE ${themeDriver.index + 1}:\n${themeDriver.html}` 
      : ""

    const inspirations = formatInspirationsForPrompt()
    const systemPrompt = generateHtmlStoryboardPrompt(inspirations, themeContext)

    const targetSlide = allSlides[index]
    const existingAssets = (targetSlide?.assets as any[]) || []
    const existingPrompt = targetSlide?.prompt || ""

    let currentHtml = targetSlide?.html || ""
    const stepResults: {
      action: string
      status: string
      result?: unknown
      error?: string
    }[] = []
    let isFinished = false
    let loopCount = 0
    const MAX_STEPS = 5

    // Action Registry - maps AI actions to execution logic
    const handlers: Record<
      string,
      (decision: {
        action: string
        thought: string
        args?: { imagePrompt?: string }
      }) => Promise<void>
    > = {
      GENERATE_IMAGE: async (decision) => {
        try {
          // Deduct credits for image generation
          await deductCredits(session.user.id, COST_PER_IMAGE)

          const res = await generateImage({
            prompt: decision.args?.imagePrompt || decision.thought,
            width: 1792,
            height: 1024,
          })

          // Fetch the specific slide to link assets
          const slides = await prisma.slide.findMany({
            where: { projectId: projectId },
            orderBy: { index: "asc" }
          })
          const targetSlide = slides[index]

          // Save to Asset Json field on slide (Temporary accumulation)
          if (res.success && res.publicId && res.secure_url && targetSlide) {
            const currentAssetsRes = await prisma.slide.findUnique({
              where: { id: targetSlide.id },
              select: { assets: true }
            })
            const currentAssets = (currentAssetsRes?.assets as any[]) || []
            const newAssets = [
              ...currentAssets, 
              { publicId: res.publicId, url: res.secure_url, type: res.resourceType || "image" }
            ]
            
            await prisma.slide.update({
              where: { id: targetSlide.id },
              data: { assets: newAssets },
            })
            console.log(
              `[SECTION_GEN] Added ${res.publicId} to assets tracking for slide ${targetSlide.id}.`
            )
          }

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
      GENERATE_HTML: async () => {
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
        system: systemPrompt,
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
          
          SLIDE_HISTORY:
          - Previous Refinement Prompt: ${existingPrompt || "None"}
          - Available Assets (URLs you can reuse): ${JSON.stringify(existingAssets.map(a => a.url), null, 2)}

          PREVIOUS_ACTIONS_AND_RESULTS:
          ${JSON.stringify(stepResults, null, 2)}
          
          CURRENT_HTML: ${currentHtml ? "Present" : "Not yet generated"}
 
          INSTRUCTIONS:
          1. Evaluate the progress. 
          2. REUSE existing assets from the "Available Assets" list if they fit the vision.
          3. Only use GENERATE_IMAGE if the existing assets are insufficient or the user requested a fresh start.
          4. If you have all assets, use GENERATE_HTML to write the code.
          5. If the code is perfect and contains all assets, choose END.
          6. ALWAYS prioritize high-end design (8K, cinematic, professional layouts).
        `,
      })

      const decision = step.object as {
        action: string
        thought: string
        args?: { imagePrompt?: string }
      }
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

    // PERSIST TO DATABASE & CLEANUP
    try {
      if (targetSlide) {
        // 1. ANALYZE USED ASSETS
        const finalAssetsRes = await prisma.slide.findUnique({
          where: { id: targetSlide.id },
          select: { assets: true }
        })
        const allPossibleAssets = (finalAssetsRes?.assets as any[]) || []
        
        // Find URLs present in the HTML
        const usedAssets = allPossibleAssets.filter(asset => 
          htmlOutput.includes(asset.url)
        )
        const unusedAssets = allPossibleAssets.filter(asset => 
          !htmlOutput.includes(asset.url)
        )

        // 2. PURGE ORPHANED ASSETS FROM CLOUDINARY
        if (unusedAssets.length > 0) {
          const publicIdsToPurge = unusedAssets.map(a => a.publicId)
          try {
            await deleteMultipleFromCloudinary(publicIdsToPurge)
            console.log(`[SECTION_GEN] Purged ${publicIdsToPurge.length} unused assets from Cloudinary for slide ${targetSlide.id}.`)
          } catch (purgeErr) {
            console.error("[SECTION_GEN] Cloudinary purge failed:", purgeErr)
          }
        }

        // 3. UPDATE DB
        await prisma.slide.update({
          where: { id: targetSlide.id },
          data: { 
            html: htmlOutput,
            prompt: initialPrompt,
            assets: usedAssets // Only keep what's actually in the HTML
          }
        })
        console.log(
          `[SECTION_GEN] Successfully saved refined HTML, prompt, and optimized assets for slide ${index + 1} (${targetSlide.id}).`
        )
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
