import fs from "fs"
import path from "path"

/**
 * Interface representing an individual slide within an inspiration template.
 */
export interface InspirationSlide {
  title: string      // The human-readable title of the slide
  html: string       // The raw HTML/CSS content of the slide
  description?: string // AI-friendly description of visual/layout goals
  content?: string     // The narrative or text content for the slide
}

/**
 * Interface representing a full presentation template (inspiration).
 */
export interface InspirationPresentation {
  name: string        // Directory name of the inspiration
  title: string       // Display title for the template
  description: string // High-level description of the template's purpose
  slides: InspirationSlide[] // Array of slides belonging to this template
}

// Resolve the absolute path to the 'inspirations' directory in the project root
const INSPIRATIONS_DIR = path.join(process.cwd(), "inspirations")

/**
 * Retrieves and processes all slides for a specific presentation directory.
 * @param presentationName The folder name within 'inspirations/'
 */
function getPresentationSlides(presentationName: string): InspirationSlide[] {
  const presentationPath = path.join(INSPIRATIONS_DIR, presentationName)
  const slides: InspirationSlide[] = []

  // Ensure the directory exists before attempting to read
  if (
    !fs.existsSync(presentationPath) ||
    !fs.statSync(presentationPath).isDirectory()
  )
    return []

  // Load the optional 'outline.json' which metadata for the slides
  const outlinePath = path.join(presentationPath, "outline.json")
  let outline: {
    slides?: Array<{ title?: string; description?: string; content?: string }>
  } | null = null
  
  if (fs.existsSync(outlinePath)) {
    outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"))
  }

  // Find all .html files, ignoring metadata and subdirectories
  const files = fs
    .readdirSync(presentationPath)
    .filter((f) => f.endsWith(".html"))
    .sort((a, b) => {
      // Numerical sort: slide-1.html comes before slide-10.html
      const numA = parseInt(a.match(/\d+/)?.[0] || "0")
      const numB = parseInt(b.match(/\d+/)?.[0] || "0")
      return numA - numB
    })

  // Iterate through each HTML file to build slide objects
  for (const [index, file] of files.entries()) {
    const filePath = path.join(presentationPath, file)
    const html = fs.readFileSync(filePath, "utf8")

    // Map metadata from outline.json to the current slide based on index
    const slideOutline = outline?.slides?.[index]
    const title =
      slideOutline?.title || file.replace(".html", "").replace(/-/g, " ")

    slides.push({
      title,
      html,
      description: slideOutline?.description,
      content: slideOutline?.content,
    })
  }

  return slides
}

/**
 * Scans the 'inspirations/' directory and returns a registry of all templates.
 */
export const getInspirations = (): InspirationPresentation[] => {
  // Gracefully exit if the directory doesn't exist
  if (!fs.existsSync(INSPIRATIONS_DIR)) return []

  // List all subdirectories inside the inspirations folder
  const presentations = fs.readdirSync(INSPIRATIONS_DIR).filter((item) => {
    const p = path.join(INSPIRATIONS_DIR, item)
    return fs.statSync(p).isDirectory()
  })

  // Map each directory to a full InspirationPresentation object
  return presentations.map((presName) => {
    const presPath = path.join(INSPIRATIONS_DIR, presName)
    const outlinePath = path.join(presPath, "outline.json")
    
    // Default metadata derived from the folder name
    let title = presName.replace(/-/g, " ")
    let description = `High-fidelity presentation template: ${title}`

    // Override defaults with values from outline.json if it exists
    if (fs.existsSync(outlinePath)) {
      try {
        const outline = JSON.parse(fs.readFileSync(outlinePath, "utf8"))
        title = outline.title || title
        description = outline.description || description
      } catch (e) {
        console.error(`Error parsing outline.json for ${presName}:`, e)
      }
    }

    return {
      name: presName,
      title,
      description,
      slides: getPresentationSlides(presName),
    }
  })
}

/**
 * Formats all inspiration data into a clean text block for inclusion in LLM prompts.
 * This helps the AI understand the architectural and CSS patterns used in premium designs.
 */
export const formatInspirationsForPrompt = (): string => {
  const inspirations = getInspirations()
  let output = "### 🍱 Premium Design Inspirations (Agency-Level Examples):\n\n"

  /**
   * Helper to strip actual image URLs from HTML strings.
   * This reduces prompt size and prevents the AI from becoming overly focused on specific asset URLs.
   */
  const stripImages = (html: string) => {
    return html
      .replace(/src="[^"]*"/g, 'src=""') // Empty standard img src
      .replace(/url\(['"]?.*?['"]?\)/g, "none") // Remove background images in CSS
      .replace(/https?:\/\/image\.pollinations\.ai\/[^"'\s]*/g, "") // Target specific AI image providers
      .replace(/background-image:\s*url\('[^']*'\)/g, "background-image: none") // Explicit CSS property cleanup
  }

  // Build the formatted string
  inspirations.forEach((pres) => {
    output += `#### Presentation: ${pres.title}\n`
    output += `Overall Description: ${pres.description}\n`
    
    pres.slides.forEach((slide, idx) => {
      output += `\n**Example Slide ${idx + 1}: ${slide.title.toUpperCase()}**\n`
      if (slide.description)
        output += `*Design Concept:* ${slide.description}\n`
      if (slide.content) output += `*Core Content:* ${slide.content}\n`
      
      // The HTML structure is the most critical part for the AI to learn from
      output += `*HTML Structure:*\n${stripImages(slide.html)}\n`
    })
    output += "\n---\n\n"
  })

  return output
}
