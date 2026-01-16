import { Tool } from "ai";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { NEBIUS_API_KEY } from "@/lib/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const generateImageTool: Tool = {
  description:
    "Generate high-quality images using AI. Use this when the user explicitly asks to create, generate, or make an image, picture, photo, illustration, or artwork. The model used is Flux Schnell, which creates fast, high-quality images based on text prompts.",
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
      .describe("Width of the image in pixels"),
    height: z
      .number()
      .int()
      .min(256)
      .max(2048)
      .default(1024)
      .describe("Height of the image in pixels"),
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
    if (!NEBIUS_API_KEY) {
      throw new Error("Missing NEBIUS_API_KEY");
    }

    try {
      const response = await fetch(
        "https://api.tokenfactory.nebius.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NEBIUS_API_KEY}`,
          },
          body: JSON.stringify({
            model: "black-forest-labs/flux-schnell",
            response_format: "b64_json",
            response_extension: "png",
            width,
            height,
            num_inference_steps: 4,
            negative_prompt: negative_prompt || "",
            seed: -1,
            loras: null,
            prompt,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API error: ${response.statusText}`
        );
      }

      const data = await response.json();
      const base64Image = data.data?.[0]?.b64_json;

      if (!base64Image) {
        throw new Error("No image generated in response");
      }

      // Convert base64 to buffer and upload to Cloudinary
      const imageBuffer = Buffer.from(base64Image, "base64");
      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "storyboard-app",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve({
                  secure_url: result.secure_url,
                  public_id: result.public_id,
                });
              } else {
                reject(new Error("Upload returned no result"));
              }
            }
          )
          .end(imageBuffer);
      });

      return {
        success: true,
        image: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        prompt,
        width,
        height,
        model: "black-forest-labs/flux-schnell",
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        prompt,
      };
    }
  },
};

export const tools = {
  generateImage: generateImageTool,
};
