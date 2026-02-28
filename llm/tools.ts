import { Tool } from "ai"
import { z } from "zod"
import { generateImage } from "./generate-image"

export const generateImageTool: Tool = {
  description:
    "Generate high-quality, professional images using AI. Use this to create cinematic visuals, illustrations, and background photos for presentation slides. The tool produces fast, high-end content tailored to your specific design prompts.",
  inputSchema: z.object({
    prompt: z
      .string()
      .describe(
        "Detailed description of the image to generate. Be specific about style, composition, colors, subject, mood, and any other relevant details."
      ),
    width: z
      .number()
      .int()
      .min(256)
      .max(2048)
      .default(1024)
      .describe(
        "Width of the image in pixels. Supported: 1024 (1:1/9:16), 1792 (16:9)"
      ),
    height: z
      .number()
      .int()
      .min(256)
      .max(2048)
      .default(1024)
      .describe(
        "Height of the image in pixels. Supported: 1024 (1:1/16:9), 1792 (9:16)"
      ),
    negative_prompt: z
      .string()
      .optional()
      .describe("Things to avoid in the image"),
  }),
  execute: async ({
    prompt,
    width = 1024,
    height = 1024,
    negative_prompt = "",
  }) => {
    return await generateImage({
      prompt,
      width,
      height,
      negativePrompt: negative_prompt,
    })
  },
}

export const tools = {
  generateImage: generateImageTool,
}
