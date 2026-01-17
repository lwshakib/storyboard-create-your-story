import { GeminiModel } from "@/llm/model";
import { generateObject } from "ai";
import { z } from "zod";
import { generateImageTool } from "@/llm/tools";
import { StoryTemplates } from "@/lib/templates-data";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const templatesContext = StoryTemplates.map(t => ({
      title: t.title,
      description: t.description,
      slides: t.slides
    }));

    // Use a strict schema to prevent lazy AI behavior (no more placeholders!)
    const { object } = await generateObject({
      model: GeminiModel(),
      schema: z.object({
        title: z.string(),
        slides: z.array(
          z.object({
            id: z.number().describe("Slide ID, starting from 1"),
            bgColor: z.string().default("#ffffff"),
            elements: z.array(z.discriminatedUnion("type", [
              z.object({
                type: z.literal("text"),
                id: z.string().optional(),
                content: z.string(),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number(),
                fontSize: z.number().default(24),
                fontWeight: z.string().default("normal"),
                color: z.string().default("#000000"),
                textAlign: z.enum(["left", "center", "right"]).default("left")
              }),
              z.object({
                type: z.literal("image"),
                id: z.string().optional(),
                imagePrompt: z.string().describe("Mandatory high-quality prompt for AI image generation. NO placeholders."),
                src: z.string().default("").describe("Must be left empty, the engine will fill this."),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number()
              }),
              z.object({
                type: z.literal("shape"),
                id: z.string().optional(),
                shapeType: z.enum(["rectangle", "circle"]),
                color: z.string().default("#3b82f6"),
                opacity: z.number().default(1),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number()
              }),
              z.object({
                type: z.literal("table"),
                id: z.string().optional(),
                tableData: z.array(z.array(z.object({ text: z.string(), isHeader: z.boolean().optional() }))),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number()
              }),
              z.object({
                type: z.enum(["bar-chart", "pie-chart", "line-chart", "area-chart", "radar-chart", "radial-chart"]),
                id: z.string().optional(),
                chartTitle: z.string(),
                chartData: z.array(z.object({ label: z.string(), value: z.number(), color: z.string().optional() })),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number()
              })
            ]))
          })
        ),
      }),
      prompt: `
      You are an elite Storyboard Designer. Create a 5-slide professional storyboard about: "${prompt}".

      RULES FOR PROFESSIONALLY GENERATED IMAGES:
      1. Every 'image' element MUST have a highly descriptive 'imagePrompt'.
      2. NEVER use placeholder text in 'src'. Leave 'src' as an empty string. 
      3. Example prompt: "A cinematic, 3D render of a futuristic AI neural network in a glass laboratory, high-tech aesthetics, soft blue lighting, professional photography."

      VISUAL STANDARDS:
      - Use Modern Corporate Glassmorphism or Minimalist professional styles.
      - Ensure high contrast.
      - NO elements should overlap.
      - Slides must be numbered 1, 2, 3, 4, 5.

      CONTEXT:
      ${JSON.stringify(templatesContext, null, 2)}
      `,
    });

    // Post-processing: Auto-generate IDs for elements that don't have them
    object.slides.forEach((slide, slideIndex) => {
      slide.elements.forEach((el, elIndex) => {
        if (!el.id) {
          el.id = `slide-${slide.id}-el-${elIndex}-${Math.random().toString(36).substr(2, 9)}`;
        }
      });
    });

    // Enriched generation: All images in parallel
    const imageElements: any[] = [];
    object.slides.forEach(s => s.elements.forEach(el => {
        if (el.type === 'image' && el.imagePrompt) imageElements.push(el);
    }));

    if (imageElements.length > 0) {
      await Promise.all(imageElements.map(async (el) => {
        try {
          console.log(`[STORYBOARD_API] Calling generateImageTool with prompt: "${el.imagePrompt}"`);
          const result = await (generateImageTool.execute as any)({
            prompt: el.imagePrompt,
            width: el.width,
            height: el.height,
          });
          if (result.success) el.src = result.image;
          else el.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(el.imagePrompt)}`; // Fail-safe dynamic fallback
        } catch (e) {
          console.error("Image generation failed", e);
        }
      }));
    }

    return Response.json(object);
  } catch (error) {
    console.error("Generation Error:", error);
    return new Response("Generation Failed", { status: 500 });
  }
}
