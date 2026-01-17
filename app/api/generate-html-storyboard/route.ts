import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { GeminiModel } from "@/llm/model";
import { generateHtmlStoryboardPrompt } from "@/llm/prompts";
import { tools } from "@/llm/tools";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { prompt, messages, theme } = await req.json();

    if (!prompt && (!messages || messages.length === 0)) {
      return new Response("Prompt or messages are required", { status: 400 });
    }

    console.log("Generating HTML Storyboard with theme:", theme);
    
    // Fetch design inspirations from registry
    const { formatInspirationsForPrompt } = await import("@/llm/inspirations/registry");
    const inspirations = formatInspirationsForPrompt();

    const result = streamText({
      model: GeminiModel(),
      system: generateHtmlStoryboardPrompt(theme, inspirations),
      messages: await convertToModelMessages(messages),
      tools,
      toolChoice: 'auto',
      stopWhen: stepCountIs(10),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Failed to generate storyboard", { status: 500 });
  }
}
