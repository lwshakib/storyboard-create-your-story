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

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TableCell {
  text: string
  isHeader?: boolean
}

export type TableRow = TableCell[]

export interface SlideElement {
  id: string
  type: ElementType
  content?: unknown
  x: number
  y: number
  width: number
  height: number
  textAlign?: "left" | "center" | "right"
  src?: string
  imagePrompt?: string
  fontSize?: number
  color?: string
  fontFamily?: string
  fontWeight?: string
  objectFit?: "cover" | "contain" | "fill"
  shapeType?: "rectangle" | "circle"
  opacity?: number
  tableData?: TableRow[]
  chartData?: ChartDataPoint[]
  chartTitle?: string
  borderColor?: string
  tableBgColor?: string
  zone?: string | number
  isFullSpace?: boolean
  showCard?: boolean
}

export type LayoutType =
  | "blank"
  | "title-only"
  | "split-h"
  | "split-v"
  | "grid-4"
  | "free"
  | "title"

export interface Slide {
  id: number
  elements: SlideElement[]
  bgColor?: string
  bgImage?: string
  layout?: LayoutType
  splitRatio?: number
  html?: string
  title?: string
  description?: string
  content?: string
}
