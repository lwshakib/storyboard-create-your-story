"use client"

import * as React from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from "@/components/ui/sidebar"
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
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Type, 
  MousePointer2,
  ChevronLeft,
  Settings2,
  Undo2,
  Redo2,
  Share2,
  Trash2,
  Columns,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Split,
  Upload,
  Pipette,
  Palette
} from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { LogoIcon } from "@/components/logo"
import Link from "next/link"

type ElementType = 'text' | 'image' | 'table';
type LayoutType = 'free' | 'split-h' | 'split-v';

interface SlideElement {
  id: string;
  type: ElementType;
  content: any;
  x: number;
  y: number;
  width: number;
  height: number;
  textAlign?: 'left' | 'center' | 'right';
  isPendingUpload?: boolean;
  zone?: 0 | 1;
}

interface Slide {
  id: number;
  elements: SlideElement[];
  layout: LayoutType;
  splitRatio: number;
  bgColor?: string;
}

export default function EditorPage() {
  const [slides, setSlides] = React.useState<Slide[]>([
    { id: 1, elements: [], layout: 'free', splitRatio: 0.5, bgColor: '#ffffff' }
  ])
  const [activeSlideId, setActiveSlideId] = React.useState(1)
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null)
  
  const canvasRef = React.useRef<HTMLDivElement>(null)

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0]

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        if ((document.activeElement as HTMLElement)?.contentEditable === 'true') return
        deleteElement(selectedElementId)
        setSelectedElementId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementId, activeSlideId])

  const addSlide = () => {
    const newId = Math.max(...slides.map(s => s.id), 0) + 1
    setSlides([...slides, { id: newId, elements: [], layout: 'free', splitRatio: 0.5, bgColor: '#ffffff' }])
    setActiveSlideId(newId)
  }

  const deleteSlide = (id: number) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter(s => s.id !== id)
    setSlides(newSlides)
    if (activeSlideId === id) {
      setActiveSlideId(newSlides[0].id)
    }
  }

  const addElementAtPos = (type: ElementType, x: number, y: number, isPending: boolean = false) => {
    let zone: 0 | 1 = 0
    if (activeSlide.layout === 'split-h') {
        zone = x + 150 > (canvasRef.current?.offsetWidth || 0) * activeSlide.splitRatio ? 1 : 0
    } else if (activeSlide.layout === 'split-v') {
        zone = y + 50 > (canvasRef.current?.offsetHeight || 0) * activeSlide.splitRatio ? 1 : 0
    }

    const newElement: SlideElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? 'New Text' : type === 'image' ? null : [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
      x,
      y,
      width: type === 'text' ? 300 : 300,
      height: type === 'text' ? 100 : 200,
      textAlign: 'left',
      isPendingUpload: isPending,
      zone
    }

    updateActiveSlide({ elements: [...activeSlide.elements, newElement] })
    setSelectedElementId(newElement.id)
  }

  const addElement = (type: ElementType) => {
    addElementAtPos(type, 100, 100)
  }

  const updateElement = (id: string, updates: Partial<SlideElement>) => {
    updateActiveSlide({
      elements: activeSlide.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    })
  }

  const deleteElement = (id: string) => {
    updateActiveSlide({
      elements: activeSlide.elements.filter(el => el.id !== id)
    })
    if (selectedElementId === id) setSelectedElementId(null)
  }

  const updateActiveSlide = (updates: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === activeSlideId ? { ...s, ...updates } : s))
  }

  const applyLayout = (type: LayoutType | 'title' | 'image-text') => {
    if (type === 'split-h' || type === 'split-v') {
      updateActiveSlide({ layout: type, splitRatio: 0.5 })
      return
    }
    
    if (type === 'title') {
      const titleElement: SlideElement = {
        id: 'title-' + Math.random(),
        type: 'text',
        content: 'Title of Your Story',
        x: 40,
        y: 40,
        width: 400,
        height: 60,
        textAlign: 'left',
      }
      updateActiveSlide({ layout: 'free', elements: [...activeSlide.elements, titleElement] })
    } else if (type === 'image-text') {
      const img: SlideElement = {
        id: 'img-' + Math.random(),
        type: 'image',
        content: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800',
        x: 50,
        y: 50,
        width: 400,
        height: 400,
      }
      const txt: SlideElement = {
        id: 'txt-' + Math.random(),
        type: 'text',
        content: 'Add your description here...',
        x: 500,
        y: 100,
        width: 400,
        height: 300,
        textAlign: 'left'
      }
      updateActiveSlide({ layout: 'free', elements: [...activeSlide.elements, img, txt] })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("elementType") as ElementType
    if (!type || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 150 
    const y = e.clientY - rect.top - 50 

    addElementAtPos(type, x, y, type === 'image')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans selection:bg-primary/20">
        <EditorSidebar 
          slides={slides} 
          activeSlideId={activeSlideId} 
          setActiveSlideId={setActiveSlideId} 
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
        />
        
        <SidebarInset className="relative flex flex-col flex-1 bg-muted/20">
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-6 border-b bg-background/50 backdrop-blur-xl">
                <div className="flex items-center gap-4 text-sm font-medium">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-muted">
                        <Link href="/home">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Separator orientation="vertical" className="h-5 bg-border/50" />
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight">Untitled Storyboard</span>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest opacity-60">Creative Draft</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex bg-muted/50 rounded-xl p-1 mr-2 border border-border/10">
                        <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-lg opacity-40"><Undo2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-lg opacity-40"><Redo2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="flex items-center px-4 py-1.5 bg-green-500/5 border border-green-500/10 rounded-full mr-2">
                        <div className="size-1.5 bg-green-500 rounded-full animate-pulse mr-2" />
                        <span className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider">Cloud Saved</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 gap-2 font-bold px-4 rounded-xl border-dashed hover:border-solid transition-all active:scale-95">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    <Button size="sm" className="h-9 bg-primary font-bold px-5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm">Present</Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-16 flex items-center justify-center relative bg-[#F8F9FB] dark:bg-[#0A0A0B]">
                {/* Subtle Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                <AnimatePresence mode="wait">
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <motion.div
                            key={activeSlideId}
                            ref={canvasRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="aspect-video w-full max-w-5xl bg-background rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border relative overflow-hidden"
                            style={{ backgroundColor: activeSlide.bgColor || '#ffffff' }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => setSelectedElementId(null)}
                        >
                            {/* Partition Background Overlay (Subtle split indicator) */}
                        {activeSlide.layout !== 'free' && (
                          <div className="absolute inset-0 pointer-events-none z-0">
                            {activeSlide.layout === 'split-h' && (
                              <div className="h-full border-r border-primary/20" style={{ width: `${activeSlide.splitRatio * 100}%` }} />
                            )}
                            {activeSlide.layout === 'split-v' && (
                              <div className="w-full border-b border-primary/20" style={{ height: `${activeSlide.splitRatio * 100}%` }} />
                            )}
                          </div>
                        )}

                        <div className="absolute inset-0 z-10">
                          {activeSlide.layout === 'free' ? (
                            activeSlide.elements.map((el) => (
                              <ElementWrapper 
                                  key={el.id}
                                  el={el}
                                  isSelected={selectedElementId === el.id}
                                  onSelect={() => setSelectedElementId(el.id)}
                                  onUpdate={(updates) => updateElement(el.id, updates)}
                                  onDelete={() => deleteElement(el.id)}
                                  canvasRef={canvasRef}
                                  layout={activeSlide.layout}
                                  splitRatio={activeSlide.splitRatio}
                              />
                            ))
                          ) : (
                            <>
                              {/* Zone 0 */}
                              <div 
                                className="absolute inset-0 overflow-hidden" 
                                style={{ 
                                  clipPath: activeSlide.layout === 'split-h' 
                                    ? `inset(0 ${(1 - activeSlide.splitRatio) * 100}% 0 0)`
                                    : `inset(0 0 ${(1 - activeSlide.splitRatio) * 100}% 0)`
                                }}
                              >
                                {activeSlide.elements.filter(el => !el.zone || el.zone === 0).map((el) => (
                                  <ElementWrapper 
                                      key={el.id}
                                      el={el}
                                      isSelected={selectedElementId === el.id}
                                      onSelect={() => setSelectedElementId(el.id)}
                                      onUpdate={(updates) => updateElement(el.id, updates)}
                                      onDelete={() => deleteElement(el.id)}
                                      canvasRef={canvasRef}
                                      layout={activeSlide.layout}
                                      splitRatio={activeSlide.splitRatio}
                                  />
                                ))}
                              </div>
                              {/* Zone 1 */}
                              <div 
                                className="absolute inset-0 overflow-hidden" 
                                style={{ 
                                  clipPath: activeSlide.layout === 'split-h' 
                                    ? `inset(0 0 0 ${activeSlide.splitRatio * 100}%)`
                                    : `inset(${activeSlide.splitRatio * 100}% 0 0 0)`
                                }}
                              >
                                {activeSlide.elements.filter(el => el.zone === 1).map((el) => (
                                  <ElementWrapper 
                                      key={el.id}
                                      el={el}
                                      isSelected={selectedElementId === el.id}
                                      onSelect={() => setSelectedElementId(el.id)}
                                      onUpdate={(updates) => updateElement(el.id, updates)}
                                      onDelete={() => deleteElement(el.id)}
                                      canvasRef={canvasRef}
                                      layout={activeSlide.layout}
                                      splitRatio={activeSlide.splitRatio}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Partition Handle (Split Trigger) */}
                        {activeSlide.layout !== 'free' && (
                          <div 
                            className={cn(
                              "absolute z-40 flex items-center justify-center group/split",
                              activeSlide.layout === 'split-h' ? "h-full w-4 cursor-col-resize -translate-x-1/2" : "w-full h-4 cursor-row-resize -translate-y-1/2"
                            )}
                            style={{ 
                              left: activeSlide.layout === 'split-h' ? `${activeSlide.splitRatio * 100}%` : 0,
                              top: activeSlide.layout === 'split-v' ? `${activeSlide.splitRatio * 100}%` : 0
                            }}
                            onMouseDown={(e) => {
                              const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                              if (!rect) return
                              
                              const onMouseMove = (moveEvent: MouseEvent) => {
                                if (activeSlide.layout === 'split-h') {
                                  const ratio = (moveEvent.clientX - rect.left) / rect.width
                                  updateActiveSlide({ splitRatio: Math.max(0.1, Math.min(0.9, ratio)) })
                                } else {
                                  const ratio = (moveEvent.clientY - rect.top) / rect.height
                                  updateActiveSlide({ splitRatio: Math.max(0.1, Math.min(0.9, ratio)) })
                                }
                              }
                              const onMouseUp = () => {
                                window.removeEventListener('mousemove', onMouseMove)
                                window.removeEventListener('mouseup', onMouseUp)
                              }
                              window.addEventListener('mousemove', onMouseMove)
                              window.addEventListener('mouseup', onMouseUp)
                            }}
                          >
                            <div className={cn(
                              "bg-primary/20 group-hover/split:bg-primary/40 transition-colors rounded-full",
                              activeSlide.layout === 'split-h' ? "w-0.5 h-full" : "h-0.5 w-full"
                            )} />
                            <div className="absolute bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-full p-2 opacity-0 group-hover/split:opacity-100 scale-75 group-hover/split:scale-100 transition-all duration-200">
                              <Split className={cn("size-3.5 text-primary", activeSlide.layout === 'split-v' && "rotate-90")} />
                            </div>
                          </div>
                        )}

                        </motion.div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64 rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl ring-1 ring-black/5">
                        <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">Canvas Layout</div>
                        <ContextMenuItem className="gap-3 h-10 rounded-xl font-bold px-3 transition-all active:scale-95" onClick={() => applyLayout('free')}>
                          <MousePointer2 className="size-4" /> Unified Canvas
                        </ContextMenuItem>
                        <ContextMenuItem className="gap-3 h-10 rounded-xl font-bold px-3 transition-all active:scale-95" onClick={() => applyLayout('split-h')}>
                          <Columns className="size-4" /> Vertical Split
                        </ContextMenuItem>
                        <ContextMenuItem className="gap-3 h-10 rounded-xl font-bold px-3 transition-all active:scale-95" onClick={() => applyLayout('split-v')}>
                          <Split className="size-4 rotate-90" /> Horizontal Split
                        </ContextMenuItem>
                        
                        <Separator className="my-2 mx-2 opacity-50" />
                        <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">Presets</div>
                        <ContextMenuItem className="gap-3 h-10 rounded-xl font-bold px-3 transition-all active:scale-95" onClick={() => applyLayout('title')}>
                          <Type className="size-4" /> Title Slide
                        </ContextMenuItem>
                        <ContextMenuItem className="gap-3 h-10 rounded-xl font-bold px-3 transition-all active:scale-95" onClick={() => applyLayout('image-text')}>
                          <ImageIcon className="size-4" /> Image & Text
                        </ContextMenuItem>

                      </ContextMenuContent>
                    </ContextMenu>
                </AnimatePresence>

                <MainToolbar 
                    activeSlide={activeSlide} 
                    selectedElementId={selectedElementId} 
                    onAddElement={addElement} 
                    onApplyLayout={applyLayout} 
                    onUpdateSlide={updateActiveSlide}
                    onDeleteElement={() => selectedElementId && deleteElement(selectedElementId)}
                />
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function ElementWrapper({ el, isSelected, onSelect, onUpdate, onDelete, canvasRef, layout, splitRatio }: { el: SlideElement, isSelected: boolean, onSelect: () => void, onUpdate: (updates: Partial<SlideElement>) => void, onDelete: () => void, canvasRef: React.RefObject<HTMLDivElement>, layout: LayoutType, splitRatio: number }) {
  const [isResizing, setIsResizing] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const x = useMotionValue(el.x);
  const y = useMotionValue(el.y);
  const width = useMotionValue(el.width);
  const height = useMotionValue(el.height);

  // Sync motion values with props but ONLY when not being dragged/resized manually
  React.useEffect(() => {
    if (!isResizing) {
      x.set(el.x);
      y.set(el.y);
      width.set(el.width);
      height.set(el.height);
    }
  }, [el.x, el.y, el.width, el.height, isResizing]);

  React.useEffect(() => {
    if (!isSelected) {
      setIsEditing(false)
    }
  }, [isSelected])

  const handleWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isSelected) {
      onSelect()
    } else if (el.type === 'text') {
      setIsEditing(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onUpdate({ content: url, isPendingUpload: false })
    }
  }

    const startResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = el.width
    const startHeight = el.height
    const startXPos = el.x
    const startYPos = el.y

    const onMouseMove = (moveEvent: MouseEvent) => {
      let deltaX = moveEvent.clientX - startX
      let deltaY = moveEvent.clientY - startY
      
      let newWidth = startWidth
      let newHeight = startHeight
      let newX = startXPos
      let newY = startYPos

      // Standard Corner/Edge Resizing for all elements
      if (direction.includes('e')) newWidth = Math.max(50, startWidth + deltaX)
      if (direction.includes('s')) newHeight = Math.max(20, startHeight + deltaY)
      
      if (direction.includes('w')) {
        const potentialWidth = Math.max(50, startWidth - deltaX)
        if (potentialWidth !== 50) {
          newWidth = potentialWidth
          newX = startXPos + deltaX
        }
      }
      if (direction.includes('n')) {
        const potentialHeight = Math.max(20, startHeight - deltaY)
        if (potentialHeight !== 20) {
          newHeight = potentialHeight
          newY = startYPos + deltaY
        }
      }

      x.set(newX)
      y.set(newY)
      width.set(newWidth)
      height.set(newHeight)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      
      const finalX = x.get()
      const finalY = y.get()
      const finalWidth = width.get()
      const finalHeight = height.get()
      
      let newZone = el.zone || 0
      if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect()
          const centerX = finalX + finalWidth / 2
          const centerY = finalY + finalHeight / 2
          
          if (layout === 'split-h') {
              newZone = centerX > rect.width * splitRatio ? 1 : 0
          } else if (layout === 'split-v') {
              newZone = centerY > rect.height * splitRatio ? 1 : 0
          }
      }

      onUpdate({ 
        x: finalX, 
        y: finalY, 
        width: finalWidth, 
        height: finalHeight, 
        zone: newZone as any 
      })
      
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.div
          drag={!isResizing && !isEditing}
          dragMomentum={false}
          dragElastic={0}
          onDragEnd={(_, info) => {
              const newX = el.x + info.offset.x
              const newY = el.y + info.offset.y
              
              let newZone = el.zone || 0
              if (canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect()
                  const centerX = newX + el.width / 2
                  const centerY = newY + el.height / 2
                  
                  if (layout === 'split-h') {
                      newZone = centerX > rect.width * splitRatio ? 1 : 0
                  } else if (layout === 'split-v') {
                      newZone = centerY > rect.height * splitRatio ? 1 : 0
                  }
              }

              onUpdate({ x: newX, y: newY, zone: newZone as any })
          }}
          onClick={handleWrapperClick}
          style={{ 
              x, 
              y, 
              width: el.type === 'text' ? el.width : width, 
              height: el.type === 'text' ? 'auto' : height,
              minHeight: el.type === 'text' ? 'auto' : height,
              position: 'absolute',
              top: 0,
              left: 0,
              transformOrigin: "0 0" // Critical for stable resizing
          }}
          className={cn(
            "group/element cursor-move",
            isSelected && "ring-2 ring-primary rounded-xl z-20",
            !isSelected && "hover:ring-1 hover:ring-primary/20",
            el.type === 'text' && "h-auto"
          )}
        >
          {/* Alignment Controls Overlay */}
          {isSelected && el.type === 'text' && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border shadow-2xl rounded-2xl p-1.5 z-[110]"
            >
              <Button variant="ghost" size="icon" className={cn("size-9 rounded-xl transition-all", el.textAlign === 'left' && "bg-primary/10 text-primary")} onClick={() => onUpdate({ textAlign: 'left' })}>
                <AlignLeft className="size-4.5" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("size-9 rounded-xl transition-all", el.textAlign === 'center' && "bg-primary/10 text-primary")} onClick={() => onUpdate({ textAlign: 'center' })}>
                <AlignCenter className="size-4.5" />
              </Button>
              <Button variant="ghost" size="icon" className={cn("size-9 rounded-xl transition-all", el.textAlign === 'right' && "bg-primary/10 text-primary")} onClick={() => onUpdate({ textAlign: 'right' })}>
                <AlignRight className="size-4.5" />
              </Button>
            </motion.div>
          )}

          {/* Resizing Nodes and Zones */}
          {isSelected && !isEditing && (
            <>
              {/* Corner Nodes - Styled like pro design tools */}
              <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-background border-2 border-primary rounded-sm cursor-nwse-resize z-[60] shadow-sm hover:scale-125 transition-transform" onMouseDown={(e) => startResize(e, 'nw')} />
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-background border-2 border-primary rounded-sm cursor-nesw-resize z-[60] shadow-sm hover:scale-125 transition-transform" onMouseDown={(e) => startResize(e, 'ne')} />
              <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-background border-2 border-primary rounded-sm cursor-nesw-resize z-[60] shadow-sm hover:scale-125 transition-transform" onMouseDown={(e) => startResize(e, 'sw')} />
              <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-background border-2 border-primary rounded-sm cursor-nwse-resize z-[60] shadow-sm hover:scale-125 transition-transform" onMouseDown={(e) => startResize(e, 'se')} />
              
              {/* Border Drag Zones */}
              <div className="absolute top-0 left-0 w-full h-1 cursor-n-resize z-50 transition-colors" onMouseDown={(e) => startResize(e, 'n')} />
              <div className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize z-50 transition-colors" onMouseDown={(e) => startResize(e, 's')} />
              <div className="absolute top-0 left-0 w-1 h-full cursor-w-resize z-50 transition-colors" onMouseDown={(e) => startResize(e, 'w')} />
              <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize z-50 transition-colors" onMouseDown={(e) => startResize(e, 'e')} />
            </>
          )}

          {el.type === 'text' && (
              <div 
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    onUpdate({ content: e.currentTarget.textContent })
                    setIsEditing(false)
                  }}
                  className={cn(
                    "w-full p-4 outline-none rounded-xl break-words whitespace-pre-wrap min-h-[1em] font-medium leading-relaxed transition-all",
                    isEditing ? "focus:ring-1 ring-primary/30" : "pointer-events-none select-none"
                  )}
                  style={{ textAlign: el.textAlign || 'left' }}
              >
                  {el.content}
              </div>
          )}
          {el.type === 'image' && (
              <div className="w-full h-full relative group p-0.5">
                {el.isPendingUpload ? (
                  <div 
                    className="w-full h-full bg-muted/20 border-2 border-dashed border-primary/10 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group/upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-primary/10 p-5 rounded-2xl group-hover/upload:scale-110 group-hover/upload:bg-primary/20 transition-all">
                      <Upload className="size-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-black text-primary/60 tracking-wider uppercase">Select Media</span>
                      <span className="text-[9px] font-bold text-muted-foreground/40 italic">Drop or Click</span>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                ) : (
                  <img src={el.content} alt="Element" className="w-full h-full object-cover rounded-[14px] pointer-events-none select-none shadow-sm ring-1 ring-black/5" />
                )}
              </div>
          )}
          {el.type === 'table' && (
              <div className="w-full h-full border rounded-xl overflow-hidden pointer-events-none select-none flex items-center justify-center bg-muted/10 p-4">
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <TableIcon className="size-8 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Dynamic Table</span>
                </div>
              </div>
          )}
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
        <ContextMenuItem 
          className="text-destructive focus:text-destructive flex gap-3 h-10 rounded-xl font-bold px-4"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          Delete Element
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function EditorSidebar({ slides, activeSlideId, setActiveSlideId, onAddSlide, onDeleteSlide }: any) {
  return (
    <Sidebar collapsible="none" className="w-72 border-r bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <LogoIcon className="size-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-foreground uppercase leading-none">Storyboarder</span>
              <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase mt-1 opacity-50">Editor v1.0</span>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between py-6 px-6">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Story Slides</SidebarGroupLabel>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg border-dashed hover:border-solid hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
                onClick={onAddSlide}
            >
                <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4 px-4 pb-10 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin scrollbar-thumb-primary/10">
            {slides.map((slide: any, index: number) => (
              <div 
                key={slide.id} 
                className="relative group pr-2"
              >
                <div 
                  onClick={() => setActiveSlideId(slide.id)}
                  className={cn(
                    "relative aspect-video rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                    activeSlideId === slide.id 
                      ? "border-primary bg-background shadow-[0_10px_30px_rgba(var(--primary),0.15)] ring-4 ring-primary/10" 
                      : "border-border/40 bg-muted/5 hover:border-border hover:bg-muted/10"
                  )}
                >
                    {/* Index Badge */}
                    <div className={cn(
                        "absolute top-2 left-2 z-10 w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-black border transition-colors",
                        activeSlideId === slide.id ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border"
                    )}>
                        {index + 1}
                    </div>

                    <div className="w-full h-full flex flex-col pt-8 px-3 opacity-40">
                      {slide.layout === 'split-h' && <div className="flex-1 w-full border-r border-dashed border-primary/20" style={{ width: `${slide.splitRatio * 100}%` }} />}
                      {slide.layout === 'split-v' && <div className="w-full border-b border-dashed border-primary/20" style={{ height: `${slide.splitRatio * 100}%` }} />}
                      <div className="flex-1 flex items-center justify-center text-[7px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {slide.layout}
                      </div>
                    </div>
                </div>
                
                {slides.length > 1 && (
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSlide(slide.id)
                        }}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function MainToolbar({ activeSlide, selectedElementId, onAddElement, onApplyLayout, onUpdateSlide, onDeleteElement }: any) {
    const handleDragStart = (e: React.DragEvent, type: ElementType) => {
      e.dataTransfer.setData("elementType", type)
    }

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur-2xl border rounded-[28px] shadow-2xl ring-1 ring-black/5"
            >
                {/* Global Tools Section */}
                <div className="flex items-center gap-2 px-2">
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'text')}
                        onClick={() => onAddElement('text')} 
                        icon={<Type className="h-4 w-4" />} 
                        tooltip="Text" 
                    />
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'image')}
                        icon={<ImageIcon className="h-4 w-4" />} 
                        tooltip="Image (Drag)" 
                    />
                    <ToolButton 
                        onDragStart={(e) => handleDragStart(e, 'table')}
                        icon={<TableIcon className="h-4 w-4" />} 
                        tooltip="Table (Drag)" 
                    />
                </div>

                <Separator orientation="vertical" className="h-8 mx-1 opacity-50" />

                {/* Canvas Settings Section */}
                <div className="flex items-center gap-2 px-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
                                <Columns className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-2 bg-background/95 backdrop-blur-3xl rounded-2xl border-none shadow-2xl ring-1 ring-black/5" side="top" align="center">
                            <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-1">Canvas Layout</div>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-[11px] font-bold px-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all" onClick={() => onApplyLayout('free')}>
                                <MousePointer2 className="h-4 w-4" /> Unified Canvas
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-[11px] font-bold px-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all" onClick={() => onApplyLayout('split-h')}>
                                <Columns className="h-4 w-4" /> Vertical Split
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-[11px] font-bold px-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all" onClick={() => onApplyLayout('split-v')}>
                                <Split className="h-4 w-4 rotate-90" /> Horizontal Split
                            </Button>
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-95">
                                <div className="size-4 rounded-md border border-black/10 shadow-sm" style={{ backgroundColor: activeSlide.bgColor }} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 bg-background/95 backdrop-blur-3xl rounded-2xl border-none shadow-2xl ring-1 ring-black/5" side="top" align="center">
                            <div className="px-3 py-2 text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-2">Background Color</div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#333333', '#1a1a1a', '#000000'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => onUpdateSlide({ bgColor: color })}
                                        className={cn(
                                            "size-6 rounded-lg border border-black/5 transition-all hover:scale-110 active:scale-90",
                                            activeSlide.bgColor === color && "ring-2 ring-primary ring-offset-2"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <Separator className="my-3 opacity-50" />
                            <div className="space-y-3">
                                <HexColorPicker 
                                    color={activeSlide.bgColor} 
                                    onChange={(color) => onUpdateSlide({ bgColor: color })}
                                    className="!w-full !h-32"
                                />
                                <div className="flex gap-2">
                                    <Input 
                                        className="h-8 text-[11px] font-mono rounded-lg border-primary/10"
                                        value={activeSlide.bgColor}
                                        onChange={(e) => onUpdateSlide({ bgColor: e.target.value })}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Element-Specific Section */}
                <AnimatePresence>
                    {selectedElementId && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0, scale: 0.8 }}
                            animate={{ width: "auto", opacity: 1, scale: 1 }}
                            exit={{ width: 0, opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 overflow-hidden border-l pl-3 ml-1 border-border/10"
                        >
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-all active:scale-95"
                                onClick={onDeleteElement}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Separator orientation="vertical" className="h-8 mx-1 opacity-50" />
                
                <div className="px-2">
                    <ToolButton icon={<Settings2 className="h-4 w-4" />} tooltip="Settings" />
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
