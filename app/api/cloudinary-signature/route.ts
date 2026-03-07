import { getCloudinarySignature } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

/**
 * GET: Generates a secure authentication signature for Cloudinary.
 * This allows the client-side (browser) to upload files directly to Cloudinary 
 * without exposing secret API keys in the frontend.
 */
export async function GET() {
  try {
    const data = await getCloudinarySignature()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in cloudinary-signature GET:", error)
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Internal Server Error: ${error instanceof Error ? error.message : String(error)}`
            : "Internal Server Error",
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { stack: error.stack }),
      },
      { status: 500 }
    )
  }
}
