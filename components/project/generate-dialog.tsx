"use client"

import * as React from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RECOMMENDED_PROMPTS } from "@/llm/prompts"

interface GenerateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialPrompt?: string
  hasExistingSlides: boolean
  isGeneratingOutline?: boolean
  onGenerate: (prompt: string) => void
}

export function GenerateDialog({
  isOpen,
  onOpenChange,
  initialPrompt = "",
  hasExistingSlides,
  isGeneratingOutline,
  onGenerate,
}: GenerateDialogProps) {
  const [prompt, setPrompt] = React.useState(initialPrompt)
  const [prevInitialPrompt, setPrevInitialPrompt] =
    React.useState(initialPrompt)
  const [randomPrompts, setRandomPrompts] = React.useState<string[]>(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 4)
  })

  if (initialPrompt !== prevInitialPrompt) {
    setPrevInitialPrompt(initialPrompt)
    if (initialPrompt) setPrompt(initialPrompt)
  }

  const refreshPrompts = React.useCallback(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random())
    setRandomPrompts(shuffled.slice(0, 4))
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-xl border-none bg-neutral-900 p-0 text-white shadow-2xl sm:max-w-[500px]">
        <div className="space-y-6 p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
              <Sparkles className="size-6 text-orange-400" />
              AI Presentation Architect
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-neutral-400">
              Describe your presentation topic or deck goal. Our AI will
              generate an executive-ready slide deck with substantive content,
              metrics, and polished layouts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              id="prompt"
              placeholder="e.g., Series A Pitch Deck for an enterprise AI workflow platform with $3.8M ARR, 140% net retention, and global enterprise traction..."
              className="min-h-[120px] resize-none rounded-lg border-neutral-700 bg-neutral-800/50 p-4 text-xs font-medium text-white transition-all placeholder:text-neutral-500 focus-visible:border-orange-500/50 focus-visible:ring-orange-500/50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold tracking-tight text-neutral-500">
                  Recommended presentations
                </span>
                <button
                  type="button"
                  onClick={refreshPrompts}
                  className="cursor-pointer text-neutral-500 transition-colors hover:text-white"
                >
                  <RefreshCw className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {randomPrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="group cursor-pointer rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-2.5 text-left text-xs text-neutral-400 transition-all hover:border-orange-500/30 hover:bg-neutral-800 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (prompt.trim()) {
                  onGenerate(prompt.trim())
                  onOpenChange(false)
                }
              }}
              disabled={!prompt.trim() || isGeneratingOutline}
              className="h-10 cursor-pointer rounded-lg bg-white px-8 text-xs font-bold text-black shadow-xl hover:bg-neutral-200"
            >
              {isGeneratingOutline ? (
                <>
                  <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Initializing...
                </>
              ) : hasExistingSlides ? (
                "Regenerate Presentation"
              ) : (
                "Generate Presentation"
              )}
            </Button>
          </DialogFooter>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
      </DialogContent>
    </Dialog>
  )
}
