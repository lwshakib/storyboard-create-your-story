"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronRight, Minus, Twitter, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const sections = [
    {
      id: "vision",
      label: "Vision",
      title: "Complexity, refined.",
      description: "Storyboard is an orchestration engine for the next generation of creators. We bridge the gap between abstract concept and visual precision."
    },
    {
      id: "capabilities",
      label: "Capabilities",
      title: "An engine built for focus.",
      items: [
        { title: "Narrative Orchestration", desc: "Advanced AI models structured to understand story arcs, not just sentences." },
        { title: "High-Fidelity Editor", desc: "A pixel-perfect canvas for architects of visual communication." },
        { title: "Native Export", desc: "Lossless transitions to PDF, PPTX, or semantic Tailwind code." },
        { title: "Design Intelligence", desc: "Built-in tokens ensure every slide follows professional design standards." }
      ]
    },
    {
      id: "process",
      label: "Process",
      title: "Concept to Reality.",
      steps: [
        { id: "01", title: "Define the Narrative", desc: "Start with a singular vision. Our engine parses complex intent into structured beats." },
        { id: "02", title: "Architect the Visuals", desc: "Automatic generation of high-fidelity layouts based on semantic content." },
        { id: "03", title: "Refine & Export", desc: "Total control over every design token. Export in seconds to any platform." }
      ]
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 selection:bg-primary/20 selection:text-foreground font-sans tracking-tight">
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          <Link href="/">
            <Logo className="scale-90" />
          </Link>
          
          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden items-center gap-10 md:flex">
               <Link href="/billing" className="text-xs font-semibold text-muted-foreground/60 hover:text-foreground transition-all">
                 Pricing
               </Link>
               <Link href="/sign-in" className="text-xs font-semibold text-muted-foreground/60 hover:text-foreground transition-all">
                 Login
               </Link>
               <ModeToggle />
               <Link href="/home">
                  <Button variant="outline" className="h-9 rounded-full px-6 border-border/60 text-xs font-semibold hover:bg-muted transition-all">
                    Get Started
                  </Button>
               </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-4 md:hidden">
              <ModeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <Minus className="size-5" /> : <ChevronRight className="size-5 rotate-90" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border/40 bg-background md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-6 p-8">
                <Link 
                  href="/billing" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-light tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link 
                  href="/sign-in" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-light tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link href="/home" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-full text-sm font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-8 overflow-hidden">
          <motion.div 
            style={{ opacity, scale }}
            className="flex flex-col items-center text-center"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="mb-10 block text-xs font-medium text-muted-foreground/40"
            >
              The high-fidelity narrative engine
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="max-w-6xl text-6xl font-light leading-[1] tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl"
            >
              Architect your story <br />
              <span className="text-muted-foreground/10 italic">with precision.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="mt-16 max-w-xl text-lg font-medium leading-relaxed text-muted-foreground/80 md:text-xl"
            >
              A professional platform for visual thinkers. 
              Refine your concept into a structured, high-density storyboard with ease.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-24"
            >
              <Link href="/home">
                <Button className="h-16 rounded-full bg-foreground text-background px-16 text-sm font-semibold hover:bg-foreground/90 transition-all shadow-2xl shadow-primary/5">
                  Start your narrative
                </Button>
              </Link>
            </motion.div>
          </motion.div>


        </section>

        {/* CONTENT SECTIONS */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="border-t border-border/5 py-40 md:py-64 px-8 transition-colors duration-500">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-32">
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="sticky top-40 space-y-6">
                    <span className="text-xs font-semibold text-muted-foreground/50">
                      {section.label}
                    </span>
                    <div className="h-px w-10 bg-border/60" />
                  </div>
                </div>
                
                <div className="md:col-span-8 lg:col-span-9 space-y-32">
                  <div className="space-y-10">
                    <h2 className="text-5xl md:text-8xl font-light tracking-tighter text-foreground/95">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed font-light">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {section.items && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-28">
                      {section.items.map((item, i) => (
                        <div key={i} className="group space-y-5 border-l border-border/60 pl-10 py-2 transition-all hover:border-foreground/30">
                           <h3 className="text-lg font-bold tracking-tight text-foreground/90">
                             {item.title}
                           </h3>
                           <p className="text-muted-foreground/70 leading-relaxed text-base font-light">
                             {item.desc}
                           </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.steps && (
                    <div className="space-y-24">
                      {section.steps.map((step, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-10 md:gap-24 items-start group">
                           <span className="text-xs font-bold text-muted-foreground/30 mt-3 transition-colors group-hover:text-foreground/40">{step.id}</span>
                           <div className="space-y-5 max-w-2xl">
                             <h3 className="text-3xl font-light tracking-tighter text-foreground/90 group-hover:text-foreground transition-colors">{step.title}</h3>
                             <p className="text-muted-foreground font-light leading-relaxed transition-colors group-hover:text-muted-foreground/80">{step.desc}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="bg-background border-t border-border/5 py-48 md:py-80 transition-colors duration-500">
          <div className="container mx-auto px-8 text-center text-foreground">
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1.2 }}
               className="space-y-20"
            >
              <h2 className="text-6xl md:text-9xl font-light tracking-tighter leading-none">
                Focus on the <br />
                <span className="opacity-30 italic">vision.</span>
              </h2>
              <div className="flex flex-col items-center gap-12">
                <Link href="/home">
                  <Button className="h-24 rounded-full bg-foreground text-background px-20 text-sm font-semibold hover:scale-105 transition-all shadow-2xl">
                    Get Started Now
                  </Button>
                </Link>
                <div className="flex items-center gap-8 text-xs font-medium opacity-40">
                  <span>Free trials</span>
                  <div className="size-1 rounded-full bg-background" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-32 px-8 border-t border-border/10">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
            <div className="space-y-8">
              <Logo className="scale-90 origin-left opacity-60 hover:opacity-100 transition-opacity" />
              <p className="text-sm font-light text-muted-foreground/60 max-w-xs leading-relaxed">
                Precision engineering for visual storytelling. 
                Built for those who value focus.
              </p>
              <div className="flex items-center gap-6 text-muted-foreground/40">
                 <Link href="#" className="hover:text-foreground transition-colors"><Twitter className="size-5" /></Link>
                 <Link href="#" className="hover:text-foreground transition-colors"><Linkedin className="size-5" /></Link>
                 <Link href="#" className="hover:text-foreground transition-colors"><Github className="size-5" /></Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-20 gap-y-12">
              <div className="space-y-6">
                <span className="text-sm font-semibold text-muted-foreground/40">Product</span>
                <nav className="flex flex-col gap-4">
                  <Link href="/billing" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Pricing</Link>
                  <Link href="#" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Templates</Link>
                </nav>
              </div>
              <div className="space-y-6">
                <span className="text-sm font-semibold text-muted-foreground/40">Company</span>
                <nav className="flex flex-col gap-4">
                  <Link href="#" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">About</Link>
                  <Link href="#" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Career</Link>
                </nav>
              </div>
              <div className="space-y-6">
                <span className="text-sm font-semibold text-muted-foreground/40">Legal</span>
                <nav className="flex flex-col gap-4">
                  <Link href="#" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Privacy</Link>
                  <Link href="#" className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Terms</Link>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="mt-28 pt-12 border-t border-border/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-medium text-muted-foreground/30 italic">
              © 2026 Storyboard Architect Inc.
            </p>
            <div className="flex gap-10 text-xs font-medium text-muted-foreground/30">
               <span>San Francisco</span>
               <span>v1.0.4</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}




