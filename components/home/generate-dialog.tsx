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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateDialog({ open, onOpenChange }: GenerateDialogProps) {
  const [prompt, setPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const router = useRouter()

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
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl ring-1 ring-black/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="size-5 text-primary" />
            AI Generator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Describe the storyboard you want to create and let AI do the magic.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt" className="text-sm font-semibold text-foreground/70 ml-1">
              What's your story about?
            </Label>
            <Input
              id="prompt"
              placeholder="e.g. A futuristic city where robots live like humans..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="rounded-xl bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate()
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-semibold h-11 px-6 hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            disabled={isGenerating} 
            onClick={handleGenerate}
            className="rounded-xl font-bold h-11 px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
