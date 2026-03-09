import { generateText } from "@/llm/generate-text"
import { STORYBOARD_SYSTEM_PROMPT } from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import { tools } from "@/llm/tools"

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

// High duration for agentic loops
export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const {
      prompt: initialPrompt,
      context,
      projectId,
      index,
    } = await req.json()

    if (!initialPrompt || !projectId || typeof index !== "number") {
      return new Response("Missing required fields", { status: 400 })
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    // 1. CREDIT RESERVE CHECK
    const userCredits = await getOrResetCredits(userId)
    if (userCredits < 1) {
      return new Response(
        JSON.stringify({
          error: "INSUFFICIENT_CREDITS",
          message: "Minimum 1 credit required.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    // 2. CONTEXT & THEME PREPARATION
    const allSlides = await prisma.slide.findMany({
      where: { projectId: projectId },
      orderBy: { index: "asc" }
    })
    
    const themeDriver = allSlides.find(s => s.html && s.html.length > 50)
    const themeContext = themeDriver 
      ? `THEME TEMPLATE FROM SLIDE ${themeDriver.index + 1}:\n${themeDriver.html}` 
      : "No theme established yet. Set the design language with this slide."

    const inspirations = formatInspirationsForPrompt()

    const targetSlide = allSlides[index]
    const existingAssets = (targetSlide?.assets as any[]) || []
    const existingPrompt = targetSlide?.prompt || ""

    const messages: any[] = [
      { role: "system", content: STORYBOARD_SYSTEM_PROMPT },
      { role: "system", content: `### 🍱 DESIGN INSPIRATIONS & REFERENCE ARCHITECTURES:\n${inspirations}` },
      { role: "system", content: `### 🏁 THEME CONTEXT:\n${themeContext}` },
      {
        role: "user",
        content: `
          USER_PROMPT: ${initialPrompt}
          PROJECT_CONTEXT: ${context}
          SLIDE_INDEX: ${index + 1}
          
          SLIDE_HISTORY:
          - Previous Refinement Prompt: ${existingPrompt || "None"}
          - Available Assets (URLs you can reuse): ${JSON.stringify(existingAssets.map(a => a.url), null, 2)}
          
          INSTRUCTIONS:
          1. Create a high-fidelity slide using HTML/Tailwind.
          2. REUSE existing assets if appropriate.
          3. Use 'generateImage' if you need NEW cinematic visuals. ALWAYS provide a detailed 'prompt', 'width', and 'height' based on the requested layout.
          4. SYNTHESIZE & CONSTRAIN: Do NOT copy long source text verbatim. Strictly limit body text to 2-3 short, impactful sentences. If the narrative is long, convert it into 2-3 bullet points or key metrics with icons.
          5. OVERFLOW PREVENTION: Ensure every element fits comfortably within the 960x540 container. Avoid pushing text to the edges (use padding). Ensure headlines do not exceed 2 lines.
          6. VERTICAL BALANCE: If using 'justify-center', ensure the total content height does not exceed 400px to accommodate padding and prevent 'pushing' elements out of view.
          7. IMPORTANT: Output ONLY the full HTML document for the slide. No preamble.
        `,
      },
    ]

    // 3. EXECUTE AGENTIC GENERATION
    const result = await generateText({
      messages,
      tools: {
        generateImage: {
          ...tools.generateImage,
          execute: async (args: any) => {
            const res = await tools.generateImage.execute(args)
            
            // Save asset to DB instantly
            if (res.url && targetSlide) {
              const currentAssetsRes = await prisma.slide.findUnique({
                where: { id: targetSlide.id },
                select: { assets: true }
              })
              const currentAssets = (currentAssetsRes?.assets as any[]) || []
              const newAssets = [
                ...currentAssets, 
                { publicId: res.publicId, url: res.url, type: "image", prompt: args.prompt }
              ]
              
              await prisma.slide.update({
                where: { id: targetSlide.id },
                data: { assets: newAssets },
              })
            }
            
            return res
          }
        }
      },
      maxSteps: 10,
      abortSignal: req.signal,
      temperature: 0.4, // Slightly more deterministic for HTML structure
    })

    const rawContent = result.text
    console.log("[SECTION_GEN] Final output from AI (length):", rawContent?.length)

    /**
     * CLEANUP & PERSISTENCE
     */
    const extractHtml = (text: string) => {
      if (!text || typeof text !== "string") return ""
      
      let clean = text.trim()
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim()

      const htmlDocRegex = /(<!DOCTYPE html[\s\S]*?<\/html>|<html[\s\S]*?<\/html>)/i
      const docMatch = clean.match(htmlDocRegex)
      if (docMatch) return docMatch[1].trim()

      const firstAngle = clean.indexOf("<")
      const lastAngle = clean.lastIndexOf(">")
      if (firstAngle !== -1 && lastAngle !== -1 && lastAngle > firstAngle) {
        return clean.substring(firstAngle, lastAngle + 1).trim()
      }
      return clean
    }

    const htmlOutput = extractHtml(rawContent)
    console.log("[SECTION_GEN] Extracted HTML (length):", htmlOutput?.length)

    // Validation: Ensure we actually got HTML
    if (!htmlOutput || !htmlOutput.includes("<")) {
      console.error("[SECTION_GEN] Model failed to output valid HTML.")
      return new Response(
        JSON.stringify({ error: "INTERNAL_SERVER_ERROR", message: "Failed to generate valid HTML content." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Deduct 1 credit for slide generation
    await deductCredits(userId, 1).catch(() => {})

    // 4. PERSIST FINAL OUTPUT
    if (targetSlide) {
      const finalAssetsRes = await prisma.slide.findUnique({
        where: { id: targetSlide.id },
        select: { assets: true }
      })
      const allPossibleAssets = (finalAssetsRes?.assets as any[]) || []
      
      const usedAssets = allPossibleAssets.filter(asset => htmlOutput.includes(asset.url))
      const unusedAssets = allPossibleAssets.filter(asset => !htmlOutput.includes(asset.url))

      // Purge unused
      if (unusedAssets.length > 0) {
        const publicIdsToPurge = unusedAssets.map(a => a.publicId)
        deleteMultipleFromCloudinary(publicIdsToPurge).catch(() => {})
      }

      await prisma.slide.update({
        where: { id: targetSlide.id },
        data: { 
          html: htmlOutput,
          prompt: initialPrompt,
          assets: usedAssets 
        }
      })
    }

    // Sync final project state
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { index: "asc" } } }
    })

    return new Response(JSON.stringify(updatedProject), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    if (req.signal.aborted || error.name === 'AbortError' || error.name === 'ResponseAborted' || error.message?.includes('aborted')) {
      console.log(`[REFINE] AI Refinement was stopped by user.`)
      return new Response("Operation cancelled", { status: 200 })
    }
    console.error("[REFINE] Fatal Error:", error)
    return new Response("Failed to refine section", { status: 500 })
  }
}
