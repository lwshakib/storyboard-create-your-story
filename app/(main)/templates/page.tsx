"use client"

import * as React from "react"
import { StoryTemplates } from "@/lib/templates-data"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, ArrowRight, Files, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SlidePreview } from "@/components/editor/slide-preview"

export default function TemplatesPage() {
  const router = useRouter()

  const handleUseTemplate = (templateId: string) => {
    const template = StoryTemplates.find(t => t.id === templateId)
    if (template) {
      localStorage.setItem('importedStoryboard', JSON.stringify({
        title: template.title,
        slides: template.slides
      }))
      toast.success(`Loading ${template.title} template...`)
      router.push('/editor')
    }
  }

  return (
    <div className="flex-1 space-y-12 p-8 pt-10 pb-20">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <LayoutTemplate className="size-8 text-primary" />
          Templates
        </h1>
        <p className="text-muted-foreground text-sm font-medium max-w-2xl leading-relaxed">
          Start your story with professionally designed layouts. Choose a template and customize it to make it your own.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
        {StoryTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col gap-4"
          >
            {/* Preview Card */}
            <div className="relative aspect-video bg-muted/30 rounded-2xl overflow-hidden border border-border/50 transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 group/preview">
              <div className="absolute inset-0 z-0">
                {template.slides.length > 0 && (
                  <SlidePreview slide={template.slides[0]} scale={1} />
                )}
              </div>
              
              {/* Overlay with Button */}
              <div className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                 <Button 
                  onClick={() => handleUseTemplate(template.id)}
                  className="rounded-xl px-6 h-11 bg-primary text-primary-foreground font-bold transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                 >
                   <Plus className="size-4" />
                   Use Template
                 </Button>
              </div>
              
              {/* Slide Count Badge */}
              <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold border border-border/50 flex items-center gap-1.5 line-height-none">
                <Files className="size-3 opacity-60" />
                {template.slides.length} Slides
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-col gap-2 px-1 text-card-foreground">
              <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-muted-foreground text-xs font-medium leading-relaxed line-clamp-2">
                {template.description}
              </p>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {template.slides.slice(0, 3).map((slide, i) => (
                    <div key={i} className="size-6 rounded-lg border-2 border-background bg-muted overflow-hidden ring-1 ring-border/10">
                      <img src={slide.bgImage || "/placeholder.png"} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {template.slides.length > 3 && (
                    <div className="size-6 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground ring-1 ring-border/10">
                      +{template.slides.length - 3}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleUseTemplate(template.id)}
                  className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors flex items-center gap-1.5"
                >
                  Quick Import <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
