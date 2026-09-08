"use client"

import React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: "solar:chat-round-line-linear",
      badge: "Idea to Outline",
      title: "Synthesize your story beats",
      description:
        "Input your script, pitch topic, or rough concept. Our AI engine analyzes narrative pacing and automatically drafts 5 to 8 structured, coherent slide beats.",
      highlights: [
        "Instant narrative pacing analysis",
        "Customizable slide outline and objectives",
        "Adjust tone, audience, and key takeaways",
      ],
    },
    {
      step: "02",
      icon: "solar:palette-linear",
      badge: "Design Generation",
      title: "Automate layout & visuals",
      description:
        "Our engine renders responsive layouts with balanced typography, data tables, dynamic charts, and Storyset illustrations without manual alignment work.",
      highlights: [
        "Balanced multi-zone grid layouts",
        "Pre-styled charts, metrics & comparison cards",
        "Consistent brand colors & accessible contrast",
      ],
    },
    {
      step: "03",
      icon: "solar:download-square-linear",
      badge: "Refine & Export",
      title: "Co-pilot polish & native export",
      description:
        "Fine-tune individual elements via interactive drag-and-drop or prompt our conversational AI co-pilot, then export directly to PowerPoint (.pptx) or print-ready PDF.",
      highlights: [
        "In-canvas conversational AI editor",
        "Lossless PowerPoint (.pptx) file generation",
        "High-resolution vector PDF & JSON backup",
      ],
    },
  ]

  return (
    <section
      id="how-it-works"
      className="border-border bg-background/50 relative border-t antialiased"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl space-y-4">
          <div className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <Icon
              icon="solar:round-transfer-horizontal-linear"
              className="text-emerald-500"
            />
            Simple 3-Step Workflow
          </div>
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            From rough concept to finished deck{" "}
            <span className="text-emerald-500">in minutes.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Skip hours of staring at blank slides. Storyboard blends structural
            AI outlining with a tactile canvas editor so you stay in creative
            flow.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="border-border bg-card/60 hover:bg-card/90 group relative flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between pb-6">
                  <span className="font-mono text-xs font-bold text-emerald-500">
                    Step {item.step}
                  </span>
                  <div className="border-border bg-muted flex h-10 w-10 items-center justify-center rounded-xl border transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                    <Icon
                      icon={item.icon}
                      width="20"
                      className="text-muted-foreground transition-colors group-hover:text-emerald-500"
                    />
                  </div>
                </div>

                <span className="text-muted-foreground/80 mb-2 block text-xs font-medium tracking-wider uppercase">
                  {item.badge}
                </span>

                <h3 className="text-foreground mb-3 text-lg font-medium tracking-tight">
                  {item.title}
                </h3>

                <p className="text-muted-foreground mb-6 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="border-border space-y-2.5 border-t pt-5">
                {item.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-sm text-emerald-500"
                    />
                    <span className="text-muted-foreground text-xs leading-tight">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
