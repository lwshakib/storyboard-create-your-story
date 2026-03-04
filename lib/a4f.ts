import { uploadBufferToCloudinary } from "@/lib/cloudinary"
import { A4F_API_KEY } from "@/lib/env"

export interface GenerateImageOptions {
  prompt: string
  width?: number
  height?: number
  negativePrompt?: string
}

export interface GenerateImageResult {
  success: boolean
  url?: string
  secure_url?: string
  publicId?: string
  error?: string
  resourceType?: string
  prompt: string
  width: number
  height: number
}

/**
 * Autonomous image generation function using the A4F API.
 * Handles API call to A4F and persistence to Cloudinary.
 */
export async function generateImage({
  prompt,
  width = 1024,
  height = 1024,
}: GenerateImageOptions): Promise<GenerateImageResult> {
  console.log(
    `[IMAGE_GEN] Generating | Prompt: "${prompt}" | Size: ${width}x${height}`
  )

  if (!A4F_API_KEY) {
    console.warn("[IMAGE_GEN] Missing A4F_API_KEY")
    return {
      success: false,
      error: "Missing A4F_API_KEY",
      prompt,
      width,
      height,
    }
  }

  // Snap to standard supported sizes
  const standardSizes = ["1024x1024", "1792x1024", "1024x1792"]
  let size = `${width}x${height}`
  if (!standardSizes.includes(size)) {
    size =
      width > height ? "1792x1024" : width < height ? "1024x1792" : "1024x1024"
  }

  try {
    const response = await fetch("https://api.a4f.co/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${A4F_API_KEY}`,
      },
      body: JSON.stringify({
        model: "provider-4/imagen-3.5",
        prompt,
        n: 1,
        size,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[IMAGE_GEN] API error (${response.status}):`, errorText)
      return {
        success: false,
        error: `API error: ${response.status}`,
        prompt,
        width,
        height,
      }
    }

    const data = await response.json()
    const base64Image = data.data?.[0]?.b64_json
    const imageUrl = data.data?.[0]?.url

    let imageInput: Buffer | string

    if (base64Image) {
      imageInput = Buffer.from(base64Image, "base64")
    } else if (imageUrl) {
      imageInput = imageUrl
    } else {
      return {
        success: false,
        error: "No image in response",
        prompt,
        width,
        height,
      }
    }

    // Upload to Cloudinary using centralized helper
    const uploadResult = await uploadBufferToCloudinary(imageInput, {
      folder: "storyboard-app",
      resource_type: "image",
    })

    return {
      success: true,
      url: uploadResult.secure_url,
      secure_url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      prompt,
      width,
      height,
    }
  } catch (error) {
    console.error("[IMAGE_GEN] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
      prompt,
      width,
      height,
    }
  }
}
