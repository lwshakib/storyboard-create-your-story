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
  const [isGenerating, setIsGenerating] = React.useState(false)
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

    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('importedStoryboard', JSON.stringify(data))
        toast.success("Storyboard generated!")
        onOpenChange(false)
        router.push("/editor")
      } else {
        toast.error("Failed to generate storyboard")
      }
    } catch (error) {
      console.error("Generation error:", error)
      toast.error("An error occurred during generation")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-neutral-900 text-white rounded-[32px] p-0 overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent italic flex items-center gap-2">
              <Sparkles className="size-6 text-orange-400" />
              AI GENERATOR
            </DialogTitle>
            <DialogDescription className="text-neutral-400 font-medium">
              What is your story about? Describe it in detail for the most cinematic results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
             <Textarea
              id="prompt"
              placeholder="A futuristic civilization on a terraformed Mars..."
              className="min-h-[120px] bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 rounded-2xl resize-none focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all font-medium p-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">INSPIRATION SAMPLES</span>
                <button onClick={refreshPrompts} className="text-neutral-500 hover:text-white transition-colors">
                  <RefreshCw className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {randomPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-left text-xs bg-neutral-800/30 hover:bg-neutral-800 border border-neutral-700/50 hover:border-orange-500/30 p-3 rounded-xl transition-all text-neutral-400 hover:text-white"
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
              className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              disabled={isGenerating || !prompt.trim()} 
              onClick={handleGenerate}
              className="bg-white text-black hover:bg-neutral-200 rounded-xl px-10 font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] h-11"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
      </DialogContent>
    </Dialog>
  )
}
