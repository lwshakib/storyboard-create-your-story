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
      className="group/item border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 relative flex flex-col gap-5 rounded-2xl border p-4 transition-all hover:shadow-xl lg:flex-row"
    >
      {/* Left: Compact Slide Preview (~500px) */}
      <div className="shrink-0 lg:w-[480px] xl:w-[540px]">
        <div
          className="slide-preview-container border-border/50 ring-border/20 relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border bg-black/5 shadow-xs ring-1"
          id={`slide-preview-${slide.id}`}
          onClick={() => onSelect(index)}
        >
          {slide.html === "SKELETON" || isGenerating ? (
            <div className="bg-muted/20 flex h-full w-full animate-pulse items-center justify-center">
              <Sparkles className="text-primary size-5 animate-spin" />
            </div>
          ) : slide.html ? (
            <SlidePreview
              key={`${slide.id}-${slide.html?.length || 0}-${slide.title || ""}`}
              html={slide.html}
              autoScale={true}
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
              <Sparkles className="size-6 opacity-40" />
              <span className="text-xs font-medium">Slide blueprint ready</span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-[11px]"
                onClick={() => onGenerate(index)}
              >
                <Wand2 className="size-3" /> Generate HTML
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Slide Info & Controls */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground/30 hover:text-primary cursor-grab p-0.5 active:cursor-grabbing">
                <GripVertical className="size-3.5" />
              </div>
              <span className="text-muted-foreground/70 text-[11px] font-bold tabular-nums">
                SLIDE {String(index + 1).padStart(2, "0")}
              </span>
              <div className="bg-border h-3 w-[1px]" />
              <button
                type="button"
                disabled={index === 0 || isBusy}
                onClick={() => onMove(index, index - 1)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 disabled:opacity-30"
                title="Move up"
              >
                <ArrowLeft className="size-3 rotate-90" />
              </button>
              <button
                type="button"
                disabled={index === totalSlides - 1 || isBusy}
                onClick={() => onMove(index, index + 1)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 disabled:opacity-30"
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
                className="text-primary size-7 rounded-md"
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
                className="text-destructive hover:bg-destructive/10 size-7 rounded-md"
                onClick={() => onDelete(index)}
                title="Delete"
                disabled={isBusy}
              >
                <Trash className="size-3.5" />
              </Button>
            </div>
          </div>

          <AutoResizeTextarea
            className="text-foreground w-full resize-none border-none bg-transparent p-0 text-base leading-snug font-bold focus:ring-0 sm:text-lg"
            value={slide.title}
            placeholder="Slide Title"
            onChange={(val) => onUpdateTitle(index, val)}
            disabled={isGenerating}
          />

          <AutoResizeTextarea
            className="text-muted-foreground w-full resize-none border-none bg-transparent p-0 text-xs leading-relaxed focus:ring-0 sm:text-sm"
            value={slide.description || ""}
            placeholder="Slide talking points, narrative notes, and key takeaways..."
            onChange={(val) => onUpdateDescription(index, val)}
            disabled={isGenerating}
          />
        </div>

        {/* Quick Add Slide Below */}
        <div className="border-border/40 text-muted-foreground flex items-center gap-2 border-t pt-2 text-[11px]">
          <button
            type="button"
            onClick={() => onInsertBelow(index)}
            className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
          >
            <Plus className="text-primary size-3" />
            <span>Insert slide below</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onExpandBelow?.(index)}
            className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
          >
            <Sparkles className="text-primary size-3" />
            <span>AI continue slide</span>
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}
