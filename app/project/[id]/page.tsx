"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { EditorView } from "@/components/editor/editor-view"
import { Loader2, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { parseStoryboard, HtmlSlide } from "@/lib/storyboard-parser"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * EditorContent: The core logic for the project editor page.
 * Responsibilities:
 * 1. Fetch project data on mount.
 * 2. Handle initial outline generation if a 'prompt' exists in the URL.
 * 3. Manage streaming slides and partial generation (refinement).
 * 4. Handle project restoration from trash.
 */
function EditorContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get("prompt") // Captured from the creation flow

  // --- PROJECT STATE ---
  const [project, setProject] = useState<{
    id: string
    title: string
    description?: string
    slides: HtmlSlide[]
    outline?: string
    isDeleted?: boolean
  } | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false)

  // --- GENERATION STATE ---
  const [streamingSlides, setStreamingSlides] = useState<HtmlSlide[]>([])
  const [generatingSections, setGeneratingSections] = useState<Set<number>>(
    new Set()
  )
  const [isExpanding, setIsExpanding] = useState(false)

  // Ref to ensure we only trigger the auto-outline generation once per session
  const hasStartedOutlineRef = useRef(false)

  /**
   * Called by the EditorView when changes are saved to the server.
   * Updates local state to keep UI in sync.
   */
  const handleSaveSuccess = useCallback(
    (updatedProject: {
      id: string
      title: string
      description?: string
      slides: HtmlSlide[]
      outline?: string
      isDeleted?: boolean
    }) => {
      setProject(updatedProject)
      if (updatedProject.slides) {
        setStreamingSlides(updatedProject.slides)
      }
    },
    []
  )

  /**
   * Initial project fetcher. 
   * Fetches the storyboard structure and existing slides.
   */
  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
        if (data.slides) {
          setStreamingSlides(data.slides)
        }
      } else {
        setError(true)
      }
    } catch (err) {
      console.error("Failed to fetch project", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  /**
   * Generates a high-level storyboard outline based on a natural language prompt.
   * This is triggered automatically if the project is empty and a prompt exists.
   */
  const generateOutline = useCallback(
    async (p: string) => {
      setIsGeneratingOutline(true)
      try {
        const resp = await fetch("/api/generate-outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: p,
            projectId: id,
          }),
        })
        
        if (!resp.ok) {
          if (resp.status === 403) {
            const data = await resp.json()
            if (data.error === "INSUFFICIENT_CREDITS") {
              throw new Error("INSUFFICIENT_CREDITS")
            }
          }
          throw new Error("Outline generation failed")
        }

        const updatedProject = await resp.json()
        setProject(updatedProject)
        setStreamingSlides(updatedProject.slides)

        // Clear prompt from URL to prevent accidental re-generations on refresh
        router.replace(`/project/${id}`, { scroll: false })
        toast.success("Outline generated and saved")
      } catch (err: unknown) {
        console.error(err)
        if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
          toast.error("You have run out of daily credits.", {
            description: "Credits reset every day at midnight (12 AM). Upgrade for higher limits.",
          })
        } else {
          toast.error("Failed to generate outline")
        }
      } finally {
        setIsGeneratingOutline(false)
      }
    },
    [id, router]
  )

  // --- EFFECTS ---

  // Trigger project fetch on ID change
  useEffect(() => {
    if (id) fetchProject()
  }, [id, fetchProject])

  // Monitor for initial prompt to start the AI generation flow
  useEffect(() => {
    if (
      prompt &&
      !hasStartedOutlineRef.current &&
      project &&
      !project.description &&
      (!project.slides || project.slides.length === 0)
    ) {
      hasStartedOutlineRef.current = true
      generateOutline(prompt)
    }
  }, [prompt, project, generateOutline])

  /**
   * AI Refinement: Takes a specific placeholder slide and generates full HTML.
   * It provides the AI with the full storyboard context to ensure visual consistency.
   */
  const handleGenerateSection = useCallback(
    async (index: number) => {
      const section = streamingSlides[index]
      if (!section) {
        toast.error("Slide data not found")
        return
      }

      // Prepare context: Full narrative flow helps the AI understand the current slide's position.
      const context = `Overall Title: ${project?.title}\nOverall Description: ${project?.description}\nFull Narrative Flow and Planned Content:\n${streamingSlides.map((s, i) => `Section ${i + 1}: ${s.title}\n- Visual Prompt: ${s.description}\n- Writing/Narration: ${s.content}`).join("\n\n")}`

      setGeneratingSections((prev) => new Set(prev).add(index))
      try {
        const response = await fetch("/api/generate-sections/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `GENERATE_SINGLE_SLIDE: Slide Index: ${index + 1}. Title: ${section.title}. Description: ${section.description}. Content: ${section.content}. 
          IMPORTANT RULES:
          1. Provide the RAW HTML for the slide content. DO NOT wrap it in <slide> or similar tags.
          2. Start directly with the <!DOCTYPE html> or <html> content. 
          3. Use the 'generateImage' tool to create a high-fidelity cinematic visual for this slide. DO NOT use placeholders.
          4. Focus on professional agency-level design.`,
            context: context,
            projectId: id,
            index: index,
          }),
        })

        if (!response.ok) {
          if (response.status === 403) {
            const data = await response.json()
            if (data.error === "INSUFFICIENT_CREDITS") {
              throw new Error("INSUFFICIENT_CREDITS")
            }
          }
          throw new Error("Failed to refine section")
        }

        const { html } = await response.json()

        if (html) {
          // AI might still wrap in tags sometimes, so we parse it for robustness
          const data = parseStoryboard(html)
          let slideHtml = html.trim()

          if (data.slides.length > 0) {
            slideHtml = data.slides[0].html
          }

          // Immutably update the slides array
          const next = [...streamingSlides]
          next[index] = {
            ...next[index],
            html: slideHtml,
          }

          setStreamingSlides(next)
          toast.success("Section refined and saved")
        }
      } catch (err: unknown) {
        console.error("Refine error:", err)
        if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
          toast.error("Daily credit limit reached.", {
            description: "Wait for the midnight reset or contact us to upgrade your plan.",
          })
        } else {
          toast.error("Failed to refine section")
        }
      } finally {
        // Remove from generating state
        setGeneratingSections((prev) => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
      }
    },
    [project, id, streamingSlides]
  )

  /**
   * AI Expansion: Asks the AI to add a new section/slide to the current flow.
   */
  const handleExpandSection = useCallback(
    async (index?: number) => {
      setIsExpanding(true)
      try {
        const res = await fetch("/api/generate-sections/expand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: id, index }),
        })
        if (!res.ok) {
          if (res.status === 403) {
            const data = await res.json()
            if (data.error === "INSUFFICIENT_CREDITS") {
              throw new Error("INSUFFICIENT_CREDITS")
            }
          }
          throw new Error("Section expansion failed")
        }

        const updatedProject = await res.json()
        setProject(updatedProject)
        setStreamingSlides(updatedProject.slides)
        toast.success("AI added a new section")
      } catch (err: unknown) {
        console.error(err)
        if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
          toast.error("Low credits for AI expansion.")
        } else {
          toast.error("Failed to add AI section")
        }
      } finally {
        setIsExpanding(false)
      }
    },
    [id]
  )

  /**
   * Renders the loading state with premium animations.
   */
  const renderLoader = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
      {/* Background Animated Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="bg-primary/10 absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -right-[10%] -bottom-[20%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[120px]"
        />
      </div>

      {/* Loader Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex max-w-md flex-col items-center px-6 text-center"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="border-primary/30 h-24 w-24 rounded-full border-t-2 border-r-2"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-primary h-10 w-10 animate-pulse" />
          </div>
        </div>

        <h2 className="from-foreground to-foreground/70 mb-3 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          {isGeneratingOutline ? "Architecting Your Narrative" : "Opening Your Storyboard"}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {isGeneratingOutline ? "Analyzing vision and creating a structural flow..." : "Preparing your workspace with high-fidelity components."}
        </p>

        <div className="bg-background/50 border-border/50 text-primary ring-primary/20 flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-lg ring-1 backdrop-blur-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isGeneratingOutline ? "Generating Outline..." : "Loading data..."}</span>
        </div>
      </motion.div>
    </div>
  )

  // --- RENDERING LOGIC ---

  if (loading || (prompt && isGeneratingOutline && !project?.outline)) {
    return renderLoader()
  }

  if (error || !project) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F8F9FB] dark:bg-[#0A0A0B]">
        <div className="bg-destructive/5 text-destructive rounded-none p-4 text-sm font-bold tracking-tight uppercase">
          Project not found or failed to load.
        </div>
        <Link
          href="/home"
          className="text-primary text-[10px] font-black tracking-widest uppercase transition-all hover:underline"
        >
          Go back home
        </Link>
      </div>
    )
  }

  // Handle Trash state: Prevent editing if project is deleted
  if (project.isDeleted) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-[#F8F9FB] text-center dark:bg-[#0A0A0B]">
        <div className="bg-muted/5 flex size-20 items-center justify-center border border-black/[0.03]">
          <Trash2 className="size-10 opacity-20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            This storyboard is in the trash
          </h1>
          <p className="text-muted-foreground text-sm font-medium opacity-60">
            Restore it to continue editing or viewing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-none px-8 text-[10px] font-black tracking-widest"
            onClick={() => router.push("/trash")}
          >
            Go to Trash
          </Button>

          <Button
            className="h-11 rounded-none px-8 text-[10px] font-black tracking-widest"
            onClick={async () => {
              const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDeleted: false }),
              })
              if (res.ok) {
                toast.success("Project restored")
                window.location.reload()
              }
            }}
          >
            Restore Project
          </Button>
        </div>
      </div>
    )
  }

  // Final Render: Pass all state and handlers to the EditorView component
  return (
    <EditorView
      initialData={{
        ...project,
        slides: streamingSlides,
      }}
      isGenerating={false}
      generatingSections={generatingSections}
      onGenerateSection={handleGenerateSection}
      onExpandSection={handleExpandSection}
      isExpanding={isExpanding}
      onSaveSuccess={handleSaveSuccess}
    />
  )
}

/**
 * UnifiedEditorPage: Wraps the editor in a Suspense boundary for better UX during navigation.
 */
export default function UnifiedEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
