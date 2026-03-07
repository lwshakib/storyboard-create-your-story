"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HtmlSlide } from "@/lib/storyboard-parser"
import { SlidePreview } from "./slide-preview"
import { cn } from "@/lib/utils"

interface PresentationModeProps {
  slides: HtmlSlide[]
  initialIndex?: number
  onClose: () => void
}

/**
 * PresentationMode Component: A high-fidelity, distraction-free viewer for the storyboard.
 * Features:
 * - Immersive Experience: Optional true browser Fullscreen integration.
 * - Fluid Transitions: Motion-blurred slide changes using AnimatePresence.
 * - Multi-input Navigation: Arrow keys, Space, PageUp/Down, and large click areas.
 * - Visual Feedback: Interactive progress bar and slide counters.
 */
export function PresentationMode({
  slides,
  initialIndex = 0,
  onClose,
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
  }, [slides.length])

  const handlePrev = React.useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // Setup event listeners for keyboard and fullscreen events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        handleNext()
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrev()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    
    // Attempt to enter fullscreen automatically for maximum immersion
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn(`Fullscreen request failed: ${err.message}`)
      })
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [handleNext, handlePrev, onClose])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black font-sans select-none"
    >
      {/* HEADER CONTROLS: Hidden by default, visible on move/hover */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
          <h2 className="text-white/80 text-sm font-semibold tracking-tight">
            {slides[currentIndex]?.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white/60 hover:bg-white/10 hover:text-white rounded-full transition-all"
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:bg-white/10 hover:text-white rounded-full transition-all"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* CLICK INTERFACE: Divides screen into Left/Right touch targets */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 z-40 w-1/2 cursor-w-resize" 
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
        />
        <div 
          className="absolute inset-y-0 right-0 z-40 w-1/2 cursor-e-resize" 
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
        />

        {/* SLIDE CANVAS: Uses SlidePreview for high-fidelity rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="h-full w-full"
          >
            <SlidePreview
              html={slides[currentIndex]?.html || ""}
              autoScale={true}
              className="h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM PROGRESS: Glowy primary line */}
      <div className="absolute bottom-0 left-0 right-0 z-50 h-1 bg-white/5">
        <motion.div
          className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
          initial={false}
          animate={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* MANUAL NAVIGATION: Visible when the user hovers near the bottom area */}
      <div className="pointer-events-none absolute inset-x-0 bottom-12 z-50 flex justify-center gap-4 opacity-0 transition-opacity hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          disabled={currentIndex === 0}
          onClick={(e) => {
            e.stopPropagation()
            handlePrev()
          }}
          className="pointer-events-auto bg-black/40 text-white/50 hover:bg-black/60 hover:text-white rounded-full border border-white/10 backdrop-blur-xl disabled:opacity-20"
        >
          <ChevronLeft className="size-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={currentIndex === slides.length - 1}
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="pointer-events-auto bg-black/40 text-white/50 hover:bg-black/60 hover:text-white rounded-full border border-white/10 backdrop-blur-xl disabled:opacity-20"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
    </div>
  )
}
