import * as React from "react"
import { getInspirations } from "@/inspirations/registry"
import { AdvancedSlidePreview } from "@/components/editor/advanced-slide-preview"
import { Layout, Presentation, Sparkles, Layers } from "lucide-react"

export default async function InspirationsDemoPage() {
  const presentations = getInspirations()

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter">Design Registry</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Premium Slide Gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-2">
                <Layout className="size-4" />
                <span>{presentations.reduce((acc, p) => acc + p.slides.length, 0)} Slides</span>
             </div>
             <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <span>AI Optimized</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-24">
          {presentations.map((presentation) => (
            <section key={presentation.name} className="space-y-8">
              <div className="flex items-center gap-4 border-l-4 border-primary pl-6">
                <div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter">{presentation.name}</h2>
                   <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 font-bold uppercase tracking-widest">
                      <Presentation className="size-4" />
                      <span>{presentation.slides.length} Architectural Patterns</span>
                   </div>
                </div>
              </div>

              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {presentation.slides.map((slide, index) => (
                  <div key={index} className="group relative flex flex-col space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{slide.title}</span>
                       <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">Sample {index + 1}</span>
                    </div>
                    
                    <div className="relative aspect-[1024/576] w-full overflow-hidden rounded-2xl border border-white/5 bg-black shadow-xl transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-primary/5 group-hover:-translate-y-1">
                      <AdvancedSlidePreview 
                        html={slide.html} 
                        autoScale={true} 
                        isEditable={false}
                      />
                      
                      {/* Interactive focus overlay */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-5 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-sm font-bold text-slate-600 uppercase tracking-[0.3em]">
          Storyboard AI Inspiration Engine &copy; 2026
        </p>
      </footer>
    </div>
  )
}
