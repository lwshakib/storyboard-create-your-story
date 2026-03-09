// Import Node's native file system module mapping
import fs from "fs"
// Import Node's path normalization utility
import path from "path"
// Import the core Slide data type to align with standard mapping variables
import { Slide } from "@/types/editor"

/**
 * Interface defining the high-level metadata of an imported inspiration storyboard set
 */
export interface Template {
  id: string // Internal identifier binding logic representation
  title: string // Rendered display title for the gallery view
  description: string // Details shown in the UI underneath the project
  thumbnail: string // Visual capture URL displayed mapping to the visual representation
  slides: Slide[] // Linear sequence arrays of layout objects mapping to HTML templates
}

// Compute the local hard-disk path resolving where the `inspirations` source directory sits
const INSPIRATIONS_DIR = path.join(process.cwd(), "inspirations")

/**
 * Crawls through the `/inspirations` root-level repository directory and constructs accessible Presentation templates.
 */
export function getTemplates(): Template[] {
  // Validate whether the inspirations file directory physically exists first
  if (!fs.existsSync(INSPIRATIONS_DIR)) {
    // Prevent hard crashes alerting developers if deployment didn't ship the asset map
    console.warn(`Inspirations directory not found at: ${INSPIRATIONS_DIR}`)
    return []
  }

  // Poll exactly what raw text-layer files reside in the base directory
  const items = fs.readdirSync(INSPIRATIONS_DIR)

  // Conditionally process files dropping anything that isn't functionally a sub-folder bucket
  const folders = items.filter((f) => {
    try {
      // Execute the query checking flag status representing physical folders over `.txt` variables
      return fs.statSync(path.join(INSPIRATIONS_DIR, f)).isDirectory()
    } catch {
      return false
    }
  })

  // Array map resolving each verified folder node sequentially into full abstract Template data layouts
  return folders.map((folder) => {
    // Lock onto the nested child folder location
    const folderPath = path.join(INSPIRATIONS_DIR, folder)
    // Check locally nested location for meta context files
    const outlinePath = path.join(folderPath, "outline.json")

    // Default abstract payload state
    let outline: {
      slides?: Array<{ title?: string; description?: string; content?: string }>
      title?: string
      description?: string
    } | null = null

    // Parse the template data json securely allowing optional override logic config values
    if (fs.existsSync(outlinePath)) {
      try {
        // Read file synchronizing the parsing routine mapped immediately over the object logic
        outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"))
      } catch (_e) {
        // Gracefully ignore misconfigured JSON documents avoiding halting rendering paths
        console.error(`Error parsing outline.json for ${folder}:`, _e)
      }
    }

    // Crawl sub-file bucket array matching only raw HTML template definitions
    const files = fs
      .readdirSync(folderPath) // Fetch flat index list
      .filter((f) => f.endsWith(".html")) // Keep only `.html` suffix types
      .sort((a, b) => {
        // Sort explicitly processing `1.html` preceding `10.html` naturally
        // Extract leading file numbering arrays logic sequences using regex expressions
        const numA = parseInt(a.match(/\d+/)?.[0] || "0")
        const numB = parseInt(b.match(/\d+/)?.[0] || "0")
        // Resolve ascending priority order parameter
        return numA - numB
      })

    // Walk linearly across all raw template layers constructing our defined Editor application state configurations maps
    const slides: Slide[] = files.map((file, index) => {
      // Decode HTML block representation text file strings fully
      const content = fs.readFileSync(path.join(folderPath, file), "utf8")
      // Extract first instance regex matching any <img > node
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/)
      // If we see an explicit image asset locally pull its mapped link address, fallback to placeholder URL block
      const bgImage = imgMatch
        ? imgMatch[1]
        : `https://placehold.co/800x450/0f172a/white?text=Slide+${index + 1}`

      // Pull isolated optional text properties for logic layout
      const slideOutline = outline?.slides?.[index]

      // Format complete Slide state representation
      return {
        id: index + 1, // Start indexed sequential id flags
        index: index, // Pure array order position
        html: content, // Direct HTML string source mapped to block
        // Re-construct string representation defaults filtering hyphen characters natively
        title:
          slideOutline?.title || file.replace(".html", "").replace(/-/g, " "),
        description: slideOutline?.description || "", // Pass configuration metadata descriptions specifically
        content: slideOutline?.content || "", // Include content mapped definition
        elements: [], // Internal layout structures not calculated structurally yet
        // Attach physical default images matching external link parameters
        assets: [
          {
            publicId: `temp-${index}`, // Internal ID parameter default flags
            url: bgImage, // Mapped target URI mapped
            type: "image", // Target layout metadata specific string definitions
          },
        ],
      }
    })

    // Try tracking explicit first thumbnail definition reference
    const firstSlideImage =
      slides.length > 0
        ? slides[0].assets?.[0]?.url
        : "https://placehold.co/800x450/0f172a/white?text=Template" // External default definition proxy route variable address

    // Aggregate entire directory layout map object mapping
    return {
      id: folder, // Local configuration bucket name string
      // Explicitly title text formatting normalizing configuration definition parameter map
      title:
        outline?.title ||
        folder
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Camel case parameter formatting
          .join(" "), // String block delimiter append map
      // Default abstract fallback description string map
      description:
        outline?.description ||
        `High-fidelity presentation template: ${folder.replace(/-/g, " ")}`,
      thumbnail:
        firstSlideImage ||
        "https://placehold.co/800x450/0f172a/white?text=Template", // Hard constraint reference variables
      // Link block mapping Slide instances generated parameters locally over files parameter
      slides,
    }
  })
}
