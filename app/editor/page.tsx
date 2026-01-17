"use client"

import * as React from "react"
import { EditorView } from "@/components/editor/editor-view"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Suspense } from "react"
import { toast } from "sonner"

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const prompt = searchParams.get('prompt')
  
  const [initialData, setInitialData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [generatedData, setGeneratedData] = React.useState<any>(null)
  
  const hasStartedRef = React.useRef(false)

  React.useEffect(() => {
    const generateStoryboard = async (p: string) => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-storyboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: p })
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate storyboard')
        }
        
        const data = await response.json()
        
        // Ensure elements is an array for each slide
        const formattedData = {
          ...data,
          slides: (data.slides || []).map((s: any) => ({
            ...s,
            elements: Array.isArray(s.elements) ? s.elements : []
          }))
        }
        
        setGeneratedData(formattedData)
      } catch (error) {
        console.error("Generation error:", error)
        toast.error("Failed to generate storyboard. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (prompt && !hasStartedRef.current && !initialData) {
        hasStartedRef.current = true
        generateStoryboard(prompt)
    }
  }, [prompt, initialData])

  React.useEffect(() => {
    // Check for imported data from localStorage
    const importedData = localStorage.getItem('importedStoryboard')
    if (importedData) {
      try {
        if (!initialData) {
          setInitialData(JSON.parse(importedData))
        }
        localStorage.removeItem('importedStoryboard')
        return
      } catch (e) {
        console.error("Failed to parse imported data", e)
      }
    }
  }, [])

  if (type?.toLowerCase() === 'advanced' || (initialData?.type === 'ADVANCED')) {
       // We need to pass the prompt if it exists, or handle the data transfer via localStorage/API
       // For now, if it's a new generation request (prompt exists), forward it.
       if (prompt) {
         router.replace(`/advanced-editor?prompt=${encodeURIComponent(prompt)}`);
         return null; 
       }
       // If it was imported data, the advanced-editor page will pick it up from localStorage
       router.replace('/advanced-editor');
       return null;
  }

  // Determine which data to pass to EditorView
  const dataToUse = generatedData || initialData

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Premium background loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" 
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center max-w-md text-center px-6"
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-t-2 border-r-2 border-primary/30"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Generating Your Story
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We're designing custom layouts and creating high-quality AI images. This process usually takes about 20-30 seconds.
            </p>
            
            <div className="flex items-center gap-3 px-5 py-2.5 bg-background/50 backdrop-blur-md border border-border/50 rounded-full text-sm font-medium text-primary shadow-lg ring-1 ring-primary/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Architecting slides & visuals...</span>
            </div>
          </motion.div>
        </div>
      )}

      {dataToUse ? (
        <EditorView initialData={dataToUse} isLoading={false} />
      ) : (
        <div className="flex h-screen w-full items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
            {!isLoading && <p className="text-muted-foreground">No storyboard data found. Please try again.</p>}
        </div>
      )}
    </div>
  )
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
