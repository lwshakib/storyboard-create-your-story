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
  onUpdate: (changes: any) => void
  clearSelection: () => void
}

export function ElementSettings({ selectedElData, onUpdate, clearSelection }: ElementSettingsProps) {
  const [text, setText] = React.useState("")
  const [color, setColor] = React.useState("")
  const [bgColor, setBgColor] = React.useState("")
  const [fontSize, setFontSize] = React.useState("")
  const [fontFamily, setFontFamily] = React.useState("")

  React.useEffect(() => {
    if (selectedElData) {
      setText(selectedElData.content || "")
      setColor(rgbToHex(selectedElData.styles.color))
      setBgColor(rgbToHex(selectedElData.styles.backgroundColor))
      setFontSize(selectedElData.styles.fontSize)
      setFontFamily(selectedElData.styles.fontFamily.replace(/['"]/g, ""))
    }
  }, [selectedElData])

  const handleUpdate = (changes: any) => {
    onUpdate(changes)
  }

  const deleteElement = () => {
    handleUpdate({ display: 'none' }) // Simplest way to "remove" via styles
    clearSelection()
  }

  if (!selectedElData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Layout className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Select an element on the slide to edit its properties.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Type className="h-4 w-4" />
          {selectedElData.tagName} Properties
        </h3>
        <Button variant="ghost" size="icon" onClick={clearSelection} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* Text Content */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Text Content</Label>
          <Input 
            value={text} 
            onChange={(e) => {
              setText(e.target.value)
              handleUpdate({ innerText: e.target.value })
            }}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
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
                className="w-10 h-10 p-1 bg-transparent border-none cursor-pointer"
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
            <Label className="text-xs font-semibold text-muted-foreground">Background</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={bgColor} 
                onChange={(e) => {
                  setBgColor(e.target.value)
                  handleUpdate({ backgroundColor: e.target.value })
                }}
                className="w-10 h-10 p-1 bg-transparent border-none cursor-pointer"
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

        {/* Typography */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <FontIcon className="h-3 w-3" /> Font Family
          </Label>
          <Select value={fontFamily} onValueChange={(val) => {
            setFontFamily(val)
            handleUpdate({ fontFamily: val })
          }}>
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

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Size</Label>
              <Input 
                value={fontSize} 
                onChange={(e) => {
                  setFontSize(e.target.value)
                  handleUpdate({ fontSize: e.target.value })
                }}
              />
           </div>
           <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Alignment</Label>
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="flex-1 rounded-none h-9 border-r"
                  onClick={() => handleUpdate({ textAlign: 'left' })}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="flex-1 rounded-none h-9 border-r"
                  onClick={() => handleUpdate({ textAlign: 'center' })}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="flex-1 rounded-none h-9"
                  onClick={() => handleUpdate({ textAlign: 'right' })}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
           </div>
        </div>
      </div>

      <Separator />

      <Button variant="destructive" className="w-full gap-2" onClick={deleteElement}>
        <Trash2 className="h-4 w-4" />
        Remove Element
      </Button>
    </div>
  )
}

function TriggerWithLabel({ val }: { val: string }) {
  return (
    <SelectTrigger className="w-full text-xs">
      <SelectValue placeholder="Font Family">{val}</SelectValue>
    </SelectTrigger>
  )
}

function rgbToHex(rgb: string) {
  if (!rgb) return "#000000"
  if (rgb.startsWith('#')) return rgb
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
  if (!match) return "#000000"
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
