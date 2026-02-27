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
  DialogTitle 
} from "@/components/ui/dialog"
import { RECOMMENDED_PROMPTS } from "@/lib/prompts-data"

export default function NewProjectPage() {
  const [showGenerateDialog, setShowGenerateDialog] = React.useState(false)

  const [prompt, setPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [randomPrompts, setRandomPrompts] = React.useState<string[]>([])
  const router = useRouter()

  const refreshPrompts = React.useCallback(() => {
    const shuffled = [...RECOMMENDED_PROMPTS].sort(() => 0.5 - Math.random());
    setRandomPrompts(shuffled.slice(0, 4));
  }, []);

  React.useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    
    try {
      // 1. Create the project immediately
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
          slides: [],
          description: null
        }),
      })

      if (res.ok) {
        const project = await res.json()
        // 2. Redirect to the project's editor page with the prompt
        router.push(`/editor/${project.id}?prompt=${encodeURIComponent(prompt)}`)
      } else {
        throw new Error("Failed to create project")
      }
    } catch (error) {
      console.error("Failed to start generation", error)
      setIsGenerating(false)
    }
  }

  const handleStartScratch = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Storyboard",
          description: "Start crafting your narrative from this single point.",
          slides: [
            {
              id: 1,
              title: "Opening Scene",
              description: "Visual concept for your first slide...",
              content: "Detailed narrative content for your first slide...",
              html: ""
            }
          ]
        }),
      })

      if (res.ok) {
        const project = await res.json()
        router.push(`/editor/${project.id}`)
      }
    } catch (error) {
      console.error("Failed to start from scratch", error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Template Card */}
        <SelectionCard 
          title="Use a Template"
          description="Browse our curated collection of professional storyboard templates."
          buttonText="Continue"
          delay={0.3}
          href="/templates"
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
        />

        <SelectionCard 
          title="Start from" 
          highlightedText="Scratch"
          description="Start with a clean canvas and build your story piece by piece."
          buttonText="Continue"
          delay={0.6}
          onClick={handleStartScratch}
        />
      </div>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-neutral-900 text-white rounded-xl p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="size-6 text-orange-400" />
                Storyboard Architect
              </DialogTitle>
              <DialogDescription className="text-neutral-400 font-medium">
                Describe your masterpiece. Our AI will handle the high-end visuals and data density.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
               <Textarea
                id="prompt"
                placeholder="Describe your vision (e.g., A futuristic Tokyo with neon-lit vertical farms...)"
                className="min-h-[120px] bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg resize-none focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all font-medium p-4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                autoFocus
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold tracking-tight text-neutral-500">Prompts for inspiration</span>
                  <button onClick={refreshPrompts} className="text-neutral-500 hover:text-white transition-colors">
                    <RefreshCw className="size-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {randomPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      className="text-left text-xs bg-neutral-800/30 hover:bg-neutral-800 border border-neutral-700/50 hover:border-orange-500/30 p-3 rounded-lg transition-all text-neutral-400 hover:text-white group"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowGenerateDialog(false)}
                className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStartGeneration} 
                disabled={!prompt.trim() || isGenerating}
                className="bg-white text-black hover:bg-neutral-200 rounded-lg px-10 font-bold shadow-xl h-11"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Create Storyboard"
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
}

function SelectionCard({ title, highlightedText, description, buttonText, featured, delay = 0, href, onClick }: SelectionCardProps) {
  const CardWrapper = href ? Link : "div"
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <CardWrapper 
        href={href as string} 
        className="block h-full cursor-pointer"
        onClick={onClick}
      >
        <div
          className={cn(
            "relative rounded-2xl border transition-all duration-300 overflow-hidden h-full flex flex-col",
            featured 
              ? "border-transparent bg-neutral-900 shadow-2xl scale-105" 
              : "bg-muted/30 border-border hover:bg-muted/50"
          )}
        >
          {/* Gradient Border for Featured Card */}
          {featured && (
            <div className="absolute inset-0 p-[2px] -z-10 rounded-2xl bg-gradient-to-br from-purple-500 via-orange-500 to-pink-500 opacity-60" />
          )}

          <div className={cn("p-8 flex flex-col h-full", featured ? "bg-neutral-900" : "bg-transparent")}>
            <div className="space-y-4 flex-1">
              <h2 className="text-xs font-semibold text-muted-foreground tracking-tight">
                {featured ? "Featured" : "Method"}
              </h2>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold leading-tight">
                  {title}
                </h3>
                {highlightedText && (
                  <h3 className={cn(
                    "text-3xl font-bold leading-tight",
                    featured ? "bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent" : ""
                  )}>
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
                  "rounded-full px-8 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer pointer-events-none inline-block",
                  featured 
                    ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                    : "bg-neutral-800 text-white hover:bg-neutral-700"
                )}
              >
                {buttonText}
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  )
}
