"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  ChevronLeft,
  Sparkles,
  Loader2,
  Save,
  Download,
  X,
  FileDown,
  FileJson,
  Presentation as PresentationIcon,
  GripVertical,
  Plus,
  Trash,
  Image as ImageIcon,
  Upload,
  Wand2,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  exportHtmlToJson,
  exportImagesToPdf,
  exportImagesToPpptx,
} from "@/lib/export-utils"
import { toPng } from "html-to-image"

import { HtmlSlide } from "@/lib/storyboard-parser"
import { SlidePreview } from "@/components/project/slide-preview"
import {
  ElementSettings,
  type ElementData,
} from "@/components/project/element-settings"
import { PresentationMode } from "./presentation-mode"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

/**
 * ProjectViewProps defines the input for the main canvas component.
 * @property initialData - The project state (title, description, slides) received from the API or creation flow.
 * @property onGenerateSection - Specific trigger to refine a single slide's HTML.
 * @property onExpandSection - Trigger to let AI add a new section seamlessly.
 * @property generatingSections - A set of slide indices currently being processed by the AI.
 * @property isExpanding - Specifically tracks if the project is being lengthened by AI.
 * @property onSaveSuccess - Callback to update parent state after a successful DB save.
 */
interface ProjectViewProps {
  initialData?: {
    id?: string
    title: string
    description?: string
    slides: HtmlSlide[]
  }
  onGenerateSection?: (index: number) => void
  onExpandSection?: (index?: number) => void
  generatingSections?: Set<number>
  expandingSections?: Set<number>
  onCancelExpand?: (index: number) => void
  onSaveSuccess?: (data: {
    id: string
    title: string
    description?: string
    slides: HtmlSlide[]
    outline?: string
    isDeleted?: boolean
  }) => void
  credits?: number | null
}

const AutoResizeTextarea = ({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
  rows = 1,
  disabled = false,
}: {
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  React.useEffect(() => {
    adjustHeight()
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
        adjustHeight()
      }}
      onBlur={onBlur}
      className={cn(
        "w-full resize-none overflow-hidden border-none bg-transparent outline-none focus:ring-0",
        className
      )}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  )
}

/**
 * ProjectView component: The high-fidelity narrative canvas.
 * This is the core workspace where users refine their stories.
 * It features a split-view of narrative content and live slide previews.
 */
export function ProjectView({
  initialData,
  onGenerateSection,
  onExpandSection,
  onCancelExpand,
  generatingSections,
  expandingSections,
  onSaveSuccess,
  credits,
}: ProjectViewProps) {
  const router = useRouter()

  // --- LOCAL STATE ---
  const hasUserChangesRef = React.useRef(false)
  const [slides, setSlides] = React.useState<HtmlSlide[]>(
    initialData?.slides || []
  )
  const [title, setTitle] = React.useState(initialData?.title || "Advanced AI Storyboard")
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  )

  const isBusy = (generatingSections?.size ?? 0) > 0 || (expandingSections?.size ?? 0) > 0
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)
  const mainScrollRef = React.useRef<HTMLDivElement>(null)

  // Settings Panel States
  const [selectedElData, setSelectedElData] =
    React.useState<ElementData | null>(null)
  const [isPresenting, setIsPresenting] = React.useState(false)

  const handleGenerateSection = (index: number) => {
    if (onGenerateSection) {
      onGenerateSection(index)
    }
  }

  const [selectedVisualsIndex, setSelectedVisualsIndex] = React.useState<
    number | null
  >(null)

  const saveProjectData = async (payload: { title?: string, description?: string, slides?: HtmlSlide[] }) => {
    if (!initialData?.id) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title ?? title,
          description: payload.description ?? description,
          slides: payload.slides ?? slides,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (onSaveSuccess) onSaveSuccess(data)
      }
    } catch (err) {
      console.error("Failed to save project change", err)
      toast.error("Cloud sync failed")
    } finally {
      setIsSaving(false)
    }
  }

  React.useEffect(() => {
    if (!hasUserChangesRef.current) return

    const timeoutId = setTimeout(() => {
      saveProjectData({ title, description, slides })
      hasUserChangesRef.current = false
    }, 2000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, slides])


  React.useEffect(() => {
    if (initialData?.slides) {
      setSlides(initialData.slides)
    }
    if (initialData?.title) {
      setTitle(initialData.title)
    }
    if (initialData?.description) {
      setDescription(initialData.description)
    }
    if (initialData?.slides && initialData.slides.length > 0) {
      scrollToSlide(initialData.slides[0].id)
    }
  }, [initialData])

  const scrollToSlide = (id: number) => {
    const el = document.getElementById(`slide-full-${id}`)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  /**
   * updateSelectedElement: Communicates with the slide iframe to apply real-time CSS/Data changes.
   * Logic:
   * 1. Finds the iframe corresponding to the currently viewed slide.
   * 2. Sends a postMessage with the elementId and the requested changes (e.g. fontSize, color).
   */
  const updateSelectedElement = (changes: Partial<ElementData>) => {
    if (!selectedElData) return
    const mainIframes = document.querySelectorAll("main iframe")
    const targetIframe = mainIframes[activeSlideIndex] as HTMLIFrameElement
    if (targetIframe?.contentWindow) {
      targetIframe.contentWindow.postMessage(
        {
          type: "UPDATE_ELEMENT",
          elementId: selectedElData.elementId,
          changes,
        },
        "*"
      )
    }
  }

  /**
   * handleExport: Captures slide previews and generates the requested format.
   * Logic:
   * - JSON: Simple serialization of current state.
   * - PDF/PPTX: Uses `html-to-image` to capture the content of each slide's iframe, 
   *   then converts those captured images into a document.
   */
  const handleExport = async (format: "json" | "pdf" | "pptx") => {
    try {
      if (format === "json") {
        exportHtmlToJson(title, description, slides)
        toast.success("JSON exported successfully")
      } else {
        toast.info(
          `Preparing ${format.toUpperCase()} generation... This may take a moment.`
        )

        const images: string[] = []
        // Loop through all slides and capture their visual state
        for (let i = 0; i < slides.length; i++) {
          const previewEl = document.getElementById(
            `slide-preview-${slides[i].id}`
          )
          if (previewEl) {
            const iframe = previewEl.querySelector("iframe")
            if (iframe && iframe.contentDocument) {
              const root = iframe.contentDocument.getElementById("preview-root")
              if (root) {
                // toPng captures the DOM node as a high-quality data URL
                const dataUrl = await toPng(root, {
                  width: 960,
                  height: 540,
                  style: {
                    transform: "scale(1)",
                    transformOrigin: "top left",
                  },
                })
                images.push(dataUrl)
              }
            }
          }
        }

        if (images.length === 0) {
          toast.error(
            "Failed to capture slide snapshots. Please ensure all slides are loaded."
          )
          return
        }

        if (format === "pdf") {
          await exportImagesToPdf(title, images)
          toast.success("PDF exported successfully")
        } else if (format === "pptx") {
          await exportImagesToPpptx(title, images)
          toast.success("PowerPoint exported successfully")
        }
      }
    } catch (error) {
      console.error(`Export to ${format} failed`, error)
      toast.error(`Export to ${format} failed`)
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        if (!content) throw new Error("Empty file content")

        // 1. Initial feedback
        toast.info("Checking compatibility...")
        const data = JSON.parse(content)

        // 2. Compatibility Check
        if (!data || typeof data !== "object" || !Array.isArray(data.slides)) {
          toast.error("Incompatible storyboard format.")
          return
        }

        setIsSaving(true)
        toast.info("Creating project...")

        // 3. Prepare payload
        const payload = {
          title: data.projectTitle || data.title || "Imported Storyboard",
          description: data.projectDescription || data.description || "",
          slides: data.slides.map(
            (s: { id?: number; html?: string }, idx: number) => ({
              ...s,
              id: s.id || idx + 1,
            })
          ),
        }

        // 4. Create new project via API
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const newProject = await res.json()
          toast.success("Project created successfully")
          router.push(`/project/${newProject.id}`)
        } else {
          throw new Error("Failed to create project")
        }
      } catch (err) {
        console.error("Import error:", err)
        toast.error("Failed to import JSON")
      } finally {
        setIsSaving(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }



  const handleScroll = () => {
    if (!mainScrollRef.current) return
    const scrollPos = mainScrollRef.current.scrollTop
    const slideElements = slides.map((s) =>
      document.getElementById(`slide-full-${s.id}`)
    )

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

  const updateOutlineSlide = (index: number, field: string, value: string) => {
    hasUserChangesRef.current = true
    setSlides((prev) => {
      const newSlides = [...prev]
      newSlides[index] = { ...newSlides[index], [field]: value }
      return newSlides
    })
  }

  const handleReorder = (newSlides: HtmlSlide[]) => {
    setSlides(newSlides)
    saveProjectData({ slides: newSlides })
  }

  const addOutlineSection = async (index: number) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${initialData?.id}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: index + 1 })
      })

      if (res.ok) {
        const updatedProject = await res.json()
        setSlides(updatedProject.slides)
        if (onSaveSuccess) onSaveSuccess(updatedProject)
        toast.success("Section added and synced")
      } else {
        throw new Error("Failed to add slide")
      }
    } catch (err) {
      console.error("Slide addition failed", err)
      toast.error("Cloud sync failed")
    } finally {
      setIsSaving(false)
    }
  }

  const removeOutlineSection = async (index: number) => {
    if (slides.length <= 1) {
      toast.error("Storyboard must have at least one section")
      return
    }

    const slideId = slides[index]?.id
    if (!slideId) {
      toast.error("Slide reference not found")
      return
    }
    
    setIsSaving(true)
    try {
      const res = await fetch(`/api/slides/${slideId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        const updatedProject = await res.json()
        setSlides(updatedProject.slides)
        if (onSaveSuccess) onSaveSuccess(updatedProject)
        toast.success("Section removed and synced")
      } else {
        throw new Error("Failed to delete slide")
      }
    } catch (err) {
      console.error("Slide deletion failed", err)
      toast.error("Cloud sync failed")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#FAFBFC] font-sans dark:bg-[#050505]">
      <header className="bg-background/95 z-[100] flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            className="hover:bg-muted size-9 rounded-full transition-all active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-border h-4 w-[1px] mx-1" />
            {isEditingTitle ? (
              <input
                autoFocus
                className="m-0 w-48 border-none bg-transparent p-0 text-sm font-bold tracking-tight outline-none focus:ring-0"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  hasUserChangesRef.current = true
                }}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              />
            ) : (
              <span
                onDoubleClick={() => setIsEditingTitle(true)}
                className="max-w-[300px] cursor-text truncate text-sm font-bold tracking-tight opacity-80"
              >
                {title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-border h-4 w-[1px] mx-1" />
          
          {/* Credit Display */}
          <div className="hidden lg:block">
            <span className="text-[10px] font-bold tabular-nums opacity-60">
              {credits !== null
                ? credits
                : "---"}{" "}
              credits remaining
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-medium shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4 opacity-70" />
                <span className="hidden md:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={10}>
              <p className="font-bold">Import JSON</p>
            </TooltipContent>
          </Tooltip>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImportJson}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-medium shadow-sm"
                  >
                    <Download className="size-4 opacity-70" />
                    <span className="hidden md:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-border/50 bg-background/95 mt-1 w-48 rounded-xl p-1 shadow-xl backdrop-blur-xl">
                  <DropdownMenuItem
                    onClick={() => handleExport("json")}
                    className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                  >
                    <FileJson className="text-primary size-3.5" />
                    <span>JSON</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport("pdf")}
                    className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                  >
                    <FileDown className="size-3.5 text-red-500" />
                    <span>PDF Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExport("pptx")}
                    className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                  >
                    <PresentationIcon className="size-3.5 text-orange-500" />
                    <span>PowerPoint</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={10}>
              <p className="font-bold">Export Options</p>
            </TooltipContent>
          </Tooltip>

          {/* No Save Button or Indicators per Request */}

          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-medium shadow-sm"
          >
            <Link href="/new">
              <Plus className="size-4" />
              <span className="hidden md:inline">New Project</span>
            </Link>
          </Button>

          <div className="bg-border h-4 w-[1px] mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-bold shadow-sm"
                onClick={() => setIsPresenting(true)}
              >
                <PresentationIcon className="text-primary size-4" />
                <span className="hidden md:inline">Present</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={10}>
              <p className="font-bold">Enter Presentation Mode</p>
            </TooltipContent>
          </Tooltip>

          <ModeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main
          className="no-scrollbar relative flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-[#050505]"
          ref={mainScrollRef}
          onScroll={handleScroll}
        >
          <div
            className="pointer-events-none absolute fixed inset-0 z-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-[1200px] space-y-24 px-6 py-16 pb-60 md:px-16">
            <div className="space-y-16">
              <div className="max-w-3xl space-y-6">
                <div className="space-y-2">
                  <input
                    className="text-foreground placeholder:text-muted/20 w-full border-none bg-transparent p-0 text-4xl font-black tracking-tighter outline-none focus:ring-0 md:text-5xl"
                    value={title}
                    placeholder="Storyboard Title"
                    onChange={(e) => {
                      setTitle(e.target.value)
                      hasUserChangesRef.current = true
                    }}
                  />
                  <AutoResizeTextarea
                    className="text-muted-foreground placeholder:text-muted/20 w-full p-0 text-lg leading-relaxed"
                    placeholder="Overall story arc and narrative goals..."
                    value={description}
                    onChange={(val) => {
                      setDescription(val)
                      hasUserChangesRef.current = true
                    }}
                  />
                </div>
              </div>

              <Reorder.Group
                axis="y"
                values={slides}
                onReorder={handleReorder}
                className="space-y-4"
              >
                {slides.map((s, i) => (
                  <Reorder.Item key={s.id} value={s} className="group relative">
                    <div className="border-border/40 group-hover:bg-muted/5 -mx-4 flex flex-col gap-8 rounded-2xl border-t bg-transparent px-4 py-8 transition-colors md:flex-row">
                      <div className="flex shrink-0 items-start gap-4 pt-1 md:w-32">
                        <div className="text-muted-foreground/20 hover:text-primary/40 cursor-grab pt-1 transition-colors active:cursor-grabbing">
                          <GripVertical className="size-4" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-muted-foreground/30 text-[10px] font-black tabular-nums">
                            Section {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="bg-primary/20 h-[1px] w-4 transition-all group-hover:w-8" />
                        </div>
                      </div>

                      <motion.div layout className="flex-1 space-y-6">
                        {s.html === "SKELETON" ? (
                          <div className="space-y-6">
                            <div className="space-y-4 animate-pulse">
                              <div className="h-10 w-2/3 rounded-lg bg-muted/40" />
                              <div className="space-y-2">
                                <div className="h-4 w-full rounded bg-muted/20" />
                                <div className="h-4 w-[90%] rounded bg-muted/20" />
                                <div className="h-4 w-[95%] rounded bg-muted/20" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              <input
                                className="group-hover:text-primary text-foreground w-full border-none bg-transparent p-0 text-3xl font-black tracking-tight transition-colors outline-none focus:ring-0 dark:text-white"
                                value={s.title}
                                onChange={(e) =>
                                  updateOutlineSlide(i, "title", e.target.value)
                                }
                                placeholder="Section Title"
                                disabled={generatingSections?.has(i)}
                              />

                              <AutoResizeTextarea
                                className="text-foreground/70 w-full max-w-3xl text-base leading-relaxed font-medium dark:text-white/70"
                                value={s.content || ""}
                                onChange={(val) =>
                                  updateOutlineSlide(i, "content", val)
                                }
                                placeholder="Write the detailed narrative content here..."
                                disabled={generatingSections?.has(i)}
                              />
                            </div>

                            {/* Live Slide Preview / Refinement Skeleton with Smooth Transitions */}
                            <AnimatePresence mode="sync">
                              {(() => {
                                const matchingSlide = slides[i]
                                
                                // REFINEMENT STATE: Show skeleton even if NO HTML exists yet
                                if (generatingSections?.has(i)) {
                                  return (
                                    <motion.div
                                      key="skeleton"
                                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                      animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                      className="overflow-hidden"
                                    >
                                      <div className="border-border ring-primary/20 slide-preview-container aspect-video w-full overflow-hidden rounded-2xl border bg-muted/10 shadow-lg ring-1 transition-all relative">
                                        <div className="relative h-full w-full overflow-hidden bg-muted/20">
                                          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        </div>
                                      </div>
                                    </motion.div>
                                  )
                                }

                                // NORMAL STATE: Show the actual slide content if it exists
                                if (matchingSlide?.html) {
                                  return (
                                    <motion.div
                                      key="content"
                                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                      animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                      className="group/preview relative overflow-hidden"
                                    >
                                      <div
                                        className="border-border/50 ring-primary/5 group-hover:ring-primary/20 slide-preview-container aspect-video w-full overflow-hidden rounded-2xl border bg-black/5 shadow-2xl ring-1 transition-all relative"
                                        id={`slide-preview-${matchingSlide.id}`}
                                      >
                                        <SlidePreview
                                          html={matchingSlide.html}
                                          autoScale={true}
                                        />
                                      </div>
                                    </motion.div>
                                  )
                                }

                                return null
                              })()}
                            </AnimatePresence>
                          </>
                        )}
                      </motion.div>

                      {/* Right Side Cancel Button - Only for NEW expansions (skeletons) */}
                      <AnimatePresence>
                        {s.html === "SKELETON" && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-1/2 -right-12 -translate-y-1/2 z-[60]"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="size-10 rounded-full border-4 border-background shadow-xl hover:scale-110 active:scale-95 transition-all"
                                  onClick={() => onCancelExpand?.(i - 1)}
                                >
                                  <X className="size-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p className="font-bold uppercase tracking-widest text-[10px]">Abort Expand</p>
                              </TooltipContent>
                            </Tooltip>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section Toolbar - Hidden only for skeletons */}
                    {s.html !== "SKELETON" && (
                      <div className={cn(
                        "bg-background ring-background absolute -bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 shadow-2xl ring-4 transition-all duration-300",
                        generatingSections?.has(i) ? "opacity-100 scale-105" : "opacity-0 group-hover:opacity-100"
                      )}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-muted size-8 rounded-full disabled:opacity-30"
                              onClick={() => setSelectedVisualsIndex(i)}
                              disabled={isBusy}
                            >
                              <Compass className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">Visual Direction</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="bg-border h-3 w-[1px]" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "group/btn size-8 rounded-full transition-all duration-300",
                                generatingSections?.has(i) 
                                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-lg ring-1 ring-red-500/30" 
                                  : "bg-primary/5 hover:bg-primary/10 text-primary"
                              )}
                              onClick={() => handleGenerateSection(i)}
                              disabled={isBusy && !generatingSections?.has(i)}
                            >
                              {generatingSections?.has(i) ? (
                                <X className="size-3.5" />
                              ) : (
                                <Wand2 className="size-3.5 transition-transform group-hover/btn:scale-110" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">
                              {generatingSections?.has(i) ? "Abort Refinement" : "Refine Slide"}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="bg-border h-3 w-[1px]" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-muted size-8 rounded-full disabled:opacity-30"
                              onClick={() => addOutlineSection(i)}
                              disabled={isBusy}
                            >
                              <Plus className="text-primary size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">Add Section</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="bg-border h-3 w-[1px]" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-primary/5 hover:bg-primary/10 group/btn size-8 rounded-full text-primary disabled:opacity-30"
                              onClick={() => onExpandSection?.(i)}
                              disabled={isBusy}
                            >
                              <Sparkles className="size-3.5 transition-transform group-hover/btn:scale-110" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">AI Expand</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="bg-border h-3 w-[1px]" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-muted size-8 rounded-full disabled:opacity-30"
                              onClick={() => {
                                setActiveSlideIndex(i)
                                setIsPresenting(true)
                              }}
                              disabled={isBusy}
                            >
                              <PresentationIcon className="size-3.5 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">Present from here</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="bg-border h-3 w-[1px]" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10 hover:text-destructive size-8 rounded-full disabled:opacity-30"
                              onClick={() => removeOutlineSection(i)}
                              disabled={isBusy}
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={10}>
                            <p className="font-bold">Remove Section</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedElData && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="bg-card fixed top-12 right-0 bottom-0 z-[150] w-[360px] border-l shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
                  Element Inspector
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedElData(null)}
                  className="size-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <ElementSettings
                  selectedElData={selectedElData}
                  onUpdate={updateSelectedElement}
                  clearSelection={() => setSelectedElData(null)}
                />
              </ScrollArea>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>


      <Dialog
        open={selectedVisualsIndex !== null}
        onOpenChange={(open) => !open && setSelectedVisualsIndex(null)}
      >
        <DialogContent className="bg-background overflow-hidden rounded-2xl border-none p-0 shadow-2xl sm:max-w-[600px]">
          <div className="space-y-6 p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Compass className="text-primary size-5" />
                Visual Direction
              </DialogTitle>
              <DialogDescription className="text-sm">
                Fine-tune the visual concept and layout instructions for this
                section.
              </DialogDescription>
            </DialogHeader>

            {selectedVisualsIndex !== null && (
              <div className="space-y-4">
                <AutoResizeTextarea
                  className="text-foreground bg-muted/30 focus:border-primary/30 min-h-[120px] w-full rounded-xl border p-4 text-sm leading-relaxed transition-all"
                  value={slides[selectedVisualsIndex]?.prompt || ""}
                  onChange={(val) =>
                    updateOutlineSlide(selectedVisualsIndex, "prompt", val)
                  }
                  placeholder="Describe the background, icons, layout style, and overall visual mood..."
                />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setSelectedVisualsIndex(null)}
                className="rounded-full px-8 font-bold"
              >
                Save & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isPresenting && (
          <PresentationMode
            slides={slides}
            initialIndex={activeSlideIndex}
            onClose={() => setIsPresenting(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
