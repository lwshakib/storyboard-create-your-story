"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { RECOMMENDED_PROMPTS } from "@/llm/prompts"

export default function NewProjectPage() {
  const [showGenerateDialog, setShowGenerateDialog] = React.useState(false)

  const [prompt, setPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isStartingScratch, setIsStartingScratch] = React.useState(false)
  const isSubmittingRef = React.useRef(false)
  const [randomPrompts, setRandomPrompts] = React.useState<string[]>([])
  const [credits, setCredits] = React.useState<number | null>(null)
  const router = useRouter()

  // Fetch credits on mount
  React.useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/user/credits")
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch (err) {
        console.error("Failed to fetch credits", err)
      }
    }
    fetchCredits()
  }, [])

  const refreshPrompts = React.useCallback(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random())
    setRandomPrompts(shuffled.slice(0, 4))
  }, [])

  React.useEffect(() => {
    Promise.resolve().then(() => refreshPrompts())
  }, [refreshPrompts])

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return
    // Guard against rapid double clicks
    if (isSubmittingRef.current || isGenerating || isStartingScratch) return

    // Check credits
    if (credits !== null && credits < 1) {
      toast.error("Credits exhausted.", {
        description: "You should use until daily limit resets at midnight.",
      })
      setShowGenerateDialog(false)
      return
    }

    isSubmittingRef.current = true
    setIsGenerating(true)

    try {
      // 1. Create the project immediately
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
          slides: [],
          description: null,
        }),
      })

      if (res.ok) {
        const project = await res.json()
        window.dispatchEvent(new Event("projects-updated"))
        // 2. Redirect to the project's editor page with the prompt
        router.push(
          `/project/${project.id}?prompt=${encodeURIComponent(prompt)}`
        )
      } else {
        throw new Error("Failed to create project")
      }
    } catch (error) {
      console.error("Failed to start generation", error)
      isSubmittingRef.current = false
      setIsGenerating(false)
      toast.error("Failed to start generation. Please try again.")
    }
  }

  const handleStartScratch = async () => {
    // Synchronous guard against rapid double clicks
    if (isSubmittingRef.current || isStartingScratch || isGenerating) return
    isSubmittingRef.current = true
    setIsStartingScratch(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Presentation",
          description: "Start crafting your presentation deck from this single slide.",
          slides: [],
        }),
      })

      if (res.ok) {
        const project = await res.json()
        window.dispatchEvent(new Event("projects-updated"))
        router.push(`/project/${project.id}`)
      } else {
        throw new Error("Failed to create project")
      }
    } catch (error) {
      console.error("Failed to start from scratch", error)
      isSubmittingRef.current = false
      setIsStartingScratch(false)
      toast.error("Failed to create storyboard. Please try again.")
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-12 space-y-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-foreground text-4xl font-bold tracking-tight md:text-5xl"
        >
          How would you like to get started?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg"
        >
          Choose your preferred method to begin
        </motion.p>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {/* Template Card */}
        <SelectionCard
          title="Use a Template"
          description="Browse our curated collection of professional storyboard templates."
          buttonText="Continue"
          delay={0.3}
          href="/templates"
          disabled={isStartingScratch || isGenerating}
        />

        <SelectionCard
          title="Generate with"
          highlightedText="Creative AI"
          description="Describe your vision and let our high-fidelity AI architect generate a complete presentation for you."
          buttonText="Generate"
          featured
          delay={0.4}
          onClick={() => {
            setShowGenerateDialog(true)
          }}
          disabled={isStartingScratch || isGenerating}
        />

        <SelectionCard
          title="Start from"
          highlightedText="Scratch"
          description="Start with a clean canvas and build your story piece by piece."
          buttonText="Continue"
          delay={0.6}
          onClick={handleStartScratch}
          disabled={isStartingScratch || isGenerating}
          isLoading={isStartingScratch}
        />
      </div>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="overflow-hidden rounded-xl border-none bg-neutral-900 p-0 text-white shadow-2xl sm:max-w-[500px]">
          <div className="space-y-6 p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-2xl font-bold text-transparent">
                <Sparkles className="size-6 text-orange-400" />
                AI Presentation Architect
              </DialogTitle>
              <DialogDescription className="font-medium text-neutral-400">
                Describe your presentation topic or deck goal. Our AI will generate an executive-ready slide deck with substantive content, metrics, and polished layouts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                id="prompt"
                placeholder="e.g., Series A Pitch Deck for an enterprise AI workflow platform with $3.8M ARR, 140% net retention, and global enterprise traction..."
                className="min-h-[120px] resize-none rounded-lg border-neutral-700 bg-neutral-800/50 p-4 font-medium text-white transition-all placeholder:text-neutral-500 focus-visible:border-orange-500/50 focus-visible:ring-orange-500/50"
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
                      className="group rounded-lg border border-neutral-700/50 bg-neutral-800/30 p-3 text-left text-xs text-neutral-400 transition-all hover:border-orange-500/30 hover:bg-neutral-800 hover:text-white"
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
                onClick={() => setShowGenerateDialog(false)}
                className="rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartGeneration}
                disabled={!prompt.trim() || isGenerating}
                className="h-11 rounded-lg bg-white px-10 font-bold text-black shadow-xl hover:bg-neutral-200"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Generate Presentation"
                )}
              </Button>
            </DialogFooter>
          </div>

          {/* Subtle Accent Gradient at Bottom */}
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 opacity-50" />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface SelectionCardProps {
  title: string
  highlightedText?: string
  description: string
  buttonText: string
  featured?: boolean
  delay?: number
  href?: string
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
}

function SelectionCard({
  title,
  highlightedText,
  description,
  buttonText,
  featured,
  delay = 0,
  href,
  onClick,
  disabled = false,
  isLoading = false,
}: SelectionCardProps) {
  const CardWrapper = href && !disabled && !isLoading ? Link : "div"

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isLoading) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={!disabled && !isLoading ? { y: -5 } : undefined}
      className={cn("h-full transition-opacity", (disabled || isLoading) && "pointer-events-none opacity-50")}
    >
      <CardWrapper
        href={href as string}
        className={cn("block h-full", !disabled && !isLoading ? "cursor-pointer" : "cursor-not-allowed")}
        onClick={handleClick}
      >
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300",
            featured
              ? "scale-105 border-transparent bg-neutral-900 shadow-2xl"
              : "bg-muted/30 border-border hover:bg-muted/50"
          )}
        >
          {/* Gradient Border for Featured Card */}
          {featured && (
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-purple-500 via-orange-500 to-pink-500 p-[2px] opacity-60" />
          )}

          <div
            className={cn(
              "flex h-full flex-col p-8",
              featured ? "bg-neutral-900" : "bg-transparent"
            )}
          >
            <div className="flex-1 space-y-4">
              <h2 className="text-muted-foreground text-xs font-semibold tracking-tight">
                {featured ? "Featured" : "Method"}
              </h2>
              <div className="space-y-1">
                <h3 className="text-3xl leading-tight font-bold">{title}</h3>
                {highlightedText && (
                  <h3
                    className={cn(
                      "text-3xl leading-tight font-bold",
                      featured
                        ? "bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
                        : ""
                    )}
                  >
                    {highlightedText}
                  </h3>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <span
                className={cn(
                  "pointer-events-none inline-flex items-center justify-center rounded-full px-8 py-2 text-sm font-semibold transition-all duration-300",
                  featured
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-white/90"
                    : "bg-neutral-800 text-white hover:bg-neutral-700"
                )}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin inline" />
                    Creating...
                  </>
                ) : (
                  buttonText
                )}
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  )
}
