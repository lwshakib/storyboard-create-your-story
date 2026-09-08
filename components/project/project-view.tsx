"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { useChat } from "@/hooks/use-chat"
import {
  MessageResponse,
  parseMarkdown,
} from "@/components/ai-elements/message"
import {
  ChevronLeft,
  Sparkles,
  Download,
  X,
  FileDown,
  FileJson,
  Presentation as PresentationIcon,
  GripVertical,
  Plus,
  Trash,
  Upload,
  Wand2,
  Compass,
  RefreshCw,
  MessageCircle,
  Send,
  LayoutGrid,
  List,
  Columns,
  ArrowLeft,
  ArrowRight,
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
import { RECOMMENDED_PROMPTS } from "@/llm/prompts"

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
  onGenerateOutline?: (prompt: string) => void
  isGeneratingOutline?: boolean
  error?: boolean
  initialPrompt?: string | null
  onRetryOutline?: () => void
  onCancelOutline?: () => void
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
  autoFocus = false,
  onKeyDown,
}: {
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  className?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  autoFocus?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight

      let finalHeight = scrollHeight
      if (typeof window !== "undefined") {
        const computedMaxHeight = window.getComputedStyle(textarea).maxHeight
        const maxHeight = parseFloat(computedMaxHeight)
        if (!isNaN(maxHeight)) {
          if (scrollHeight > maxHeight) {
            finalHeight = maxHeight
            textarea.style.overflowY = "auto"
          } else {
            textarea.style.overflowY = "hidden"
          }
        }
      }

      textarea.style.height = `${finalHeight}px`
    }
  }, [])

  React.useLayoutEffect(() => {
    adjustHeight()
    window.addEventListener("resize", adjustHeight)
    return () => window.removeEventListener("resize", adjustHeight)
  }, [value, adjustHeight])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => {
        onChange(e.target.value)
        adjustHeight()
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full resize-none border-none bg-transparent p-1 outline-none focus:ring-0",
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
  onGenerateOutline,
  isGeneratingOutline,
  error,
  initialPrompt,
  onRetryOutline,
  onCancelOutline,
  credits,
}: ProjectViewProps) {
  const router = useRouter()

  // --- LOCAL STATE ---
  const hasUserChangesRef = React.useRef(false)
  const [slides, setSlides] = React.useState<HtmlSlide[]>(
    initialData?.slides || []
  )
  const [title, setTitle] = React.useState(
    initialData?.title || "Advanced AI Storyboard"
  )
  const [description, setDescription] = React.useState(
    initialData?.description || ""
  )

  const isBusy =
    (generatingSections?.size ?? 0) > 0 || (expandingSections?.size ?? 0) > 0
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [, setIsSaving] = React.useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [gridColumns, setGridColumns] = React.useState<2 | 3>(2)
  const mainScrollRef = React.useRef<HTMLDivElement>(null)

  // Settings Panel States
  const [selectedElData, setSelectedElData] =
    React.useState<ElementData | null>(null)
  const [isPresenting, setIsPresenting] = React.useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = React.useState(false)
  const [outlinePrompt, setOutlinePrompt] = React.useState(initialPrompt || "")
  const [randomPrompts, setRandomPrompts] = React.useState<string[]>([])

  React.useEffect(() => {
    if (initialPrompt) {
      Promise.resolve().then(() => setOutlinePrompt(initialPrompt))
    }
  }, [initialPrompt])

  const refreshPrompts = React.useCallback(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random())
    setRandomPrompts(shuffled.slice(0, 4))
  }, [])

  React.useEffect(() => {
    Promise.resolve().then(() => refreshPrompts())
  }, [refreshPrompts])

  const handleGenerateSection = (index: number) => {
    if (onGenerateSection) {
      onGenerateSection(index)
    }
  }

  const [selectedVisualsIndex, setSelectedVisualsIndex] = React.useState<
    number | null
  >(null)

  // Chat & UI State
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [currentChatMessage, setCurrentChatMessage] = React.useState("")

  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    status: chatStatus,
    sendMessage: architectSendMessage,
  } = useChat({
    projectId: initialData?.id || "",
    onProjectUpdate: (p) => {
      setTitle(p.title)
      setDescription(p.description || "")
      setSlides(p.slides as HtmlSlide[])
      hasUserChangesRef.current = false
      if (onSaveSuccess) {
        onSaveSuccess({
          id: initialData?.id || p.id,
          title: p.title,
          description: p.description || "",
          slides: p.slides as HtmlSlide[],
        })
      }
      toast.success("Presentation updated by Assistant")
    },
  })

  const handleSendChatMessage = async () => {
    if (!currentChatMessage.trim()) return
    const msg = currentChatMessage
    setCurrentChatMessage("")
    await architectSendMessage(msg, { title, description, slides })
  }

  const saveProjectData = async (payload: {
    title?: string
    description?: string
    slides?: HtmlSlide[]
  }) => {
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

  const scrollToSlide = (id: string | number) => {
    const el = document.getElementById(`slide-full-${id}`)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  // Trigger project fetch on ID change
  React.useEffect(() => {
    if (initialData?.slides) {
      Promise.resolve().then(() => setSlides(initialData.slides!))
    }
    if (initialData?.title) {
      Promise.resolve().then(() => setTitle(initialData.title!))
    }
    if (initialData?.description) {
      Promise.resolve().then(() => setDescription(initialData.description!))
    }
    if (initialData?.slides && initialData.slides.length > 0) {
      scrollToSlide(initialData.slides[0].id)
    }
  }, [initialData])

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
      if (newSlides[index]) {
        newSlides[index] = { ...newSlides[index], [field]: value }
      }
      return newSlides
    })
  }

  const handleReorder = (newSlides: HtmlSlide[]) => {
    setSlides(newSlides)
    saveProjectData({ slides: newSlides })
  }

  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return
    const updated = [...slides]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setSlides(updated)
    saveProjectData({ slides: updated })
  }

  const addOutlineSection = async (index: number) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${initialData?.id}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: index + 1 }),
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
        method: "DELETE",
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
          <div className="hidden items-center gap-3 md:flex">
            <div className="bg-border mx-1 h-4 w-[1px]" />
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
          <div className="bg-border mx-1 h-4 w-[1px]" />

          {/* Credit Display */}
          <div className="hidden lg:block">
            <span className="text-[10px] font-bold tabular-nums opacity-60">
              {credits !== null ? credits : "---"} credits remaining
            </span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-sm md:h-10 md:w-auto md:gap-2 md:px-6"
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
                    className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-sm md:h-10 md:w-auto md:gap-2 md:px-6"
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-sm md:h-10 md:w-auto md:gap-2 md:px-6"
          >
            <Link href="/new">
              <Plus className="size-4" />
              <span className="hidden md:inline">New Project</span>
            </Link>
          </Button>

          <div className="bg-border mx-1 h-4 w-[1px]" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 flex size-9 items-center justify-center rounded-full p-0 font-bold shadow-sm md:h-10 md:w-auto md:gap-2 md:px-6"
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

          <div className="relative z-10 mx-auto w-full max-w-[1720px] px-4 sm:px-6 md:px-10 py-6 pb-40 space-y-6">
            {/* Executive Deck Header & Minimal Toolbar */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5 backdrop-blur-md shadow-xs md:flex-row md:items-center md:justify-between">
              {/* Left: Compact Project Title & Storyline */}
              <div className="flex-1 min-w-0 space-y-1">
                <AutoResizeTextarea
                  className="text-foreground placeholder:text-muted/30 w-full text-xl sm:text-2xl font-black tracking-tight leading-snug bg-transparent border-none p-0 focus:ring-0 resize-none"
                  value={title}
                  placeholder="Presentation Title"
                  onChange={(val) => {
                    setTitle(val)
                    hasUserChangesRef.current = true
                  }}
                />
                <AutoResizeTextarea
                  className="text-muted-foreground placeholder:text-muted/30 w-full text-xs sm:text-sm leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none line-clamp-2 focus:line-clamp-none transition-all"
                  placeholder="Overall presentation narrative and talking points..."
                  value={description}
                  onChange={(val) => {
                    setDescription(val)
                    hasUserChangesRef.current = true
                  }}
                />
              </div>

              {/* Right: Controls & View Switcher */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Slide Count Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border text-xs font-semibold text-muted-foreground">
                  <PresentationIcon className="size-3.5 text-primary" />
                  <span>{slides.length} {slides.length === 1 ? "Slide" : "Slides"}</span>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                          viewMode === "grid"
                            ? "bg-background shadow-xs text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <LayoutGrid className="size-3.5" />
                        <span className="hidden sm:inline">Grid</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p className="text-xs font-medium">Multi-Slide Grid View</p></TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                          viewMode === "list"
                            ? "bg-background shadow-xs text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <List className="size-3.5" />
                        <span className="hidden sm:inline">List</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p className="text-xs font-medium">Streamlined List View</p></TooltipContent>
                  </Tooltip>
                </div>

                {/* Column Toggle if in Grid Mode */}
                {viewMode === "grid" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground"
                        onClick={() => setGridColumns((prev) => (prev === 2 ? 3 : 2))}
                      >
                        <Columns className="size-3.5 mr-1" />
                        <span>{gridColumns} Col</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs font-medium">Switch to {gridColumns === 2 ? "3 Columns (More compact)" : "2 Columns"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Quick Add Slide */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                  onClick={() => addOutlineSection(slides.length - 1)}
                  disabled={isBusy}
                >
                  <Plus className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Add Slide</span>
                </Button>

                {/* AI Deck Generate */}
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
                  onClick={() => setShowGenerateDialog(true)}
                >
                  <Sparkles className="size-3.5" />
                  <span className="hidden sm:inline">AI Deck</span>
                </Button>
              </div>
            </div>

            {isGeneratingOutline && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-16 text-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="border-primary/30 h-14 w-14 rounded-full border-t-2 border-r-2"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-primary h-5 w-5 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight">
                    AI Architect is generating your outline
                  </h3>
                  <p className="text-muted-foreground text-xs opacity-60">
                    Analyzing vision and creating a structural flow...
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
                    onClick={() => setShowGenerateDialog(true)}
                  >
                    Change Prompt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
                    onClick={onCancelOutline}
                  >
                    Abort Generation
                  </Button>
                </div>
              </motion.div>
            )}

            {error && !isGeneratingOutline && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/5 border-destructive/20 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-16 text-center"
              >
                <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
                  <X className="text-destructive size-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-destructive text-sm font-bold tracking-tight">
                    Outline Generation Failed
                  </h3>
                  <p className="text-muted-foreground text-xs opacity-60">
                    We encountered an issue while architecting your storyboard.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={onRetryOutline}
                      className="h-9 rounded-full bg-white px-7 text-xs font-bold text-black shadow-lg hover:bg-neutral-200"
                    >
                      Retry Generation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGenerateDialog(true)}
                      className="h-9 rounded-full px-7 text-xs font-bold"
                    >
                      Change Prompt
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/home")}
                    className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
                  >
                    Go back home
                  </Button>
                </div>
              </motion.div>
            )}

            {!isGeneratingOutline && !error && slides.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-24 text-center"
              >
                <div className="bg-primary/5 flex size-16 items-center justify-center rounded-full">
                  <Sparkles className="text-primary size-8" />
                </div>
                <div className="max-w-sm space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">
                    Your Canvas is Empty
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Start by describing your topic and letting the AI Presentation Architect generate an executive-ready deck for you.
                  </p>
                </div>
                <Button
                  onClick={() => setShowGenerateDialog(true)}
                  className="h-10 gap-2 rounded-full px-8 text-xs font-bold"
                >
                  <Wand2 className="size-4" />
                  Generate Presentation with AI
                </Button>
              </motion.div>
            )}

            {/* MULTI-SLIDE GRID VIEW */}
            {!isGeneratingOutline && !error && slides.length > 0 && viewMode === "grid" && (
              <div
                className={cn(
                  "grid gap-6 transition-all",
                  gridColumns === 2
                    ? "grid-cols-1 lg:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                )}
              >
                {slides.map((s, i) => (
                  <motion.div
                    layout
                    key={s.id}
                    id={`slide-full-${s.id}`}
                    className="group/card relative flex flex-col rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-200 overflow-hidden p-4 gap-3"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="flex items-center justify-center size-6 rounded-md bg-muted text-[11px] font-bold text-muted-foreground shrink-0 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <AutoResizeTextarea
                          className="text-foreground font-bold text-sm truncate hover:truncate-none focus:truncate-none bg-transparent border-none p-0 focus:ring-0 flex-1 min-w-0 resize-none leading-snug"
                          value={s.title}
                          placeholder="Slide Title"
                          onChange={(val) => updateOutlineSlide(i, "title", val)}
                          disabled={generatingSections?.has(i)}
                        />
                      </div>

                      {/* Slide Card Actions */}
                      <div className="flex items-center gap-0.5 opacity-70 group-hover/card:opacity-100 transition-opacity shrink-0">
                        {/* Move Left / Right */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              disabled={i === 0 || isBusy}
                              onClick={() => moveSlide(i, i - 1)}
                            >
                              <ArrowLeft className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p className="text-xs">Move Earlier</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              disabled={i === slides.length - 1 || isBusy}
                              onClick={() => moveSlide(i, i + 1)}
                            >
                              <ArrowRight className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p className="text-xs">Move Later</p></TooltipContent>
                        </Tooltip>

                        {/* Edit Visual Blueprint */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              onClick={() => setSelectedVisualsIndex(i)}
                              disabled={isBusy}
                            >
                              <Compass className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p className="text-xs">Edit Slide Blueprint Prompt</p></TooltipContent>
                        </Tooltip>

                        {/* Regenerate Slide */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md text-primary"
                              onClick={() => handleGenerateSection(i)}
                              disabled={isBusy && !generatingSections?.has(i)}
                            >
                              {generatingSections?.has(i) ? (
                                <X className="size-3.5 text-red-500" />
                              ) : (
                                <Wand2 className="size-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">
                              {generatingSections?.has(i)
                                ? "Stop Generation"
                                : "Regenerate Slide Design"}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Present Slide */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              onClick={() => {
                                setActiveSlideIndex(i)
                                setIsPresenting(true)
                              }}
                            >
                              <PresentationIcon className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p className="text-xs">Present From Here</p></TooltipContent>
                        </Tooltip>

                        {/* Delete Slide */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                              onClick={() => removeOutlineSection(i)}
                              disabled={isBusy}
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p className="text-xs text-red-500">Delete Slide</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Slide Canvas Preview */}
                    <div
                      className="border-border/50 slide-preview-container relative aspect-video w-full overflow-hidden rounded-xl border bg-black/5 shadow-xs ring-1 ring-border/20 transition-all cursor-pointer group-hover/card:ring-primary/40"
                      id={`slide-preview-${s.id}`}
                      onClick={() => setActiveSlideIndex(i)}
                    >
                      {s.html === "SKELETON" || generatingSections?.has(i) ? (
                        <div className="bg-muted/20 relative h-full w-full overflow-hidden flex items-center justify-center">
                          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <div className="flex items-center gap-2 z-10 text-xs font-semibold text-primary animate-pulse">
                            <Sparkles className="size-4 animate-spin" />
                            <span>Architecting slide design...</span>
                          </div>
                        </div>
                      ) : s.html ? (
                        <SlidePreview
                          key={`${s.id}-${s.html?.length || 0}-${s.title || ""}`}
                          html={s.html}
                          autoScale={true}
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                          <Sparkles className="size-6 opacity-40" />
                          <span className="text-xs font-medium">Slide blueprint ready</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGenerateSection(i)
                            }}
                          >
                            <Wand2 className="size-3" /> Generate HTML
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Slide Talking Points / Narrative Notes */}
                    <div className="px-0.5 space-y-1">
                      <AutoResizeTextarea
                        className="text-muted-foreground text-xs leading-relaxed w-full bg-transparent border-none p-0 focus:ring-0 line-clamp-2 focus:line-clamp-none resize-none transition-all"
                        value={s.description || ""}
                        placeholder="Slide talking points & narrative..."
                        onChange={(val) => updateOutlineSlide(i, "description", val)}
                        disabled={generatingSections?.has(i)}
                      />
                    </div>

                    {/* Card Footer Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground/80">
                      <button
                        onClick={() => addOutlineSection(i)}
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Plus className="size-3 text-primary" />
                        <span>Insert slide</span>
                      </button>
                      <button
                        onClick={() => onExpandSection?.(i)}
                        className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Sparkles className="size-3 text-primary" />
                        <span>AI continue</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* STREAMLINED LIST VIEW */}
            {!isGeneratingOutline && !error && slides.length > 0 && viewMode === "list" && (
              <Reorder.Group
                axis="y"
                values={slides}
                onReorder={handleReorder}
                className="space-y-4"
              >
                {slides.map((s, i) => (
                  <Reorder.Item
                    key={s.id}
                    value={s}
                    id={`slide-full-${s.id}`}
                    className="group/item relative flex flex-col lg:flex-row gap-5 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xl p-4 transition-all"
                  >
                    {/* Left: Compact Slide Preview (~500px) */}
                    <div className="lg:w-[480px] xl:w-[540px] shrink-0">
                      <div
                        className="slide-preview-container relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-black/5 shadow-xs ring-1 ring-border/20 cursor-pointer"
                        id={`slide-preview-${s.id}`}
                        onClick={() => setActiveSlideIndex(i)}
                      >
                        {s.html === "SKELETON" || generatingSections?.has(i) ? (
                          <div className="h-full w-full bg-muted/20 flex items-center justify-center animate-pulse">
                            <Sparkles className="size-5 text-primary animate-spin" />
                          </div>
                        ) : s.html ? (
                          <SlidePreview
                            key={`${s.id}-${s.html?.length || 0}-${s.title || ""}`}
                            html={s.html}
                            autoScale={true}
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                            <Sparkles className="size-6 opacity-40" />
                            <span className="text-xs font-medium">Slide blueprint ready</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1.5"
                              onClick={() => handleGenerateSection(i)}
                            >
                              <Wand2 className="size-3" /> Generate HTML
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Slide Info & Controls */}
                    <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing p-0.5">
                              <GripVertical className="size-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground/70 tabular-nums">
                              SLIDE {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="h-3 w-[1px] bg-border" />
                            <button
                              disabled={i === 0 || isBusy}
                              onClick={() => moveSlide(i, i - 1)}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowLeft className="size-3 rotate-90" />
                            </button>
                            <button
                              disabled={i === slides.length - 1 || isBusy}
                              onClick={() => moveSlide(i, i + 1)}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowRight className="size-3 rotate-90" />
                            </button>
                          </div>

                          {/* Toolbar Buttons */}
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              onClick={() => setSelectedVisualsIndex(i)}
                              title="Edit Blueprint"
                            >
                              <Compass className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md text-primary"
                              onClick={() => handleGenerateSection(i)}
                              title="Regenerate"
                            >
                              <Wand2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md"
                              onClick={() => {
                                setActiveSlideIndex(i)
                                setIsPresenting(true)
                              }}
                              title="Present"
                            >
                              <PresentationIcon className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                              onClick={() => removeOutlineSection(i)}
                              title="Delete"
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <AutoResizeTextarea
                          className="text-foreground font-bold text-base sm:text-lg leading-snug w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
                          value={s.title}
                          placeholder="Slide Title"
                          onChange={(val) => updateOutlineSlide(i, "title", val)}
                          disabled={generatingSections?.has(i)}
                        />

                        <AutoResizeTextarea
                          className="text-muted-foreground text-xs sm:text-sm leading-relaxed w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
                          value={s.description || ""}
                          placeholder="Slide talking points, narrative notes, and key takeaways..."
                          onChange={(val) => updateOutlineSlide(i, "description", val)}
                          disabled={generatingSections?.has(i)}
                        />
                      </div>

                      {/* Quick Add Slide Below */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                        <button
                          onClick={() => addOutlineSection(i)}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Plus className="size-3 text-primary" />
                          <span>Insert slide below</span>
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => onExpandSection?.(i)}
                          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                        >
                          <Sparkles className="size-3 text-primary" />
                          <span>AI continue slide</span>
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
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
                <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest">
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
      {/* Global Floating AI Architect Chat */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-card fixed right-4 bottom-24 z-[200] flex h-[500px] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border shadow-2xl sm:right-8 sm:w-[380px]"
          >
            <div className="bg-muted/5 flex shrink-0 items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-xl">
                  <Sparkles className="text-primary size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-sm font-semibold">
                    Project assistant
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
                className="size-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1 p-6">
              <div className="space-y-6">
                {chatMessages.length === 0 && (
                  <div className="bg-muted/5 flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed py-16 text-center">
                    <div className="bg-muted/20 flex h-12 w-12 items-center justify-center rounded-full">
                      <MessageCircle className="text-muted-foreground/40 size-6" />
                    </div>
                    <div className="space-y-2 px-6">
                      <p className="text-xs font-bold opacity-80">
                        Hello! I&apos;m your AI Project Architect.
                      </p>
                      <p className="text-muted-foreground text-[10px] leading-relaxed">
                        I can help you restructure the project, add/delete
                        sections, or refine your entire narrative.
                      </p>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col gap-2",
                      msg.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground font-medium shadow-md"
                          : "bg-muted/30 border shadow-sm"
                      )}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <MessageResponse>
                          {parseMarkdown(msg.content)}
                        </MessageResponse>
                      )}
                    </div>
                  </div>
                ))}

                {chatStatus && (
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-xs text-slate-400">{chatStatus}</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t p-5">
              <div className="relative flex items-end gap-3">
                <AutoResizeTextarea
                  className="bg-muted/30 focus:border-primary/20 max-h-32 min-h-[48px] w-full rounded-2xl border px-5 py-3 text-[13px] leading-relaxed transition-all"
                  placeholder="Architectural feedback..."
                  value={currentChatMessage}
                  onChange={setCurrentChatMessage}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendChatMessage()
                    }
                  }}
                  disabled={isChatLoading}
                />
                <Button
                  size="icon"
                  className="size-11 shrink-0 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                  onClick={handleSendChatMessage}
                  disabled={!currentChatMessage.trim() || isChatLoading}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Toggle Button */}
      <Button
        size="icon"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "fixed right-8 bottom-8 z-[200] size-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90",
          isChatOpen
            ? "bg-muted hover:bg-muted text-foreground"
            : "bg-primary shadow-primary/20"
        )}
      >
        {isChatOpen ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </Button>

      <Dialog
        open={selectedVisualsIndex !== null}
        onOpenChange={(open) => !open && setSelectedVisualsIndex(null)}
      >
        <DialogContent className="bg-background overflow-hidden rounded-xl border-none p-0 shadow-2xl sm:max-w-[500px]">
          <div className="flex flex-col">
            <div className="border-b p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold tracking-tight">
                  Visual Blueprint
                </DialogTitle>
                <DialogDescription className="text-xs font-medium opacity-60">
                  Configure the architecture and design language for this slide.
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="max-h-[400px] p-6">
              {selectedVisualsIndex !== null && (
                <div className="space-y-4">
                  <AutoResizeTextarea
                    className="text-foreground bg-muted/20 focus:border-primary/20 min-h-[160px] w-full rounded-lg border p-4 text-sm leading-relaxed transition-all"
                    value={slides[selectedVisualsIndex]?.prompt || ""}
                    onChange={(val) =>
                      updateOutlineSlide(selectedVisualsIndex, "prompt", val)
                    }
                    placeholder="Describe the layout, colors, typography, and visual assets for this slide..."
                  />
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end border-t p-4">
              <Button
                onClick={() => setSelectedVisualsIndex(null)}
                className="h-10 rounded-lg px-8 text-[11px] font-bold tracking-widest uppercase transition-all"
              >
                Save Changes
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
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="overflow-hidden rounded-xl border-none bg-neutral-900 p-0 text-white shadow-2xl sm:max-w-[500px]">
          <div className="space-y-6 p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
                <Sparkles className="size-6 text-orange-400" />
                AI Presentation Architect
              </DialogTitle>
              <DialogDescription className="font-medium text-neutral-400">
                Describe your presentation topic or deck goal. Our AI will generate an executive-ready slide deck with substantive content, metrics, and polished layouts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                id="prompt"
                placeholder="e.g., Series A Pitch Deck for an enterprise AI workflow platform with $3.8M ARR, 140% net retention, and global enterprise traction..."
                className="min-h-[120px] resize-none rounded-lg border-neutral-700 bg-neutral-800/50 p-4 font-medium text-white transition-all placeholder:text-neutral-500 focus-visible:border-orange-500/50 focus-visible:ring-orange-500/50"
                value={outlinePrompt}
                onChange={(e) => setOutlinePrompt(e.target.value)}
                autoFocus
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold tracking-tight text-neutral-500">
                    Recommended presentations
                  </span>
                  <button
                    onClick={refreshPrompts}
                    className="text-neutral-500 transition-colors hover:text-white"
                  >
                    <RefreshCw className="size-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {randomPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setOutlinePrompt(p)}
                      className="group rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-3 text-left text-xs text-neutral-400 transition-all hover:border-orange-500/30 hover:bg-neutral-800 hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                variant="ghost"
                onClick={() => setShowGenerateDialog(false)}
                className="rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (onGenerateOutline && outlinePrompt.trim()) {
                    onGenerateOutline(outlinePrompt)
                    setShowGenerateDialog(false)
                  }
                }}
                disabled={!outlinePrompt.trim() || isGeneratingOutline}
                className="h-11 rounded-lg bg-white px-10 font-bold text-black shadow-xl hover:bg-neutral-200"
              >
                {isGeneratingOutline ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  slides.length > 0 ? "Regenerate Presentation" : "Generate Presentation"
                )}
              </Button>
            </DialogFooter>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
