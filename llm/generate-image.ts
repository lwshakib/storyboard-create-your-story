// Import required environment variables for Cloudflare and model API access
import { CLOUDFLARE_API_KEY, FLUX_KLEIN_WORKER_URL } from '@/lib/env';
// Import utility function to save generated images to Cloudinary
import { saveImageToCloudinary } from '@/lib/cloudinary';

/**
 * Supported generation modes for the Flux Klein model.
 * - text-to-image: Standard image generation from text prompt.
 * - image-to-image: Modify an existing image based on a prompt.
 * - blend: Mix multiple images together.
 * - inpaint: Modify specific parts of an image using a mask.
 */
export type GenerateImageMode = 'text-to-image' | 'image-to-image' | 'blend' | 'inpaint';

/**
 * Options for generating an image.
 */
export interface GenerateImageOptions {
  /** The operation mode. Defaults to 'text-to-image'. */
  mode?: GenerateImageMode
  /** The textual description of the desired result. */
  prompt: string
  /** Input images for variations, blending, or inpainting. */
  images?: (Blob | Buffer | File)[]
  /** Mask for inpainting (White = change, Black = keep). */
  mask?: Blob | Buffer | File
  /** Influence of input image (0.0=original, 1.0=new). Defaults to 1.0. */
  strength?: number
  /** Output width. Defaults to 1024. */
  width?: number
  /** Output height. Defaults to 1024. */
  height?: number
  /** Optimization steps. Recommended 20-35. Defaults to 28. */
  steps?: number
  /** Set for deterministic/repeatable results. */
  seed?: number
}

/**
 * The result of an image generation operation.
 */
export interface GenerateImageResult {
  // Boolean flag indicating if generation was successful
  success: boolean
  /** The URL of the generated image (persisted in Cloudinary). */
  image?: string
  /** The Cloudinary public ID. */
  publicId?: string
  /** The prompt used for generation. */
  prompt: string
  /** The final width of the image. */
  width?: number
  /** The final height of the image. */
  height?: number
  /** The model name used. */
  model: string
  /** Error message if success is false. */
  error?: string
}

// Define the constant model name used in the generation
const MODEL_NAME = "FLUX.2 [klein] 9B"

/**
 * Generates or manipulates an image using the Flux Klein model.
 * Handles single prompt generation, image variations, and blending.
 *
 * @param options - Prompt, mode, and optional input images/masks.
 * @returns Object containing the Cloudinary URL and metadata.
 */
export const generateImage = async (
  options: GenerateImageOptions
): Promise<GenerateImageResult> => {
  // Destructure options with default fallbacks
  const {
    mode = "text-to-image",
    prompt,
    images = [],
    mask,
    strength = 1.0,
    width = 1024,
    height = 1024,
    steps = 28,
    seed,
  } = options

  // Validate presence of the Cloudflare API key
  if (!CLOUDFLARE_API_KEY) {
    console.error("[GENERATE_IMAGE] Missing CLOUDFLARE_API_KEY")
    // Return early with an error state if API key is missing
    return {
      success: false,
      error: "Missing CLOUDFLARE_API_KEY",
      prompt,
      model: MODEL_NAME,
    }
  }

  try {
    // Variable to hold the fetch response
    let response: Response

    // Determine if we should use JSON or FormData based on mode and inputs
    const isFormDataNeeded = mode !== "text-to-image" || images.length > 0 || !!mask

    if (!isFormDataNeeded) {
      // Simple Text-to-Image (JSON) workflow
      response = await fetch(FLUX_KLEIN_WORKER_URL!, {
        method: "POST", // POST request to the worker
        headers: {
          "Content-Type": "application/json", // Send payload as JSON
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`, // Authenticate using API Key
        },
        body: JSON.stringify({
          prompt, // User's prompt text
          width,  // Image width
          height, // Image height
          steps,  // Number of generation steps
          seed,   // Seed for reproducibility
        }),
      })
    } else {
      // Advanced Workflows requiring multipart/form-data
      const form = new FormData()
      form.append("prompt", prompt) // Append prompt string
      
      // Append numerical parameters if they exist
      if (width) form.append("width", width.toString())
      if (height) form.append("height", height.toString())
      if (steps) form.append("steps", steps.toString())
      if (seed !== undefined) form.append("seed", seed.toString())
      if (strength !== undefined) form.append("strength", strength.toString())

      // Loop through the input images array and append them to the form
      images.forEach((img, idx) => {
        // For common modes like blend, use image0, image1, etc.
        // For image-to-image, the first image is often just 'image'
        const key = idx === 0 && mode !== "blend" ? "image" : `image${idx}`
        form.append(key, img as Blob)
      })

      // If inpainting mode is selected and a mask is provided, append it
      if (mode === "inpaint" && mask) {
        form.append("mask", mask as Blob)
      }

      // Execute the POST request using FormData
      response = await fetch(FLUX_KLEIN_WORKER_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`, // Note: Content-Type is auto-set for FormData
        },
        body: form,
      })
    }

    // Check if the response was unsuccessful
    if (!response.ok) {
      // Read the backend error text
      const errorText = await response.text();
      console.error(`[GENERATE_IMAGE] API Error: ${response.status} - ${errorText}`);
      // Throw an error to be handled by the catch block
      throw new Error(`Image generation failed (${response.status}): ${errorText}`);
    }

    // Extract the raw image binary (image/png) from the response
    const arrayBuffer = await response.arrayBuffer();
    // Convert the array buffer into a Node Buffer object
    const imageBuffer = Buffer.from(arrayBuffer);

    // Persist resulting image to Cloudinary to get a stable URL for the frontend
    const uploadResult = await saveImageToCloudinary(imageBuffer);

    // Return the successful generation payload
    return {
      success: true,               // Flag success
      image: uploadResult.url,     // Accessible Cloudinary URL
      publicId: uploadResult.publicId, // Cloudinary identifier used for deletions/management
      prompt,                      // Echo the prompt used
      width,                       // Return generation width
      height,                      // Return generation height
      model: MODEL_NAME,           // Specify which model did the generation
    };
  } catch (error) {
    // Handle any exceptions during the fetch or upload process
    console.error('[GENERATE_IMAGE_EXCEPTION]', error);
    return {
      success: false, // Flag failure
      error:
        error instanceof Error
          ? error.message // Use standard error message
          : 'An unexpected error occurred during image generation', // Fallback error string
      prompt,
      model: MODEL_NAME,
    };
  }
};
