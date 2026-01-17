"use client"

import * as React from "react"
import { StoryTemplates, Template } from "@/lib/templates-data"
import { AdvancedTemplates } from "@/lib/advanced-templates"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, ArrowRight, Files, Plus, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SlidePreview } from "@/components/editor/slide-preview"
import { AdvancedSlidePreview } from "@/components/editor/advanced-slide-preview"
import { cn } from "@/lib/utils"

export default function TemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<'all' | 'standard' | 'advanced'>('all')

  const allTemplates = [...StoryTemplates, ...AdvancedTemplates]
  const filteredTemplates = allTemplates.filter(t => {
    if (activeTab === 'all') return true
    if (activeTab === 'standard') return t.type !== 'ADVANCED'
    if (activeTab === 'advanced') return t.type === 'ADVANCED'
    return true
  })

  const handleUseTemplate = (template: Template) => {
    localStorage.setItem('importedStoryboard', JSON.stringify({
      title: template.title,
      slides: template.slides
    }))
    
    toast.success(`Loading ${template.title} template...`)
    
    if (template.type === 'ADVANCED') {
      router.push('/advanced-editor')
    } else {
      router.push('/editor')
    }
  }

  return (
    <div className="flex-1 space-y-12 p-8 pt-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LayoutTemplate className="size-10 text-primary" />
            STORY TEMPLATES
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-2xl leading-relaxed">
            Start your story with professionally designed layouts. Choose from our standard minimalist collection or high-fidelity architectural designs.
          </p>
        </div>

        <div className="flex items-center bg-muted/50 p-1 rounded-2xl border border-border/50">
            {[
                { id: 'all', label: 'All' },
                { id: 'standard', label: 'Standard' },
                { id: 'advanced', label: 'High-Fidelity', icon: Sparkles }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                        "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === tab.id 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {tab.icon && <tab.icon className="size-3 text-orange-400" />}
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col gap-4"
          >
            {/* Preview Card */}
            <div className="relative aspect-video bg-muted/40 rounded-[2rem] overflow-hidden border border-border/50 transition-all hover:border-primary/40 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] group/preview">
              <div className="absolute inset-0 z-0">
                {template.slides.length > 0 && (
                  template.type === 'ADVANCED' ? (
                    <AdvancedSlidePreview html={template.slides[0].html || ""} autoScale />
                  ) : (
                    <SlidePreview slide={template.slides[0]} scale={1} />
                  )
                )}
              </div>
              
              {/* Overlay with Button */}
              <div className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                 <Button 
                  onClick={() => handleUseTemplate(template)}
                  className="rounded-[1.2rem] px-8 h-12 bg-primary text-primary-foreground font-black transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-2 border-b-4 border-primary-foreground/20"
                 >
                    <Plus className="size-5" />
                    USE TEMPLATE
                 </Button>
              </div>
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-20">
                <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm",
                    template.type === 'ADVANCED' 
                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20" 
                        : "bg-primary/10 text-primary border-primary/20"
                )}>
                    {template.type === 'ADVANCED' ? "High-Fidelity" : "Standard"}
                </div>
              </div>

              {/* Slide Count Badge */}
              <div className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold border border-border/50 flex items-center gap-1.5 shadow-sm">
                <Files className="size-3 opacity-60" />
                {template.slides.length} Slides
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-col gap-2 px-2 text-card-foreground">
              <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors uppercase italic truncate">
                {template.title}
              </h3>
              <p className="text-muted-foreground text-xs font-semibold leading-relaxed line-clamp-2">
                {template.description}
              </p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {template.slides.slice(0, 4).map((slide, i) => (
                    <div key={i} className="size-8 rounded-xl border-4 border-background bg-muted overflow-hidden ring-1 ring-border/5 shadow-sm">
                      <img src={slide.bgImage || template.thumbnail || "/placeholder.png"} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {template.slides.length > 4 && (
                    <div className="size-8 rounded-xl border-4 border-background bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border/5 shadow-sm">
                      +{template.slides.length - 4}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleUseTemplate(template)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/70 transition-all flex items-center gap-1.5"
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
