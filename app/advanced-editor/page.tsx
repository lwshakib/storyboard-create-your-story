"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  Sparkles, 
  Loader2,
  Trash2,
  Layout,
  Save,
  Download,
  Pencil,
  Palette,
  X,
  Presentation
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Suspense } from "react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileDown, FileJson, Presentation as PresentationIcon } from "lucide-react"
import { exportHtmlToJson, exportHtmlToPdf, exportHtmlToPpptx } from "@/lib/export-utils"

import { parseStoryboard, HtmlSlide } from "@/lib/storyboard-parser"
import { AdvancedSlidePreview } from "@/components/editor/advanced-slide-preview"
import { ElementSettings, type ElementData } from "./element-settings"
import { ThemeSettings } from "./theme-settings"

interface AdvancedEditorContentProps {
  initialData?: {
    id: string
    title: string
    slides: HtmlSlide[]
  }
}

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
      {/* Overlay to catch clicks and prevent interaction in thumbnail */}
      <div className="absolute inset-0 z-30" />
    </div>
  )
}

function AdvancedEditorContent({ initialData }: AdvancedEditorContentProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialPrompt = searchParams.get("prompt")
  
  const [slides, setSlides] = React.useState<HtmlSlide[]>(initialData?.slides || [])
  const [storyTitle, setStoryTitle] = React.useState(initialData?.title || "Advanced AI Storyboard")
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [completion, setCompletion] = React.useState("")
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)
  const mainScrollRef = React.useRef<HTMLDivElement>(null)
  
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isThemeMode, setIsThemeMode] = React.useState(false)
  const [selectedElData, setSelectedElData] = React.useState<ElementData | null>(null)
  const [activeThemeId, setActiveThemeId] = React.useState<string | null>(null)
  const [appliedTheme, setAppliedTheme] = React.useState<any>(null)

  const handleStream = async (prompt: string) => {
    setIsLoading(true)
    setCompletion("")
    try {
      const response = await fetch("/api/generate-html-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, theme: activeThemeId }),
      })

      if (!response.ok) throw new Error("Failed to start stream")
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        accumulatedText += decoder.decode(value, { stream: true })
        setCompletion(accumulatedText)

        const data = parseStoryboard(accumulatedText)
        setSlides(prev => {
          if (data.slides.length >= prev.length) {
            return data.slides
          }
          return prev
        })
        
        if (data.title && data.title !== storyTitle && !isEditingTitle) {
          setStoryTitle(data.title)
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      toast.error("Failed to generate storyboard")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    // Check for imported storyboard (from templates or JSON import)
    const imported = localStorage.getItem('importedStoryboard')
    if (imported) {
      try {
        const data = JSON.parse(imported)
        // If it's the advanced editor, we expect advanced content.
        // If the data has HTML slides, we use them.
        // If it has standard element-based slides, we might need to handle them or warn.
        // For now, let's assume if we got here, we want to try to use what we found.
        
        if (data.slides && data.slides.length > 0) {
            // Ensure slides are in HtmlSlide format or map them if possible
            const loadedSlides: HtmlSlide[] = data.slides.map((s: any) => ({
                id: s.id,
                html: s.html || "", 
                title: s.title || `Slide ${s.id + 1}`
            })).filter((s: HtmlSlide) => s.html);

            if (loadedSlides.length > 0) {
                // Redirect to the main editor route with type=advanced
                // We re-save to localStorage to ensure it's available for the main editor
                // But we modify the data to include type: 'ADVANCED' explicitly if not present
                const exportData = { ...data, type: 'ADVANCED' };
                localStorage.setItem('importedStoryboard', JSON.stringify(exportData));
                router.replace('/editor?type=advanced');
                return;
            }
        }
      } catch (e) {
        console.error("Failed to parse imported storyboard", e)
      }
    } else if (initialPrompt && slides.length === 0 && !isLoading && completion === "") {
        // Only stream if NOT imported
      handleStream(initialPrompt)
    }
  }, [initialPrompt])

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_CLICKED' && isEditMode) {
        setSelectedElData(e.data)
      } else if (e.data.type === 'HTML_UPDATED') {
        setSlides(prev => {
          const updated = [...prev]
          // The update usually comes from the active slide index
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
    const iframes = document.querySelectorAll('iframe')
    // We need to find the correct iframe. In the user's layout, there's one iframe per slide in the main area.
    // Thumbnails also have iframes, so we must target only the main area iframes.
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
          router.push(`/advanced-editor/${data.id}`)
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
        <div className="w-64 border-r bg-background/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 flex items-center justify-between border-b bg-background/20">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnails</h3>
          </div>
          <ScrollArea className="flex-1">
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
              {isLoading && (
                 <div className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/20 animate-pulse gap-2">
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-30">Generating...</span>
                 </div>
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
              {slides.length > 0 ? (
                slides.map((slide, index) => (
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
                ))
              ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center gap-6 text-muted-foreground">
                    <div className="relative">
                       <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                       <Sparkles className="h-16 w-16 text-primary relative" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-xl font-bold tracking-tight text-foreground">Initiating Production</p>
                       <p className="text-sm font-medium opacity-50">Our AI creative engine is parsing your request...</p>
                    </div>
                  </div>
              )}
            </AnimatePresence>
            
            {isLoading && (
               <div className="space-y-6 opacity-60">
                   <div className="flex items-center gap-3 px-2">
                       <Loader2 className="h-4 w-4 animate-spin text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Assembling Slide {slides.length + 1}...</span>
                   </div>
                   <div className="w-full h-[576px] bg-muted/5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-muted/20 animate-pulse" />
                       <div className="h-2 w-32 bg-muted/20 rounded-full animate-pulse" />
                   </div>
               </div>
            )}
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
                onApplyTheme={(t: any) => {
                  setActiveThemeId(t.id)
                  setAppliedTheme(t)
                  
                  // Apply theme logic - surgical replacement of :root vars in all slides
                  const updatedSlides = slides.map(slide => {
                    let html = slide.html
                    const themeVars = `
  :root {
    --background: ${t.background};
    --foreground: ${t.foreground};
    --primary: ${t.primary};
    --primary-foreground: ${t.primaryForeground};
    --card: ${t.card};
    --card-foreground: ${t.cardForeground};
    --secondary: ${t.secondary};
    --secondary-foreground: ${t.secondaryForeground};
    --muted: ${t.muted};
    --muted-foreground: ${t.mutedForeground};
    --accent: ${t.accent};
    --accent-foreground: ${t.accentForeground};
    --popover: ${t.popover || t.card};
    --popover-foreground: ${t.popoverForeground || t.cardForeground};
    --destructive: ${t.destructive};
    --border: ${t.border};
    --input: ${t.input};
    --ring: ${t.ring};
    --radius: ${t.radius};
  }
                    `.trim()

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
                  toast.success(`Theme "${t.name}" applied across all slides`)
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

export default function AdvancedEditorPage({ initialData }: AdvancedEditorContentProps) {
  return (
    <Suspense fallback={
       <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
       </div>
    }>
      <AdvancedEditorContent initialData={initialData} />
    </Suspense>
  )
}
