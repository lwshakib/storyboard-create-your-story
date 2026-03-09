/**
 * Centralized Cloudinary integration for both Client and Server.
 * Server-only logic is dynamically imported to avoid breaking the browser bundle.
 */

/**
 * Server-side: Generates a signed upload signature.
 * Only call this from API routes or Server Actions.
 */
export const getCloudinarySignature = async (
  folder: string = "storyboard-architect" // Default destination folder in Cloudinary
) => {
  // Prevent execution on the client-side to avoid exposing secrets
  if (typeof window !== "undefined") {
    throw new Error("getCloudinarySignature must be called on the server")
  }

  // Dynamically import the cloudinary SDK only on the server
  const { v2: cloudinary } = await import("cloudinary")

  // Authenticate Cloudinary instance using the environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS connection
  })

  // Generate a Unix timestamp (in seconds) representing the current time
  const timestamp = Math.floor(Date.now() / 1000)
  // Create an HMAC SHA-1 signature based on the timestamp, folder string, and our secret
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  // Package and return the auth object required by the client to make a signed request
  return {
    signature, // The generated HMAC signature
    timestamp, // The timestamp string used to generate the signature
    folder, // The designated storage folder inside Cloudinary
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!, // Cloudinary instance name
    apiKey: process.env.CLOUDINARY_API_KEY!, // Public key
  }
}

/**
 * Server-side: Uploads a Buffer (or base64 string) to Cloudinary.
 * Only call this from API routes or Server Actions.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer | string, // The raw file content buffer or base64 string
  options: {
    folder?: string // Optional target folder
    public_id?: string // Optional specific name to assign
    resource_type?: "image" | "video" | "raw" | "auto" // Declare the file type, auto lets Cloudinary figure it out
  } = {}
) => {
  // Prevent execution on the client side
  if (typeof window !== "undefined") {
    throw new Error("uploadBufferToCloudinary must be called on the server")
  }

  // Import cloudinary module securely on the server
  const { v2: cloudinary } = await import("cloudinary")

  // Apply credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  // Wrap the callback-based uploader in a Promise for modern async/await usage
  return new Promise<{
    secure_url: string
    public_id: string
    resource_type: string
  }>((resolve, reject) => {
    // Construct the settings for the API route
    const uploadOptions = {
      folder: options.folder || "storyboard-architect", // Use standard folder or provided override
      public_id: options.public_id, // Pass explicit id
      resource_type: options.resource_type || "auto", // Default to auto-detect file parsing
    }

    // Initialize the upload stream connection to Cloudinary server
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        // Handle stream failures
        if (error) reject(error)
        else if (result) {
          // Resolve standard metadata returned on success
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          })
        } else reject(new Error("Cloudinary upload failed: No result returned")) // Edgecase defensive check
      }
    )

    // Differentiate between generic strings (URLs/Base64) and raw Buffers
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
        .catch(reject) // Error bubble-up
    } else {
      // Stream buffer chunk completely out and finalize stream
      uploadStream.end(buffer)
    }
  })
}

/**
 * Server-side: Alias for uploadBufferToCloudinary with simplified response.
 */
export const saveImageToCloudinary = async (
  buffer: Buffer, // Expected image data explicitly mapped as type Buffer
  folder: string = "storyboard-architect" // Target storage partition
) => {
  // Pass to the generic uploader ensuring image type parameter
  const result = await uploadBufferToCloudinary(buffer, {
    folder,
    resource_type: "image",
  })

  // Return just standard frontend-friendly mapped fields
  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

/**
 * Client-side: Uploads a file directly to Cloudinary using a signed request.
 * This fetches a fresh signature from our API before each upload.
 */
export const uploadFileToCloudinary = async (
  file: File, // File object uploaded from an HTML input
  signal?: AbortSignal // Signal used to cancel the fetch if a user aborts
) => {
  // 1. Get the signature from our custom local API route
  const sigRes = await fetch("/api/cloudinary-signature")
  // Throw standard error if the api is unreachable
  if (!sigRes.ok) {
    throw new Error("Failed to get upload signature")
  }
  // Convert response to JSON dictionary
  const signature = await sigRes.json()

  // 2. Prepare the Cloudinary specific direct upload API endpoint URL
  const uploadApi = `https://api.cloudinary.com/v1_1/${signature.cloudName}/upload`
  // Initialize generic form data payload
  const formData = new FormData()

  // 3. Construct form body for Cloudinary
  formData.append("file", file) // Attach the raw local file
  formData.append("api_key", signature.apiKey) // Provide site public key
  formData.append("timestamp", signature.timestamp.toString()) // Provide verification timestamp matching the signature
  formData.append("signature", signature.signature) // Provide secure signature computed on server side
  formData.append("folder", signature.folder) // Set the save directory parameter

  // 4. Perform the actual POST file transfer upload
  const uploadRes = await fetch(uploadApi, {
    method: "POST",
    body: formData, // the multipart content body
    signal, // Pass the kill signal
  })

  // Check upload delivery error state
  if (!uploadRes.ok) {
    // Decode underlying API error to console for debugging
    const errorData = await uploadRes.json()
    console.error("Cloudinary upload error:", errorData)
    // Send basic failure state back up the UI handler
    throw new Error("Cloudinary upload failed")
  }

  // Parse success dataset from JSON return block
  const data = await uploadRes.json()

  // Return standardized dataset shape out to consumer functions
  return {
    secureUrl: data.secure_url as string, // HTTPS public link
    publicId: data.public_id as string, // Reference ID string
    resourceType: data.resource_type as string, // "image" or "video" designation
  }
}

/**
 * Server-side: Deletes an asset from Cloudinary by its public ID.
 * Only call this from API routes or Server Actions.
 */
export const deleteFromCloudinary = async (publicId: string) => {
  // Restrict execution
  if (typeof window !== "undefined") {
    throw new Error("deleteFromCloudinary must be called on the server")
  }

  // Init SDK
  const { v2: cloudinary } = await import("cloudinary")

  // Construct config details
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  // Execute deletion wrapping callback async operation as a Promise
  return new Promise((resolve, reject) => {
    // Delete target artifact using ID string
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error)
        reject(error) // Handle fail states
      else resolve(result) // Resolve raw success context
    })
  })
}

/**
 * Server-side: Deletes multiple assets from Cloudinary by their public IDs.
 * Only call this from API routes or Server Actions.
 */
export const deleteMultipleFromCloudinary = async (publicIds: string[]) => {
  // Ensure the library calls aren't exposed to the client
  if (typeof window !== "undefined") {
    throw new Error("deleteMultipleFromCloudinary must be called on the server")
  }

  // Exit early to prevent API spamming if array is empty
  if (publicIds.length === 0) return

  // Import library module asynchronously
  const { v2: cloudinary } = await import("cloudinary")

  // Hydrate auth configs
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  // Execute the deletion mapping command in bulk wrap with a promise
  return new Promise((resolve, reject) => {
    // Pass the batch string array and standard callback handling
    cloudinary.api.delete_resources(publicIds, (error, result) => {
      if (error)
        reject(error) // Forward failure flag
      else resolve(result) // Return success results array map
    })
  })
}
