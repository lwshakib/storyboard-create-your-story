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

/**
 * EditorSidebarProps defines the shape of props for the side navigation in the editor.
 * @property slides - The list of slides to display.
 * @property activeSlideId - The ID of the currently selected slide.
 * @property setActiveSlideId - Callback function to change the current slide.
 * @property onAddSlide - Callback to append a new blank slide.
 * @property onDeleteSlide - Callback to remove a specific slide.
 */
interface EditorSidebarProps {
  slides: Slide[]
  activeSlideId: number
  setActiveSlideId: (id: number) => void
  onAddSlide: () => void
  onDeleteSlide: (id: number) => void
}

/**
 * EditorSidebar component: A thumbnail-based navigation bar for the storyboard slides.
 * Features:
 * - Dynamic list of slide previews using iframes (SlidePreview).
 * - Visual highlighting of the active slide.
 * - Quick actions for adding and deleting slides.
 * - Premium styling with blur effects and custom scrollbars.
 */
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
          {/* SIDEBAR HEADER: Title and Global Add Button */}
          <div className="flex items-center justify-between px-6 py-6">
            <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] font-black tracking-[0.2em]">
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

          {/* SLIDE LIST: Maps through all slides to render mini previews */}
          <div className="custom-scrollbar flex max-h-[calc(100vh-160px)] flex-col gap-4 overflow-y-auto px-4 pb-10">
            {slides.map((slide, index) => (
              <div key={slide.id} className="group relative pr-2">
                {/* THUMBNAIL CONTAINER */}
                <div
                  onClick={() => setActiveSlideId(slide.id as number)}
                  className={cn(
                    "relative aspect-video cursor-pointer overflow-hidden border-2 transition-all duration-300",
                    activeSlideId === slide.id
                      ? "border-primary bg-background ring-primary/10 shadow-[0_10px_30px_rgba(var(--primary),0.15)] ring-4"
                      : "border-border/40 bg-muted/5 hover:border-border hover:bg-muted/10"
                  )}
                >
                  {/* INDEX BADGE: Displays the 1-indexed position of the slide */}
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

                  {/* MINI PREVIEW: Uses the slide's HTML inside a scaled-down iframe */}
                  <SlidePreview
                    html={slide.html || slide.content || ""}
                    autoScale
                  />
                </div>

                {/* DELETE ACTION: Only shown on hover, and only if more than one slide exists */}
                {slides.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 z-20 h-6 w-6 rounded-lg opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation() // Prevents triggering the slide selection
                      onDeleteSlide(slide.id as number)
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
