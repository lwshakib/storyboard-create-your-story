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
        const response = await fetch('/api/templates')
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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: template.title,
          slides: template.slides
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
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary opacity-50" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-12 p-8 pt-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <LayoutTemplate className="size-8 text-primary" />
            Story Templates
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-2xl leading-relaxed">
            Professional high-fidelity presentation templates. Automatically synchronized with our design inspirations library.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col gap-4"
          >
            {/* Preview Card */}
            <div className="relative aspect-video bg-muted/40 rounded-xl overflow-hidden border border-border/50 transition-all hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] group/preview">
              <div className="absolute inset-0 z-0">
                {template.slides.length > 0 && (
                  <SlidePreview html={template.slides[0].html || ""} autoScale />
                )}
              </div>
              
              {/* Overlay with Button */}
              <div className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                 <Button 
                  onClick={() => handleUseTemplate(template)}
                  disabled={creatingId !== null}
                  className="rounded-xl px-8 h-12 bg-primary text-primary-foreground font-bold transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 border-b-2 border-primary-foreground/10"
                 >
                    {creatingId === template.id ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                    {creatingId === template.id ? "Creating..." : "Use template"}
                 </Button>
              </div>
              

              {/* Slide Count Badge */}
              <div className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold border border-border/50 flex items-center gap-1.5 shadow-sm">
                <Files className="size-3 opacity-60" />
                {template.slides.length} Slides
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-col gap-2 px-2 text-card-foreground">
              <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                {template.title}
              </h3>
              <p className="text-muted-foreground text-xs font-semibold leading-relaxed line-clamp-2">
                {template.description}
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {template.slides.slice(0, 4).map((slide, i) => (
                    <div key={i} className="size-8 rounded-lg border-4 border-background bg-muted overflow-hidden ring-1 ring-border/5 shadow-sm">
                      <img src={slide.bgImage || template.thumbnail || "/placeholder.png"} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {template.slides.length > 4 && (
                    <div className="size-8 rounded-lg border-4 border-background bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border/5 shadow-sm">
                      +{template.slides.length - 4}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleUseTemplate(template)}
                  disabled={creatingId !== null}
                  className="text-[10px] font-bold tracking-tight text-primary hover:text-primary/70 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {creatingId === template.id ? "Creating..." : "Quick import"} <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
