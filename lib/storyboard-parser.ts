import { Slide, SlideElement } from "@/types/editor"
import { colorToHex } from "./utils"

export interface HtmlSlide {
  id: number
  title: string
  html: string
  description?: string
  content?: string
  structuredSlide?: Slide // Optional structured version
}

export interface StoryboardData {
  title: string
  slides: HtmlSlide[]
}

/**
 * Converts AI-generated HTML slide into structured Slide elements
 * for better native exports (PPTX, PDF).
 * Using off-screen rendering for accurate coordinate and style extraction.
 */
/**
 * Converts AI-generated HTML slide into structured Slide elements
 * for better native exports (PPTX, PDF).
 * Using off-screen rendering for accurate coordinate and style extraction.
 */
export async function htmlToStructuredSlide(
  htmlSlide: HtmlSlide
): Promise<Slide> {
  // If we already have structured data from the AI parser, use it!
  if (htmlSlide.structuredSlide) {
    return htmlSlide.structuredSlide
  }

  if (typeof window === "undefined") {
    return {
      id: htmlSlide.id,
      elements: [],
      bgColor: "#ffffff",
      layout: "free",
    }
  }

  const container = document.createElement("div")
  // ... (rest of search/fallback logic)
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "-20000px",
    width: "1024px",
    height: "576px",
    zIndex: "-1",
    overflow: "hidden",
  })

  container.innerHTML = `
      <div id="capture-root" style="width: 1024px; height: 576px; position: relative; overflow: hidden; background: white; margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif;">
          <style>
              * { box-sizing: border-box !important; }
              body, html { margin: 0; padding: 0; background: white; width: 1024px; height: 576px; }
          </style>
          ${htmlSlide.html}
      </div>
  `

  document.body.appendChild(container)
  await new Promise((resolve) => setTimeout(resolve, 200))

  const root = container.querySelector("#capture-root") as HTMLElement
  const elements: SlideElement[] = []
  let bgColor = "#ffffff"
  let bgImage = ""

  const findBackground = (
    node: HTMLElement
  ): { color?: string; image?: string } => {
    const computed = window.getComputedStyle(node)
    let color = colorToHex(computed.backgroundColor)
    let image = ""
    const bg = computed.backgroundImage
    if (bg && bg !== "none") {
      if (bg.includes("url")) {
        const match = bg.match(/url\(["']?(.*?)["']?\)/)
        if (match) image = match[1]
      } else if (bg.includes("gradient")) {
        const colorMatch = bg.match(
          /#(?:[0-9a-fA-F]{3}){1,2}|rgb\(.*?\)|rgba\(.*?\)/
        )
        if (colorMatch) color = colorToHex(colorMatch[0])
      }
    }
    const isMeaningful =
      color &&
      color !== "rgba(0, 0, 0, 0)" &&
      color !== "transparent" &&
      color !== "#00000000"
    if (isMeaningful || image)
      return { color: isMeaningful ? color : undefined, image }
    for (const child of Array.from(node.children)) {
      if (child instanceof HTMLElement) {
        const childBg = findBackground(child)
        if (childBg.color || childBg.image) return childBg
      }
    }
    return {}
  }

  const bgRes = findBackground(root)
  if (bgRes.color) bgColor = bgRes.color
  if (bgRes.image) bgImage = bgRes.image

  const rootRect = root.getBoundingClientRect()

  const traverse = (node: Element) => {
    if (!(node instanceof HTMLElement)) return
    if (node.tagName === "STYLE" || node.tagName === "SCRIPT") return
    const rect = node.getBoundingClientRect()
    const style = window.getComputedStyle(node)
    const x = Math.max(0, rect.left - rootRect.left)
    const y = Math.max(0, rect.top - rootRect.top)
    const width = rect.width
    const height = rect.height
    const isImage = node.tagName === "IMG"
    const textTags = [
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "P",
      "SPAN",
      "DIV",
      "LI",
      "B",
      "I",
      "STRONG",
      "EM",
    ]
    const hasText = Array.from(node.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent?.trim().length
    )

    if (isImage) {
      elements.push({
        id: Math.random().toString(36).substr(2, 9),
        type: "image",
        src: (node as HTMLImageElement).src,
        x,
        y,
        width: width || 400,
        height: height || 300,
        objectFit: (style.objectFit as "cover" | "contain" | "fill") || "cover",
      })
    } else if (textTags.includes(node.tagName) && hasText) {
      const content = (node as HTMLElement).innerText.trim()
      if (content) {
        elements.push({
          id: Math.random().toString(36).substr(2, 9),
          type: "text",
          content,
          x,
          y,
          width: width || rect.width,
          height: height || rect.height,
          fontSize: parseInt(style.fontSize) || 24,
          color: colorToHex(style.color || "#000000"),
          fontWeight: style.fontWeight || "normal",
          textAlign: (style.textAlign as "left" | "center" | "right") || "left",
          fontFamily:
            style.fontFamily?.replace(/['"]/g, "") || "Inter, sans-serif",
        })
      }
    } else if (node.tagName === "DIV" || node.tagName === "SPAN") {
      const bg = colorToHex(style.backgroundColor)
      const hasBg =
        bg &&
        bg !== "rgba(0, 0, 0, 0)" &&
        bg !== "transparent" &&
        bg !== "#00000000"
      if (hasBg && width > 0 && height > 0 && !hasText) {
        elements.push({
          id: Math.random().toString(36).substr(2, 9),
          type: "shape",
          shapeType: "rectangle",
          x,
          y,
          width,
          height,
          color: bg,
          opacity: parseFloat(style.opacity) || 1,
        })
      }
    }
    if (!isImage) Array.from(node.children).forEach((child) => traverse(child))
  }
  traverse(root)
  document.body.removeChild(container)
  return { id: htmlSlide.id, elements, bgColor, bgImage, layout: "free" }
}

export function parseStoryboard(text: string): StoryboardData {
  const result: StoryboardData = { title: "Advanced Storyboard", slides: [] }

  let titleMatch
  const titleRegex = /<title[^>]+name=["'](.*?)["']/g
  let lastTitle
  while ((titleMatch = titleRegex.exec(text)) !== null) {
    lastTitle = titleMatch[1]
  }
  if (lastTitle) result.title = lastTitle

  const slideRegex =
    /<(slide-(\d+))\s+title=["'](.*?)["'][^>]*>([\s\S]*?)<\/\1>/g
  let match

  while ((match = slideRegex.exec(text)) !== null) {
    const id = parseInt(match[2])
    const title = match[3]
    const content = match[4].trim()

    const html = content
    const structuredSlide = undefined

    const existingIndex = result.slides.findIndex((s) => s.id === id)
    if (existingIndex !== -1) {
      result.slides[existingIndex] = { id, title, html, structuredSlide }
    } else {
      result.slides.push({ id, title, html, structuredSlide })
    }
  }

  result.slides.sort((a, b) => a.id - b.id)
  return result
}
