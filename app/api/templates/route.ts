import { NextResponse } from "next/server"
import { getTemplates } from "@/lib/templates"

/**
 * GET: Retrieves the list of available storyboard templates.
 * These are used as starting points for new projects.
 */
export async function GET() {
  try {
    const templates = getTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Failed to fetch templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}
