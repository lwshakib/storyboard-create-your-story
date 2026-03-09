import { generateImage } from "./llm/generate-image"
import * as fs from "fs"
import * as path from "path"

async function main() {
  const prompt =
    "A cinematic, ultra-wide web banner for an AI-powered storyboard and presentation builder application. Showcase a futuristic and creative workspace with multiple glowing slides, layout grids, and story panels floating in mid-air, connected by glowing digital data streams. Dark mode aesthetics, deep blues and neon purples, professional, clean, and sleek design. The scene conveys the magic of artificial intelligence turning raw ideas into beautiful, structured visual sequences."

  console.log("Requesting image generation...")

  const result = await generateImage({
    prompt,
    width: 1024,
    height: 384,
  })

  if (!result.success || !result.image) {
    console.error("Failed to generate image:", result.error)
    process.exit(1)
  }

  console.log(
    "Image successfully generated. Downloading from Cloudinary:",
    result.image
  )

  // Fetch the image from Cloudinary to save locally
  const response = await fetch(result.image)
  if (!response.ok) {
    console.error("Failed to download image from Cloudinary")
    process.exit(1)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Save to public folder
  const outputPath = path.join(process.cwd(), "public", "project-banner.png")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buffer)

  console.log(`Banner successfully saved to ${outputPath}`)
}

main().catch(console.error)
