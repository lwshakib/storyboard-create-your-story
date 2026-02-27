import { GeminiModel } from "@/llm/model";
import { generateObject } from "ai";
import { z } from "zod";
import { formatInspirationsForPrompt } from "@/inspirations/registry";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const designInspirations = formatInspirationsForPrompt();

    const { object } = await generateObject({
      model: GeminiModel(),
      schema: z.object({
        title: z.string(),
        description: z.string(),
        slides: z.array(
          z.object({
            title: z.string(),
            description: z.string().describe("A HIGHLY DETAILED visual prompt for image generation. Describe lighting, camera angle, mood, and cinematic quality (e.g. 'Wide cinematic shot of...')."),
            content: z.string().describe("Main textual content for this slide"),
          })
        ),
      }),
      prompt: `
      You are an elite Content Strategist and Storyboard Outline Designer. 
      Create a detailed outline for a storyboard about: "${prompt}".
      
      The outline should have:
      1. A compelling title for the whole storyboard.
      2. A brief overall description.
      3. A set of 5-7 slides, each with:
         - **Title**: A short, punchy title.
         - **Visual Prompt**: A HIGHLY DETAILED description of the visual/concept. This will be used as a prompt for a high-end image generator. Mention lighting (e.g., 'soft morning light', 'vibrant neon'), composition (e.g., 'low angle shot', 'extreme close-up'), and style (e.g., 'minimalist industrial', 'vibrant 3D abstract').
         - **Content**: The actual text content that will appear on the slide.
      
      ### 🍱 DESIGN INSPIRATIONS & REFERENCE ARCHITECTURES (Agency-Level Examples):
      ${designInspirations}
      
      ### 📋 RULES FOR THE ARCHITECT:
      - Use the inspirations only IF NEEDED (e.g., if the user's prompt matches a high-end corporate or creative style).
      - If you use an inspiration, adapt its structure and narrative density to the user's topic.
      - If the user's prompt is simple or very specific, focus on a direct, clear narrative flow without over-engineering.
      - **CRITICAL**: The 'description' for each slide MUST be a professional image prompt. Avoid generic terms like 'a picture of'. Instead use 'Photorealistic cinematic shot...', 'Macro photography of...', 'Abstract glassmorphism rendering...'.
      `,
    });

    return Response.json(object);
  } catch (error) {
    console.error("Outline Generation Error:", error);
    return new Response("Outline Generation Failed", { status: 500 });
  }
}
