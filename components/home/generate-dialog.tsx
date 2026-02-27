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
import { Sparkles, Loader2, RefreshCw } from "lucide-react"
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
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random());
    setRandomPrompts(shuffled.slice(0, 4));
  }, []);

  React.useEffect(() => {
    if (open) refreshPrompts();
  }, [open, refreshPrompts]);

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
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-neutral-900 text-white rounded-xl p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="size-6 text-orange-400" />
              AI Generator
            </DialogTitle>
            <DialogDescription className="text-neutral-400 font-medium">
              What is your story about? Describe it in detail for the most cinematic results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
             <Textarea
              id="prompt"
              placeholder="A futuristic civilization on a terraformed Mars..."
              className="min-h-[120px] bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg resize-none focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all font-medium p-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold tracking-tight text-neutral-400">Inspiration samples</span>
                <button onClick={refreshPrompts} className="text-neutral-500 hover:text-white transition-colors">
                  <RefreshCw className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {randomPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-left text-xs bg-neutral-800/30 hover:bg-neutral-800 border border-neutral-700/50 hover:border-orange-500/30 p-3 rounded-lg transition-all text-neutral-400 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              disabled={!prompt.trim()} 
              onClick={handleGenerate}
              className="bg-white text-black hover:bg-neutral-200 rounded-lg px-10 font-bold shadow-xl h-11"
            >
              <Sparkles className="size-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
      </DialogContent>
    </Dialog>
  )
}
