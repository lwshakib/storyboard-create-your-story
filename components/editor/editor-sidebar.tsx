"use client"

import * as React from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider, 
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slide } from "@/types/editor"
import { SlidePreview } from "./slide-preview"

interface EditorSidebarProps {
  slides: Slide[]
  activeSlideId: number
  setActiveSlideId: (id: number) => void
  onAddSlide: () => void
  onDeleteSlide: (id: number) => void
}

export function EditorSidebar({ slides, activeSlideId, setActiveSlideId, onAddSlide, onDeleteSlide }: EditorSidebarProps) {
  return (
    <Sidebar collapsible="none" className="w-72 border-r bg-background/50 backdrop-blur-xl">
      <SidebarContent className="p-0">
        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between py-6 px-6">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Story Slides</SidebarGroupLabel>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg border-dashed hover:border-solid hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
                onClick={onAddSlide}
            >
                <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4 px-4 pb-10 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin scrollbar-thumb-primary/10">
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className="relative group pr-2"
              >
                <div 
                  onClick={() => setActiveSlideId(slide.id)}
                  className={cn(
                    "relative aspect-video border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                    activeSlideId === slide.id 
                      ? "border-primary bg-background shadow-[0_10px_30px_rgba(var(--primary),0.15)] ring-4 ring-primary/10" 
                      : "border-border/40 bg-muted/5 hover:border-border hover:bg-muted/10"
                  )}
                >
                    {/* Index Badge */}
                    <div className={cn(
                        "absolute top-2 left-2 z-10 w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-black border transition-colors",
                        activeSlideId === slide.id ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border"
                    )}>
                        {index + 1}
                    </div>

                    <SlidePreview slide={slide} />
                </div>
                
                {slides.length > 1 && (
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-1 -right-1 h-6 w-6 opacity-0 group-hover:opacity-100 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSlide(slide.id)
                        }}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
