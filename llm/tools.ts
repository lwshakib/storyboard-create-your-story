// Import Zod for payload validation and schema parsing
import { z } from "zod"
// Import our core wrapper interacting with Flux-Klein model
import { generateImage } from "./generate-image"

/**
 * Registry mapping tools that the generative agent can invoke mid-generation.
 */
export const tools = {
  // Define an assistant callable tool strictly named 'generateImage'
  generateImage: {
    // High-level description detailing when the agent should call this capability
    description:
      "Generates a high-quality, cinematic image for the storyboard based on a description.",
    // The structured schema map defining how the LLM parameters are parsed
    parameters: z.object({
      // The visual descriptor string prompt required to generate art
      prompt: z
        .string()
        .describe("The detailed description of the image to generate."),
      // Explicit optional image width defaulted to standard aspect 1024
      width: z
        .number()
        .default(1024)
        .describe("The width of the image in pixels."),
      // Explicit optional image height defaulted to standard aspect 1024
      height: z
        .number()
        .default(1024)
        .describe("The height of the image in pixels."),
    }),
    // Logic implementing the actions taken whenever the assistant calls this block
    execute: async (args: {
      prompt: string
      width?: number
      height?: number
    }) => {
      // Diagnostic console log noting internal trigger and parameters
      console.log(
        "[TOOL:generateImage] Generating image with prompt:",
        args.prompt
      )

      // Request generation from Flux and wait for the Cloudinary URL resolution
      const result = await generateImage({
        prompt: args.prompt,
        width: args.width || 1024, // Enforce standard width constraint
        height: args.height || 1024, // Enforce standard height constraint
      })

      // Trap error explicitly to throw a standardized system exception
      if (!result.success) {
        throw new Error(result.error || "Failed to generate image")
      }

      // Return a flat JSON dictionary consumed natively back to the LLM step-loop
      return {
        url: result.image, // External URL to standard output image
        publicId: result.publicId, // Data-asset locator
        prompt: result.prompt, // Logged prompt confirming actual request dispatched
      }
    },
  },
}

// Extracted valid Type references representing tool keys
export type ToolName = keyof typeof tools
