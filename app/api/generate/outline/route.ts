import { generateObject } from "@/llm/generate-object"

export const dynamic = "force-dynamic"
import { OUTLINE_AND_HTML_SYSTEM_PROMPT } from "@/llm/prompts"
import { getInspirationsMetadata } from "@/inspirations/registry"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { deductCredits, getOrResetCredits } from "@/lib/credits"

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
    if (!prompt) return new Response("Prompt is required", { status: 400 })

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return new Response("Unauthorized", { status: 401 })

    // 1. Credit Check
    const userCredits = await getOrResetCredits(session.user.id)
    if (userCredits < 1) {
      return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Generate Outline Schema (Plain JSON Object as per documentation)
    const jsonSchema = {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Executive title of the presentation deck.",
        },
        description: {
          type: "string",
          description:
            "High-level strategic narrative and executive summary of the presentation.",
        },
        visualTheme: {
          type: "string",
          description:
            "A technical description of the presentation's visual DNA (background hex, card styling, accent colors, typography).",
        },
        slides: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "Punchy, executive slide title (e.g., 'Executive Summary: The Compute Bottleneck', 'Q4 Key Performance Indicators').",
              },
              prompt: {
                type: "string",
                description:
                  "Structured markdown Visual Blueprint detailing the layout geometry, cards, typography, and Lucide icons.",
              },
              description: {
                type: "string",
                description:
                  "Full, detailed presentation narrative and talking points containing real metrics, domain-specific insights, and concrete takeaways. Zero dummy text.",
              },
              html: {
                type: "string",
                description:
                  "Complete, self-contained presentation HTML starting with <div id='preview-root' class='w-[960px] h-[540px] ...'>. Must have header zone (badge + title + subtitle), structured body cards with Lucide icons and substantive text, and bottom footer bar. Strictly 960x540, no overflow, zero dummy content, zero emojis.",
              },
            },
            required: ["title", "prompt", "description", "html"],
          },
        },
      },
      required: ["title", "description", "slides"],
    }

    const { object } = await generateObject({
      jsonSchema,
      messages: [
        {
          role: "system",
          content:
            OUTLINE_AND_HTML_SYSTEM_PROMPT +
            `\n\nDesign Styles Available:\n${getInspirationsMetadata()}`,
        },
        {
          role: "user",
          content: `Create a complete, executive presentation-grade slide deck for: "${prompt}".

THEME & COLOR DECISION:
- Analyze the user prompt to determine whether an Executive LIGHT mode (bg-[#F8FAFC] with crisp slate-900 typography, clean white cards with subtle borders) or an Executive DARK mode (bg-[#0B0F17] with white typography, glass cards) is best suited for this topic.
- If the user explicitly asks for light or dark colors, follow their instruction. Otherwise, choose the mode that best represents the industry (e.g. Healthcare, Clean Tech, ESG, Education, HR, Consumer usually favor crisp Light Mode; Cybersecurity, DevOps, AI, Crypto favor sleek Dark Mode).
- Apply this theme mode consistently across ALL slides in the deck.

Generate 5–7 presentation slides following standard deck flow:
1. Executive Cover / Title Slide
2. Executive Summary & Market Problem / Friction
3. Core Solution & Strategic Pillars
4. Key Performance Indicators & Traction (Bento Grid)
5. Deep Dive / Technical Architecture / Comparative Matrix
6. Phased Execution Roadmap & Milestones
7. Strategic Conclusion & Next Steps / Ask

CRITICAL REQUIREMENTS:
- Every slide must contain authentic, substantive, domain-specific presentation copy with concrete metrics (e.g. +142% YoY, $18.5M ARR, 99.99% SLA), clear arguments, and bold-led bullet points.
- ZERO dummy text, ZERO placeholder copy ("Lorem ipsum", "Section description goes here", "Card title"), and ZERO empty cards.
- Render complete, production-ready HTML for every slide within the strict 960x540 canvas with clean presentation hierarchy (Header badge + title + subtitle, structured body cards with Lucide icons, and footer metadata bar).`,
        },
      ],
      temperature: 0.8,
    })

    // 3. Deduct Credit
    await deductCredits(session.user.id, 1)

    // 4. Persistence with markdown asterisk sanitization
    const cleanHtml = (str: string) => {
      if (!str) return ""
      return str
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="font-bold text-white">$1</strong>'
        )
        .replace(/(?<!\*)\*([^*\n<]+)\*(?!\*)/g, '<em class="italic">$1</em>')
        .replace(/\*\*/g, "")
    }

    const cleanText = (str: string) => {
      if (!str) return ""
      return str.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*\*/g, "")
    }

    const reindexedSlides = (
      (object.slides as {
        title: string
        prompt: string
        description: string
      }[]) || []
    ).map((s, idx: number) => ({
      index: idx,
      title: cleanText(s.title) || `Slide ${idx + 1}`,
      prompt: s.prompt || "Executive presentation layout",
      description:
        cleanText(s.description) || "Presentation narrative and key takeaways",
      html: cleanHtml((s as { html?: string }).html || ""),
      assets: [],
    }))

    if (!projectId) {
      return Response.json({ ...object, slides: reindexedSlides })
    }

    // 5. Cleanup & Regeneration
    // First, fetch existing slides to purge their S3 assets
    const existingSlides = await prisma.slide.findMany({
      where: { projectId },
      select: { assets: true },
    })

    const assetKeysToPurge: string[] = []
    existingSlides.forEach((slide) => {
      const assets = (slide.assets as Array<{ key?: string }>) || []
      assets.forEach((asset) => {
        if (asset.key) assetKeysToPurge.push(asset.key)
      })
    })

    if (assetKeysToPurge.length > 0) {
      const { deleteMultipleFromS3 } = await import("@/lib/s3")
      await deleteMultipleFromS3(assetKeysToPurge).catch((err) =>
        console.error("Failed to purge assets during regeneration:", err)
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: object.title,
        description: object.description,
        slides: {
          deleteMany: {},
          create: reindexedSlides,
        },
      },
      include: {
        slides: { orderBy: { index: "asc" } },
      },
    })

    return Response.json(updatedProject)
  } catch (error) {
    console.error("Outline Generation Error:", error)
    return new Response("Outline Generation Failed", { status: 500 })
  }
}
