import { generateSingleSlideText } from "@/llm/generate-text"

export const maxDuration = 120 // Mark as long-running for Vercel/Inngest if needed

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json()
    
    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    console.log("[SECTION_GEN] Refining section with prompt:", prompt)
    
    const htmlOutput = await generateSingleSlideText(prompt, context)


    return new Response(JSON.stringify({ html: htmlOutput }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[SECTION_GEN] Error:", error)
    return new Response("Failed to generate section", { status: 500 })
  }
}
