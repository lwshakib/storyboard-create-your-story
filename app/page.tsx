"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Minus,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react"
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
      description:
        "Storyboard is an orchestration engine for the next generation of creators. We bridge the gap between abstract concept and visual precision.",
    },
    {
      id: "capabilities",
      label: "Capabilities",
      title: "An engine built for focus.",
      items: [
        {
          title: "Narrative Orchestration",
          desc: "Advanced AI models structured to understand story arcs, not just sentences.",
        },
        {
          title: "High-Fidelity Editor",
          desc: "A pixel-perfect canvas for architects of visual communication.",
        },
        {
          title: "Native Export",
          desc: "Lossless transitions to PDF, PPTX, or semantic Tailwind code.",
        },
        {
          title: "Design Intelligence",
          desc: "Built-in tokens ensure every slide follows professional design standards.",
        },
      ],
    },
    {
      id: "process",
      label: "Process",
      title: "Concept to Reality.",
      steps: [
        {
          id: "01",
          title: "Define the Narrative",
          desc: "Start with a singular vision. Our engine parses complex intent into structured beats.",
        },
        {
          id: "02",
          title: "Architect the Visuals",
          desc: "Automatic generation of high-fidelity layouts based on semantic content.",
        },
        {
          id: "03",
          title: "Refine & Export",
          desc: "Total control over every design token. Export in seconds to any platform.",
        },
      ],
    },
  ]

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-foreground flex min-h-screen flex-col font-sans tracking-tight transition-colors duration-500">
      <nav className="border-border/40 bg-background/70 fixed top-0 z-50 w-full border-b backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          <Link href="/">
            <Logo className="scale-90" />
          </Link>

          <div className="flex items-center gap-4 md:gap-10">
            <div className="hidden items-center gap-10 md:flex">
              <Link
                href="/billing"
                className="text-muted-foreground/60 hover:text-foreground text-xs font-semibold transition-all"
              >
                Pricing
              </Link>
              <Link
                href="/sign-in"
                className="text-muted-foreground/60 hover:text-foreground text-xs font-semibold transition-all"
              >
                Login
              </Link>
              <ModeToggle />
              <Link href="/home">
                <Button
                  variant="outline"
                  className="border-border/60 hover:bg-muted h-9 rounded-full px-6 text-xs font-semibold transition-all"
                >
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
                {isMenuOpen ? (
                  <Minus className="size-5" />
                ) : (
                  <ChevronRight className="size-5 rotate-90" />
                )}
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
              className="border-border/40 bg-background overflow-hidden border-b md:hidden"
            >
              <div className="flex flex-col gap-6 p-8">
                <Link
                  href="/billing"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-lg font-light tracking-tight transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-lg font-light tracking-tight transition-colors"
                >
                  Login
                </Link>
                <Link href="/home" onClick={() => setIsMenuOpen(false)}>
                  <Button className="h-12 w-full rounded-full text-sm font-semibold">
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
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8">
          <motion.div
            style={{ opacity, scale }}
            className="flex flex-col items-center text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-muted-foreground/40 mb-10 block text-xs font-medium"
            >
              The high-fidelity narrative engine
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="max-w-6xl text-6xl leading-[1] font-light tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl"
            >
              Architect your story <br />
              <span className="text-muted-foreground/10 italic">
                with precision.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="text-muted-foreground/80 mt-16 max-w-xl text-lg leading-relaxed font-medium md:text-xl"
            >
              A professional platform for visual thinkers. Refine your concept
              into a structured, high-density storyboard with ease.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-24"
            >
              <Link href="/home">
                <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-primary/5 h-16 rounded-full px-16 text-sm font-semibold shadow-2xl transition-all">
                  Start your narrative
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* CONTENT SECTIONS */}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="border-border/5 border-t px-8 py-40 transition-colors duration-500 md:py-64"
          >
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-20 md:grid-cols-12 md:gap-32">
                <div className="md:col-span-4 lg:col-span-3">
                  <div className="sticky top-40 space-y-6">
                    <span className="text-muted-foreground/50 text-xs font-semibold">
                      {section.label}
                    </span>
                    <div className="bg-border/60 h-px w-10" />
                  </div>
                </div>

                <div className="space-y-32 md:col-span-8 lg:col-span-9">
                  <div className="space-y-10">
                    <h2 className="text-foreground/95 text-5xl font-light tracking-tighter md:text-8xl">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed font-light">
                        {section.description}
                      </p>
                    )}
                  </div>

                  {section.items && (
                    <div className="grid grid-cols-1 gap-x-20 gap-y-28 sm:grid-cols-2">
                      {section.items.map((item, i) => (
                        <div
                          key={i}
                          className="group border-border/60 hover:border-foreground/30 space-y-5 border-l py-2 pl-10 transition-all"
                        >
                          <h3 className="text-foreground/90 text-lg font-bold tracking-tight">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground/70 text-base leading-relaxed font-light">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.steps && (
                    <div className="space-y-24">
                      {section.steps.map((step, i) => (
                        <div
                          key={i}
                          className="group flex flex-col items-start gap-10 md:flex-row md:gap-24"
                        >
                          <span className="text-muted-foreground/30 group-hover:text-foreground/40 mt-3 text-xs font-bold transition-colors">
                            {step.id}
                          </span>
                          <div className="max-w-2xl space-y-5">
                            <h3 className="text-foreground/90 group-hover:text-foreground text-3xl font-light tracking-tighter transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-muted-foreground group-hover:text-muted-foreground/80 leading-relaxed font-light transition-colors">
                              {step.desc}
                            </p>
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
        <section className="bg-background border-border/5 border-t py-48 transition-colors duration-500 md:py-80">
          <div className="text-foreground container mx-auto px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="space-y-20"
            >
              <h2 className="text-6xl leading-none font-light tracking-tighter md:text-9xl">
                Focus on the <br />
                <span className="italic opacity-30">vision.</span>
              </h2>
              <div className="flex flex-col items-center gap-12">
                <Link href="/home">
                  <Button className="bg-foreground text-background h-24 rounded-full px-20 text-sm font-semibold shadow-2xl transition-all hover:scale-105">
                    Get Started Now
                  </Button>
                </Link>
                <div className="flex items-center gap-8 text-xs font-medium opacity-40">
                  <span>Free trials</span>
                  <div className="bg-background size-1 rounded-full" />
                  <span>No credit card required</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-border/10 border-t px-8 py-32">
        <div className="container mx-auto">
          <div className="flex flex-col items-start justify-between gap-20 lg:flex-row">
            <div className="space-y-8">
              <Logo className="origin-left scale-90 opacity-60 transition-opacity hover:opacity-100" />
              <p className="text-muted-foreground/60 max-w-xs text-sm leading-relaxed font-light">
                Precision engineering for visual storytelling. Built for those
                who value focus.
              </p>
              <div className="text-muted-foreground/40 flex items-center gap-6">
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  <Twitter className="size-5" />
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  <Linkedin className="size-5" />
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  <Github className="size-5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-20 gap-y-12 sm:grid-cols-3">
              <div className="space-y-6">
                <span className="text-muted-foreground/40 text-sm font-semibold">
                  Product
                </span>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/billing"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    Templates
                  </Link>
                </nav>
              </div>
              <div className="space-y-6">
                <span className="text-muted-foreground/40 text-sm font-semibold">
                  Company
                </span>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="#"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    Career
                  </Link>
                </nav>
              </div>
              <div className="space-y-6">
                <span className="text-muted-foreground/40 text-sm font-semibold">
                  Legal
                </span>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="#"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground/70 hover:text-foreground text-sm transition-colors"
                  >
                    Terms
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="border-border/5 mt-28 flex flex-col items-center justify-between gap-8 border-t pt-12 md:flex-row">
            <p className="text-muted-foreground/30 text-xs font-medium italic">
              © 2026 Storyboard Architect Inc.
            </p>
            <div className="text-muted-foreground/30 flex gap-10 text-xs font-medium">
              <span>San Francisco</span>
              <span>v1.0.4</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
