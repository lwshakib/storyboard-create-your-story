"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
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

export function EditorSidebar({
  slides,
  activeSlideId,
  setActiveSlideId,
  onAddSlide,
  onDeleteSlide,
}: EditorSidebarProps) {
  return (
    <Sidebar
      collapsible="none"
      className="bg-background/50 w-72 border-r backdrop-blur-xl"
    >
      <SidebarContent className="p-0">
        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between px-6 py-6">
            <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em] uppercase">
              Story Slides
            </SidebarGroupLabel>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary hover:text-primary-foreground h-8 w-8 rounded-lg border-dashed transition-all duration-300 hover:border-solid"
              onClick={onAddSlide}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="custom-scrollbar flex max-h-[calc(100vh-160px)] flex-col gap-4 overflow-y-auto px-4 pb-10">
            {slides.map((slide, index) => (
              <div key={slide.id} className="group relative pr-2">
                <div
                  onClick={() => setActiveSlideId(slide.id)}
                  className={cn(
                    "relative aspect-video cursor-pointer overflow-hidden border-2 transition-all duration-300",
                    activeSlideId === slide.id
                      ? "border-primary bg-background ring-primary/10 shadow-[0_10px_30px_rgba(var(--primary),0.15)] ring-4"
                      : "border-border/40 bg-muted/5 hover:border-border hover:bg-muted/10"
                  )}
                >
                  {/* Index Badge */}
                  <div
                    className={cn(
                      "absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border text-[9px] font-black transition-colors",
                      activeSlideId === slide.id
                        ? "bg-primary border-primary text-white"
                        : "bg-background text-muted-foreground border-border"
                    )}
                  >
                    {index + 1}
                  </div>

                  <SlidePreview html={slide.html || slide.content || ""} autoScale />
                </div>

                {slides.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 z-20 h-6 w-6 rounded-lg opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110 active:scale-95"
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
