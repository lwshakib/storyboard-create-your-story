"use client"

import * as React from "react"
import {
  Presentation as PresentationIcon,
  LayoutGrid,
  List,
  Columns,
  Plus,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AutoResizeTextarea } from "@/components/project/auto-resize-textarea"

interface DeckToolbarProps {
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (desc: string) => void
  slideCount: number
  viewMode: "grid" | "list"
  setViewMode: (mode: "grid" | "list") => void
  gridColumns: 2 | 3
  setGridColumns: React.Dispatch<React.SetStateAction<2 | 3>>
  onAddSlide: () => void
  onOpenGenerateDialog: () => void
  isBusy?: boolean
  onUserChange?: () => void
}

export function DeckToolbar({
  title,
  setTitle,
  description,
  setDescription,
  slideCount,
  viewMode,
  setViewMode,
  gridColumns,
  setGridColumns,
  onAddSlide,
  onOpenGenerateDialog,
  isBusy,
  onUserChange,
}: DeckToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5 backdrop-blur-md shadow-xs md:flex-row md:items-center md:justify-between">
      {/* Left: Compact Project Title & Storyline */}
      <div className="flex-1 min-w-0 space-y-1">
        <AutoResizeTextarea
          className="text-foreground placeholder:text-muted/30 w-full text-xl sm:text-2xl font-black tracking-tight leading-snug bg-transparent border-none p-0 focus:ring-0 resize-none"
          value={title}
          placeholder="Presentation Title"
          onChange={(val) => {
            setTitle(val)
            onUserChange?.()
          }}
        />
        <AutoResizeTextarea
          className="text-muted-foreground placeholder:text-muted/30 w-full text-xs sm:text-sm leading-relaxed bg-transparent border-none p-0 focus:ring-0 resize-none line-clamp-2 focus:line-clamp-none transition-all"
          placeholder="Overall presentation narrative and talking points..."
          value={description}
          onChange={(val) => {
            setDescription(val)
            onUserChange?.()
          }}
        />
      </div>

      {/* Right: Controls & View Switcher */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {/* Slide Count Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border text-xs font-semibold text-muted-foreground">
          <PresentationIcon className="size-3.5 text-primary" />
          <span>
            {slideCount} {slideCount === 1 ? "Slide" : "Slides"}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-background shadow-xs text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">Multi-Slide Grid View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-background shadow-xs text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">Streamlined List View</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Column Toggle if in Grid Mode */}
        {viewMode === "grid" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setGridColumns((prev) => (prev === 2 ? 3 : 2))}
              >
                <Columns className="size-3.5 mr-1" />
                <span>{gridColumns} Col</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">
                Switch to {gridColumns === 2 ? "3 Columns (More compact)" : "2 Columns"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Quick Add Slide */}
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
          onClick={onAddSlide}
          disabled={isBusy}
        >
          <Plus className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Add Slide</span>
        </Button>

        {/* AI Deck Generate */}
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium"
          onClick={onOpenGenerateDialog}
        >
          <Sparkles className="size-3.5" />
          <span className="hidden sm:inline">AI Deck</span>
        </Button>
      </div>
    </div>
  )
}
