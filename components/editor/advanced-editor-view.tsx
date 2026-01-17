"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  Sparkles, 
  Loader2,
  Save,
  Download,
  Pencil,
  Palette,
  X,
  Presentation
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileDown, FileJson, Presentation as PresentationIcon } from "lucide-react"
import { exportHtmlToJson, exportHtmlToPdf, exportHtmlToPpptx } from "@/lib/export-utils"

import { HtmlSlide } from "@/lib/storyboard-parser"
import { AdvancedSlidePreview } from "@/components/editor/advanced-slide-preview"
import { ElementSettings, type ElementData } from "@/components/editor/element-settings"
import { ThemeSettings } from "@/components/editor/theme-settings"

interface AdvancedEditorViewProps {
  initialData?: {
    id?: string
    title: string
    slides: HtmlSlide[]
  }
  isGenerating?: boolean
}

const SkeletonSlide = ({ index }: { index: number }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 px-2">
      <span className="h-6 w-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-black animate-pulse">{index + 1}</span>
      <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/30 animate-pulse">Generating Slide...</h2>
    </div>
    <div 
      className="relative shadow-[0_50px_100px_rgba(0,0,0,0.05)] bg-card border-none rounded-2xl overflow-hidden mx-auto flex items-center justify-center"
      style={{ width: 960, height: 540 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <Sparkles className="h-5 w-5 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm font-bold text-muted-foreground tracking-tight animate-pulse">AI is crafting your visual narrative...</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-muted overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  </div>
)
const SlideThumbnail = ({ html, index, onClick, active, title }: { html: string, index: number, onClick: () => void, active?: boolean, title: string }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-white shadow-sm hover:border-primary/50",
        active ? "border-primary shadow-md ring-2 ring-primary/10" : "border-transparent"
      )}
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <span className="text-[10px] text-white font-bold truncate w-full">{title}</span>
      </div>
      <div className="absolute top-2 left-2 z-20 bg-background/90 backdrop-blur-md rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-sm border border-black/5">
        {index + 1}
      </div>
      
      <div className="absolute inset-0 origin-top-left flex items-center justify-center bg-white">
          <AdvancedSlidePreview html={html} autoScale={true} scale={0.21875} />
      </div>
      <div className="absolute inset-0 z-30" />
    </div>
  )
}

const GeneratingThumbnail = ({ index }: { index: number }) => (
  <div 
    className="aspect-video rounded-xl border-2 border-dashed border-primary/20 bg-muted/30 flex flex-col items-center justify-center gap-2 animate-pulse overflow-hidden relative"
  >
    <div className="absolute top-2 left-2 z-20 bg-primary/20 rounded-lg px-2 py-0.5 text-[10px] font-bold text-primary">
      {index + 1}
    </div>
    <Loader2 className="h-4 w-4 text-primary opacity-40 animate-spin" />
    <span className="text-[8px] font-black uppercase tracking-widest text-primary/40 text-center px-2">AI is thinking...</span>
  </div>
)

export function AdvancedEditorView({ initialData, isGenerating }: AdvancedEditorViewProps) {
  const router = useRouter()
  
  const [slides, setSlides] = React.useState<HtmlSlide[]>(initialData?.slides || [])
  const [storyTitle, setStoryTitle] = React.useState(initialData?.title || "Advanced AI Storyboard")
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)
  const mainScrollRef = React.useRef<HTMLDivElement>(null)
  
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isThemeMode, setIsThemeMode] = React.useState(false)
  const [selectedElData, setSelectedElData] = React.useState<ElementData | null>(null)
  const [activeThemeId, setActiveThemeId] = React.useState<string | null>(null)
  const [appliedTheme, setAppliedTheme] = React.useState<any>(null)

  React.useEffect(() => {
    if (initialData?.slides) {
      setSlides(initialData.slides)
    }
    if (initialData?.title) {
        setStoryTitle(initialData.title)
    }
  }, [initialData])

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_CLICKED' && isEditMode) {
        setSelectedElData(e.data)
      } else if (e.data.type === 'HTML_UPDATED') {
        setSlides(prev => {
          const updated = [...prev]
          if (updated[activeSlideIndex]) {
            updated[activeSlideIndex] = { ...updated[activeSlideIndex], html: e.data.html }
          }
          return updated
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activeSlideIndex, isEditMode])

  const updateSelectedElement = (changes: any) => {
    if (!selectedElData) return
    const mainIframes = document.querySelectorAll('main iframe')
    const targetIframe = mainIframes[activeSlideIndex] as HTMLIFrameElement
    if (targetIframe?.contentWindow) {
      targetIframe.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT',
        elementId: selectedElData.elementId,
        changes
      }, '*')
    }
  }

  const handleExport = async (format: 'json' | 'pdf' | 'pptx') => {
    try {
        if (format === 'json') {
            exportHtmlToJson(storyTitle, slides);
            toast.success("JSON exported successfully");
        } else if (format === 'pdf') {
            toast.info("Preparing PDF conversion...");
            await exportHtmlToPdf(storyTitle, slides);
            toast.success("PDF exported successfully");
        } else if (format === 'pptx') {
            toast.info("Preparing PowerPoint conversion...");
            await exportHtmlToPpptx(storyTitle, slides);
            toast.success("PowerPoint exported successfully");
        }
    } catch (error) {
        console.error(`Export to ${format} failed`, error);
        toast.error(`Export to ${format} failed`);
    }
  }

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
          type: "ADVANCED",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(initialData?.id ? "Project updated" : "Project saved successfully")
        if (!initialData?.id) {
          router.push(`/editor?type=advanced&id=${data.id}`)
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

  const scrollToSlide = (id: number) => {
    const el = document.getElementById(`slide-full-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!mainScrollRef.current) return
    const scrollPos = mainScrollRef.current.scrollTop
    const slideElements = slides.map(s => document.getElementById(`slide-full-${s.id}`))
    
    let currentSlideIndex = 0
    slideElements.forEach((el, idx) => {
      if (el && el.offsetTop - 100 <= scrollPos) {
        currentSlideIndex = idx
      }
    })
    
    if (currentSlideIndex !== activeSlideIndex) {
      setActiveSlideIndex(currentSlideIndex)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#F8F9FB] dark:bg-[#0A0A0B] overflow-hidden font-sans relative">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-6 border-b bg-background/50 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="rounded-xl hover:bg-muted transition-all active:scale-95">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col min-w-[120px]">
            {isEditingTitle ? (
                <input
                    autoFocus
                    className="font-bold tracking-tight text-sm bg-transparent border-none outline-none p-0 m-0 w-full focus:ring-0"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
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
          <Button 
            variant={isEditMode ? "secondary" : "outline"} 
            onClick={() => {
              setIsEditMode(!isEditMode)
              if (isThemeMode) setIsThemeMode(false)
            }}
            className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm transition-all"
            size="sm"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Mode {isEditMode ? "ON" : "OFF"}</span>
          </Button>
          <Button 
            variant={isThemeMode ? "secondary" : "outline"} 
            onClick={() => {
              setIsThemeMode(!isThemeMode)
              if (isEditMode) setIsEditMode(false)
            }}
            className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm transition-all"
            size="sm"
          >
            <Palette className="h-4 w-4" />
            <span>Themes</span>
          </Button>

          <div className="w-[1px] h-4 bg-border/40 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 font-semibold px-4 rounded-xl border-border/50 hover:bg-muted/50 transition-all shadow-sm"
              >
                <Download className="h-4 w-4 opacity-70" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2 bg-background/95 backdrop-blur-xl ring-1 ring-black/5 mt-2">
                <DropdownMenuItem 
                    className="gap-3 h-10 rounded-xl font-semibold px-3 cursor-pointer transition-colors"
                    onClick={() => handleExport('json')}
                >
                    <FileJson className="size-4 text-primary" />
                    <span>Export as JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="gap-3 h-10 rounded-xl font-semibold px-3 cursor-pointer transition-colors"
                    onClick={() => handleExport('pdf')}
                >
                    <FileDown className="size-4 text-red-500" />
                    <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="gap-3 h-10 rounded-xl font-semibold px-3 cursor-pointer transition-colors"
                    onClick={() => handleExport('pptx')}
                >
                    <PresentationIcon className="size-4 text-orange-500" />
                    <span>Export as PowerPoint</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              const element = document.documentElement;
              if (element.requestFullscreen) {
                await element.requestFullscreen();
              }
            }}
            size="sm" 
            className="h-9 bg-primary text-primary-foreground font-bold px-5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            Present
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Thumbnails */}
        <div className="w-64 border-r bg-background/30 backdrop-blur-sm flex flex-col h-full min-h-0">
          <div className="p-4 flex items-center justify-between border-b bg-background/20 shrink-0 h-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Slides</h3>
            <div className="px-2 py-0.5 rounded-full bg-muted/50 text-[9px] font-black text-muted-foreground/70 ring-1 ring-border shadow-sm">
              {slides.length}
            </div>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-4">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={`${slide.id}-${index}`}
                  html={slide.html}
                  index={index}
                  title={slide.title}
                  active={index === activeSlideIndex}
                  onClick={() => scrollToSlide(slide.id)}
                />
              ))}
              {isGenerating && (
                <GeneratingThumbnail index={slides.length} />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Scrollable Area */}
        <main 
          className="flex-1 relative bg-[#F1F3F5] dark:bg-[#0F0F10] overflow-y-auto scroll-smooth" 
          ref={mainScrollRef}
          onScroll={handleScroll}
        >
          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none fixed" 
               style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
          
          <div className="max-w-5xl mx-auto py-20 px-12 space-y-24 pb-40 relative z-10">
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.div 
                  key={`${slide.id}-${index}`} 
                  id={`slide-full-${slide.id}`} 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                  onClick={() => setActiveSlideIndex(index)}
                >
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <span className="h-6 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black">{index + 1}</span>
                       <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">{slide.title}</h2>
                    </div>
                  </div>
                  <div className={cn(
                      "relative shadow-[0_50px_100px_rgba(0,0,0,0.12)] bg-white rounded-2xl overflow-hidden border transition-all mx-auto",
                      activeSlideIndex === index ? "ring-2 ring-primary ring-offset-4 shadow-2xl" : "ring-1 ring-black/5"
                    )}
                    style={{ width: 960, height: 540 }}
                  >
                    <AdvancedSlidePreview 
                      html={slide.html} 
                      autoScale={true}
                      isEditable={isEditMode && activeSlideIndex === index}
                    />
                    {!isEditMode && (
                      <div className="absolute inset-0 bg-transparent cursor-pointer" />
                    )}
                  </div>
                </motion.div>
              ))}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pb-20"
                >
                  <SkeletonSlide index={slides.length} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Slide-out Panels */}
      <AnimatePresence>
        {(isEditMode && selectedElData) && (
          <motion.aside 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-14 right-0 bottom-0 w-[380px] bg-card border-l shadow-2xl z-[150]"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight capitalize">Element Properties</span>
                <Button variant="ghost" size="icon" onClick={() => setSelectedElData(null)}><X className="h-4 w-4" /></Button>
              </div>
              <ElementSettings 
                selectedElData={selectedElData}
                onUpdate={updateSelectedElement}
                clearSelection={() => setSelectedElData(null)}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThemeMode && (
          <motion.aside 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-14 right-0 bottom-0 w-[380px] bg-card border-l shadow-2xl z-[150]"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight capitalize">Design System</span>
                <Button variant="ghost" size="icon" onClick={() => setIsThemeMode(false)}><X className="h-4 w-4" /></Button>
              </div>
              <ThemeSettings 
                activeThemeId={activeThemeId}
                onApplyTheme={(theme: any) => {
                  setActiveThemeId(theme.id)
                  setAppliedTheme(theme)
                  
                  const updatedSlides = slides.map(slide => {
                    let html = slide.html
                    const themeVars = `:root {
  --background: ${theme.background};
  --foreground: ${theme.foreground};
  --primary: ${theme.primary};
  --primary-foreground: ${theme.primaryForeground};
  --card: ${theme.card};
  --card-foreground: ${theme.cardForeground};
  --secondary: ${theme.secondary};
  --secondary-foreground: ${theme.secondaryForeground};
  --muted: ${theme.muted};
  --muted-foreground: ${theme.mutedForeground};
  --accent: ${theme.accent};
  --accent-foreground: ${theme.accentForeground};
  --popover: ${theme.popover || theme.card};
  --popover-foreground: ${theme.popoverForeground || theme.cardForeground};
  --destructive: ${theme.destructive};
  --border: ${theme.border};
  --input: ${theme.input};
  --ring: ${theme.ring};
  --radius: ${theme.radius};
}`

                    if (html.includes(':root')) {
                      html = html.replace(/:root\s*\{[\s\S]*?\}/, themeVars)
                    } else if (html.includes('<style>')) {
                        html = html.replace('<style>', `<style>\n${themeVars}`)
                    } else if (html.includes('</head>')) {
                        html = html.replace('</head>', `<style>\n${themeVars}\n</style></head>`)
                    }
                    
                    return { ...slide, html }
                  })
                  
                  setSlides(updatedSlides)
                  toast.success("Theme applied across all slides")
                }}
                appliedTheme={appliedTheme}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
