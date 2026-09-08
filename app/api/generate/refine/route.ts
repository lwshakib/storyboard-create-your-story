import { generateText } from "@/llm/generate-text"
import {
  STORYBOARD_SYSTEM_PROMPT,
  REFINE_USER_PROMPT_TEMPLATE,
} from "@/llm/prompts"
import { formatInspirationsForPrompt } from "@/inspirations/registry"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deleteMultipleFromS3 } from "@/lib/s3"
import { deductCredits, getOrResetCredits } from "@/lib/credits"

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
      orderBy: { index: "asc" },
    })

    const themeDriver = allSlides.find((s) => s.html && s.html.length > 50)
    const themeContext = themeDriver
      ? `THEME TEMPLATE FROM SLIDE ${themeDriver.index + 1}:\n${themeDriver.html}`
      : "No theme established yet. Set the design language with this slide."

    const inspirations = formatInspirationsForPrompt()

    const targetSlide = allSlides[index]
    const existingAssets = (targetSlide?.assets as { url: string }[]) || []
    const existingPrompt = targetSlide?.prompt || ""

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
        content: REFINE_USER_PROMPT_TEMPLATE(
          initialPrompt,
          context,
          index,
          existingPrompt,
          JSON.stringify(
            existingAssets.map((a) => a.url),
            null,
            2
          )
        ),
      },
    ]

    const result = await generateText({
      messages,
      abortSignal: req.signal,
      temperature: 0.4, // Slightly more deterministic for HTML structure
    })

    const rawContent = result.text
    console.log(
      "[SECTION_GEN] Final output from AI (length):",
      rawContent?.length
    )

    /**
     * CLEANUP & PERSISTENCE
     */
    const extractHtml = (text: string) => {
      if (!text || typeof text !== "string") return ""

      let clean = text
        .trim()
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim()

      // Convert **bold** markdown to <strong class="font-bold text-white">$1</strong>
      clean = clean
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="font-bold text-white">$1</strong>'
        )
        .replace(/(?<!\*)\*([^*\n<]+)\*(?!\*)/g, '<em class="italic">$1</em>')
        .replace(/\*\*/g, "")

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

    const htmlOutput = extractHtml(rawContent)
    console.log("[SECTION_GEN] Extracted HTML (length):", htmlOutput?.length)

    // Validation: Ensure we actually got HTML
    if (!htmlOutput || !htmlOutput.includes("<")) {
      console.error("[SECTION_GEN] Model failed to output valid HTML.")
      return new Response(
        JSON.stringify({
          error: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate valid HTML content.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Deduct 1 credit for slide generation
    await deductCredits(userId, 1).catch(() => {})

    // 4. PERSIST FINAL OUTPUT
    if (targetSlide) {
      const finalAssetsRes = await prisma.slide.findUnique({
        where: { id: targetSlide.id },
        select: { assets: true },
      })
      const allPossibleAssets =
        (finalAssetsRes?.assets as { url: string; key: string }[]) || []

      const usedAssets = allPossibleAssets.filter((asset) =>
        htmlOutput.includes(asset.url)
      )
      const unusedAssets = allPossibleAssets.filter(
        (asset) => !htmlOutput.includes(asset.url)
      )

      // Purge unused
      if (unusedAssets.length > 0) {
        const keysToPurge = unusedAssets.map((a) => a.key || a.url)
        deleteMultipleFromS3(keysToPurge).catch(() => {})
      }

      await prisma.slide.update({
        where: { id: targetSlide.id },
        data: {
          html: htmlOutput,
          prompt: initialPrompt,
          assets: usedAssets,
        },
      })
    }

    // Sync final project state
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { slides: { orderBy: { index: "asc" } } },
    })

    return new Response(JSON.stringify(updatedProject), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    const err = error as Error
    if (
      req.signal.aborted ||
      err.name === "AbortError" ||
      err.name === "ResponseAborted" ||
      err.message?.includes("aborted")
    ) {
      console.log(`[REFINE] AI Refinement was stopped by user.`)
      return new Response("Operation cancelled", { status: 200 })
    }
    console.error("[REFINE] Fatal Error:", error)
    return new Response("Failed to refine section", { status: 500 })
  }
}
