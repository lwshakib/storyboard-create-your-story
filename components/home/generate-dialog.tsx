"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { RECOMMENDED_PROMPTS } from "@/lib/prompts-data"

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateDialog({ open, onOpenChange }: GenerateDialogProps) {
  const [prompt, setPrompt] = React.useState("")

  const [randomPrompts, setRandomPrompts] = React.useState<string[]>([])
  const router = useRouter()

  const refreshPrompts = React.useCallback(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random())
    setRandomPrompts(shuffled.slice(0, 4))
  }, [])

  React.useEffect(() => {
    if (open) refreshPrompts()
  }, [open, refreshPrompts])

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt")
      return
    }

    onOpenChange(false)
    router.push(`/editor?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-xl border-none bg-neutral-900 p-0 text-white shadow-2xl sm:max-w-[500px]">
        <div className="space-y-6 p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
              <Sparkles className="size-6 text-orange-400" />
              AI Generator
            </DialogTitle>
            <DialogDescription className="font-medium text-neutral-400">
              What is your story about? Describe it in detail for the most
              cinematic results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              id="prompt"
              placeholder="A futuristic civilization on a terraformed Mars..."
              className="min-h-[120px] resize-none rounded-lg border-neutral-700 bg-neutral-800/50 p-4 font-medium text-white transition-all placeholder:text-neutral-500 focus-visible:border-orange-500/50 focus-visible:ring-orange-500/50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold tracking-tight text-neutral-400">
                  Inspiration samples
                </span>
                <button
                  onClick={refreshPrompts}
                  className="text-neutral-500 transition-colors hover:text-white"
                >
                  <RefreshCw className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {randomPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-3 text-left text-xs text-neutral-400 transition-all hover:border-orange-500/30 hover:bg-neutral-800 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              disabled={!prompt.trim()}
              onClick={handleGenerate}
              className="h-11 rounded-lg bg-white px-10 font-bold text-black shadow-xl hover:bg-neutral-200"
            >
              <Sparkles className="mr-2 size-4" />
              Generate
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
      </DialogContent>
    </Dialog>
  )
}
