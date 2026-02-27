"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Layout, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OutlineSlide {
  title: string
  description: string
  content: string
}

interface OutlineData {
  title: string
  description: string
  slides: OutlineSlide[]
}

export default function OutlinePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get("prompt")
  
  const [loading, setLoading] = React.useState(true)
  const [outline, setOutline] = React.useState<OutlineData | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fetchOutline = React.useCallback(async () => {
    if (!prompt) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      
      if (!response.ok) throw new Error("Failed to generate outline")
      
      const data = await response.json()
      setOutline(data)
    } catch (err) {
      console.error(err)
      setError("Something went wrong while generating your outline. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [prompt])

  React.useEffect(() => {
    fetchOutline()
  }, [fetchOutline])

  const handleConfirm = () => {
    if (!prompt) return
    router.push(`/editor?prompt=${encodeURIComponent(prompt)}`)
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-2xl font-bold text-neutral-400">No prompt provided</h1>
        <Button onClick={() => router.push("/new")}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 md:px-8">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full" />
              <div className="relative flex flex-col items-center">
                <div className="h-24 w-24 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-8 relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 animate-pulse" />
                    <Sparkles className="size-10 text-orange-500 animate-pulse" />
                </div>
                <div className="space-y-4 text-center">
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                    Architecting Your Narrative
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-neutral-500 font-medium">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Analyzing your vision and creating a structural flow...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
          >
            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <RefreshCw className="size-8 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Generation Interrupted</h2>
              <p className="text-neutral-500">{error}</p>
            </div>
            <Button onClick={fetchOutline} variant="outline" className="rounded-full">
              Retry Generation
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="size-3" />
                Draft Created
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                  {outline?.title}
                </h1>
                <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
                  {outline?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {outline?.slides.map((slide, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all group overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-800 group-hover:bg-orange-500 transition-all" />
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <div className="size-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold group-hover:bg-neutral-700 group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                              {slide.title}
                            </h3>
                            <p className="text-sm text-neutral-500 italic">
                                Concept: {slide.description}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 text-neutral-300 leading-relaxed font-medium">
                            {slide.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="sticky bottom-8 z-10 p-6 rounded-3xl bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold">
                  <CheckCircle2 className="size-5 text-green-500" />
                  Outline Ready
                </div>
                <p className="text-sm text-neutral-500">
                  Ready to transform this outline into a high-fidelity presentation?
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push("/new")}
                  className="rounded-full text-neutral-400 hover:text-white"
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleConfirm}
                  size="lg"
                  className="rounded-full px-8 bg-white text-black hover:bg-neutral-200 font-bold shadow-2xl flex-1 sm:flex-none h-12"
                >
                  Generate Presentation
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
