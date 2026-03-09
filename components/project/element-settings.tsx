"use client"

import * as React from "react"
import {
  X,
  Type,
  Palette,
  Trash2,
  Layout,
  Type as FontIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * ElementData: Interface representing the properties of a selected HTML element on the slide.
 * These properties are extracted from the slide's iframe and used to populate the settings panel.
 */
export interface ElementData {
  elementId: string
  tagName: string
  content: string
  styles: {
    color: string
    backgroundColor: string
    fontSize: string
    fontFamily: string
    textAlign: string
    padding: string
    margin: string
    borderRadius: string
  }
}

interface ElementSettingsProps {
  selectedElData: ElementData | null
  onUpdate: (changes: Partial<ElementData> | Record<string, unknown>) => void
  clearSelection: () => void
}

/**
 * ElementSettings Component: A contextual sidebar panel for editing individual HTML elements.
 * Features:
 * - Real-time synchronization: Edits in the panel are sent to the slide iframe via postMessage.
 * - Dynamic UI: Adjusts based on the selected tag (Text, Div, etc.).
 * - Color Picker: Converts CSS RGB values to Hex for the standard HTML color input.
 */
export function ElementSettings({
  selectedElData,
  onUpdate,
  clearSelection,
}: ElementSettingsProps) {
  // --- LOCAL INPUT STATES ---
  const [text, setText] = React.useState("")
  const [color, setColor] = React.useState("")
  const [bgColor, setBgColor] = React.useState("")
  const [fontSize, setFontSize] = React.useState("")
  const [fontFamily, setFontFamily] = React.useState("")

  // Update local state when a new element is selected or current element changes externally
  React.useEffect(() => {
    if (selectedElData) {
      setText(selectedElData.content || "")
      setColor(rgbToHex(selectedElData.styles.color))
      setBgColor(rgbToHex(selectedElData.styles.backgroundColor))
      setFontSize(selectedElData.styles.fontSize)
      setFontFamily(selectedElData.styles.fontFamily.replace(/['"]/g, ""))
    }
  }, [selectedElData])

  const handleUpdate = (
    changes: Partial<ElementData> | Record<string, unknown>
  ) => {
    onUpdate(changes)
  }

  /**
   * deleteElement: Effectively removes an element by setting its display to none.
   * This is sent as a style update to the slide preview.
   */
  const deleteElement = () => {
    handleUpdate({ display: "none" })
    clearSelection()
  }

  // EMPTY STATE: If no element is selected, show a helpful message
  if (!selectedElData) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center">
        <Layout className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-sm font-medium">
          Select an element on the slide to edit its properties.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <Type className="h-4 w-4" />
          {selectedElData.tagName} Properties
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSelection}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* TEXT CONTENT FIELD */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs font-semibold">
            Text Content
          </Label>
          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              handleUpdate({ innerText: e.target.value })
            }}
          />
        </div>

        {/* COLORS GRID: Text and Background */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
              <Palette className="h-3 w-3" /> Text Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  handleUpdate({ color: e.target.value })
                }}
                className="h-10 w-10 cursor-pointer border-none bg-transparent p-1"
              />
              <Input
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  handleUpdate({ color: e.target.value })
                }}
                className="flex-1 text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold">
              Background
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value)
                  handleUpdate({ backgroundColor: e.target.value })
                }}
                className="h-10 w-10 cursor-pointer border-none bg-transparent p-1"
              />
              <Input
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value)
                  handleUpdate({ backgroundColor: e.target.value })
                }}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>

        {/* TYPOGRAPHY Selectors */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
            <FontIcon className="h-3 w-3" /> Font Family
          </Label>
          <Select
            value={fontFamily}
            onValueChange={(val) => {
              setFontFamily(val)
              handleUpdate({ fontFamily: val })
            }}
          >
            <TriggerWithLabel val={fontFamily} />
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Outfit">Outfit</SelectItem>
              <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              <SelectItem value="system-ui">System</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SIZE AND ALIGNMENT Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold">
              Size
            </Label>
            <Input
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value)
                handleUpdate({ fontSize: e.target.value })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold">
              Alignment
            </Label>
            <div className="flex overflow-hidden rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 flex-1 rounded-none border-r"
                onClick={() => handleUpdate({ textAlign: "left" })}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 flex-1 rounded-none border-r"
                onClick={() => handleUpdate({ textAlign: "center" })}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 flex-1 rounded-none"
                onClick={() => handleUpdate({ textAlign: "right" })}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* DANGEROUS ACTION: Removal */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        onClick={deleteElement}
      >
        <Trash2 className="h-4 w-4" />
        Remove Element
      </Button>
    </div>
  )
}

/**
 * TriggerWithLabel: Custom select trigger that displays the current value as a placeholder.
 */
function TriggerWithLabel({ val }: { val: string }) {
  return (
    <SelectTrigger className="w-full text-xs">
      <SelectValue placeholder="Font Family">{val}</SelectValue>
    </SelectTrigger>
  )
}

/**
 * rgbToHex: Utility to convert CSS computed color strings (rgb/rgba) to Hex format.
 * Necessary because HTML color inputs only accept #RRGGBB.
 */
function rgbToHex(rgb: string) {
  if (!rgb) return "#000000"
  if (rgb.startsWith("#")) return rgb
  const match = rgb.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
  )
  if (!match) return "#000000"
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
