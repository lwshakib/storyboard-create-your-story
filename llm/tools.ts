import { z } from 'zod';
import { generateImage } from './generate-image';

export const tools = {
  generateImage: {
    description: 'Generates a high-quality, cinematic image for the storyboard based on a description.',
    parameters: z.object({
      prompt: z.string().describe('The detailed description of the image to generate.'),
      width: z.number().default(1024).describe('The width of the image in pixels.'),
      height: z.number().default(1024).describe('The height of the image in pixels.'),
    }),
    execute: async (args: { prompt: string; width?: number; height?: number }) => {
      console.log('[TOOL:generateImage] Generating image with prompt:', args.prompt);
      
      const result = await generateImage({
        prompt: args.prompt,
        width: args.width || 1024,
        height: args.height || 1024,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      return {
        url: result.image,
        publicId: result.publicId,
        prompt: result.prompt,
      };
    },
  },
};

export type ToolName = keyof typeof tools;
