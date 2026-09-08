"use client"

import * as React from "react"
import { Reorder } from "framer-motion"
import {
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Compass,
  Wand2,
  Presentation as PresentationIcon,
  Trash,
  Plus,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlidePreview } from "@/components/project/slide-preview"
import { AutoResizeTextarea } from "@/components/project/auto-resize-textarea"
import { HtmlSlide } from "@/lib/storyboard-parser"

interface SlideListItemProps {
  slide: HtmlSlide
  index: number
  totalSlides: number
  isGenerating?: boolean
  isBusy?: boolean
  onUpdateTitle: (index: number, title: string) => void
  onUpdateDescription: (index: number, description: string) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onEditBlueprint: (index: number) => void
  onGenerate: (index: number) => void
  onPresent: (index: number) => void
  onDelete: (index: number) => void
  onInsertBelow: (index: number) => void
  onExpandBelow?: (index: number) => void
  onSelect: (index: number) => void
}

export function SlideListItem({
  slide,
  index,
  totalSlides,
  isGenerating,
  isBusy,
  onUpdateTitle,
  onUpdateDescription,
  onMove,
  onEditBlueprint,
  onGenerate,
  onPresent,
  onDelete,
  onInsertBelow,
  onExpandBelow,
  onSelect,
}: SlideListItemProps) {
  return (
    <Reorder.Item
      key={slide.id}
      value={slide}
      id={`slide-full-${slide.id}`}
      className="group/item relative flex flex-col lg:flex-row gap-5 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xl p-4 transition-all"
    >
      {/* Left: Compact Slide Preview (~500px) */}
      <div className="lg:w-[480px] xl:w-[540px] shrink-0">
        <div
          className="slide-preview-container relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-black/5 shadow-xs ring-1 ring-border/20 cursor-pointer"
          id={`slide-preview-${slide.id}`}
          onClick={() => onSelect(index)}
        >
          {slide.html === "SKELETON" || isGenerating ? (
            <div className="h-full w-full bg-muted/20 flex items-center justify-center animate-pulse">
              <Sparkles className="size-5 text-primary animate-spin" />
            </div>
          ) : slide.html ? (
            <SlidePreview
              key={`${slide.id}-${slide.html?.length || 0}-${slide.title || ""}`}
              html={slide.html}
              autoScale={true}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <Sparkles className="size-6 opacity-40" />
              <span className="text-xs font-medium">Slide blueprint ready</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] gap-1.5"
                onClick={() => onGenerate(index)}
              >
                <Wand2 className="size-3" /> Generate HTML
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Slide Info & Controls */}
      <div className="flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground/30 hover:text-primary cursor-grab active:cursor-grabbing p-0.5">
                <GripVertical className="size-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground/70 tabular-nums">
                SLIDE {String(index + 1).padStart(2, "0")}
              </span>
              <div className="h-3 w-[1px] bg-border" />
              <button
                type="button"
                disabled={index === 0 || isBusy}
                onClick={() => onMove(index, index - 1)}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 cursor-pointer"
                title="Move up"
              >
                <ArrowLeft className="size-3 rotate-90" />
              </button>
              <button
                type="button"
                disabled={index === totalSlides - 1 || isBusy}
                onClick={() => onMove(index, index + 1)}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1 cursor-pointer"
                title="Move down"
              >
                <ArrowRight className="size-3 rotate-90" />
              </button>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onEditBlueprint(index)}
                title="Edit Blueprint"
              >
                <Compass className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md text-primary"
                onClick={() => onGenerate(index)}
                title={isGenerating ? "Stop Generation" : "Regenerate"}
              >
                {isGenerating ? (
                  <X className="size-3.5 text-red-500" />
                ) : (
                  <Wand2 className="size-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onPresent(index)}
                title="Present"
              >
                <PresentationIcon className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(index)}
                title="Delete"
                disabled={isBusy}
              >
                <Trash className="size-3.5" />
              </Button>
            </div>
          </div>

          <AutoResizeTextarea
            className="text-foreground font-bold text-base sm:text-lg leading-snug w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
            value={slide.title}
            placeholder="Slide Title"
            onChange={(val) => onUpdateTitle(index, val)}
            disabled={isGenerating}
          />

          <AutoResizeTextarea
            className="text-muted-foreground text-xs sm:text-sm leading-relaxed w-full bg-transparent border-none p-0 focus:ring-0 resize-none"
            value={slide.description || ""}
            placeholder="Slide talking points, narrative notes, and key takeaways..."
            onChange={(val) => onUpdateDescription(index, val)}
            disabled={isGenerating}
          />
        </div>

        {/* Quick Add Slide Below */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          <button
            type="button"
            onClick={() => onInsertBelow(index)}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <Plus className="size-3 text-primary" />
            <span>Insert slide below</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onExpandBelow?.(index)}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <Sparkles className="size-3 text-primary" />
            <span>AI continue slide</span>
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}
