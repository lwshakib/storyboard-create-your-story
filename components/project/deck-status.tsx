"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, X, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeckStatusProps {
  isGeneratingOutline?: boolean
  error?: boolean
  slideCount: number
  onOpenGenerateDialog: () => void
  onCancelOutline?: () => void
  onRetryOutline?: () => void
}

export function DeckStatus({
  isGeneratingOutline,
  error,
  slideCount,
  onOpenGenerateDialog,
  onCancelOutline,
  onRetryOutline,
}: DeckStatusProps) {
  const router = useRouter()

  if (isGeneratingOutline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-16 text-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="border-primary/30 h-14 w-14 rounded-full border-t-2 border-r-2"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-primary h-5 w-5 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold tracking-tight">
            AI Architect is generating your outline
          </h3>
          <p className="text-muted-foreground text-xs opacity-60">
            Analyzing vision and creating a structural flow...
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
            onClick={onOpenGenerateDialog}
          >
            Change Prompt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
            onClick={onCancelOutline}
          >
            Abort Generation
          </Button>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/5 border-destructive/20 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-16 text-center"
      >
        <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
          <X className="text-destructive size-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-destructive text-sm font-bold tracking-tight">
            Outline Generation Failed
          </h3>
          <p className="text-muted-foreground text-xs opacity-60">
            We encountered an issue while architecting your storyboard.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <Button
              onClick={onRetryOutline}
              className="h-9 rounded-full bg-white px-7 text-xs font-bold text-black shadow-lg hover:bg-neutral-200"
            >
              Retry Generation
            </Button>
            <Button
              variant="outline"
              onClick={onOpenGenerateDialog}
              className="h-9 rounded-full px-7 text-xs font-bold"
            >
              Change Prompt
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/home")}
            className="text-muted-foreground text-[10px] font-bold tracking-widest opacity-40 hover:opacity-100"
          >
            Go back home
          </Button>
        </div>
      </motion.div>
    )
  }

  if (slideCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-24 text-center"
      >
        <div className="bg-primary/5 flex size-16 items-center justify-center rounded-full">
          <Sparkles className="text-primary size-8" />
        </div>
        <div className="max-w-sm space-y-2">
          <h3 className="text-lg font-bold tracking-tight">
            Your Canvas is Empty
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Start by describing your topic and letting the AI Presentation Architect generate an executive-ready deck for you.
          </p>
        </div>
        <Button
          onClick={onOpenGenerateDialog}
          className="h-10 gap-2 rounded-full px-8 text-xs font-bold"
        >
          <Wand2 className="size-4" />
          Generate Presentation with AI
        </Button>
      </motion.div>
    )
  }

  return null
}
