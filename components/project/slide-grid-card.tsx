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
      className="group/card border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:shadow-xl"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <AutoResizeTextarea
            className="text-foreground hover:truncate-none focus:truncate-none min-w-0 flex-1 resize-none truncate border-none bg-transparent p-0 text-sm leading-snug font-bold focus:ring-0"
            value={slide.title}
            placeholder="Slide Title"
            onChange={(val) => onUpdateTitle(index, val)}
            disabled={isGenerating}
          />
        </div>

        {/* Slide Card Actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover/card:opacity-100">
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
                className="text-primary size-7 rounded-md"
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
                {isGenerating ? "Stop Generation" : "Regenerate Slide Design"}
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
                className="text-destructive hover:bg-destructive/10 size-7 rounded-md"
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
        className="border-border/50 slide-preview-container ring-border/20 group-hover/card:ring-primary/40 relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border bg-black/5 shadow-xs ring-1 transition-all"
        id={`slide-preview-${slide.id}`}
        onClick={() => onSelect(index)}
      >
        {slide.html === "SKELETON" || isGenerating ? (
          <div className="bg-muted/20 relative flex h-full w-full items-center justify-center overflow-hidden">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="text-primary z-10 flex animate-pulse items-center gap-2 text-xs font-semibold">
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
          <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
            <Sparkles className="size-6 opacity-40" />
            <span className="text-xs font-medium">Slide blueprint ready</span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-[11px]"
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
      <div className="space-y-1 px-0.5">
        <AutoResizeTextarea
          className="text-muted-foreground line-clamp-2 w-full resize-none border-none bg-transparent p-0 text-xs leading-relaxed transition-all focus:line-clamp-none focus:ring-0"
          value={slide.description || ""}
          placeholder="Slide talking points & narrative..."
          onChange={(val) => onUpdateDescription(index, val)}
          disabled={isGenerating}
        />
      </div>

      {/* Card Footer Quick Actions */}
      <div className="border-border/40 text-muted-foreground/80 flex items-center justify-between border-t pt-2 text-[11px]">
        <button
          type="button"
          onClick={() => onInsertBelow(index)}
          className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
        >
          <Plus className="text-primary size-3" />
          <span>Insert slide</span>
        </button>
        <button
          type="button"
          onClick={() => onExpandBelow?.(index)}
          className="hover:text-primary flex cursor-pointer items-center gap-1 transition-colors"
        >
          <Sparkles className="text-primary size-3" />
          <span>AI continue</span>
        </button>
      </div>
    </motion.div>
  )
}
