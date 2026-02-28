import { GeminiModel } from "@/llm/model";
import { generateObject } from "ai";
import { z } from "zod";
import { formatInspirationsForPrompt } from "@/inspirations/registry";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deductCredits, calculateTextCost, getOrResetCredits } from "@/lib/credits";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, projectId } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Preliminary Credit Check (5,000 credits reserve)
    const userCredits = await getOrResetCredits(session.user.id);
    if (userCredits < 5000) {
        return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS", message: "Minimum 5,000 credits required for outline generation." }), { 
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
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
            description: z.string().describe("DETAILED visual and stylistic guide. Must specify if an image is needed, the EXACT image prompt if so, the layout structure (sidebar, bento, etc.), and maintain theme/font/color consistency with all other slides."),
            content: z.string().describe("COMPREHENSIVE textual content for this slide. Should be detailed and ready for the final slide."),
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
         - **Visual Prompt (Description)**: A COMPREHENSIVE design guide. It MUST decide if an image is needed, provide the detailed prompt for it, specify the layout (e.g. Sidebar, Bento), and ensure total visual cohesion (same theme, colors, fonts) with the rest of the storyboard.
         - **Content**: The full, detailed text that will occupy the slide.
      
      ### 🍱 DESIGN INSPIRATIONS & REFERENCE ARCHITECTURES (Agency-Level Examples):
      ${designInspirations}
      
      ### 📋 RULES FOR THE ARCHITECT:
      - Use the inspirations only IF NEEDED (e.g., if the user's prompt matches a high-end corporate or creative style).
      - If you use an inspiration, adapt its structure and narrative density to the user's topic.
      - If the user's prompt is simple or very specific, focus on a direct, clear narrative flow without over-engineering.
      - **CRITICAL**: The 'description' for each slide MUST be a professional design blueprint. It should specify the layout (Sidebar, Bento, etc.), if an image is required (including its detailed prompt), and ensure stylistic harmony (theme, fonts, colors) across all slides.
      `,
    });

    // Calculate Dynamic Credit Cost
    const totalText = object.title + object.description + object.slides.map(s => s.title + s.description + s.content).join("");
    const finalTextCost = calculateTextCost(totalText);

    // Final Deduction
    try {
        await deductCredits(session.user.id, finalTextCost);
        console.log(`[OUTLINE_GEN] Deducted ${finalTextCost} credits for ${totalText.length} characters.`);
    } catch (err: any) {
        if (err.message === "INSUFFICIENT_CREDITS") {
            return new Response(JSON.stringify({ error: "INSUFFICIENT_CREDITS" }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // Format slides for DB structure
    const formattedSlides = object.slides.map((s, idx) => ({
      id: idx + 1,
      title: s.title,
      description: s.description,
      content: s.content,
      html: "" 
    }));

    // Persist to DB if projectId is provided
    if (projectId) {
      try {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: {
            title: object.title,
            description: object.description,
            slides: formattedSlides,
          },
        });
        return Response.json(updatedProject);
      } catch (dbError) {
        console.error("Failed to update project in DB:", dbError);
        // Fallback: return generated object if DB fails but generation succeeded
        return Response.json({ ...object, slides: formattedSlides });
      }
    }

    return Response.json({ ...object, slides: formattedSlides });
  } catch (error) {
    console.error("Outline Generation Error:", error);
    return new Response("Outline Generation Failed", { status: 500 });
  }
}
