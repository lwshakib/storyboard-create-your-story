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
  CheckCircle2,
  RefreshCw,
} from "lucide-react"


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

function OutlineContent() {
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
      setError(
        "Something went wrong while generating your outline. Please try again."
      )
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-400">
          No prompt provided
        </h1>
        <Button onClick={() => router.push("/new")}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[50vh] flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-[100px]" />
              <div className="relative flex flex-col items-center">
                <div className="group relative mb-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
                  <div className="absolute inset-x-0 bottom-0 h-1 animate-pulse bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500" />
                  <Sparkles className="size-10 animate-pulse text-orange-500" />
                </div>
                <div className="space-y-4 text-center">
                  <h2 className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                    Architecting Your Narrative
                  </h2>
                  <div className="flex items-center justify-center gap-2 font-medium text-neutral-500">
                    <Loader2 className="size-4 animate-spin" />
                    <span>
                      Analyzing your vision and creating a structural flow...
                    </span>
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
            className="flex min-h-[50vh] flex-col items-center justify-center space-y-6"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <RefreshCw className="size-8 text-red-500" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Generation Interrupted</h2>
              <p className="text-neutral-500">{error}</p>
            </div>
            <Button
              onClick={fetchOutline}
              variant="outline"
              className="rounded-full"
            >
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
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold tracking-widest text-orange-500 uppercase">
                <Sparkles className="size-3" />
                Draft Created
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white md:text-5xl">
                  {outline?.title}
                </h1>
                <p className="max-w-2xl text-xl leading-relaxed text-neutral-400">
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
                  <Card className="group relative overflow-hidden border-neutral-800 bg-neutral-900 transition-all hover:border-neutral-700">
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-neutral-800 transition-all group-hover:bg-orange-500" />
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 md:flex-row">
                        <div className="flex-shrink-0">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-800 font-bold text-neutral-400 transition-all group-hover:bg-neutral-700 group-hover:text-white">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-orange-400">
                              {slide.title}
                            </h3>
                            <p className="text-sm text-neutral-500 italic">
                              Concept: {slide.description}
                            </p>
                          </div>
                          <div className="rounded-xl border border-neutral-800/50 bg-neutral-950/50 p-4 leading-relaxed font-medium text-neutral-300">
                            {slide.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="sticky bottom-8 z-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl sm:flex-row">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 className="size-5 text-green-500" />
                  Outline Ready
                </div>
                <p className="text-sm text-neutral-500">
                  Ready to transform this outline into a high-fidelity
                  presentation?
                </p>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto">
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
                  className="h-12 flex-1 rounded-full bg-white px-8 font-bold text-black shadow-2xl hover:bg-neutral-200 sm:flex-none"
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

export default function OutlinePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <OutlineContent />
    </React.Suspense>
  )
}

