/**
 * Represents the different types of elements that can be placed on a slide.
 * - text: A simple text block.
 * - table: A structured data table.
 * - image: An uploaded or generated image block.
 * - shape: A basic geometric shape (e.g., rectangle, circle).
 * - bar-chart, pie-chart, line-chart, area-chart, radar-chart, radial-chart: Various types of data visualization charts.
 */
export type ElementType =
  | "text"
  | "table"
  | "image"
  | "shape"
  | "bar-chart"
  | "pie-chart"
  | "line-chart"
  | "area-chart"
  | "radar-chart"
  | "radial-chart"

/**
 * Defines a single data point for charting components.
 * - label: The text label for the data point.
 * - value: The numerical value used for rendering the chart.
 * - color: An optional specific color for this data point.
 */
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

/**
 * Represents a single cell within a table element.
 * - text: The text content of the cell.
 * - isHeader: A flag indicating if this cell is a header cell.
 */
export interface TableCell {
  text: string
  isHeader?: boolean
}

/**
 * Represents a full row in a table, consisting of an array of TableCell objects.
 */
export type TableRow = TableCell[]

/**
 * Represents a structural element placed on a slide, containing its visual and content data.
 */
export interface SlideElement {
  id: string // Unique identifier for the element
  type: ElementType // The type of element (text, image, chart, etc.)
  content?: unknown // The actual content, format depends on ElementType
  x: number // X-coordinate position on the slide grid/canvas
  y: number // Y-coordinate position on the slide grid/canvas
  width: number // Element width
  height: number // Element height
  textAlign?: "left" | "center" | "right" // Text alignment styling
  src?: string // Source URL if the element is an image
  imagePrompt?: string // Prompt used to generate an image
  fontSize?: number // Font size styling
  color?: string // Font or element color styling
  fontFamily?: string // Font family styling
  fontWeight?: string // Font weight styling
  objectFit?: "cover" | "contain" | "fill" // Image object-fit styling
  shapeType?: "rectangle" | "circle" // Specific type if the element is a shape
  opacity?: number // Element opacity level
  tableData?: TableRow[] // Data array if the element is a table
  chartData?: ChartDataPoint[] // Data array if the element is a chart
  chartTitle?: string // Title for a chart element
  borderColor?: string // Border color for the element
  tableBgColor?: string // Background color if the element is a table
  zone?: string | number // Defined layout zone for the element
  isFullSpace?: boolean // Flag indicating if the element should fill its parent space
  showCard?: boolean // Flag to determine if the element should render as a card
}

/**
 * Defines various slide layout presets to govern how elements are positioned.
 */
export type LayoutType =
  | "blank"      // Completely empty layout
  | "title-only" // Layout containing only a title zone
  | "split-h"    // Horizontal split into two zones
  | "split-v"    // Vertical split into two zones
  | "grid-4"     // 2x2 grid layout
  | "free"       // Free-form layout allowing manual positioning
  | "title"      // General title slide layout

/**
 * Represents a single slide within the storyboard or presentation.
 */
export interface Slide {
  id: string | number // Unique identifier for the slide
  index?: number // Sequential index of the slide within the presentation
  elements?: SlideElement[] // Array of visual elements within the slide
  html?: string // Optional prerendered HTML content for the slide
  title?: string // Slide title
  content?: string // Main text content string of the slide
  prompt?: string // The AI prompt used to generate this slide
  // Array of assets generated or uploaded for this slide
  assets?: { publicId: string; url: string; type: string }[]
  bgColor?: string // Slide background color
  bgImage?: string // Slide background image URL
  layout?: string // Identifier of the layout template used
}
