import { streamText } from "ai";
import { GeminiModel } from "@/llm/model";
import { generateHtmlStoryboardPrompt } from "@/llm/prompts";
import { tools } from "@/llm/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, theme } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    console.log("Generating HTML Storyboard with prompt:", prompt, "and theme:", theme);
    
    // Fetch design inspirations from registry
    const { formatInspirationsForPrompt } = await import("@/llm/inspirations/registry");
    const inspirations = formatInspirationsForPrompt();

    const result = await streamText({
      model: GeminiModel(),
      system: generateHtmlStoryboardPrompt(theme, inspirations),
      prompt: prompt,
      tools,
      toolChoice: 'auto',
      maxSteps: 10,
    } as any);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Failed to generate storyboard", { status: 500 });
  }
}
