// Import the third-party library responsible for generating PowerPoint files
import pptxgen from "pptxgenjs"
// Import types representing the structured canvas/slide layout format used internally
import { Slide, SlideElement } from "@/types/editor"
// Import tools to parse raw HTML blocks back into structured slide layouts
import { HtmlSlide, htmlToStructuredSlide } from "./storyboard-parser"
// Import the third-party library responsible for generating PDF document files
import { jsPDF } from "jspdf"
// Import utility function that sanitizes generic CSS colors into safe strict hex formats
import { colorToHex } from "./utils"

/**
 * Serializes the current active Slide state Array into a downloadable JSON file.
 * Perfect for local backups or project template saving.
 */
export const exportToJson = (title: string, slides: Slide[]) => {
  // Construct the structured backup object mapping standard attributes
  const data = {
    title, // Project title
    slides, // The raw array dataset defining slide structures
    exportedAt: new Date().toISOString(), // Timestamp signature
    version: "1.0", // Format version marker for future-proofing reader
  }
  // Convert JSON object representation string to an immutable browser Blob payload
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  // Register the Blob in browser memory, obtaining a temporary direct URL endpoint
  const url = URL.createObjectURL(blob)
  // Create an invisible hyperlink anchor element dynamically
  const link = document.createElement("a")
  // Target the generated dummy url
  link.href = url
  // Define strict download filename replacing blank spaces with underscores
  link.download = `${title.replace(/\s+/g, "_")}.json`
  // Attach the phantom element physical document tree (Required by Firefox)
  document.body.appendChild(link)
  // Automatically trigger a left click on the anchor causing forced download
  link.click()
  // Clean up side-effects destroying the phantom link element
  document.body.removeChild(link)
  // Release Blob memory garbage collection hook
  URL.revokeObjectURL(url)
}

/**
 * Builds a valid PPTX document strictly executing mappings between internal app state and PowerPoint definitions.
 */
export const exportToPpptx = async (title: string, slides: Slide[]) => {
  // Instantiate empty pptx presentation container
  const pres = new pptxgen()
  // Tag metadata attribute
  pres.title = title

  // Iterate chronologically through each requested frame
  slides.forEach((slideData) => {
    // Generate empty blank slide node inside current internal pptx instance
    const slide = pres.addSlide()

    // Map solid color backgrounds safely stripping native "#" indicators required by PPTX library
    if (slideData.bgColor) {
      slide.background = { fill: slideData.bgColor.replace("#", "") }
    }

    // Since we don't have easy access to the images as blobs here (they are URLs),
    // and pptxgenjs supports URLs, we can use them directly.
    if (slideData.bgImage) {
      slide.background = { path: slideData.bgImage }
    }

    // Iterate map translating standard application layout elements into PPTX specific layout nodes
    ;(slideData.elements || []).forEach((el: SlideElement) => {
      // 1024x576 is our internal canvas size.
      // Powerpoint default is usually 10x5.625 inches (16:9).
      // Translate raw pixel coordinates to screen relative % coordinates for fluid ppt scale matches
      const x = ((el.x / 1024) * 100 + "%") as unknown as number
      const y = ((el.y / 576) * 100 + "%") as unknown as number
      const w = ((el.width / 1024) * 100 + "%") as unknown as number
      const h = ((el.height / 576) * 100 + "%") as unknown as number

      // Render Text elements
      if (el.type === "text") {
        slide.addText(el.content as string, {
          x,
          y,
          w,
          h,
          // Shrink font size inherently to map CSS scaling closer to physical Word/PPT Points definitions
          fontSize: el.fontSize ? el.fontSize * 0.75 : 18,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          align: (el.textAlign as any) || "left",
          fontFace: el.fontFamily || "Arial",
          // Map standard css explicit weights or keywords back to true/false booleans for ppt handler
          bold: el.fontWeight === "900" || el.fontWeight === "bold",
          valign: "middle", // Force centering vertical axis naturally
        })
        // Render Image elements
      } else if (el.type === "image" && el.src && el.src !== "loading") {
        slide.addImage({
          path: el.src, // Bind remote source URL directly, PPT generator natively handles fetch
          x,
          y,
          w,
          h,
        })
        // Render Shape configurations
      } else if (el.type === "shape" && el.shapeType) {
        // Switch evaluating ppt primitive enumerator bindings based on raw text match
        const shapeType =
          el.shapeType === "circle"
            ? pres.ShapeType.ellipse
            : pres.ShapeType.rect
        // Build generic vector properties
        slide.addShape(shapeType, {
          x,
          y,
          w,
          h,
          fill: {
            color: el.color?.replace("#", "") || "CCCCCC", // Strip symbol prefix
            alpha: (el.opacity || 1) * 100, // Multiply standard CSS 0-1 opacity into 0-100 PPT percentage formatting
          },
        })
        // Render Data grids
      } else if (el.type === "table" && el.tableData) {
        // Reduce complex table properties extracting pure raw text structures
        const rows = el.tableData.map((row) => row.map((cell) => cell.text))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slide.addTable(rows as any[], {
          x,
          y,
          w,
          h,
          border: { pt: 1, color: "000000" }, // Forcibly lock in standardized presentation borders
          fill: { color: "F8F8F8" }, // Inject subtle gray contrast backfill
          fontSize: 12,
        })
        // Render dynamic Rechart equivalents
      } else if (
        [
          "bar-chart",
          "pie-chart",
          "line-chart",
          "area-chart",
          "radar-chart",
          "radial-chart",
        ].includes(el.type) &&
        el.chartData
      ) {
        // Collect chart data vector mappings (Labels/Numeric Heights/Legend Colors)
        const labels = el.chartData.map((d) => d.label)
        const values = el.chartData.map((d) => d.value)
        const colors = el.chartData.map(
          (d) => d.color?.replace("#", "") || "3b82f6" // Format arrays mapping defaults
        )

        // Conditional checks binding PPT renderer specific visual generation targets
        let chartType = pres.ChartType.bar
        if (el.type === "pie-chart" || el.type === "radial-chart")
          chartType = pres.ChartType.pie
        if (el.type === "line-chart") chartType = pres.ChartType.line
        if (el.type === "area-chart") chartType = pres.ChartType.area
        if (el.type === "radar-chart") chartType = pres.ChartType.radar

        // Push standard metric arrays to graph library
        slide.addChart(
          chartType,
          [{ name: el.chartTitle || "Data", labels, values }],
          {
            x,
            y,
            w,
            h,
            showTitle: !!el.chartTitle, // Determine title visibility status natively
            title: el.chartTitle,
            chartColors: colors,
          }
        )
      }
    })
  })

  // Export finished data payload triggering user interaction sequence download
  await pres.writeFile({ fileName: `${title.replace(/\s+/g, "_")}.pptx` })
}

// --- HTML Storyboard Exports ---

/**
 * Serializes the abstract "HtmlSlide" schema containing raw unedited LLM strings output format into JSON storage payload.
 */
export const exportHtmlToJson = (
  title: string,
  description: string,
  slides: HtmlSlide[]
) => {
  // Package document
  const data = {
    title,
    projectTitle: title, // Legacy duplication parameter
    description,
    projectDescription: description, // Legacy duplication parameter
    slides, // Standard HTML mapping array string maps
    exportedAt: new Date().toISOString(),
    format: "html-storyboard", // Internal format logic identifier map tracking system type
    version: "1.0",
  }

  // JSON -> Blob serialization conversion mapping
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  // Bind hyperlink sequence downloading data out into secure client storage
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${title.replace(/\s+/g, "_")}_advanced.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Obsolete capture function removed in favor of structural parsing

/**
 * Advanced sequence extracting and translating raw HTML slide representations natively into scalable PDF vector documents.
 */
export const exportHtmlToPdf = async (title: string, slides: HtmlSlide[]) => {
  // Setup horizontal orientation A4 paper format
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt", // Draw logic scale referencing discrete geometric points
    format: [1024, 576], // Map explicit canvas constraint resolutions
  })

  // Run async parallel layout conversion mapper scanning DOM output converting pure HTML layers back to vector metadata definitions
  const structuredSlides = await Promise.all(
    slides.map((s) => htmlToStructuredSlide(s))
  )

  // Map individual vector output
  for (let i = 0; i < structuredSlides.length; i++) {
    // Inject pagination slice dividing multiple screens explicitly
    if (i > 0) doc.addPage([1024, 576], "landscape")
    const slide = structuredSlides[i]

    // Handle painting Background vectors directly natively
    if (slide.bgColor) {
      // Decode hex color format using generic mapper
      const hex = colorToHex(slide.bgColor)
      if (hex.startsWith("#")) {
        doc.setFillColor(hex) // Set working painter
        doc.rect(0, 0, 1024, 576, "F") // Render single physical fill block
      }
    }

    // Step across mapped DOM abstractions output
    for (const el of slide.elements || []) {
      if (el.type === "text") {
        // Validate explicit text color parameters
        const hex = colorToHex(el.color || "#000000")
        if (hex.startsWith("#")) doc.setTextColor(hex)
        // Bind explicit pixel scale font configuration mapping properties
        doc.setFontSize(el.fontSize || 24)
        // Simple text placement. y + fontSize is a rough baseline natively translating top left box constraints format offsets
        doc.text(el.content as string, el.x, el.y + (el.fontSize || 24))
      } else if (el.type === "image" && el.src) {
        try {
          // Send PNG string map configurations safely through internal pipeline handling errors silently ensuring slide renders regardless
          doc.addImage(el.src, "PNG", el.x, el.y, el.width, el.height)
        } catch (_e) {
          console.warn("Failed to add image to PDF", _e)
        }
      } else if (el.type === "shape" && el.color) {
        // Resolve pure css block vector primitives back into standard rendering operations format coordinates paths
        const hex = colorToHex(el.color)
        if (hex.startsWith("#")) {
          // Mount active primitive format painter configurations
          doc.setFillColor(hex)
          if (el.shapeType === "circle") {
            doc.ellipse(
              el.x + el.width / 2,
              el.y + el.height / 2,
              el.width / 2,
              el.height / 2,
              "F"
            )
          } else {
            doc.rect(el.x, el.y, el.width, el.height, "F")
          }
        }
      }
    }
  }

  // Force PDF processing finish
  doc.save(`${title.replace(/\s+/g, "_")}.pdf`)
}

/**
 * Proxy function handling extracting HTML structures translating to standard Powerpoint format
 */
export const exportHtmlToPpptx = async (title: string, slides: HtmlSlide[]) => {
  // First evaluate parallel asynchronous DOM scanning processing strings back to structured representations objects maps
  const structuredSlides = await Promise.all(
    slides.map((s) => htmlToStructuredSlide(s))
  )
  // Call internal standard layout object translation route handler
  await exportToPpptx(title, structuredSlides)
}

/**
 * Creates a raw PDF strictly rendering completely collapsed flattened full-screen snapshot strings variables images
 */
export const exportImagesToPdf = async (title: string, images: string[]) => {
  // Intialize baseline configuration
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [1024, 576],
  })

  // Iteratively push sequential snapshot strings rendering explicitly bounded native blocks
  for (let i = 0; i < images.length; i++) {
    if (i > 0) doc.addPage([1024, 576], "landscape")
    // Force fill canvas
    doc.addImage(images[i], "PNG", 0, 0, 1024, 576)
  }

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`)
}

/**
 * Bootstraps quick standard Powerpoint structure using flattened full background static frame slides
 */
export const exportImagesToPpptx = async (title: string, images: string[]) => {
  // Create blank sequence
  const pres = new pptxgen()
  pres.title = title

  // Add individual full slide blocks configurations mappings appending new object models iteratively mapped flat layout params
  images.forEach((imgData) => {
    const slide = pres.addSlide()
    slide.addImage({
      data: imgData,
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
    })
  })

  // Finalize export
  await pres.writeFile({ fileName: `${title.replace(/\s+/g, "_")}.pptx` })
}
