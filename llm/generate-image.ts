import { v2 as cloudinary } from "cloudinary"
import { A4F_API_KEY } from "@/lib/env"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
  prompt: string
  width: number
  height: number
}

/**
 * Autonomous image generation function.
 * Handles API call to A4F and persistence to Cloudinary.
 */
export async function generateImage({
  prompt,
  width = 1024,
  height = 1024,
  negativePrompt = "",
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

    let imageBuffer: Buffer

    if (base64Image) {
      imageBuffer = Buffer.from(base64Image, "base64")
    } else if (imageUrl) {
      const imgResponse = await fetch(imageUrl)
      imageBuffer = Buffer.from(await imgResponse.arrayBuffer())
    } else {
      return {
        success: false,
        error: "No image in response",
        prompt,
        width,
        height,
      }
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string
      public_id: string
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "storyboard-app",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error)
            else if (result)
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              })
            else reject(new Error("Upload failed"))
          }
        )
        .end(imageBuffer)
    })

    return {
      success: true,
      url: uploadResult.secure_url,
      secure_url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
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
