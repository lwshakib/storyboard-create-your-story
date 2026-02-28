"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, ArrowRight, Files, Plus, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SlidePreview } from "@/components/editor/slide-preview"
import { cn } from "@/lib/utils"
import { Template } from "@/lib/templates"

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [creatingId, setCreatingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
        } else {
          toast.error("Failed to load templates")
        }
      } catch (error) {
        console.error("Templates fetch error:", error)
        toast.error("An error occurred while loading templates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleUseTemplate = async (template: Template) => {
    setCreatingId(template.id)
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: template.title,
          slides: template.slides,
        }),
      })

      if (response.ok) {
        const project = await response.json()
        toast.success(`Created project from ${template.title}`)
        router.push(`/editor/${project.id}`)
      } else {
        toast.error("Failed to create project from template")
      }
    } catch (error) {
      console.error("Template creation error:", error)
      toast.error("An error occurred")
    } finally {
      setCreatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary size-8 animate-spin opacity-50" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">
            Loading templates...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-12 p-8 pt-10 pb-20">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground flex items-center gap-3 text-3xl font-bold tracking-tight">
            <LayoutTemplate className="text-primary size-8" />
            Story Templates
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed font-medium">
            Professional high-fidelity presentation templates. Automatically
            synchronized with our design inspirations library.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onUse={() => handleUseTemplate(template)}
            isCreating={creatingId === template.id}
            isGlobalCreating={creatingId !== null}
          />
        ))}
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  index,
  onUse,
  isCreating,
  isGlobalCreating,
}: {
  template: Template
  index: number
  onUse: () => void
  isCreating: boolean
  isGlobalCreating: boolean
}) {
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col gap-4"
    >
      {/* Preview Card */}
      <div className="bg-muted/40 border-border/50 hover:border-primary/40 group/preview relative aspect-video overflow-hidden rounded-xl border transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="absolute inset-0 z-0 scale-[1.01]">
          <SlidePreview
            html={template.slides[activeSlideIndex]?.html || ""}
            autoScale
          />
        </div>

        {/* Overlay with Button */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/preview:opacity-100">
          <Button
            onClick={onUse}
            disabled={isGlobalCreating}
            className="bg-primary text-primary-foreground border-primary-foreground/10 flex h-12 items-center gap-2 rounded-xl border-b-2 px-8 font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            {isCreating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
            {isCreating ? "Creating..." : "Use template"}
          </Button>
        </div>

        {/* Slide Count Badge */}
        <div className="bg-background/80 text-foreground border-border/50 absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md">
          <Files className="size-3 opacity-60" />
          {template.slides.length} Slides
        </div>

        {/* Progress Dots / Slide Selectors */}
        <div className="bg-background/40 absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 px-2 py-1.5 opacity-0 backdrop-blur-md transition-opacity group-hover/preview:opacity-100">
          {template.slides.map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveSlideIndex(i)}
              className={cn(
                "size-1.5 rounded-full transition-all",
                activeSlideIndex === i
                  ? "bg-primary w-4"
                  : "bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      </div>

      {/* Meta Info */}
      <div className="text-card-foreground flex flex-col gap-2 px-2">
        <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
          {template.title}
        </h3>
        <p className="text-muted-foreground line-clamp-1 text-sm leading-relaxed font-medium">
          {template.description}
        </p>

        <div className="mt-2 flex items-center justify-end">
          <button
            onClick={onUse}
            disabled={isGlobalCreating}
            className="text-primary hover:text-primary/70 flex items-center gap-1.5 text-[10px] font-bold tracking-tight transition-all disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Quick import"}{" "}
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
