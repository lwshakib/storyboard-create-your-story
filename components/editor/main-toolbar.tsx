"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Type, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Palette,
  SeparatorHorizontal,
  Plus,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { Slide, ElementType, SlideElement } from "@/types/editor"
import { uploadFileToCloudinary } from "@/lib/editor-utils"

interface MainToolbarProps {
  activeSlide: Slide
  selectedElementId: string | null
  onAddElement: (type: ElementType, config?: any) => void
  onApplyLayout: (type: any) => void
  onUpdateSlide: (updates: Partial<Slide>) => void
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void
}

export function MainToolbar({ activeSlide, selectedElementId, onAddElement, onApplyLayout, onUpdateSlide, onUpdateElement }: MainToolbarProps) {
    const handleDragStart = (e: React.DragEvent, type: ElementType) => {
      e.dataTransfer.setData("elementType", type)
    }

    const [tableRows, setTableRows] = React.useState(3)
    const [tableCols, setTableCols] = React.useState(3)
    const [isTableDialogOpen, setIsTableDialogOpen] = React.useState(false)

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-2xl border rounded-[28px] shadow-2xl ring-1 ring-black/5"
            >
                {/* Global Tools Section */}
                <div className="flex items-center gap-1.5">
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'text')}
                        onClick={() => onAddElement('text')} 
                        icon={<Type className="h-4 w-4" />} 
                        tooltip="Text" 
                    />
                    
                    <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                        <DialogTrigger asChild>
                            <ToolButton 
                                onDragStart={(e) => handleDragStart(e, 'table')}
                                icon={<TableIcon className="h-4 w-4" />} 
                                tooltip="Table (Click/Drag)" 
                            />
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[320px] rounded-[32px] border-none bg-background/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black tracking-tight uppercase mb-4 text-center">New Table</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-6 py-2 font-sans">
                                <div className="space-y-3">
                                    <Label htmlFor="rows" className="font-black uppercase text-[9px] tracking-[0.2em] opacity-40 ml-1">Rows</Label>
                                    <Input 
                                        id="rows" 
                                        type="number" 
                                        value={tableRows} 
                                        min={1} 
                                        max={20}
                                        onChange={(e) => setTableRows(parseInt(e.target.value))} 
                                        className="h-12 rounded-2xl bg-muted/50 border-none font-black text-lg focus-visible:ring-primary/20 px-6 transition-all" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="cols" className="font-black uppercase text-[9px] tracking-[0.2em] opacity-40 ml-1">Columns</Label>
                                    <Input 
                                        id="cols" 
                                        type="number" 
                                        value={tableCols} 
                                        min={1} 
                                        max={10}
                                        onChange={(e) => setTableCols(parseInt(e.target.value))} 
                                        className="h-12 rounded-2xl bg-muted/50 border-none font-black text-lg focus-visible:ring-primary/20 px-6 transition-all" 
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-8">
                                <Button 
                                    className="w-full h-14 rounded-[20px] bg-primary font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={() => {
                                        onAddElement('table', { rows: tableRows, cols: tableCols })
                                        setIsTableDialogOpen(false)
                                    }}
                                >
                                    Create Table
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <div className="relative">
                        <ToolButton 
                            onDragStart={(e) => handleDragStart(e, 'image')}
                            onClick={() => document.getElementById('image-upload')?.click()}
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
                                    // Add with loading state
                                    const x = 100 + (activeSlide.elements.length * 20)
                                    const y = 100 + (activeSlide.elements.length * 20)
                                    
                                    const newElement: SlideElement = {
                                        id: newId,
                                        type: 'image',
                                        content: '',
                                        x,
                                        y,
                                        width: 400,
                                        height: 300,
                                        src: 'loading',
                                        zone: 0
                                    }
                                    onUpdateSlide({ elements: [...activeSlide.elements, newElement] })
                                    
                                    uploadFileToCloudinary(file).then(data => {
                                        onUpdateElement(newId, { src: data.secureUrl })
                                    })
                                }
                            }}
                        />
                    </div>
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'shape')}
                        onClick={() => onAddElement('shape', { shapeType: 'rectangle' })} 
                        icon={<Square className="h-4 w-4" />} 
                        tooltip="Rectangle" 
                    />
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'shape')}
                        onClick={() => onAddElement('shape', { shapeType: 'circle' })} 
                        icon={<CircleIcon className="h-4 w-4" />} 
                        tooltip="Circle" 
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <ToolButton 
                                icon={<BarChart2 className="h-4 w-4" />} 
                                tooltip="Charts" 
                            />
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 bg-background/95 backdrop-blur-3xl rounded-2xl border-none shadow-2xl ring-1 ring-black/5" side="top" align="center">
                            <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-1">Add Chart</div>
                            <div className="grid grid-cols-1 gap-1">
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('bar-chart')}>
                                    <BarChart2 className="size-4 text-blue-500" /> Bar Chart
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('pie-chart')}>
                                    <PieChartIcon className="size-4 text-orange-500" /> Pie Chart
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('line-chart')}>
                                    <TrendingUp className="size-4 text-green-500" /> Line Chart
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('area-chart')}>
                                    <Plus className="size-4 text-purple-500" /> Area Chart
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('radar-chart')}>
                                    <Plus className="size-4 text-pink-500" /> Radar Chart
                                </Button>
                                <Button variant="ghost" className="justify-start gap-3 h-10 rounded-xl font-bold text-xs" onClick={() => onAddElement('radial-chart')}>
                                    <Plus className="size-4 text-yellow-500" /> Radial Chart
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator orientation="vertical" className="h-6 opacity-30" />

                {/* Background Settings Section */}
                <div className="flex items-center gap-1.5">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
                                <Palette className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 bg-background/95 backdrop-blur-3xl rounded-2xl border-none shadow-2xl ring-1 ring-black/5" side="top" align="center">
                            <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-2">Preset Backgrounds</div>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {Array.from({ length: 13 }).map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => onUpdateSlide({ bgImage: `/backgrounds/bg${i+1}.${i < 5 ? 'png' : 'jpg'}` })}
                                        className={cn(
                                            "aspect-video rounded-lg border border-black/5 transition-all hover:scale-110 active:scale-90 overflow-hidden",
                                            activeSlide.bgImage === `/backgrounds/bg${i+1}.${i < 5 ? 'png' : 'jpg'}` && "ring-2 ring-primary ring-offset-2"
                                        )}
                                    >
                                        <img src={`/backgrounds/bg${i+1}.${i < 5 ? 'png' : 'jpg'}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                <button 
                                    onClick={() => onUpdateSlide({ bgImage: '' })}
                                    className="aspect-video rounded-lg border border-border flex items-center justify-center text-[8px] font-black uppercase hover:bg-muted transition-all"
                                >
                                    None
                                </button>
                            </div>
                            <Separator className="my-3 opacity-50" />
                            <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-2">Background Color</div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#333333', '#1a1a1a', '#000000'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => onUpdateSlide({ bgColor: color, bgImage: '' })}
                                        className={cn(
                                            "size-6 rounded-lg border border-black/5 transition-all hover:scale-110 active:scale-90",
                                            activeSlide.bgColor === color && !activeSlide.bgImage && "ring-2 ring-primary ring-offset-2"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <Separator className="my-3 opacity-50" />
                            <div className="space-y-3">
                                <HexColorPicker 
                                    color={activeSlide.bgColor} 
                                    onChange={(color) => onUpdateSlide({ bgColor: color, bgImage: '' })}
                                    className="!w-full !h-32"
                                />
                                <div className="flex gap-2">
                                    <Input 
                                        className="h-8 text-[11px] font-mono rounded-lg border-primary/10"
                                        value={activeSlide.bgColor}
                                        onChange={(e) => onUpdateSlide({ bgColor: e.target.value, bgImage: '' })}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </motion.div>
        </div>
    )
}

function ToolButton({ icon, tooltip, active, onClick, onDragStart }: { icon: React.ReactNode, tooltip: string, active?: boolean, onClick?: () => void, onDragStart?: (e: React.DragEvent) => void }) {
    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClick}
            draggable={!!onDragStart}
            onDragStart={onDragStart}
            className={cn(
                "h-9 w-9 rounded-xl transition-all duration-300 shadow-none border-none",
                active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "hover:bg-primary/5 hover:text-primary active:scale-90",
                onDragStart && "cursor-grab active:cursor-grabbing"
            )}
        >
            {icon}
        </Button>
    )
}
