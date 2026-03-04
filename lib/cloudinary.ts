/**
 * Centralized Cloudinary integration for both Client and Server.
 * Server-only logic is dynamically imported to avoid breaking the browser bundle.
 */

/**
 * Server-side: Generates a signed upload signature.
 * Only call this from API routes or Server Actions.
 */
export const getCloudinarySignature = async (
  folder: string = "storyboard-architect"
) => {
  if (typeof window !== "undefined") {
    throw new Error("getCloudinarySignature must be called on the server")
  }

  const { v2: cloudinary } = await import("cloudinary")

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
  }
}

/**
 * Server-side: Uploads a Buffer (or base64 string) to Cloudinary.
 * Only call this from API routes or Server Actions.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    resource_type?: "image" | "video" | "raw" | "auto"
  } = {}
) => {
  if (typeof window !== "undefined") {
    throw new Error("uploadBufferToCloudinary must be called on the server")
  }

  const { v2: cloudinary } = await import("cloudinary")

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return new Promise<{
    secure_url: string
    public_id: string
    resource_type: string
  }>((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "storyboard-architect",
      public_id: options.public_id,
      resource_type: options.resource_type || "auto",
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error)
        else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          })
        } else reject(new Error("Cloudinary upload failed: No result returned"))
      }
    )

    if (typeof buffer === "string") {
      // If it's a base64 string or URL, we can use a different method or just pipe it
      // But for simplicity, we'll assume the caller passes a Buffer or let Cloudinary handle strings
      cloudinary.uploader
        .upload(buffer, uploadOptions)
        .then((result) =>
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          })
        )
        .catch(reject)
    } else {
      uploadStream.end(buffer)
    }
  })
}

/**
 * Client-side: Uploads a file directly to Cloudinary using a signed request.
 * This fetches a fresh signature from our API before each upload.
 */
export const uploadFileToCloudinary = async (
  file: File,
  signal?: AbortSignal
) => {
  // 1. Get the signature from our API
  const sigRes = await fetch("/api/cloudinary-signature")
  if (!sigRes.ok) {
    throw new Error("Failed to get upload signature")
  }
  const signature = await sigRes.json()

  // 2. Prepare the Cloudinary upload request
  const uploadApi = `https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", signature.apiKey)
  formData.append("timestamp", signature.timestamp.toString())
  formData.append("signature", signature.signature)
  formData.append("folder", signature.folder)

  // 3. Perform the upload
  const uploadRes = await fetch(uploadApi, {
    method: "POST",
    body: formData,
    signal,
  })

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json()
    console.error("Cloudinary upload error:", errorData)
    throw new Error("Cloudinary upload failed")
  }

  const data = await uploadRes.json()
  return {
    secureUrl: data.secure_url as string,
    publicId: data.public_id as string,
    resourceType: data.resource_type as string,
  }
}

/**
 * Server-side: Deletes an asset from Cloudinary by its public ID.
 * Only call this from API routes or Server Actions.
 */
export const deleteFromCloudinary = async (publicId: string) => {
  if (typeof window !== "undefined") {
    throw new Error("deleteFromCloudinary must be called on the server")
  }

  const { v2: cloudinary } = await import("cloudinary")

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

/**
 * Server-side: Deletes multiple assets from Cloudinary by their public IDs.
 * Only call this from API routes or Server Actions.
 */
export const deleteMultipleFromCloudinary = async (publicIds: string[]) => {
  if (typeof window !== "undefined") {
    throw new Error("deleteMultipleFromCloudinary must be called on the server")
  }

  if (publicIds.length === 0) return

  const { v2: cloudinary } = await import("cloudinary")

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(publicIds, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}
