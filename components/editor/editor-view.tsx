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
  Pencil,
  Palette,
  X,
  Presentation,
  FileDown,
  FileJson,
  Presentation as PresentationIcon,
  GripVertical,
  Layers,
  Plus,
  Trash,
  Image as ImageIcon,
  Upload,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  exportHtmlToJson,
  exportHtmlToPdf,
  exportHtmlToPpptx,
  exportImagesToPdf,
  exportImagesToPpptx,
} from "@/lib/export-utils"
import { toPng } from "html-to-image"

import { HtmlSlide } from "@/lib/storyboard-parser"
import { SlidePreview } from "@/components/editor/slide-preview"
import {
  ElementSettings,
  type ElementData,
} from "@/components/editor/element-settings"
import { ThemeSettings } from "@/components/editor/theme-settings"

interface EditorViewProps {
  initialData?: {
    id?: string
    title: string
    description?: string
    slides: HtmlSlide[]
  }
  isGenerating?: boolean
  onGenerate?: () => void
  onGenerateSection?: (index: number) => void
  generatingSections?: Set<number>
  onSaveSuccess?: (data: any) => void
}

const SkeletonSlide = ({ index }: { index: number }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 px-2">
      <span className="bg-muted text-muted-foreground flex h-6 w-10 animate-pulse items-center justify-center rounded-full text-xs font-black">
        {index + 1}
      </span>
      <h2 className="text-muted-foreground/30 animate-pulse text-sm font-black tracking-widest uppercase">
        Generating Slide...
      </h2>
    </div>
    <div className="bg-card relative mx-auto flex aspect-video w-full max-w-[1000px] items-center justify-center overflow-hidden rounded-xl border-none shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <Sparkles className="text-accent absolute -top-1 -right-1 h-5 w-5 animate-pulse" />
        </div>
        <p className="text-muted-foreground animate-pulse text-sm font-bold tracking-tight">
          AI is crafting your visual narrative...
        </p>
      </div>
      <div className="bg-muted absolute inset-x-0 bottom-0 h-1 overflow-hidden">
        <motion.div
          className="bg-primary h-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  </div>
)

const SlideThumbnail = ({
  html,
  index,
  onClick,
  active,
  title,
}: {
  html: string
  index: number
  onClick: () => void
  active?: boolean
  title: string
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group hover:border-primary/50 relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all",
        active
          ? "border-primary ring-primary/10 shadow-md ring-2"
          : "border-transparent"
      )}
    >
      <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/40 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="w-full truncate text-[10px] font-bold text-white">
          {title}
        </span>
      </div>
      <div className="bg-background/90 absolute top-2 left-2 z-20 rounded-lg border border-black/5 px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-md">
        {index + 1}
      </div>

      <div className="absolute inset-0 flex origin-top-left items-center justify-center bg-white">
        <SlidePreview html={html} autoScale={true} />
      </div>
      <div className="absolute inset-0 z-30" />
    </div>
  )
}

const GeneratingThumbnail = ({ index }: { index: number }) => (
  <div className="border-primary/20 bg-muted/30 relative flex aspect-video animate-pulse flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed">
    <div className="bg-primary/20 text-primary absolute top-2 left-2 z-20 rounded-lg px-2 py-0.5 text-[10px] font-bold">
      {index + 1}
    </div>
    <Loader2 className="text-primary h-4 w-4 animate-spin opacity-40" />
    <span className="text-primary/40 px-2 text-center text-[8px] font-black tracking-widest uppercase">
      AI is thinking...
    </span>
  </div>
)

const AutoResizeTextarea = ({
  value,
  onChange,
  className,
  placeholder,
  rows = 1,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  placeholder?: string
  rows?: number
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
      className={cn(
        "w-full resize-none overflow-hidden border-none bg-transparent outline-none focus:ring-0",
        className
      )}
      placeholder={placeholder}
      rows={rows}
    />
  )
}

export function EditorView({
  initialData,
  isGenerating,
  onGenerate,
  onGenerateSection,
  generatingSections,
  onSaveSuccess,
}: EditorViewProps) {
  const router = useRouter()

  const [slides, setSlides] = React.useState<HtmlSlide[]>(
    initialData?.slides || []
  )
  const [storyTitle, setStoryTitle] = React.useState(
    initialData?.title || "Advanced AI Storyboard"
  )
  const [overallDescription, setOverallDescription] = React.useState(
    initialData?.description || ""
  )
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)
  const mainScrollRef = React.useRef<HTMLDivElement>(null)

  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isThemeMode, setIsThemeMode] = React.useState(false)
  const [selectedElData, setSelectedElData] =
    React.useState<ElementData | null>(null)
  const [activeThemeId, setActiveThemeId] = React.useState<string | null>(null)
  const [appliedTheme, setAppliedTheme] = React.useState<any>(null)

  const handleGenerateSection = (index: number) => {
    if (onGenerateSection) {
      onGenerateSection(index)
    }
  }

  const [selectedVisualsIndex, setSelectedVisualsIndex] = React.useState<
    number | null
  >(null)

  const hasChanges = React.useMemo(() => {
    const initialTitle = initialData?.title || "Advanced AI Storyboard"
    const initialDesc = initialData?.description || ""
    const initialSlides = initialData?.slides || []

    return (
      storyTitle !== initialTitle ||
      overallDescription !== initialDesc ||
      JSON.stringify(slides) !== JSON.stringify(initialSlides)
    )
  }, [storyTitle, overallDescription, slides, initialData])

  React.useEffect(() => {
    if (initialData?.slides) {
      setSlides(initialData.slides)
    }
    if (initialData?.title) {
      setStoryTitle(initialData.title)
    }
    if (initialData?.description) {
      setOverallDescription(initialData.description)
    }
    if (initialData?.slides && initialData.slides.length > 0) {
      scrollToSlide(initialData.slides[0].id)
    }
  }, [initialData])

  const scrollToSlide = (id: number) => {
    const el = document.getElementById(`slide-full-${id}`)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const updateSelectedElement = (changes: any) => {
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

  const handleExport = async (format: "json" | "pdf" | "pptx") => {
    try {
      if (format === "json") {
        exportHtmlToJson(storyTitle, overallDescription, slides)
        toast.success("JSON exported successfully")
      } else {
        toast.info(
          `Preparing ${format.toUpperCase()} generation... This may take a moment.`
        )

        const images: string[] = []
        // Target the rendered slide preview containers
        const previews = document.querySelectorAll(".slide-preview-container")

        for (let i = 0; i < slides.length; i++) {
          const previewEl = document.getElementById(
            `slide-preview-${slides[i].id}`
          )
          if (previewEl) {
            // Find the iframe
            const iframe = previewEl.querySelector("iframe")
            if (iframe && iframe.contentDocument) {
              const root = iframe.contentDocument.getElementById("preview-root")
              if (root) {
                // Ensure it's rendered. We might need a small delay or check
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
          await exportImagesToPdf(storyTitle, images)
          toast.success("PDF exported successfully")
        } else if (format === "pptx") {
          await exportImagesToPpptx(storyTitle, images)
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
          slides: data.slides.map((s: any, idx: number) => ({
            ...s,
            id: s.id || idx + 1,
          })),
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
          router.push(`/editor/${newProject.id}`)
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = initialData?.id
        ? `/api/projects/${initialData.id}`
        : "/api/projects"
      const method = initialData?.id ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyTitle,
          description: overallDescription,
          slides: slides,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(
          initialData?.id ? "Project updated" : "Project saved successfully"
        )
        if (!initialData?.id) {
          router.push(`/editor/${data.id}`)
        } else {
          if (onSaveSuccess) onSaveSuccess(data)
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
    setSlides((prev) => {
      const newSlides = [...prev]
      newSlides[index] = { ...newSlides[index], [field]: value }
      return newSlides
    })
  }

  const handleReorder = (newSlides: HtmlSlide[]) => {
    setSlides(newSlides)
  }

  const addOutlineSection = (index: number) => {
    setSlides((prev) => {
      const newSlides = [...prev]
      newSlides.splice(index + 1, 0, {
        id: Date.now(), // Real IDs will be assigned on next generate/save
        title: "New Section",
        description: "",
        content: "",
        html: "",
      })
      // Re-index to ensure logical flow
      return newSlides.map((s, idx) => ({ ...s, id: idx + 1 }))
    })
    toast.success("New section added")
  }

  const removeOutlineSection = (index: number) => {
    setSlides((prev) => {
      if (prev.length <= 1) {
        toast.error("Storyboard must have at least one section")
        return prev
      }
      const newSlides = [...prev]
      newSlides.splice(index, 1)
      return newSlides.map((s, idx) => ({ ...s, id: idx + 1 }))
    })
    toast.success("Section removed")
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#FAFBFC] font-sans dark:bg-[#050505]">
      <header className="bg-background/80 z-[100] flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/home")}
            className="hover:bg-muted size-8 rounded-lg transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                autoFocus
                className="m-0 w-48 border-none bg-transparent p-0 text-xs font-bold tracking-tight outline-none focus:ring-0"
                value={storyTitle}
                onChange={(e) => {
                  setStoryTitle(e.target.value)
                }}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
              />
            ) : (
              <span
                onDoubleClick={() => setIsEditingTitle(true)}
                className="max-w-[200px] cursor-text truncate text-xs font-bold tracking-tight"
              >
                {storyTitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleImportJson}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 rounded-lg px-3 text-xs font-bold"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3" />
            <span>Import</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 rounded-lg px-3 text-xs font-bold"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
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

          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:border-border/50 bg-primary/5 text-primary hover:bg-primary/10 h-8 gap-2 rounded-lg border border-transparent px-3 text-xs font-bold transition-colors"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  <span>Save</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={async () => {
              const element = document.documentElement
              if (element.requestFullscreen) {
                await element.requestFullscreen()
              }
            }}
            size="sm"
            className="bg-primary text-primary-foreground ml-1 h-8 rounded-lg px-4 text-xs font-black shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            Present
          </Button>
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
                    value={storyTitle}
                    placeholder="Storyboard Title"
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                  <AutoResizeTextarea
                    className="text-muted-foreground placeholder:text-muted/20 w-full p-0 text-lg leading-relaxed"
                    placeholder="Overall story arc and narrative goals..."
                    value={overallDescription}
                    onChange={(val) => setOverallDescription(val)}
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

                      <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                          <input
                            className="group-hover:text-primary text-foreground w-full border-none bg-transparent p-0 text-3xl font-black tracking-tight transition-colors outline-none focus:ring-0 dark:text-white"
                            value={s.title}
                            onChange={(e) =>
                              updateOutlineSlide(i, "title", e.target.value)
                            }
                            placeholder="Section Title"
                          />

                          <AutoResizeTextarea
                            className="text-foreground/70 w-full max-w-3xl text-base leading-relaxed font-medium dark:text-white/70"
                            value={s.content || ""}
                            onChange={(val) =>
                              updateOutlineSlide(i, "content", val)
                            }
                            placeholder="Write the detailed narrative content here..."
                          />
                        </div>

                        {/* Live Slide Preview or Generating State */}
                        <div className="mt-8">
                          {(() => {
                            const matchingSlide = slides[i]
                            const isGenerating = generatingSections?.has(i)

                            if (isGenerating) {
                              return (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-primary/[0.02] border-primary/10 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed"
                                >
                                  {/* Animated Glow / Shimmer */}
                                  <div className="via-primary/[0.08] animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent" />

                                  <div className="relative flex flex-col items-center gap-3">
                                    <div className="relative">
                                      <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl" />
                                      <Sparkles className="text-primary relative z-10 size-8 animate-pulse" />
                                    </div>
                                  </div>

                                  {/* Progress line at the bottom */}
                                  <div className="bg-primary/5 absolute inset-x-0 bottom-0 h-1 overflow-hidden">
                                    <motion.div
                                      className="bg-primary/40 h-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                      initial={{ width: "0%" }}
                                      animate={{ width: "100%" }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                    />
                                  </div>
                                </motion.div>
                              )
                            }

                            if (matchingSlide && matchingSlide.html) {
                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="group/preview relative"
                                >
                                  <div
                                    className="border-border/50 ring-primary/5 group-hover:ring-primary/20 slide-preview-container aspect-video w-full overflow-hidden rounded-2xl border bg-black/5 shadow-2xl ring-1 transition-all"
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
                        </div>
                      </div>
                    </div>

                    {/* Section Toolbar */}
                    <div className="bg-background ring-background absolute -bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 opacity-0 shadow-2xl ring-4 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted size-8 rounded-full"
                        onClick={() => setSelectedVisualsIndex(i)}
                      >
                        <ImageIcon className="size-3.5" />
                      </Button>
                      <div className="bg-border h-3 w-[1px]" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-primary/5 hover:bg-primary/10 group/btn size-8 rounded-full"
                        onClick={() => handleGenerateSection(i)}
                      >
                        <Sparkles className="text-primary size-3.5 transition-transform group-hover/btn:scale-110" />
                      </Button>
                      <div className="bg-border h-3 w-[1px]" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted size-8 rounded-full"
                        onClick={() => addOutlineSection(i)}
                      >
                        <Plus className="text-primary size-3.5" />
                      </Button>
                      <div className="bg-border h-3 w-[1px]" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 hover:text-destructive size-8 rounded-full"
                        onClick={() => removeOutlineSection(i)}
                      >
                        <Trash className="size-3.5" />
                      </Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isEditMode && selectedElData && (
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

      <AnimatePresence>
        {isThemeMode && (
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
                  Design Tokens
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsThemeMode(false)}
                  className="size-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <ThemeSettings
                  activeThemeId={activeThemeId}
                  onApplyTheme={(theme: any) => {
                    setActiveThemeId(theme.id)
                    setAppliedTheme(theme)

                    const updatedSlides = slides.map((slide) => {
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

                      if (html.includes(":root")) {
                        html = html.replace(/:root\s*\{[\s\S]*?\}/, themeVars)
                      } else if (html.includes("<style>")) {
                        html = html.replace("<style>", `<style>\n${themeVars}`)
                      } else if (html.includes("</head>")) {
                        html = html.replace(
                          "</head>",
                          `<style>\n${themeVars}\n</style></head>`
                        )
                      }

                      return { ...slide, html }
                    })

                    setSlides(updatedSlides)
                    toast.success("Design system synchronized across workspace")
                  }}
                  appliedTheme={appliedTheme}
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
                <ImageIcon className="text-primary size-5" />
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
                  value={slides[selectedVisualsIndex]?.description || ""}
                  onChange={(val) =>
                    updateOutlineSlide(selectedVisualsIndex, "description", val)
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
    </div>
  )
}
