"use client"

import Image from "next/image"
import * as React from "react"
import { motion } from "framer-motion"
import {
  Type,
  Table as TableIcon,
  Image as ImageIcon,
  Square,
  Circle as CircleIcon,
  Palette,
  Plus,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { Slide, ElementType, SlideElement } from "@/types/editor"
import { uploadFileToCloudinary } from "@/lib/cloudinary"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MainToolbarProps {
  activeSlide: Slide
  selectedElementId: string | null
  onAddElement: (type: ElementType, config?: unknown) => void
  onApplyLayout?: (type: unknown) => void
  onUpdateSlide: (updates: Partial<Slide>) => void
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void
}

/**
 * MainToolbar Component: The floating utility bar for adding content to slides.
 * Features:
 * - Content Creation: Buttons for text, tables, images, shapes, and various charts.
 * - Drag & Drop: Tools can be dragged onto the canvas to place them exactly.
 * - Image Upload: Integrated with Cloudinary for persistent visual assets.
 * - Slide Styles: Quick access to background colors and preset high-end textures.
 */
export function MainToolbar({
  activeSlide,
  onAddElement,
  onUpdateSlide,
  onUpdateElement,
}: MainToolbarProps) {
  
  // Drag handling to pass the element type to the canvas drop zone
  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData("elementType", type)
  }

  const [tableRows, setTableRows] = React.useState(3)
  const [tableCols, setTableCols] = React.useState(3)
  const [isTableDialogOpen] = React.useState(false) // Note: Controlled by Dialog's trigger usually

  return (
    <div className="absolute bottom-20 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/80 flex items-center gap-2 rounded-[28px] border p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl"
      >
        {/* SECTION 1: Narrative & Structural Tools */}
        <div className="flex items-center gap-1.5">
          <ToolButton
            onDragStart={(e) => handleDragStart(e, "text")}
            onClick={() => onAddElement("text")}
            icon={<Type className="h-4 w-4" />}
            tooltip="Text"
          />

          {/* TABLE CREATION: Opens a dialog to specify dimensions */}
          <Dialog>
            <DialogTrigger asChild>
              <ToolButton
                onDragStart={(e) => handleDragStart(e, "table")}
                icon={<TableIcon className="h-4 w-4" />}
                tooltip="Table (Click/Drag)"
              />
            </DialogTrigger>
            <DialogContent className="bg-background/95 rounded-[32px] border-none p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl sm:max-w-[320px]">
              <DialogHeader>
                <DialogTitle className="mb-4 text-center text-xl font-black tracking-tight uppercase">
                  New Table
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-2 font-sans">
                <div className="space-y-3">
                  <Label className="ml-1 text-[9px] font-black tracking-[0.2em] uppercase opacity-40">
                    Rows
                  </Label>
                  <Input
                    type="number"
                    value={tableRows}
                    min={1}
                    max={20}
                    onChange={(e) => setTableRows(parseInt(e.target.value))}
                    className="bg-muted/50 focus-visible:ring-primary/20 h-12 rounded-2xl border-none px-6 text-lg font-black transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="ml-1 text-[9px] font-black tracking-[0.2em] uppercase opacity-40">
                    Columns
                  </Label>
                  <Input
                    type="number"
                    value={tableCols}
                    min={1}
                    max={10}
                    onChange={(e) => setTableCols(parseInt(e.target.value))}
                    className="bg-muted/50 focus-visible:ring-primary/20 h-12 rounded-2xl border-none px-6 text-lg font-black transition-all"
                  />
                </div>
              </div>
              <DialogFooter className="mt-8">
                <Button
                  className="bg-primary shadow-primary/30 h-14 w-full rounded-[20px] text-[10px] font-black tracking-widest uppercase shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => {
                    onAddElement("table", { rows: tableRows, cols: tableCols })
                  }}
                >
                  Create Table
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* IMAGE UPLOADER: Handles local file selection and Cloudinary upload */}
          <div className="relative">
            <ToolButton
              onDragStart={(e) => handleDragStart(e, "image")}
              onClick={() => document.getElementById("image-upload")?.click()}
              icon={<ImageIcon className="h-4 w-4" />}
              tooltip="Image (Click/Drag)"
            />
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const newId = Math.random().toString(36).substr(2, 9)
                  const x = 100 + activeSlide.elements.length * 20
                  const y = 100 + activeSlide.elements.length * 20

                  // 1. Add a placeholder image with a 'loading' src
                  const newElement: SlideElement = {
                    id: newId,
                    type: "image",
                    content: "",
                    x,
                    y,
                    width: 400,
                    height: 300,
                    src: "loading", 
                    zone: 0,
                  }
                  onUpdateSlide({
                    elements: [...activeSlide.elements, newElement],
                  })

                  // 2. Perform the async upload and update the element when done
                  uploadFileToCloudinary(file).then((data) => {
                    onUpdateElement(newId, { src: data.secureUrl })
                  })
                }
              }}
            />
          </div>

          {/* SHAPES: Basic vector representations */}
          <ToolButton
            onDragStart={(e) => handleDragStart(e, "shape")}
            onClick={() => onAddElement("shape", { shapeType: "rectangle" })}
            icon={<Square className="h-4 w-4" />}
            tooltip="Rectangle"
          />
          <ToolButton
            onDragStart={(e) => handleDragStart(e, "shape")}
            onClick={() => onAddElement("shape", { shapeType: "circle" })}
            icon={<CircleIcon className="h-4 w-4" />}
            tooltip="Circle"
          />

          {/* CHARTS MENU: Multiple data-driven visualization options */}
          <Popover>
            <PopoverTrigger asChild>
              <ToolButton
                icon={<BarChart2 className="h-4 w-4" />}
                tooltip="Charts"
              />
            </PopoverTrigger>
            <PopoverContent
              className="bg-background/95 w-48 rounded-2xl border-none p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl"
              side="top"
              align="center"
            >
              <div className="text-primary/40 mb-1 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
                Add Chart
              </div>
              <div className="grid grid-cols-1 gap-1">
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("bar-chart")}>
                  <BarChart2 className="size-4 text-blue-500" /> Bar Chart
                </Button>
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("pie-chart")}>
                  <PieChartIcon className="size-4 text-orange-500" /> Pie Chart
                </Button>
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("line-chart")}>
                  <TrendingUp className="size-4 text-green-500" /> Line Chart
                </Button>
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("area-chart")}>
                  <Plus className="size-4 text-purple-500" /> Area Chart
                </Button>
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("radar-chart")}>
                  <Plus className="size-4 text-pink-500" /> Radar Chart
                </Button>
                <Button variant="ghost" className="h-10 justify-start gap-3 rounded-xl text-xs font-bold" onClick={() => onAddElement("radial-chart")}>
                  <Plus className="size-4 text-yellow-500" /> Radial Chart
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Separator orientation="vertical" className="h-6 opacity-30" />

        {/* SECTION 2: Background & Aesthetics */}
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/5 hover:text-primary h-9 w-9 rounded-xl transition-all active:scale-95"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="bg-background/95 w-64 rounded-2xl border-none p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-3xl"
              side="top"
              align="center"
            >
              <div className="text-primary/40 mb-2 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
                Preset Backgrounds
              </div>
              {/* Renders a grid of pre-captured professional background textures */}
              <div className="mb-4 grid grid-cols-4 gap-2">
                {Array.from({ length: 13 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onUpdateSlide({
                        bgImage: `/backgrounds/bg${i + 1}.${i < 5 ? "png" : "jpg"}`,
                      })
                    }
                    className={cn(
                      "aspect-video overflow-hidden rounded-lg border border-black/5 transition-all hover:scale-110 active:scale-90",
                      activeSlide.bgImage ===
                        `/backgrounds/bg${i + 1}.${i < 5 ? "png" : "jpg"}` &&
                        "ring-primary ring-2 ring-offset-2"
                    )}
                  >
                    <Image
                      src={`/backgrounds/bg${i + 1}.${i < 5 ? "png" : "jpg"}`}
                      alt={`Background ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <Separator className="my-3 opacity-50" />
              <div className="text-primary/40 mb-2 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
                Background Color
              </div>
              
              {/* Color Picker for solid backgrounds */}
              <div className="space-y-3">
                <HexColorPicker
                  color={activeSlide.bgColor}
                  onChange={(color) =>
                    onUpdateSlide({ bgColor: color, bgImage: "" })
                  }
                  className="!h-32 !w-full"
                />
                <Input
                  className="border-primary/10 h-8 rounded-lg font-mono text-[11px]"
                  value={activeSlide.bgColor}
                  onChange={(e) =>
                    onUpdateSlide({ bgColor: e.target.value, bgImage: "" })
                  }
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * ToolButton: Standardizes the look and feel of toolbar actions.
 * Includes tooltips and Framer Motion hover states.
 */
function ToolButton({
  icon,
  active,
  onClick,
  onDragStart,
  tooltip,
}: {
  icon: React.ReactNode
  tooltip?: string
  active?: boolean
  onClick?: () => void
  onDragStart?: (e: React.DragEvent) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          draggable={!!onDragStart}
          onDragStart={onDragStart}
          className={cn(
            "h-9 w-9 rounded-xl border-none shadow-none transition-all duration-300",
            active
              ? "bg-primary text-primary-foreground shadow-primary/20 scale-110 shadow-lg"
              : "hover:bg-primary/5 hover:text-primary active:scale-90",
            onDragStart && "cursor-grab active:cursor-grabbing"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="top" sideOffset={8}>
          <p className="font-bold">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  )
}
