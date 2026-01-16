"use client"

import * as React from "react"
import { EditorView } from "@/components/editor/editor-view"
import { useSearchParams } from "next/navigation"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Suspense } from "react"

function EditorContent() {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt')
  const [initialData, setInitialData] = React.useState<any>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)

  React.useEffect(() => {
    // Check for imported data from localStorage
    const importedData = localStorage.getItem('importedStoryboard')
    if (importedData) {
      try {
        setInitialData(JSON.parse(importedData))
        localStorage.removeItem('importedStoryboard')
        return
      } catch (e) {
        console.error("Failed to parse imported data", e)
      }
    }

    // If no imported data but we have a prompt, generate it
    if (prompt) {
      const generateData = async () => {
        setIsGenerating(true)
        try {
          const res = await fetch('/api/generate-storyboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          })
          if (res.ok) {
            const data = await res.json()
            setInitialData(data)
          } else {
            console.error("Failed to generate storyboard")
          }
        } catch (error) {
          console.error("Error generating storyboard", error)
        } finally {
          setIsGenerating(false)
        }
      }
      generateData()
    }
  }, [prompt])

  if (isGenerating) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B] gap-6 overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '48px 48px' }} />
        
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative"
        >
           <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 via-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
           <div className="relative h-24 w-24 rounded-3xl bg-background border shadow-2xl flex items-center justify-center">
              <Wand2 className="h-10 w-10 text-primary animate-bounce" />
           </div>
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             className="absolute -inset-2 border-2 border-dashed border-primary/30 rounded-full pointer-events-none"
           />
        </motion.div>

        <div className="space-y-2 text-center z-10">
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
            <span>Generating Storyboard</span>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-wide">
            Our AI is meticulously crafting your visual narrative...
          </p>
        </div>

        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden relative mt-4">
           <motion.div 
             initial={{ x: "-100%" }}
             animate={{ x: "0%" }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="absolute inset-0 bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500"
           />
        </div>
      </div>
    )
  }

  return <EditorView initialData={initialData} />
}

export default function EditorPage() {
  return (
    <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
    }>
      <EditorContent />
    </Suspense>
  )
}
