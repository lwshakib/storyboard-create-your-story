import * as React from "react"
import { getInspirations } from "@/inspirations/registry"
import { SlidePreview } from "@/components/editor/slide-preview"
import { Layout, Presentation, Sparkles } from "lucide-react"

export default async function InspirationsDemoPage() {
  const presentations = getInspirations()

  return (
    <div className="selection:bg-primary/30 min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="from-primary to-accent shadow-primary/20 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase">
                Design Registry
              </h1>
              <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                Premium Slide Gallery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
            <div className="flex items-center gap-2">
              <Layout className="size-4" />
              <span>
                {presentations.reduce((acc, p) => acc + p.slides.length, 0)}{" "}
                Slides
              </span>
            </div>
            <div className="text-primary flex items-center gap-2">
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
              <div className="border-primary flex items-center gap-4 border-l-4 pl-6">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase">
                    {presentation.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 uppercase">
                    <Presentation className="size-4" />
                    <span>
                      {presentation.slides.length} Architectural Patterns
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {presentation.slides.map((slide, index) => (
                  <div
                    key={index}
                    className="group relative flex flex-col space-y-3"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase">
                        {slide.title}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest text-slate-600 uppercase italic">
                        Sample {index + 1}
                      </span>
                    </div>

                    <div className="group-hover:border-primary/40 group-hover:shadow-primary/5 relative aspect-[1024/576] w-full overflow-hidden rounded-2xl border border-white/5 bg-black shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <SlidePreview
                        html={slide.html}
                        autoScale={true}
                        isEditable={false}
                      />

                      {/* Interactive focus overlay */}
                      <div className="bg-primary/20 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
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
        <p className="text-sm font-bold tracking-[0.3em] text-slate-600 uppercase">
          Storyboard AI Inspiration Engine &copy; 2026
        </p>
      </footer>
    </div>
  )
}
