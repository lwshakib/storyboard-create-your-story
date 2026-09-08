"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SlidePreview } from "@/components/project/slide-preview"
import { AutoResizeTextarea } from "@/components/project/auto-resize-textarea"
import { HtmlSlide } from "@/lib/storyboard-parser"

interface SlideGridCardProps {
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

export function SlideGridCard({
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
}: SlideGridCardProps) {
  return (
    <motion.div
      layout
      id={`slide-full-${slide.id}`}
      className="group/card relative flex flex-col rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-200 overflow-hidden p-4 gap-3"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="flex items-center justify-center size-6 rounded-md bg-muted text-[11px] font-bold text-muted-foreground shrink-0 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <AutoResizeTextarea
            className="text-foreground font-bold text-sm truncate hover:truncate-none focus:truncate-none bg-transparent border-none p-0 focus:ring-0 flex-1 min-w-0 resize-none leading-snug"
            value={slide.title}
            placeholder="Slide Title"
            onChange={(val) => onUpdateTitle(index, val)}
            disabled={isGenerating}
          />
        </div>

        {/* Slide Card Actions */}
        <div className="flex items-center gap-0.5 opacity-70 group-hover/card:opacity-100 transition-opacity shrink-0">
          {/* Move Left / Right */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                disabled={index === 0 || isBusy}
                onClick={() => onMove(index, index - 1)}
              >
                <ArrowLeft className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Move Earlier</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                disabled={index === totalSlides - 1 || isBusy}
                onClick={() => onMove(index, index + 1)}
              >
                <ArrowRight className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Move Later</p>
            </TooltipContent>
          </Tooltip>

          {/* Edit Visual Blueprint */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onEditBlueprint(index)}
                disabled={isBusy}
              >
                <Compass className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Edit Slide Blueprint Prompt</p>
            </TooltipContent>
          </Tooltip>

          {/* Regenerate Slide */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md text-primary"
                onClick={() => onGenerate(index)}
                disabled={isBusy && !isGenerating}
              >
                {isGenerating ? (
                  <X className="size-3.5 text-red-500" />
                ) : (
                  <Wand2 className="size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                {isGenerating
                  ? "Stop Generation"
                  : "Regenerate Slide Design"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Present Slide */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                onClick={() => onPresent(index)}
              >
                <PresentationIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Present From Here</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete Slide */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-md text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(index)}
                disabled={isBusy}
              >
                <Trash className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs text-red-500">Delete Slide</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Slide Canvas Preview */}
      <div
        className="border-border/50 slide-preview-container relative aspect-video w-full overflow-hidden rounded-xl border bg-black/5 shadow-xs ring-1 ring-border/20 transition-all cursor-pointer group-hover/card:ring-primary/40"
        id={`slide-preview-${slide.id}`}
        onClick={() => onSelect(index)}
      >
        {slide.html === "SKELETON" || isGenerating ? (
          <div className="bg-muted/20 relative h-full w-full overflow-hidden flex items-center justify-center">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2 z-10 text-xs font-semibold text-primary animate-pulse">
              <Sparkles className="size-4 animate-spin" />
              <span>Architecting slide design...</span>
            </div>
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
              onClick={(e) => {
                e.stopPropagation()
                onGenerate(index)
              }}
            >
              <Wand2 className="size-3" /> Generate HTML
            </Button>
          </div>
        )}
      </div>

      {/* Slide Talking Points / Narrative Notes */}
      <div className="px-0.5 space-y-1">
        <AutoResizeTextarea
          className="text-muted-foreground text-xs leading-relaxed w-full bg-transparent border-none p-0 focus:ring-0 line-clamp-2 focus:line-clamp-none resize-none transition-all"
          value={slide.description || ""}
          placeholder="Slide talking points & narrative..."
          onChange={(val) => onUpdateDescription(index, val)}
          disabled={isGenerating}
        />
      </div>

      {/* Card Footer Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground/80">
        <button
          type="button"
          onClick={() => onInsertBelow(index)}
          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
        >
          <Plus className="size-3 text-primary" />
          <span>Insert slide</span>
        </button>
        <button
          type="button"
          onClick={() => onExpandBelow?.(index)}
          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
        >
          <Sparkles className="size-3 text-primary" />
          <span>AI continue</span>
        </button>
      </div>
    </motion.div>
  )
}
