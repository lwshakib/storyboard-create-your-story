"use client"

import * as React from "react"
import { 
  SidebarProvider, 
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Type, 
  ImageIcon,
  MousePointer2,
  ChevronLeft,
  Undo2,
  Redo2,
  Columns,
  Split,
  Save,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { Slide, SlideElement, LayoutType, ElementType } from "@/types/editor"
import { SlidePreview } from "./slide-preview"
import { EditorSidebar } from "./editor-sidebar"
import { MainToolbar } from "./main-toolbar"
import { ElementWrapper } from "./element-wrapper"
import { uploadFileToCloudinary } from "@/lib/editor-utils"
import { exportToJson, exportToPpptx } from "@/lib/export-utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    Download, 
    Upload, 
    FileJson, 
    Presentation,
    Share2
} from "lucide-react"

interface EditorViewProps {
  initialData?: {
    id?: string
    title: string
    slides: Slide[]
  }
}

export function EditorView({ initialData }: EditorViewProps) {
  const [slides, setSlides] = React.useState<Slide[]>(initialData?.slides || [
    { id: 1, elements: [], layout: 'free', splitRatio: 0.5, bgColor: '#ffffff', bgImage: '' }
  ])
  const [activeSlideId, setActiveSlideId] = React.useState(slides[0].id)
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null)
  const [canvasScale, setCanvasScale] = React.useState(1)
  const [isPresenting, setIsPresenting] = React.useState(false)
  const [storyTitle, setStoryTitle] = React.useState(initialData?.title || "Untitled Storyboard")
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string)
            if (data.slides && Array.isArray(data.slides)) {
                setSlides(data.slides)
                setStoryTitle(data.title || "Imported Storyboard")
                setActiveSlideId(data.slides[0].id)
                toast.success("Project imported successfully")
                saveToHistory(data.slides)
            } else {
                toast.error("Invalid file format")
            }
        } catch (error) {
            toast.error("Failed to parse JSON file")
        }
    }
    reader.readAsText(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  React.useEffect(() => {
    if (initialData) {
      setSlides(initialData.slides)
      setStoryTitle(initialData.title || "Untitled Storyboard")
      if (initialData.slides.length > 0) {
        setActiveSlideId(initialData.slides[0].id)
      }
    }
  }, [initialData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = initialData?.id ? `/api/projects/${initialData.id}` : "/api/projects"
      const method = initialData?.id ? "PATCH" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyTitle,
          slides: slides,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(initialData?.id ? "Project updated" : "Project saved successfully")
        if (!initialData?.id) {
          // New project saved, redirect to details page
          router.push(`/project/${data.id}`)
        } else {
          router.refresh()
        }
      } else {
        toast.error("Failed to save project")
      }
    } catch (error) {
      console.error("Failed to save project", error)
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Undo/Redo History
  const [history, setHistory] = React.useState<Slide[][]>([slides])
  const [historyIndex, setHistoryIndex] = React.useState(0)

  const saveToHistory = (newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newSlides)))
    if (newHistory.length > 50) newHistory.shift()
    else setHistoryIndex(newHistory.length - 1)
    setHistory(newHistory)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setSlides(JSON.parse(JSON.stringify(prev)))
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setSlides(JSON.parse(JSON.stringify(next)))
      setHistoryIndex(historyIndex + 1)
    }
  }

  const updateSlidesWithHistory = (updater: (prev: Slide[]) => Slide[]) => {
    const newSlides = updater(slides)
    setSlides(newSlides)
    saveToHistory(newSlides)
  }

  const canvasRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth - 128
      const containerHeight = containerRef.current.offsetHeight - 128
      const scale = Math.min(containerWidth / 1024, containerHeight / 576)
      setCanvasScale(Math.min(scale, 1.2))
    }

    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)
    updateScale()
    window.addEventListener('resize', updateScale)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [])

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0]

  React.useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isPresenting) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        const nextIndex = slides.findIndex(s => s.id === activeSlideId) + 1
        if (nextIndex < slides.length) setActiveSlideId(slides[nextIndex].id)
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = slides.findIndex(s => s.id === activeSlideId) - 1
        if (prevIndex >= 0) setActiveSlideId(slides[prevIndex].id)
      } else if (e.key === 'Escape') {
        setIsPresenting(false)
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
      }
    }
    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
  }, [isPresenting, activeSlideId, slides])

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresenting) {
        setIsPresenting(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isPresenting])

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
    const currentSlide = slides.find(s => s.id === activeSlideId) || slides[slides.length - 1]
    updateSlidesWithHistory(prev => [...prev, { 
        id: newId, 
        elements: [], 
        layout: 'free', 
        splitRatio: 0.5, 
        bgColor: currentSlide?.bgColor || '#ffffff', 
        bgImage: currentSlide?.bgImage || '' 
    }])
    setActiveSlideId(newId)
  }

  const deleteSlide = (id: number) => {
    if (slides.length <= 1) return
    const newSlides = slides.filter(s => s.id !== id)
    updateSlidesWithHistory(() => newSlides)
    if (activeSlideId === id) {
      setActiveSlideId(newSlides[0].id)
    }
  }

  const addElementAtPos = (type: ElementType, clientX: number, clientY: number, tableConfig?: { rows: number, cols: number, shapeType?: 'rectangle' | 'circle' }) => {
    const width = type === 'text' ? 300 : (type === 'image' || type === 'shape') ? 400 : 300
    const height = type === 'text' ? 100 : (type === 'image' || type === 'shape') ? 300 : 200

    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    let localX = (clientX - rect.left) / canvasScale - width / 2
    let localY = (clientY - rect.top) / canvasScale - height / 2

    localX = Math.max(0, Math.min(1024 - width, localX))
    localY = Math.max(0, Math.min(576 - height, localY))

    let zone: 0 | 1 = 0
    const splitRatio = activeSlide.splitRatio || 0.5
    if (activeSlide.layout === 'split-h') {
        zone = localX + width / 2 > 1024 * splitRatio ? 1 : 0
        if (zone === 0) localX = Math.min(localX, 1024 * splitRatio - width)
        else localX = Math.max(localX, 1024 * splitRatio)
    } else if (activeSlide.layout === 'split-v') {
        zone = localY + height / 2 > 576 * splitRatio ? 1 : 0
        if (zone === 0) localY = Math.min(localY, 576 * splitRatio - height)
        else localY = Math.max(localY, 576 * splitRatio)
    }

    const newElement: SlideElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? 'New Text' : type === 'table' 
        ? Array.from({ length: tableConfig?.rows || 3 }, () => Array.from({ length: tableConfig?.cols || 3 }, () => ''))
        : '',
      x: localX,
      y: localY,
      width,
      height,
      textAlign: 'left',
      zone,
      src: type === 'image' ? 'loading' : undefined,
      fontSize: type === 'text' ? 24 : undefined,
      color: (type === 'text' || type === 'shape') ? '#000000' : undefined,
      fontFamily: type === 'text' ? 'Inter' : undefined,
      fontWeight: type === 'text' ? 'normal' : undefined,
      shapeType: type === 'shape' ? (tableConfig?.shapeType || 'rectangle') : undefined,
      opacity: type === 'shape' ? 1 : undefined
    }

    updateActiveSlide({ elements: [...activeSlide.elements, newElement] })
    setSelectedElementId(newElement.id)
  }

  const addElement = (type: ElementType, config?: any) => {
    addElementAtPos(type, window.innerWidth / 2, window.innerHeight / 2, config)
  }

  const updateElement = (id: string, updates: Partial<SlideElement>) => {
    updateSlidesWithHistory(prev => prev.map(s => s.id === activeSlideId 
      ? { ...s, elements: s.elements.map(el => el.id === id ? { ...el, ...updates } : el) } 
      : s
    ))
  }

  const deleteElement = (id: string) => {
    updateActiveSlide({
      elements: activeSlide.elements.filter(el => el.id !== id)
    })
    if (selectedElementId === id) setSelectedElementId(null)
  }

  const bringToFront = (id: string) => {
    const el = activeSlide.elements.find(e => e.id === id)
    if (!el) return
    updateActiveSlide({
      elements: [...activeSlide.elements.filter(e => e.id !== id), el]
    })
  }

  const sendToBack = (id: string) => {
    const el = activeSlide.elements.find(e => e.id === id)
    if (!el) return
    updateActiveSlide({
      elements: [el, ...activeSlide.elements.filter(e => e.id !== id)]
    })
  }

  const bringForward = (id: string) => {
    const index = activeSlide.elements.findIndex(el => el.id === id)
    if (index === -1 || index === activeSlide.elements.length - 1) return
    const newElements = [...activeSlide.elements]
    const temp = newElements[index]
    newElements[index] = newElements[index + 1]
    newElements[index + 1] = temp
    updateActiveSlide({ elements: newElements })
  }

  const sendBackward = (id: string) => {
    const index = activeSlide.elements.findIndex(el => el.id === id)
    if (index === -1 || index === 0) return
    const newElements = [...activeSlide.elements]
    const temp = newElements[index]
    newElements[index] = newElements[index - 1]
    newElements[index - 1] = temp
    updateActiveSlide({ elements: newElements })
  }

  const updateActiveSlide = (updates: Partial<Slide>) => {
    updateSlidesWithHistory(prev => prev.map(s => s.id === activeSlideId ? { ...s, ...updates } : s))
  }

  const applyLayout = (type: LayoutType | 'title') => {
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
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'Inter',
        color: '#000000'
      }
      updateActiveSlide({ layout: 'free', elements: [...activeSlide.elements, titleElement] })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    
    const x = (e.clientX - rect.left) / canvasScale - 150 
    const y = (e.clientY - rect.top) / canvasScale - 50 

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith('image/')) {
            const newId = Math.random().toString(36).substr(2, 9)
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
            updateActiveSlide({ elements: [...activeSlide.elements, newElement] })
            setSelectedElementId(newId)

            uploadFileToCloudinary(file).then(data => {
                updateElement(newId, { src: data.secureUrl })
            }).catch(err => {
                console.error("Upload failed", err)
                deleteElement(newId)
            })
            return
        }
    }

    const type = e.dataTransfer.getData("elementType") as ElementType
    if (!type) return

    addElementAtPos(type, e.clientX, e.clientY)
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background font-sans selection:bg-primary/20">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-6 border-b bg-background/50 backdrop-blur-xl z-[100]">
          <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl hover:bg-muted">
                  <Link href="/home">
                      <ChevronLeft className="h-5 w-5" />
                  </Link>
              </Button>
              <div className="flex flex-col min-w-[120px]">
                  {isEditingTitle ? (
                      <input
                          autoFocus
                          value={storyTitle}
                          onChange={(e) => setStoryTitle(e.target.value)}
                          onBlur={() => setIsEditingTitle(false)}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter') setIsEditingTitle(false)
                          }}
                          className="font-bold tracking-tight text-sm bg-transparent border-none outline-none p-0 m-0 w-full focus:ring-0"
                      />
                  ) : (
                      <span 
                          onDoubleClick={() => setIsEditingTitle(true)}
                          className="font-bold tracking-tight text-sm truncate max-w-[180px] cursor-text"
                      >
                          {storyTitle}
                      </span>
                  )}
              </div>
          </div>
          
          <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 font-semibold px-4 rounded-xl border-border/50 hover:bg-muted/50 transition-all shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                  <Upload className="h-4 w-4 opacity-70" />
                  <span>Import</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 gap-2 font-semibold px-4 rounded-xl border-border/50 hover:bg-muted/50 transition-all shadow-sm"
                    >
                        <Share2 className="h-4 w-4 opacity-70" />
                        <span>Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl ring-1 ring-black/5 mt-2">
                    <DropdownMenuItem 
                        className="gap-3 h-10 rounded-xl font-semibold px-3 cursor-pointer transition-colors"
                        onClick={() => exportToJson(storyTitle, slides)}
                    >
                        <FileJson className="size-4 text-primary" />
                        <span>Export as JSON</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="gap-3 h-10 rounded-xl font-semibold px-3 cursor-pointer transition-colors"
                        onClick={() => exportToPpptx(storyTitle, slides)}
                    >
                        <Presentation className="size-4 text-orange-500" />
                        <span>Export as PowerPoint</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-[1px] h-4 bg-border/40 mx-1" />

              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 font-semibold px-4 rounded-xl border-dashed hover:border-solid hover:bg-muted/30 transition-all active:scale-95 shadow-sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 opacity-70" />}
                  <span>{initialData?.id ? "Update" : "Save"}</span>
              </Button>
              <Button 
                onClick={async () => {
                  setIsPresenting(true)
                  try {
                    await document.documentElement.requestFullscreen()
                  } catch (err) {
                    console.error("Error attempting to enable full-screen mode:", err)
                  }
                }} 
                size="sm" 
                className="h-9 bg-primary text-primary-foreground font-bold px-5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                  Present
              </Button>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider>
          <EditorSidebar 
            slides={slides} 
            activeSlideId={activeSlideId} 
            setActiveSlideId={setActiveSlideId} 
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
          />
          
          <SidebarInset className="relative flex flex-col flex-1 bg-muted/20 overflow-hidden">
            <div ref={containerRef} className="flex-1 overflow-hidden pt-26 flex items-start justify-center relative bg-[#F8F9FB] dark:bg-[#0A0A0B]">
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '32px 32px' }} />
                <AnimatePresence mode="wait">
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <div
                            style={{ 
                                width: 1024, 
                                height: 576, 
                                transform: `scale(${canvasScale})`,
                                transformOrigin: 'center center',
                                backgroundColor: activeSlide.bgColor || '#ffffff',
                                backgroundImage: activeSlide.bgImage ? `url(${activeSlide.bgImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                            className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border relative flex-shrink-0 bg-white"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => setSelectedElementId(null)}
                        >
                        <motion.div
                            key={activeSlideId}
                            ref={canvasRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full relative overflow-hidden"
                        >
                        <div className="absolute inset-0 z-10">
                          {activeSlide.elements.map((el) => (
                                <ElementWrapper 
                                    key={el.id}
                                    el={el}
                                    isSelected={selectedElementId === el.id}
                                    onSelect={() => setSelectedElementId(el.id)}
                                    onUpdate={(updates) => updateElement(el.id, updates)}
                                    onDelete={() => deleteElement(el.id)}
                                    onBringToFront={() => bringToFront(el.id)}
                                    onSendToBack={() => sendToBack(el.id)}
                                    onBringForward={() => bringForward(el.id)}
                                    onSendBackward={() => sendBackward(el.id)}
                                    canvasRef={canvasRef}
                                    layout={activeSlide.layout || 'free'}
                                    splitRatio={activeSlide.splitRatio || 0.5}
                                    canvasScale={canvasScale}
                                />
                          ))}
                        </div>
                        </motion.div>
                        </div>
                      </ContextMenuTrigger>
                    </ContextMenu>
                </AnimatePresence>

                <MainToolbar 
                    activeSlide={activeSlide} 
                    selectedElementId={selectedElementId} 
                    onAddElement={addElement} 
                    onApplyLayout={applyLayout}
                    onUpdateSlide={updateActiveSlide}
                    onUpdateElement={updateElement}
                />

                <div className="absolute bottom-10 right-10 flex flex-col gap-3 z-50 mb-10">
                    <div className="flex bg-background/95 backdrop-blur-2xl border shadow-2xl rounded-2xl p-1.5 ring-1 ring-black/5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
                            disabled={historyIndex === 0}
                            onClick={undo}
                        >
                            <Undo2 className="h-4.5 w-4.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-5 mx-1 my-auto opacity-20" />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all active:scale-90 disabled:opacity-30"
                            disabled={historyIndex >= history.length - 1}
                            onClick={redo}
                        >
                            <Redo2 className="h-4.5 w-4.5" />
                        </Button>
                    </div>
                </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      <AnimatePresence>
        {isPresenting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background flex items-center justify-center p-0"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX
                if (x > rect.width / 2) {
                    const nextIndex = slides.findIndex(s => s.id === activeSlideId) + 1
                    if (nextIndex < slides.length) setActiveSlideId(slides[nextIndex].id)
                } else {
                    const prevIndex = slides.findIndex(s => s.id === activeSlideId) - 1
                    if (prevIndex >= 0) setActiveSlideId(slides[prevIndex].id)
                }
            }}
          >
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                <div 
                    className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    style={{ 
                        width: '100vw', 
                        height: '56.25vw', 
                        maxHeight: '100vh',
                        maxWidth: '177.78vh',
                        backgroundColor: activeSlide.bgColor || '#ffffff',
                        backgroundImage: activeSlide.bgImage ? `url(${activeSlide.bgImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <SlidePreview slide={activeSlide} scale={1} />
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-3xl rounded-3xl px-6 py-4 border border-white/10 shadow-2xl opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white/60 text-xs font-black uppercase tracking-widest">{slides.findIndex(s => s.id === activeSlideId) + 1} / {slides.length}</span>
                    <Separator orientation="vertical" className="h-4 bg-white/20" />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                        onClick={async (e) => {
                            e.stopPropagation()
                            setIsPresenting(false)
                            if (document.fullscreenElement) {
                                await document.exitFullscreen()
                            }
                        }}
                    >
                        Exit Preview
                    </Button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
