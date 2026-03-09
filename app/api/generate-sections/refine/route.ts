import { generateObject } from "@/llm/generate-object"
import { generateHtmlStoryboardPrompt } from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"
import { tools } from "@/llm/tools"
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
      : ""

    const inspirations = formatInspirationsForPrompt()
    const systemPrompt = generateHtmlStoryboardPrompt(inspirations, themeContext)

    const targetSlide = allSlides[index]
    const existingAssets = (targetSlide?.assets as any[]) || []
    const existingPrompt = targetSlide?.prompt || ""

    // 3. EXECUTE AGENTIC GENERATION
    const result = await generateObject({
      schema: z.object({
        html: z.string().describe("The final full high-fidelity HTML code for the slide."),
      }),
      messages: [
        { role: "system", content: systemPrompt },
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
            3. Use 'generateImage' if you need NEW cinematic visuals.
            4. Synthesize the narrative into professional design.
            5. Provide the full HTML document within the 'html' field.
          `,
        },
      ],
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
      temperature: 0.4, // Slightly more deterministic for HTML structure
    })

    const finalObject = result.object as { html: string }
    console.log("[SECTION_GEN] Final Object from AI:", JSON.stringify(finalObject, null, 2))

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

    const htmlOutput = extractHtml(finalObject?.html)
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

    // Sync final state
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

    return new Response(JSON.stringify({ html: htmlOutput }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[SECTION_GEN] Fatal Error:", error)
    return new Response("Failed to generate section", { status: 500 })
  }
}
