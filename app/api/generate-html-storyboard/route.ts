import { streamText } from "ai";
import { GeminiModel } from "@/llm/model";
import { generateHtmlStoryboardPrompt } from "@/llm/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const result = await streamText({
      model: GeminiModel(),
      system: generateHtmlStoryboardPrompt(),
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Failed to generate storyboard", { status: 500 });
  }
}
