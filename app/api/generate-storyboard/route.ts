import { GeminiModel } from "@/llm/model";
import { generateObject } from "ai";
import { z } from "zod";
import { generateImageTool } from "@/llm/tools";
import { StoryTemplates } from "@/lib/templates-data";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Serialize templates to provide context/inspiration
    // We remove the 'thumbnail' to save tokens as it's not needed for generation logic
    const templatesContext = StoryTemplates.map(t => ({
      title: t.title,
      description: t.description,
      slides: t.slides
    }));

    const { object } = await generateObject({
      model: GeminiModel(),
      schema: z.object({
        title: z.string(),
        slides: z.array(
          z.object({
            id: z.number(),
            bgColor: z.string().optional(),
            bgImage: z.string().optional(),
            elements: z.array(
              z.object({
                id: z.string(),
                type: z.enum([
                  "text", "image", "shape", "table", 
                  "bar-chart", "pie-chart", "line-chart", "area-chart", "radar-chart", "radial-chart"
                ]),
                content: z.any().optional(),
                x: z.number(),
                y: z.number(),
                width: z.number(),
                height: z.number(),
                fontSize: z.number().optional(),
                fontWeight: z.string().optional(),
                color: z.string().optional(),
                fontFamily: z.string().optional(),
                textAlign: z.string().optional(),
                src: z.string().optional(),
                imagePrompt: z.string().optional(),
                shapeType: z.enum(["rectangle", "circle"]).optional(),
                opacity: z.number().optional(),
                // New fields for charts and tables
                tableData: z.array(z.array(z.object({ 
                  text: z.string(), 
                  isHeader: z.boolean().optional() 
                }))).optional(),
                tableBgColor: z.string().optional(),
                borderColor: z.string().optional(),
                chartData: z.array(z.object({ 
                  label: z.string(), 
                  value: z.number(), 
                  color: z.string().optional() 
                })).optional(),
                chartTitle: z.string().optional(),
              })
            ),
          })
        ),
      }),
      prompt: `
      You are an expert storyboard creator. 
      Generate a new storyboard based on this user prompt: "${prompt}".

      Here are some existing professional templates for inspiration on structure, layout, and content quality:
      ${JSON.stringify(templatesContext, null, 2)}

      GUIDELINES:
      - Create 3-5 high-quality slides.
      - Canvas size is 1024x576. Ensure all elements fit within this bound.
      - Use a mix of 'text', 'image', 'shape', 'table', and chart types ('bar-chart', 'pie-chart', etc.) where appropriate.
      - VISUAL STYLE: Use the provided templates as a quality benchmark. Aim for professional, clean, and visually appealing layouts.
      - **COLOR CONTRAST**: This is CRITICAL. Ensure high contrast between the background color and foreground elements (text, shapes). 
        - If the background is dark (e.g., black, dark blue), use light text/shapes (e.g., white, light gray).
        - If the background is light (e.g., white, cream), use dark text/shapes (e.g., black, dark gray).
        - NEVER use the same or similar colors for background and text.
      
      SPECIFIC ELEMENT RULES:
      - **Images**: MUST include a detailed 'imagePrompt' starting with "A professional photo/illustration of...".
      - **Tables**: Use 'tableData' structure (rows of cells). Use 'tableBgColor' and 'borderColor' to style them nicely (e.g., semi-transparent backgrounds, subtle borders).
      - **Charts**: Use 'chartData' (labels and values) and 'chartTitle'.
      - **Text**: Define fontSize, fontWeight, color, etc.
      
      Make the story compelling and the visuals stunning.
      `,
    });

    // Enriched generation: Generate images for image prompts
    for (const slide of object.slides) {
      for (const element of slide.elements) {
        if (element.type === 'image' && element.imagePrompt) {
          try {
            console.log(`Generating image for prompt: ${element.imagePrompt}`);
            const result = await (generateImageTool.execute as any)({
              prompt: element.imagePrompt,
              width: element.width || 1024,
              height: element.height || 1024,
            });
            if (result.success) {
              element.src = result.image;
            }
          } catch (error) {
            console.error("Failed to generate image for element:", error);
          }
        }
      }
    }

    return Response.json(object);
  } catch (error) {
    console.error("Generation error:", error);
    return new Response("Failed to generate storyboard", { status: 500 });
  }
}
