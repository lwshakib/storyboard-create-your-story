"use client"

import React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export function FeaturesMinimal() {
  const coreFeatures = [
    {
      icon: "solar:notes-linear",
      title: "Contextual Narrative Outlining",
      description:
        "Input your raw notes, script, or pitch concept. Storyboard extracts key takeaways and creates a logical 5-8 beat outline before committing to full slide designs.",
      badge: "AI Architecture",
    },
    {
      icon: "solar:slider-vertical-linear",
      title: "Adaptive Layout Presets",
      description:
        "Automatically position elements across horizontal splits, vertical splits, 2x2 grids, and title zones with optimal negative space and typography hierarchy.",
      badge: "Canvas Engine",
    },
    {
      icon: "solar:graph-new-linear",
      title: "Interactive Charts & Data Tables",
      description:
        "Embed dynamic bar, line, area, and pie charts with custom metrics, or generate multi-row data tables that format automatically for high legibility.",
      badge: "Data Visualization",
    },
    {
      icon: "solar:magic-stick-linear",
      title: "Conversational AI Co-Pilot",
      description:
        "Refine individual slides on demand. Instruct the assistant to change tone, summarize bullet points, adjust color accents, or replace visual assets via chat.",
      badge: "AI Co-Pilot",
    },
    {
      icon: "solar:export-linear",
      title: "Native PowerPoint & PDF Export",
      description:
        "Generate genuine Microsoft PowerPoint (.pptx) decks using native vector shapes and text frames, or export print-ready high-resolution vector PDF files.",
      badge: "Lossless Export",
    },
    {
      icon: "solar:shield-check-linear",
      title: "Enterprise Storage & Privacy",
      description:
        "Your presentations and uploaded media are stored securely with PostgreSQL isolation and private AWS S3 bucket presigned URLs. No training on user data.",
      badge: "Security & Cloud",
    },
  ]

  return (
    <section
      id="features"
      className="border-border bg-background relative border-t antialiased"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        {/* Section Header */}
        <div className="mb-16 max-w-2xl space-y-4">
          <div className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <Icon icon="solar:stars-minimalistic-linear" className="text-emerald-500" />
            Core Capabilities
          </div>
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Engineered for precision, <br />
            <span className="text-emerald-500">designed for speed.</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Every feature is built to remove friction between having an idea and delivering a polished, audience-ready presentation.
          </p>
        </div>

        {/* 6-Card Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="border-border bg-card/60 hover:bg-card hover:border-emerald-500/30 group relative flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between pb-5">
                  <div className="border-border bg-muted group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors">
                    <Icon
                      icon={feat.icon}
                      width="20"
                      className="text-muted-foreground group-hover:text-emerald-500 transition-colors"
                    />
                  </div>
                  <span className="border-border/60 bg-muted/60 text-muted-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-foreground mb-2 text-base font-medium tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
