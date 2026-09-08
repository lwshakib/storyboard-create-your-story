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
    <div className="border-border/60 bg-card/40 flex flex-col gap-4 rounded-2xl border p-4 shadow-xs backdrop-blur-md sm:p-5 md:flex-row md:items-center md:justify-between">
      {/* Left: Compact Project Title & Storyline */}
      <div className="min-w-0 flex-1 space-y-1">
        <AutoResizeTextarea
          className="text-foreground placeholder:text-muted/30 w-full resize-none border-none bg-transparent p-0 text-xl leading-snug font-black tracking-tight focus:ring-0 sm:text-2xl"
          value={title}
          placeholder="Presentation Title"
          onChange={(val) => {
            setTitle(val)
            onUserChange?.()
          }}
        />
        <AutoResizeTextarea
          className="text-muted-foreground placeholder:text-muted/30 line-clamp-2 w-full resize-none border-none bg-transparent p-0 text-xs leading-relaxed transition-all focus:line-clamp-none focus:ring-0 sm:text-sm"
          placeholder="Overall presentation narrative and talking points..."
          value={description}
          onChange={(val) => {
            setDescription(val)
            onUserChange?.()
          }}
        />
      </div>

      {/* Right: Controls & View Switcher */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {/* Slide Count Pill */}
        <div className="bg-muted/50 text-muted-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold">
          <PresentationIcon className="text-primary size-3.5" />
          <span>
            {slideCount} {slideCount === 1 ? "Slide" : "Slides"}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="bg-muted/30 flex items-center rounded-lg border p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  viewMode === "grid"
                    ? "bg-background text-foreground font-semibold shadow-xs"
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
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  viewMode === "list"
                    ? "bg-background text-foreground font-semibold shadow-xs"
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
                className="text-muted-foreground hover:text-foreground h-8 rounded-lg px-2.5 text-xs font-medium"
                onClick={() => setGridColumns((prev) => (prev === 2 ? 3 : 2))}
              >
                <Columns className="mr-1 size-3.5" />
                <span>{gridColumns} Col</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs font-medium">
                Switch to{" "}
                {gridColumns === 2 ? "3 Columns (More compact)" : "2 Columns"}
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
          <Plus className="text-primary size-3.5" />
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
