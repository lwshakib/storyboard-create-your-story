"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Loader2,
  Download,
  Pencil,
  Palette,
  Save,
  X,
  Plus,
  Presentation as PresentationIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileJson, FileDown } from "lucide-react";
import { exportHtmlToJson, exportHtmlToPdf, exportHtmlToPpptx } from "@/lib/export-utils";

import { parseStoryboard, HtmlSlide } from "@/lib/storyboard-parser";
import { AdvancedSlidePreview } from "@/components/editor/advanced-slide-preview";
import { ElementSettings, type ElementData } from "../element-settings";
import { ThemeSettings } from "../theme-settings";

interface Project {
  id: string;
  title: string;
  messages: any[];
  slides?: HtmlSlide[];
}

const SlideThumbnail = ({ html, index, onClick, active, title }: { html: string, index: number, onClick: () => void, active?: boolean, title: string }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative aspect-video rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-white shadow-sm hover:border-primary/50",
        active ? "border-primary shadow-md ring-2 ring-primary/10" : "border-transparent"
      )}
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <span className="text-[10px] text-white font-bold truncate w-full">{title}</span>
      </div>
      <div className="absolute top-2 left-2 z-20 bg-background/90 backdrop-blur-md rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-sm border border-black/5">
        {index + 1}
      </div>
      
      <div className="absolute inset-0 origin-top-left flex items-center justify-center bg-white">
          <AdvancedSlidePreview html={html} autoScale={true} scale={0.21875} />
      </div>
      <div className="absolute inset-0 z-30" />
    </div>
  )
}

function ProjectContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slides, setSlides] = useState<HtmlSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isThemeMode, setIsThemeMode] = useState(false);
  const [selectedElData, setSelectedElData] = useState<ElementData | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [appliedTheme, setAppliedTheme] = useState<any>(null);

  const chat = useChat({
    api: "/api/chat",
    body: {
      projectId,
      theme: activeThemeId
    },
    onFinish: (message: any) => {
        const data = parseStoryboard(message.content);
        if (data.slides.length > 0) setSlides(data.slides);
    }
  } as any) as any;

  const { messages, append, setMessages, isLoading: isAiThinking } = chat;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Project not found");
        const data = await res.json();
        setProject(data);
        setSlides(data.slides || []);
        if (data.messages) setMessages(data.messages);
        if (data.canvasData?.appliedTheme) {
            setAppliedTheme(data.canvasData.appliedTheme);
            setActiveThemeId(data.canvasData.appliedTheme.id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load workspace");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'ELEMENT_CLICKED' && isEditMode) {
        setSelectedElData(e.data);
      } else if (e.data.type === 'HTML_UPDATED') {
        setSlides(prev => {
          const updated = [...prev];
          if (updated[activeSlideIndex]) {
            updated[activeSlideIndex] = { ...updated[activeSlideIndex], html: e.data.html };
          }
          return updated;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeSlideIndex, isEditMode]);

  const updateSelectedElement = (changes: any) => {
    if (!selectedElData) return;
    const mainIframes = document.querySelectorAll('main iframe')
    const targetIframe = mainIframes[activeSlideIndex] as HTMLIFrameElement
    if (targetIframe?.contentWindow) {
      targetIframe.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT',
        elementId: selectedElData.elementId,
        changes
      }, '*');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          slides: slides,
          canvasData: { appliedTheme }
        })
      });
      toast.success("Project saved!");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSlide = (id: number) => {
    const el = document.getElementById(`slide-full-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!mainScrollRef.current) return
    const scrollPos = mainScrollRef.current.scrollTop
    const slideElements = slides.map(s => document.getElementById(`slide-full-${s.id}`))
    
    let currentSlideIndex = 0
    slideElements.forEach((el, idx) => {
      if (el && el.offsetTop - 100 <= scrollPos) {
        currentSlideIndex = idx
      }
    })
    
    if (currentSlideIndex !== activeSlideIndex) {
      setActiveSlideIndex(currentSlideIndex)
    }
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>;

  return (
    <div className="flex h-screen w-full flex-col bg-[#F8F9FB] dark:bg-[#0A0A0B] overflow-hidden font-sans relative">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-6 border-b bg-background/50 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="rounded-xl hover:bg-muted transition-all active:scale-95">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold tracking-tight text-sm truncate max-w-[280px]">
            {project?.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant={isEditMode ? "secondary" : "outline"} 
            onClick={() => {
              setIsEditMode(!isEditMode)
              if (isThemeMode) setIsThemeMode(false)
            }}
            className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm transition-all"
            size="sm"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Mode {isEditMode ? "ON" : "OFF"}</span>
          </Button>
          <Button 
            variant={isThemeMode ? "secondary" : "outline"} 
            onClick={() => {
              setIsThemeMode(!isThemeMode)
              if (isEditMode) setIsEditMode(false)
            }}
            className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm transition-all"
            size="sm"
          >
            <Palette className="h-4 w-4" />
            <span>Themes</span>
          </Button>

          <div className="w-[1px] h-4 bg-border/40 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm">
                <Download className="h-4 w-4 opacity-70" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-none shadow-2xl p-2 bg-background/95 mt-2">
                <DropdownMenuItem onClick={() => exportHtmlToJson(project?.title || "Storyboard", slides)} className="gap-3 h-10 rounded-xl px-3 cursor-pointer">
                    <FileJson className="size-4 text-primary" />
                    <span>Export JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportHtmlToPdf(project?.title || "Storyboard", slides)} className="gap-3 h-10 rounded-xl px-3 cursor-pointer">
                    <FileDown className="size-4 text-red-500" />
                    <span>Export PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportHtmlToPpptx(project?.title || "Storyboard", slides)} className="gap-3 h-10 rounded-xl px-3 cursor-pointer">
                    <PresentationIcon className="size-4 text-orange-500" />
                    <span>Export PowerPoint</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="h-9 gap-2 font-semibold px-4 rounded-xl shadow-sm">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 opacity-70" />}
            Save
          </Button>
          <Button onClick={async () => { document.documentElement.requestFullscreen() }} size="sm" className="h-9 font-bold px-5 rounded-xl shadow-lg transition-all text-sm">
            Present
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Thumbnails */}
        <div className="w-64 border-r bg-background/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 flex items-center justify-between border-b bg-background/20">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnails</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={index}
                  html={slide.html}
                  index={index}
                  title={slide.title}
                  active={index === activeSlideIndex}
                  onClick={() => scrollToSlide(slide.id)}
                />
              ))}
              {isAiThinking && (
                 <div className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/20 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                 </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Scrollbar Area */}
        <main 
          className="flex-1 relative bg-[#F1F3F5] dark:bg-[#0F0F10] overflow-y-auto scroll-smooth" 
          ref={mainScrollRef}
          onScroll={handleScroll}
        >
          <div className="max-w-5xl mx-auto py-20 px-12 space-y-24 pb-40 relative z-10">
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.div 
                  key={index} 
                  id={`slide-full-${slide.id}`} 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  onClick={() => setActiveSlideIndex(index)}
                >
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <span className="h-6 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black">{index + 1}</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">{slide.title}</h2>
                     </div>
                  </div>
                  <div className={cn(
                      "relative shadow-2xl bg-white rounded-2xl overflow-hidden border transition-all mx-auto",
                      activeSlideIndex === index ? "ring-2 ring-primary ring-offset-4" : "ring-1 ring-black/5"
                    )}
                    style={{ width: 960, height: 540 }}
                  >
                    <AdvancedSlidePreview 
                      html={slide.html} 
                      autoScale={true}
                      isEditable={isEditMode && activeSlideIndex === index}
                    />
                    {!isEditMode && (
                      <div className="absolute inset-0 bg-transparent cursor-pointer" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Slide-out Panels */}
      <AnimatePresence>
        {(isEditMode && selectedElData) && (
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-14 right-0 bottom-0 w-[380px] bg-card border-l shadow-2xl z-[150]">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight capitalize">Element Properties</span>
                <Button variant="ghost" size="icon" onClick={() => setSelectedElData(null)}><X className="h-4 w-4" /></Button>
              </div>
              <ElementSettings selectedElData={selectedElData} onUpdate={updateSelectedElement} clearSelection={() => setSelectedElData(null)} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThemeMode && (
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-14 right-0 bottom-0 w-[380px] bg-card border-l shadow-2xl z-[150]">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight capitalize">Design System</span>
                <Button variant="ghost" size="icon" onClick={() => setIsThemeMode(false)}><X className="h-4 w-4" /></Button>
              </div>
              <ThemeSettings activeThemeId={activeThemeId} onApplyTheme={(t) => { setActiveThemeId(t.id); setAppliedTheme(t); toast.success(`Theme ${t.name} applied`); }} appliedTheme={appliedTheme} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#F8F9FB] dark:bg-[#0A0A0B]"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>}>
      <ProjectContent />
    </Suspense>
  );
}
