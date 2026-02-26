import { Tool } from "ai";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { A4F_API_KEY } from "@/lib/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    console.log(`[GENERATOR] Running Image Tool for prompt: "${prompt}"`);
    if (!A4F_API_KEY) {
      throw new Error("Missing A4F_API_KEY");
    }

    try {
      const response = await fetch(
        "https://api.a4f.co/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${A4F_API_KEY}`,
          },
          body: JSON.stringify({
            model: "provider-4/imagen-3.5",
            prompt,
            n: 1,
            size: `${width}x${height}`
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      const base64Image = data.data?.[0]?.b64_json;
      const imageUrl = data.data?.[0]?.url;

      let imageBuffer: Buffer;

      if (base64Image) {
        imageBuffer = Buffer.from(base64Image, "base64");
      } else if (imageUrl) {
        const imgResponse = await fetch(imageUrl);
        imageBuffer = Buffer.from(await imgResponse.arrayBuffer());
      } else {
        throw new Error("No image generated in response");
      }

      // Upload buffer to Cloudinary
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
        secure_url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        prompt,
        width,
        height,
        model: "provider-4/imagen-3.5",
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
