"use client"

import * as React from "react"
import { EditorView } from "@/components/editor/editor-view"
import { AdvancedEditorView } from "@/components/editor/advanced-editor-view"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Suspense } from "react"
import { toast } from "sonner"
import { parseStoryboard, HtmlSlide } from "@/lib/storyboard-parser"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const type = (typeParam || 'normal').toLowerCase()
  const prompt = searchParams.get('prompt')
  const themeParam = searchParams.get('theme')
  const projectId = searchParams.get('id')
  
  const [initialData, setInitialData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [generatedData, setGeneratedData] = React.useState<any>(null)
  
  // Advanced specific state
  const [advancedSlides, setAdvancedSlides] = React.useState<HtmlSlide[]>([])
  const [advancedTitle, setAdvancedTitle] = React.useState("Advanced Storyboard")
  const [isStreaming, setIsStreaming] = React.useState(false)

  const { sendMessage, messages, status } = useChat({
    id: "advanced-storyboard",
    transport: new DefaultChatTransport({
      api: "/api/generate-html-storyboard",
      body: {
        theme: themeParam,
      },
    }),
    onFinish: (message: any) => {
      console.log("Stream finished:", message);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to generate advanced storyboard");
    },
  });

  const hasStartedRef = React.useRef(false)

  React.useEffect(() => {
    const generateNormalStoryboard = async (p: string) => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-storyboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: p })
        })
        
        if (!response.ok) throw new Error('Failed to generate storyboard')
        
        const data = await response.json()
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

    const generateAdvancedStoryboard = async (p: string) => {
      setIsLoading(false)
      sendMessage({ text: p})
    }

    if (prompt && !hasStartedRef.current && !initialData) {
        hasStartedRef.current = true
        
        // Construct clean URL by removing prompt and theme
        const params = new URLSearchParams(searchParams.toString())
        params.delete('prompt')
        params.delete('theme')
        const newQuery = params.toString()
        router.replace(`/editor${newQuery ? `?${newQuery}` : ''}`, { scroll: false })

        if (type === 'advanced') {
          generateAdvancedStoryboard(prompt)
        } else {
          generateNormalStoryboard(prompt)
        }
    }
  }, [prompt, type, themeParam, initialData])

  // Sync messages to storyboard state
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && (lastMessage as any).role === 'assistant') {
      let content = (lastMessage as any).content
      
      // Handle multimodal/structured parts if present
      const parts = (lastMessage as any).parts
      if (parts && Array.isArray(parts)) {
        const textPart = parts.find((p: any) => p.type === 'text')
        if (textPart && textPart.text) {
          content = textPart.text
        }
      }

      if (content) {
        const data = parseStoryboard(content)
        if (data.slides.length > 0) {
          setAdvancedSlides(data.slides)
        }
        if (data.title && data.title !== "Advanced Storyboard") {
          setAdvancedTitle(data.title)
        }
      }
    }
  }, [messages])

  // Sync status to streaming state
  React.useEffect(() => {
    if (status === 'streaming') {
      setIsStreaming(true)
    } else if (status === 'ready' || status === 'error') {
      setIsStreaming(false)
    }
  }, [status])

  React.useEffect(() => {
    // Check for existing project first if ID is present
    const fetchProject = async (id: string) => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (response.ok) {
          const data = await response.json()
          setInitialData(data)
          if (data.type === 'ADVANCED' || type === 'advanced') {
            if (data.slides) {
              setAdvancedSlides(data.slides)
              setAdvancedTitle(data.title)
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch project", e)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId && !initialData) {
      fetchProject(projectId)
      return
    }

    const importedData = localStorage.getItem('importedStoryboard')
    if (importedData) {
      try {
        const data = JSON.parse(importedData)
        setInitialData(data)
        if (data.type === 'ADVANCED' || type === 'advanced') {
          if (data.slides) {
            setAdvancedSlides(data.slides)
            setAdvancedTitle(data.title || "Advanced Storyboard")
          }
        }
        localStorage.removeItem('importedStoryboard')
      } catch (e) {
        console.error("Failed to parse imported data", e)
      }
    }
  }, [projectId, type])

  // Handle "Start from Scratch" / Empty State
  React.useEffect(() => {
    if (!prompt && !projectId && !initialData && !isLoading && !generatedData && advancedSlides.length === 0) {
        if (type === 'advanced') {
            // No default blank slide for advanced mode - let it be empty or wait for generation
        } else {
            setGeneratedData({ title: "Untitled Storyboard", slides: [{ id: 1, elements: [], bgColor: "#ffffff" }] })
        }
    }
  }, [prompt, projectId, initialData, isLoading, generatedData, advancedSlides.length, type])

  const renderLoader = () => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
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
  )

  if (type === 'advanced') {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        {isLoading && renderLoader()}
        <AdvancedEditorView 
            isGenerating={isStreaming}
            initialData={{ 
                id: initialData?.id,
                title: advancedTitle || initialData?.title, 
                slides: advancedSlides 
            }} 
        />
      </div>
    )
  }

  const dataToUse = generatedData || initialData

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {isLoading && renderLoader()}

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
