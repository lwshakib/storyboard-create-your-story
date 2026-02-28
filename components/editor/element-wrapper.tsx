"use client"

import * as React from "react"
import { motion, useMotionValue, AnimatePresence } from "framer-motion"
import {
  Image as ImageIcon,
  Trash2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  Expand,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Plus,
  Settings2,
  Loader2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  LabelList,
  PolarGrid,
  PolarAngleAxis,
} from "recharts"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { SlideElement, LayoutType } from "@/types/editor"
import { uploadFileToCloudinary } from "@/lib/editor-utils"

interface ElementWrapperProps {
  el: SlideElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<SlideElement>) => void
  onDelete: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  onBringForward: () => void
  onSendBackward: () => void
  canvasRef: React.RefObject<HTMLDivElement | null>
  layout: LayoutType
  splitRatio: number
  canvasScale: number
  defaultTextColor: string
}

export function ElementWrapper({
  el,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  canvasRef,
  layout,
  splitRatio,
  canvasScale,
  defaultTextColor,
}: ElementWrapperProps) {
  const [isResizing, setIsResizing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  const x = useMotionValue(el.x)
  const y = useMotionValue(el.y)
  const width = useMotionValue(el.width)
  const height = useMotionValue(el.height)

  const lastProps = React.useRef({
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
  })

  React.useEffect(() => {
    if (!isResizing && !isDragging) {
      if (el.x !== lastProps.current.x) x.set(el.x)
      if (el.y !== lastProps.current.y) y.set(el.y)
      if (el.width !== lastProps.current.width) width.set(el.width)
      if (el.height !== lastProps.current.height) height.set(el.height)

      lastProps.current = {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      }
    }
  }, [
    el.x,
    el.y,
    el.width,
    el.height,
    isResizing,
    isDragging,
    x,
    y,
    width,
    height,
  ])

  React.useEffect(() => {
    if (!isSelected) {
      setIsEditing(false)
    }
  }, [isSelected])

  React.useEffect(() => {
    if (el.isFullSpace && !isResizing && !isDragging) {
      let nx = 0,
        ny = 0,
        nw = 1024,
        nh = 576
      if (layout === "split-h") {
        if (el.zone === 0) {
          nw = 1024 * splitRatio
        } else {
          nx = 1024 * splitRatio
          nw = 1024 * (1 - splitRatio)
        }
      } else if (layout === "split-v") {
        if (el.zone === 0) {
          nh = 576 * splitRatio
        } else {
          ny = 576 * splitRatio
          nh = 576 * (1 - splitRatio)
        }
      }
      x.set(nx)
      y.set(ny)
      width.set(nw)
      height.set(nh)
    }
  }, [
    el.isFullSpace,
    layout,
    splitRatio,
    el.zone,
    isResizing,
    isDragging,
    x,
    y,
    width,
    height,
  ])

  const handleWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isSelected) {
      onSelect()
    } else if (
      el.type === "text" ||
      el.type === "table" ||
      (el.type && el.type.includes("chart"))
    ) {
      setIsEditing(true)
    }
  }

  const startResize = (e: React.PointerEvent, direction: string) => {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)

    setIsResizing(true)
    if (el.isFullSpace) onUpdate({ isFullSpace: false })

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = width.get()
    const startHeight = height.get()
    const startXPos = x.get()
    const startYPos = y.get()

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / canvasScale
      const deltaY = (moveEvent.clientY - startY) / canvasScale

      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startXPos
      let newY = startYPos

      if (direction.includes("e")) {
        let maxW = 1024 - startXPos
        if (layout === "split-h" && el.zone === 0)
          maxW = 1024 * splitRatio - startXPos
        newWidth = Math.max(50, Math.min(maxW, startWidth + deltaX))
      }
      if (direction.includes("s")) {
        let maxH = 576 - startYPos
        if (layout === "split-v" && el.zone === 0)
          maxH = 576 * splitRatio - startYPos
        newHeight = Math.max(20, Math.min(maxH, startHeight + deltaY))
      }

      if (direction.includes("w")) {
        let minX = 0
        if (layout === "split-h" && el.zone === 1) minX = 1024 * splitRatio
        const targetX = Math.max(
          minX,
          Math.min(startXPos + startWidth - 50, startXPos + deltaX)
        )
        newWidth = startWidth + (startXPos - targetX)
        newX = targetX
      }
      if (direction.includes("n")) {
        let minY = 0
        if (layout === "split-v" && el.zone === 1) minY = 576 * splitRatio
        const targetY = Math.max(
          minY,
          Math.min(startYPos + startHeight - 20, startYPos + deltaY)
        )
        newHeight = startHeight + (startYPos - targetY)
        newY = targetY
      }

      if (moveEvent.shiftKey) {
        const ratio = startWidth / startHeight
        if (direction.includes("e") || direction.includes("w")) {
          newHeight = newWidth / ratio
        } else {
          newWidth = newHeight * ratio
        }
      }

      x.set(newX)
      y.set(newY)
      width.set(newWidth)
      height.set(newHeight)
    }

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)

      const finalX = x.get()
      const finalY = y.get()
      const finalWidth = width.get()
      const finalHeight = height.get()

      let newZone = el.zone || 0
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const centerX = finalX + finalWidth / 2
        const centerY = finalY + finalHeight / 2

        if (layout === "split-h") {
          newZone = centerX > rect.width * splitRatio ? 1 : 0
        } else if (layout === "split-v") {
          newZone = centerY > rect.height * splitRatio ? 1 : 0
        }
      }

      onUpdate({
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight,
        zone: newZone as 0 | 1,
      })

      setIsResizing(false)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          drag={!isResizing && !isEditing}
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            setIsDragging(true)
            if (el.isFullSpace) onUpdate({ isFullSpace: false })
          }}
          onDragEnd={(_, info) => {
            setIsDragging(false)
            let newX = el.x + info.offset.x / canvasScale
            let newY = el.y + info.offset.y / canvasScale

            newX = Math.max(0, Math.min(1024 - el.width, newX))
            newY = Math.max(0, Math.min(576 - el.height, newY))

            let newZone = el.zone || 0
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect()
              const centerX = newX + el.width / 2
              const centerY = newY + el.height / 2

              if (layout === "split-h") {
                newZone = centerX > rect.width * splitRatio ? 1 : 0
              } else if (layout === "split-v") {
                newZone = centerY > rect.height * splitRatio ? 1 : 0
              }
            }

            onUpdate({ x: newX, y: newY, zone: newZone as 0 | 1 })
          }}
          onClick={handleWrapperClick}
          style={{
            x,
            y,
            width: width,
            height: el.type === "text" || el.type === "table" ? "auto" : height,
            minHeight:
              el.type === "text" || el.type === "table" ? "auto" : height,
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "0 0",
          }}
          className={cn(
            "group/element cursor-move",
            isSelected && "ring-primary ring-2",
            el.type !== "image" && "rounded-xl",
            (el.type === "text" ||
              el.type === "table" ||
              (el.type && el.type.includes("chart"))) &&
              "h-auto h-fit"
          )}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (!isSelected) onSelect()
            if (
              el.type === "text" ||
              el.type === "table" ||
              (el.type && el.type.includes("chart"))
            )
              setIsEditing(true)
          }}
        >
          {/* Chart/Table Settings Controls */}
          <AnimatePresence>
            {isSelected &&
              ((el.type && el.type.includes("chart")) ||
                el.type === "table") && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="bg-background/95 absolute -top-16 left-1/2 z-[200] flex h-11 min-w-max -translate-x-1/2 items-center gap-1 rounded-2xl border p-1 shadow-2xl backdrop-blur-xl"
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted/50 size-8 rounded-lg transition-all"
                      >
                        <Settings2 className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-background/95 w-[300px] rounded-2xl border-none p-4 shadow-2xl backdrop-blur-xl">
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-[10px] font-black uppercase opacity-40">
                            Element Title
                          </label>
                          <input
                            className="bg-muted w-full rounded-xl px-3 py-2 text-xs font-semibold"
                            value={el.chartTitle || ""}
                            placeholder="Untitled Element"
                            onChange={(e) =>
                              onUpdate({ chartTitle: e.target.value })
                            }
                          />
                        </div>

                        {el.type && el.type.includes("chart") && (
                          <div>
                            <label className="mb-2 block text-[10px] font-black uppercase opacity-40">
                              Chart Data
                            </label>
                            <div className="custom-scrollbar max-h-[200px] space-y-2 overflow-y-auto pr-2">
                              {(
                                el.chartData || [
                                  { label: "A", value: 400, color: "#0088FE" },
                                  { label: "B", value: 300, color: "#00C49F" },
                                  { label: "C", value: 300, color: "#FFBB28" },
                                ]
                              ).map((dp, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    className="bg-muted flex-1 rounded-lg px-2 py-1.5 text-[10px] font-medium"
                                    value={dp.label}
                                    onChange={(e) => {
                                      const newData = [...(el.chartData || [])]
                                      if (newData.length === 0) return
                                      newData[i] = {
                                        ...newData[i],
                                        label: e.target.value,
                                      }
                                      onUpdate({ chartData: newData })
                                    }}
                                  />
                                  <input
                                    type="number"
                                    className="bg-muted w-16 rounded-lg px-2 py-1.5 text-[10px] font-medium"
                                    value={dp.value}
                                    onChange={(e) => {
                                      const newData = [...(el.chartData || [])]
                                      if (newData.length === 0) return
                                      newData[i] = {
                                        ...newData[i],
                                        value: parseFloat(e.target.value) || 0,
                                      }
                                      onUpdate({ chartData: newData })
                                    }}
                                  />
                                  <button
                                    className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors"
                                    onClick={() =>
                                      onUpdate({
                                        chartData: (el.chartData || []).filter(
                                          (_, idx) => idx !== i
                                        ),
                                      })
                                    }
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 w-full rounded-xl border-dashed text-[10px] font-bold tracking-wider uppercase"
                                onClick={() =>
                                  onUpdate({
                                    chartData: [
                                      ...(el.chartData || [
                                        {
                                          label: "A",
                                          value: 400,
                                          color: "#0088FE",
                                        },
                                        {
                                          label: "B",
                                          value: 300,
                                          color: "#00C49F",
                                        },
                                        {
                                          label: "C",
                                          value: 300,
                                          color: "#FFBB28",
                                        },
                                      ]),
                                      {
                                        label: "New",
                                        value: 100,
                                        color: "#8884d8",
                                      },
                                    ],
                                  })
                                }
                              >
                                <Plus className="mr-2 size-3" /> Add Data Point
                              </Button>
                            </div>
                          </div>
                        )}

                        {el.type === "table" && (
                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-[10px] font-black uppercase opacity-40">
                                Table Colors
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-muted hover:bg-muted/80 h-9 w-full justify-between rounded-xl border-none px-3"
                                    >
                                      <span className="text-[10px] font-bold opacity-60">
                                        Background
                                      </span>
                                      <div
                                        className="size-3.5 rounded-full border border-black/10 shadow-sm"
                                        style={{
                                          backgroundColor:
                                            el.tableBgColor ||
                                            "rgba(255,255,255,0.8)",
                                        }}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="bg-background/95 w-[200px] rounded-2xl border-none p-3 shadow-2xl backdrop-blur-xl">
                                    <HexColorPicker
                                      color={el.tableBgColor || "#ffffff"}
                                      onChange={(color) =>
                                        onUpdate({ tableBgColor: color })
                                      }
                                      className="!h-32 !w-full"
                                    />
                                  </PopoverContent>
                                </Popover>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-muted hover:bg-muted/80 h-9 w-full justify-between rounded-xl border-none px-3"
                                    >
                                      <span className="text-[10px] font-bold opacity-60">
                                        Border
                                      </span>
                                      <div
                                        className="size-3.5 rounded-full border border-black/10 shadow-sm"
                                        style={{
                                          backgroundColor:
                                            el.borderColor || "#e5e7eb",
                                        }}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="bg-background/95 w-[200px] rounded-2xl border-none p-3 shadow-2xl backdrop-blur-xl">
                                    <HexColorPicker
                                      color={el.borderColor || "#e5e7eb"}
                                      onChange={(color) =>
                                        onUpdate({ borderColor: color })
                                      }
                                      className="!h-32 !w-full"
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Separator
                    orientation="vertical"
                    className="mx-0.5 h-4 opacity-20"
                  />

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted/50 size-8 rounded-lg transition-all"
                      >
                        <div
                          className="size-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: el.color || "#000000" }}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-background/95 w-[200px] rounded-2xl border-none p-3 shadow-2xl backdrop-blur-xl">
                      <HexColorPicker
                        color={el.color || "#000000"}
                        onChange={(color) => onUpdate({ color })}
                        className="mb-3 !h-32 !w-full"
                      />
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          "#000000",
                          "#FFFFFF",
                          "#FF3B30",
                          "#FF9500",
                          "#FFCC00",
                          "#4CD964",
                          "#5AC8FA",
                          "#007AFF",
                          "#5856D6",
                          "#FF2D55",
                        ].map((c) => (
                          <button
                            key={c}
                            className="border-border size-6 rounded-lg border transition-transform hover:scale-110 active:scale-90"
                            style={{ backgroundColor: c }}
                            onClick={() => onUpdate({ color: c })}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )}
          </AnimatePresence>
          {/* Text Formatting Controls */}
          <AnimatePresence>
            {isSelected && el.type === "text" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-background/95 absolute -top-16 left-1/2 z-[200] flex h-11 min-w-max -translate-x-1/2 items-center gap-1 rounded-2xl border p-1 shadow-2xl backdrop-blur-xl"
              >
                <Select
                  value={el.fontFamily || "Inter"}
                  onValueChange={(val) => onUpdate({ fontFamily: val })}
                >
                  <SelectTrigger className="hover:bg-muted/50 h-8 w-[100px] rounded-lg border-none bg-transparent px-2 text-[10px] font-bold shadow-none transition-all focus:ring-0">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 rounded-xl border-none shadow-2xl backdrop-blur-xl">
                    {[
                      "Inter",
                      "Roboto",
                      "Playfair Display",
                      "Montserrat",
                      "System-ui",
                    ].map((font) => (
                      <SelectItem
                        key={font}
                        value={font}
                        className="rounded-lg text-[10px] font-medium"
                      >
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Separator
                  orientation="vertical"
                  className="mx-0.5 h-4 opacity-20"
                />

                <Select
                  value={String(el.fontSize || 24)}
                  onValueChange={(val) => onUpdate({ fontSize: parseInt(val) })}
                >
                  <SelectTrigger className="hover:bg-muted/50 h-8 w-[54px] rounded-lg border-none bg-transparent px-2 text-[10px] font-bold shadow-none transition-all focus:ring-0">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 rounded-xl border-none shadow-2xl backdrop-blur-xl">
                    {[12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 72, 96].map(
                      (size) => (
                        <SelectItem
                          key={size}
                          value={String(size)}
                          className="rounded-lg text-[10px] font-medium"
                        >
                          {size}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Separator
                  orientation="vertical"
                  className="mx-0.5 h-4 opacity-20"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 rounded-lg transition-all",
                    el.fontWeight === "bold" && "bg-primary/10 text-primary"
                  )}
                  onClick={() =>
                    onUpdate({
                      fontWeight: el.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                >
                  <Bold className="size-3.5" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted/50 size-8 rounded-lg transition-all"
                    >
                      <div
                        className="size-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: el.color || "#000000" }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-background/95 w-[200px] rounded-2xl border-none p-3 shadow-2xl backdrop-blur-xl">
                    <HexColorPicker
                      color={el.color || "#000000"}
                      onChange={(color) => onUpdate({ color })}
                      className="mb-3 !h-32 !w-full"
                    />
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        "#000000",
                        "#FFFFFF",
                        "#FF3B30",
                        "#FF9500",
                        "#FFCC00",
                        "#4CD964",
                        "#5AC8FA",
                        "#007AFF",
                        "#5856D6",
                        "#FF2D55",
                      ].map((c) => (
                        <button
                          key={c}
                          className="border-border size-6 rounded-lg border transition-transform hover:scale-110 active:scale-90"
                          style={{ backgroundColor: c }}
                          onClick={() => onUpdate({ color: c })}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Separator
                  orientation="vertical"
                  className="mx-0.5 h-4 opacity-20"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 rounded-lg transition-all",
                    el.textAlign === "left" && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onUpdate({ textAlign: "left" })}
                >
                  <AlignLeft className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 rounded-lg transition-all",
                    el.textAlign === "center" && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onUpdate({ textAlign: "center" })}
                >
                  <AlignCenter className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 rounded-lg transition-all",
                    el.textAlign === "right" && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onUpdate({ textAlign: "right" })}
                >
                  <AlignRight className="size-3.5" />
                </Button>
              </motion.div>
            )}

            {isSelected && el.type === "shape" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-background/95 absolute -top-16 left-1/2 z-[200] flex h-11 min-w-max -translate-x-1/2 items-center gap-1 rounded-2xl border p-1 shadow-2xl backdrop-blur-xl"
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted/50 size-8 rounded-lg transition-all"
                    >
                      <div
                        className="size-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: el.color || "#000000" }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-background/95 w-[200px] rounded-2xl border-none p-3 shadow-2xl backdrop-blur-xl">
                    <HexColorPicker
                      color={el.color || "#000000"}
                      onChange={(color) => onUpdate({ color })}
                      className="mb-3 !h-32 !w-full"
                    />
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        "#000000",
                        "#FFFFFF",
                        "#FF3B30",
                        "#FF9500",
                        "#FFCC00",
                        "#4CD964",
                        "#5AC8FA",
                        "#007AFF",
                        "#5856D6",
                        "#FF2D55",
                      ].map((c) => (
                        <button
                          key={c}
                          className="border-border size-6 rounded-lg border transition-transform hover:scale-110 active:scale-90"
                          style={{ backgroundColor: c }}
                          onClick={() => onUpdate({ color: c })}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Separator
                  orientation="vertical"
                  className="mx-0.5 h-4 opacity-20"
                />

                <div className="flex flex-col items-center gap-0.5 px-2">
                  <span className="text-[8px] font-black uppercase opacity-40">
                    Opacity
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={el.opacity ?? 1}
                    onChange={(e) =>
                      onUpdate({ opacity: parseFloat(e.target.value) })
                    }
                    className="bg-muted accent-primary h-1 w-20 cursor-pointer appearance-none rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resizing Nodes */}
          {isSelected && !isEditing && el.type !== "table" && (
            <>
              <div
                className="bg-background border-primary absolute -top-1.5 -left-1.5 z-[60] h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 shadow-sm transition-transform hover:scale-125"
                onPointerDown={(e) => startResize(e, "nw")}
              />
              <div
                className="bg-background border-primary absolute -top-1.5 -right-1.5 z-[60] h-3.5 w-3.5 cursor-nesw-resize rounded-sm border-2 shadow-sm transition-transform hover:scale-125"
                onPointerDown={(e) => startResize(e, "ne")}
              />
              <div
                className="bg-background border-primary absolute -bottom-1.5 -left-1.5 z-[60] h-3.5 w-3.5 cursor-nesw-resize rounded-sm border-2 shadow-sm transition-transform hover:scale-125"
                onPointerDown={(e) => startResize(e, "sw")}
              />
              <div
                className="bg-background border-primary absolute -right-1.5 -bottom-1.5 z-[60] h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 shadow-sm transition-transform hover:scale-125"
                onPointerDown={(e) => startResize(e, "se")}
              />

              <div
                className="absolute top-0 left-0 z-50 h-1 w-full cursor-n-resize transition-colors"
                onPointerDown={(e) => startResize(e, "n")}
              />
              <div
                className="absolute bottom-0 left-0 z-50 h-1 w-full cursor-s-resize transition-colors"
                onPointerDown={(e) => startResize(e, "s")}
              />
              <div
                className="absolute top-0 left-0 z-50 h-full w-1 cursor-w-resize transition-colors"
                onPointerDown={(e) => startResize(e, "w")}
              />
              <div
                className="absolute top-0 right-0 z-50 h-full w-1 cursor-e-resize transition-colors"
                onPointerDown={(e) => startResize(e, "e")}
              />
            </>
          )}

          {el.type === "text" && (
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => {
                onUpdate({ content: e.currentTarget.textContent })
                setIsEditing(false)
              }}
              className={cn(
                "min-h-[1em] w-full break-words whitespace-pre-wrap transition-all outline-none",
                isEditing
                  ? "ring-primary/30 focus:ring-1"
                  : "pointer-events-none select-none"
              )}
              style={{
                textAlign: el.textAlign || "left",
                fontSize: el.fontSize ? `${el.fontSize}px` : "24px",
                color: el.color || defaultTextColor,
                fontFamily: el.fontFamily || "inherit",
                fontWeight: el.fontWeight || "normal",
                lineHeight: 1.2,
              }}
            >
              {el.content as string}
            </div>
          )}
          {el.type === "table" && (
            <div
              className={cn(
                "custom-scrollbar group/table relative w-full overflow-x-auto rounded-none border p-1 transition-all",
                !isEditing && "pointer-events-none select-none"
              )}
              style={{
                backgroundColor: el.tableBgColor || "rgba(255,255,255,0.8)",
                borderColor: el.borderColor || "rgba(0,0,0,0.1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              }}
            >
              <table className="w-full table-fixed border-collapse">
                <tbody>
                  {(
                    el.tableData ||
                    (el.content as { text: string; isHeader?: boolean }[][]) ||
                    []
                  ).map(
                    (
                      row: { text: string; isHeader?: boolean }[],
                      rowIndex: number
                    ) => (
                      <tr key={rowIndex}>
                        {row.map(
                          (
                            cell: { text: string; isHeader?: boolean },
                            colIndex: number
                          ) => (
                            <td
                              key={colIndex}
                              className={cn(
                                "focus:bg-primary/5 h-10 border-r border-b p-2 text-center align-middle text-[10px] font-medium transition-colors outline-none last:border-r-0",
                                cell.isHeader &&
                                  "bg-black/5 font-black tracking-wider uppercase"
                              )}
                              style={{
                                borderColor:
                                  el.borderColor || "rgba(0,0,0,0.1)",
                                color: el.color || defaultTextColor,
                              }}
                              contentEditable={isEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                if (el.tableData) {
                                  const newData = [...el.tableData]
                                  newData[rowIndex] = [...newData[rowIndex]]
                                  newData[rowIndex][colIndex] = {
                                    ...newData[rowIndex][colIndex],
                                    text: e.currentTarget.textContent || "",
                                  }
                                  onUpdate({ tableData: newData })
                                } else {
                                  const newContent = [
                                    ...((el.content as string[][]) || []),
                                  ]
                                  newContent[rowIndex] = [
                                    ...newContent[rowIndex],
                                  ]
                                  newContent[rowIndex][colIndex] =
                                    e.currentTarget.textContent || ""
                                  onUpdate({ content: newContent })
                                }
                              }}
                            >
                              {cell.text ?? cell}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Add Row/Col Buttons */}
          {isSelected && el.type === "table" && (
            <>
              <button
                className="bg-primary border-background absolute right-0 -bottom-6 z-[120] flex items-center justify-center rounded-full border-2 p-1.5 text-white opacity-0 shadow-lg transition-all group-hover/table:opacity-100 hover:scale-110 active:scale-90"
                onClick={(e) => {
                  e.stopPropagation()
                  const data = el.tableData || (el.content as string[][]) || []
                  if (data.length > 0) {
                    if (el.tableData) {
                      const newRow = new Array(data[0].length)
                        .fill(null)
                        .map(() => ({ text: "" }))
                      onUpdate({ tableData: [...el.tableData, newRow] })
                    } else {
                      const newRow = new Array(data[0].length).fill("")
                      onUpdate({
                        content: [
                          ...((el.content as string[][]) || []),
                          newRow,
                        ],
                      })
                    }
                  }
                }}
              >
                <Plus className="size-3" />
              </button>
              <button
                className="bg-primary border-background absolute -right-6 bottom-0 z-[120] flex items-center justify-center rounded-full border-2 p-1.5 text-white opacity-0 shadow-lg transition-all group-hover/table:opacity-100 hover:scale-110 active:scale-90"
                onClick={(e) => {
                  e.stopPropagation()
                  const data = el.tableData || (el.content as string[][]) || []
                  if (data.length > 0) {
                    if (el.tableData) {
                      const newData = el.tableData.map(
                        (row: { text: string; isHeader?: boolean }[]) => [
                          ...row,
                          { text: "" },
                        ]
                      )
                      onUpdate({ tableData: newData })
                    } else {
                      const newContent = ((el.content as string[][]) || []).map(
                        (row: string[]) => [...row, ""]
                      )
                      onUpdate({ content: newContent })
                    }
                  }
                }}
              >
                <Plus className="size-3" />
              </button>
            </>
          )}

          {el.type === "image" && (
            <div
              className="group/img relative h-full w-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                if (!el.src) {
                  e.stopPropagation()
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.onchange = (e: Event) => {
                    const file = (e.target as HTMLInputElement)?.files?.[0]
                    if (file) {
                      onUpdate({ src: "loading" })
                      uploadFileToCloudinary(file)
                        .then((data) => {
                          onUpdate({ src: data.secureUrl })
                        })
                        .catch((err) => {
                          console.error("Upload failed", err)
                          onUpdate({ src: "" })
                        })
                    }
                  }
                  input.click()
                }
              }}
            >
              {el.src && el.src !== "loading" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={el.src}
                  alt="Uploaded content"
                  className="pointer-events-none h-full w-full"
                  style={{ objectFit: el.objectFit || "cover" }}
                />
              ) : (
                <div
                  className={cn(
                    "bg-muted/20 flex h-full w-full flex-col items-center justify-center gap-3 transition-all",
                    el.src === "loading"
                      ? "animate-pulse"
                      : "group-hover/img:bg-muted/30"
                  )}
                >
                  {el.src === "loading" ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 flex size-8 animate-spin items-center justify-center rounded-full">
                        <Loader2 className="text-primary size-4" />
                      </div>
                      <span className="text-primary/70 text-[10px] font-bold tracking-wider uppercase">
                        Generating...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full",
                          "bg-muted/40 group-hover/img:bg-primary/10 transition-colors"
                        )}
                      >
                        <ImageIcon className="text-muted-foreground group-hover/img:text-primary size-5 transition-colors" />
                      </div>
                      <span className="text-muted-foreground/40 group-hover/img:text-primary/70 text-[10px] font-black tracking-[0.2em] uppercase transition-colors">
                        Click to Upload Image
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {el.type === "shape" && (
            <div
              className="h-full w-full"
              style={{
                backgroundColor: el.color || defaultTextColor,
                opacity: el.opacity ?? 1,
                borderRadius: el.shapeType === "circle" ? "100%" : "0px",
              }}
            />
          )}

          {el.type && el.type.includes("chart") && (
            <div
              className={cn(
                "group/chart relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-4",
                (el as { showCard?: boolean }).showCard !== false &&
                  "bg-background/30 border-border/10 border backdrop-blur-sm"
              )}
            >
              {el.chartTitle && (
                <div
                  className="mb-4 text-center text-[10px] font-black tracking-[0.2em] uppercase"
                  style={{
                    color: el.color || defaultTextColor,
                  }}
                >
                  {el.chartTitle}
                </div>
              )}
              <div className="min-h-0 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  {el.type === "bar-chart" ? (
                    <BarChart data={el.chartData || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis
                        dataKey="label"
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      >
                        {(el.chartData || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || el.color || "#8884d8"}
                          />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            fill: el.color || defaultTextColor,
                          }}
                        />
                      </Bar>
                    </BarChart>
                  ) : el.type === "pie-chart" ? (
                    <PieChart>
                      <Pie
                        data={el.chartData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="label"
                        label={({ label, value, x, y, textAnchor }) => (
                          <text
                            x={x}
                            y={y}
                            fill={el.color || defaultTextColor}
                            textAnchor={textAnchor}
                            dominantBaseline="central"
                            fontSize={10}
                            fontWeight="bold"
                          >
                            {`${label}: ${value}`}
                          </text>
                        )}
                        isAnimationActive={false}
                      >
                        {(el.chartData || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || "#8884d8"}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  ) : el.type === "line-chart" ? (
                    <LineChart data={el.chartData || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis
                        dataKey="label"
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={el.color || "#8884d8"}
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: el.color || "#8884d8",
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          offset={10}
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            fill: el.color || defaultTextColor,
                          }}
                        />
                      </Line>
                    </LineChart>
                  ) : el.type === "area-chart" ? (
                    <AreaChart
                      data={el.chartData || []}
                      margin={{ left: -20, right: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis
                        dataKey="label"
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Area
                        type="natural"
                        dataKey="value"
                        stroke={el.color || "#8884d8"}
                        fill={el.color || "#8884d8"}
                        fillOpacity={0.3}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          offset={10}
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            fill: el.color || defaultTextColor,
                          }}
                        />
                      </Area>
                    </AreaChart>
                  ) : el.type === "radar-chart" ? (
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={el.chartData || []}
                    >
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                      <PolarAngleAxis
                        dataKey="label"
                        fontSize={8}
                        tick={{
                          fill: el.color || defaultTextColor,
                          opacity: 0.7,
                        }}
                      />
                      <Radar
                        name="Value"
                        dataKey="value"
                        stroke={el.color || "#8884d8"}
                        fill={el.color || "#8884d8"}
                        fillOpacity={0.6}
                        dot={{ r: 4 }}
                        isAnimationActive={false}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            fill: el.color || defaultTextColor,
                          }}
                        />
                      </Radar>
                    </RadarChart>
                  ) : el.type === "radial-chart" ? (
                    <RadialBarChart
                      innerRadius="30%"
                      outerRadius="100%"
                      barSize={10}
                      data={el.chartData || []}
                    >
                      <RadialBar
                        label={{
                          position: "insideStart",
                          fill: "#fff",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                        background
                        dataKey="value"
                        isAnimationActive={false}
                      />
                    </RadialBarChart>
                  ) : (
                    <div />
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-background/95 w-56 rounded-2xl border-none p-2 shadow-2xl backdrop-blur-xl">
        {el.type === "image" && (
          <>
            <div className="text-primary/40 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
              Image Scaling
            </div>
            <ContextMenuItem
              className={cn(
                "h-10 gap-3 rounded-xl px-4 font-bold",
                el.isFullSpace && "bg-primary/10 text-primary"
              )}
              onClick={() => {
                onUpdate({ isFullSpace: !el.isFullSpace })
              }}
            >
              <Maximize2 className="size-4" />
              {el.isFullSpace ? "Locked to Zone" : "Take Whole Space"}
            </ContextMenuItem>

            <Separator className="my-1 opacity-50" />

            <div className="text-primary/40 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
              Display Mode
            </div>
            <ContextMenuItem
              className={cn(
                "h-10 gap-3 rounded-xl px-4 font-bold",
                el.objectFit === "cover" && "bg-primary/10 text-primary"
              )}
              onClick={() => onUpdate({ objectFit: "cover" })}
            >
              <Expand className="size-4" />
              Fill Space (Cover)
            </ContextMenuItem>
            <ContextMenuItem
              className={cn(
                "h-10 gap-3 rounded-xl px-4 font-bold",
                el.objectFit === "contain" && "bg-primary/10 text-primary"
              )}
              onClick={() => onUpdate({ objectFit: "contain" })}
            >
              <Minimize2 className="size-4" />
              Fit to Frame
            </ContextMenuItem>
            <ContextMenuItem
              className={cn(
                "h-10 gap-3 rounded-xl px-4 font-bold",
                el.objectFit === "fill" && "bg-primary/10 text-primary"
              )}
              onClick={() => onUpdate({ objectFit: "fill" })}
            >
              <StretchHorizontal className="size-4" />
              Stretch to Fill
            </ContextMenuItem>

            <Separator className="my-1 opacity-50" />
          </>
        )}

        <div className="text-primary/40 px-3 py-2 text-[9px] font-black tracking-[0.3em] uppercase">
          Layering
        </div>
        <ContextMenuItem
          className="h-10 gap-3 rounded-xl px-4 font-bold"
          onClick={onBringToFront}
        >
          <ArrowUpToLine className="size-4" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuItem
          className="h-10 gap-3 rounded-xl px-4 font-bold"
          onClick={onBringForward}
        >
          <ArrowUp className="size-4" />
          Bring Forward
        </ContextMenuItem>
        <ContextMenuItem
          className="h-10 gap-3 rounded-xl px-4 font-bold"
          onClick={onSendBackward}
        >
          <ArrowDown className="size-4" />
          Send Backward
        </ContextMenuItem>
        <ContextMenuItem
          className="h-10 gap-3 rounded-xl px-4 font-bold"
          onClick={onSendToBack}
        >
          <ArrowDownToLine className="size-4" />
          Send to Back
        </ContextMenuItem>

        <Separator className="my-1 opacity-50" />

        <ContextMenuItem
          className="text-destructive focus:text-destructive flex h-10 gap-3 rounded-xl px-4 font-bold"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          Delete Element
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
