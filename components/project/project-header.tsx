"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Download,
  FileDown,
  FileJson,
  Presentation as PresentationIcon,
  Plus,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"

interface ProjectHeaderProps {
  title: string
  setTitle: (title: string) => void
  isEditingTitle: boolean
  setIsEditingTitle: (isEditing: boolean) => void
  credits: number | null
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void
  onExport: (format: "json" | "pdf" | "pptx") => void
  onPresent: () => void
  onUserChange?: () => void
}

export function ProjectHeader({
  title,
  setTitle,
  isEditingTitle,
  setIsEditingTitle,
  credits,
  onImportJson,
  onExport,
  onPresent,
  onUserChange,
}: ProjectHeaderProps) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  return (
    <header className="bg-background/95 z-[100] flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6 backdrop-blur-md">
      {/* Left side: Back Button & Title (cleanly spaced, no divider) */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/home")}
          className="hover:bg-muted size-8 rounded-full transition-all active:scale-95"
          title="Back to home"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              autoFocus
              className="m-0 w-64 border-none bg-transparent p-0 text-sm font-bold tracking-tight outline-none focus:ring-0"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                onUserChange?.()
              }}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingTitle(true)}
              className="max-w-[320px] cursor-text truncate text-sm font-bold tracking-tight opacity-90 hover:opacity-100 transition-opacity"
              title="Double click to rename"
            >
              {title}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Tools, Export, Present, Mode (no rogue dividers) */}
      <div className="flex items-center gap-2.5">
        {/* Credit Display */}
        <div className="hidden lg:block">
          <span className="text-[10px] font-bold tabular-nums opacity-60">
            {credits !== null ? credits : "---"} credits remaining
          </span>
        </div>

        {/* Import JSON */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-xs md:h-9 md:w-auto md:gap-2 md:px-4 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5 opacity-70" />
              <span className="hidden md:inline">Import</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            <p className="font-bold text-xs">Import JSON</p>
          </TooltipContent>
        </Tooltip>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={onImportJson}
        />

        {/* Export Dropdown */}
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-xs md:h-9 md:w-auto md:gap-2 md:px-4 text-xs"
                >
                  <Download className="size-3.5 opacity-70" />
                  <span className="hidden md:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border/50 bg-background/95 mt-1 w-48 rounded-xl p-1 shadow-xl backdrop-blur-xl">
                <DropdownMenuItem
                  onClick={() => onExport("json")}
                  className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                >
                  <FileJson className="text-primary size-3.5" />
                  <span>JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport("pdf")}
                  className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                >
                  <FileDown className="size-3.5 text-red-500" />
                  <span>PDF Document</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport("pptx")}
                  className="h-9 cursor-pointer gap-2 rounded-lg px-2 text-xs font-medium"
                >
                  <PresentationIcon className="size-3.5 text-orange-500" />
                  <span>PowerPoint</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            <p className="font-bold text-xs">Export Options</p>
          </TooltipContent>
        </Tooltip>

        {/* New Project */}
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex size-9 items-center justify-center rounded-full p-0 font-medium shadow-xs md:h-9 md:w-auto md:gap-2 md:px-4 text-xs"
        >
          <Link href="/new">
            <Plus className="size-3.5" />
            <span className="hidden md:inline">New Project</span>
          </Link>
        </Button>

        {/* Present Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 flex size-9 items-center justify-center rounded-full p-0 font-bold shadow-xs md:h-9 md:w-auto md:gap-2 md:px-4 text-xs"
              onClick={onPresent}
            >
              <PresentationIcon className="text-primary size-3.5" />
              <span className="hidden md:inline">Present</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            <p className="font-bold text-xs">Enter Presentation Mode</p>
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <ModeToggle />
      </div>
    </header>
  )
}
