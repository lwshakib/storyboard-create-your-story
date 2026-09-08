"use client"

import * as React from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { useChat } from "@/hooks/use-chat"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  exportHtmlToJson,
  exportImagesToPdf,
  exportImagesToPpptx,
} from "@/lib/export-utils"
import { toPng } from "html-to-image"

import { HtmlSlide } from "@/lib/storyboard-parser"
import {
  ElementSettings,
  type ElementData,
} from "@/components/project/element-settings"
import { PresentationMode } from "./presentation-mode"

import { ProjectHeader } from "./project-header"
import { DeckToolbar } from "./deck-toolbar"
import { DeckStatus } from "./deck-status"
import { SlideGridCard } from "./slide-grid-card"
import { SlideListItem } from "./slide-list-item"
import { ProjectChatDrawer } from "./project-chat-drawer"
import { VisualBlueprintDialog } from "./visual-blueprint-dialog"
import { GenerateDialog } from "./generate-dialog"

export interface ProjectViewProps {
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

/**
 * ProjectView component: The high-fidelity narrative canvas.
 * Orchestrates project state, cloud autosaving, layout view modes,
 * export/import actions, and modular subcomponents.
 */
export function ProjectView({
  initialData,
  onGenerateSection,
  onExpandSection,
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

  // Settings & Dialog States
  const [selectedElData, setSelectedElData] =
    React.useState<ElementData | null>(null)
  const [isPresenting, setIsPresenting] = React.useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = React.useState(false)
  const [selectedVisualsIndex, setSelectedVisualsIndex] = React.useState<
    number | null
  >(null)

  // Chat Drawer State
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

  // Sync initialData changes
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
        for (let i = 0; i < slides.length; i++) {
          const previewEl = document.getElementById(
            `slide-preview-${slides[i].id}`
          )
          if (previewEl) {
            const iframe = previewEl.querySelector("iframe")
            if (iframe && iframe.contentDocument) {
              const root = iframe.contentDocument.getElementById("preview-root")
              if (root) {
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

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        if (!content) throw new Error("Empty file content")

        toast.info("Checking compatibility...")
        const data = JSON.parse(content)

        if (!data || typeof data !== "object" || !Array.isArray(data.slides)) {
          toast.error("Incompatible storyboard format.")
          return
        }

        setIsSaving(true)
        toast.info("Creating project...")

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

        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const newProject = await res.json()
          toast.success("Project created successfully")
          window.location.href = `/project/${newProject.id}`
        } else {
          throw new Error("Failed to create project")
        }
      } catch (err) {
        console.error("Import error:", err)
        toast.error("Failed to import JSON")
      } finally {
        setIsSaving(false)
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
      {/* Main Top Header */}
      <ProjectHeader
        title={title}
        setTitle={setTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        credits={credits ?? null}
        onImportJson={handleImportJson}
        onExport={handleExport}
        onPresent={() => setIsPresenting(true)}
        onUserChange={() => {
          hasUserChangesRef.current = true
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <main
          className="no-scrollbar relative flex-1 overflow-y-auto scroll-smooth bg-white dark:bg-[#050505]"
          ref={mainScrollRef}
          onScroll={handleScroll}
        >
          {/* Subtle background dots */}
          <div
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-[1720px] px-4 sm:px-6 md:px-10 py-6 pb-40 space-y-6">
            {/* Executive Deck Header & Toolbar */}
            <DeckToolbar
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              slideCount={slides.length}
              viewMode={viewMode}
              setViewMode={setViewMode}
              gridColumns={gridColumns}
              setGridColumns={setGridColumns}
              onAddSlide={() => addOutlineSection(slides.length - 1)}
              onOpenGenerateDialog={() => setShowGenerateDialog(true)}
              isBusy={isBusy}
              onUserChange={() => {
                hasUserChangesRef.current = true
              }}
            />

            {/* Outline Generation / Error / Empty States */}
            <DeckStatus
              isGeneratingOutline={isGeneratingOutline}
              error={error}
              slideCount={slides.length}
              onOpenGenerateDialog={() => setShowGenerateDialog(true)}
              onCancelOutline={onCancelOutline}
              onRetryOutline={onRetryOutline}
            />

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
                  <SlideGridCard
                    key={s.id}
                    slide={s}
                    index={i}
                    totalSlides={slides.length}
                    isGenerating={generatingSections?.has(i)}
                    isBusy={isBusy}
                    onUpdateTitle={(idx, val) => updateOutlineSlide(idx, "title", val)}
                    onUpdateDescription={(idx, val) => updateOutlineSlide(idx, "description", val)}
                    onMove={moveSlide}
                    onEditBlueprint={(idx) => setSelectedVisualsIndex(idx)}
                    onGenerate={(idx) => onGenerateSection?.(idx)}
                    onPresent={(idx) => {
                      setActiveSlideIndex(idx)
                      setIsPresenting(true)
                    }}
                    onDelete={removeOutlineSection}
                    onInsertBelow={addOutlineSection}
                    onExpandBelow={onExpandSection}
                    onSelect={(idx) => setActiveSlideIndex(idx)}
                  />
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
                  <SlideListItem
                    key={s.id}
                    slide={s}
                    index={i}
                    totalSlides={slides.length}
                    isGenerating={generatingSections?.has(i)}
                    isBusy={isBusy}
                    onUpdateTitle={(idx, val) => updateOutlineSlide(idx, "title", val)}
                    onUpdateDescription={(idx, val) => updateOutlineSlide(idx, "description", val)}
                    onMove={moveSlide}
                    onEditBlueprint={(idx) => setSelectedVisualsIndex(idx)}
                    onGenerate={(idx) => onGenerateSection?.(idx)}
                    onPresent={(idx) => {
                      setActiveSlideIndex(idx)
                      setIsPresenting(true)
                    }}
                    onDelete={removeOutlineSection}
                    onInsertBelow={addOutlineSection}
                    onExpandBelow={onExpandSection}
                    onSelect={(idx) => setActiveSlideIndex(idx)}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        </main>
      </div>

      {/* Slide Element Inspector Sidebar */}
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

      {/* Global Floating AI Architect Chat Drawer */}
      <ProjectChatDrawer
        isOpen={isChatOpen}
        onToggleOpen={() => setIsChatOpen(!isChatOpen)}
        messages={chatMessages}
        isLoading={isChatLoading}
        status={chatStatus}
        currentMessage={currentChatMessage}
        setCurrentMessage={setCurrentChatMessage}
        onSendMessage={handleSendChatMessage}
      />

      {/* Visual Blueprint Modal */}
      <VisualBlueprintDialog
        isOpen={selectedVisualsIndex !== null}
        onClose={() => setSelectedVisualsIndex(null)}
        prompt={
          selectedVisualsIndex !== null
            ? slides[selectedVisualsIndex]?.prompt || ""
            : ""
        }
        onSavePrompt={(val) => {
          if (selectedVisualsIndex !== null) {
            updateOutlineSlide(selectedVisualsIndex, "prompt", val)
          }
        }}
      />

      {/* Fullscreen Presentation Mode */}
      <AnimatePresence>
        {isPresenting && (
          <PresentationMode
            slides={slides}
            initialIndex={activeSlideIndex}
            onClose={() => setIsPresenting(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Presentation Deck Generation Dialog */}
      <GenerateDialog
        isOpen={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        initialPrompt={initialPrompt || ""}
        hasExistingSlides={slides.length > 0}
        isGeneratingOutline={isGeneratingOutline}
        onGenerate={(prompt) => {
          if (onGenerateOutline && prompt.trim()) {
            onGenerateOutline(prompt.trim())
            setShowGenerateDialog(false)
          }
        }}
      />
    </div>
  )
}
