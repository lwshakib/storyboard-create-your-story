"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export function TemplatesPreview() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const templates = [
    {
      id: "growth-business-deck",
      title: "Growth & Pitch Deck",
      category: "startup",
      slides: 9,
      tag: "Fundraising",
      description:
        "Traction metrics, market sizing, team slides, and problem-solution architecture designed for seed to Series B pitches.",
      color: "from-emerald-500/20 to-teal-500/10",
      accent: "text-emerald-500",
    },
    {
      id: "corporate-business-deck",
      title: "Corporate Strategy",
      category: "business",
      slides: 9,
      tag: "Executive",
      description:
        "Quarterly reviews, stakeholder roadmaps, and risk analysis formats optimized for boardroom clarity.",
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-blue-500",
    },
    {
      id: "innovate-business-presentation",
      title: "Product Innovation & Launch",
      category: "product",
      slides: 9,
      tag: "Launch",
      description:
        "Feature deep-dives, competitive matrix, architectural flow, and user journey storyboards for tech products.",
      color: "from-purple-500/20 to-indigo-500/10",
      accent: "text-purple-500",
    },
    {
      id: "modern-dark-deck",
      title: "Cinematic Dark Mode",
      category: "creative",
      slides: 9,
      tag: "Design",
      description:
        "High-contrast visual storyboards and narrative beats with dramatic typography and media focal points.",
      color: "from-zinc-500/20 to-neutral-500/10",
      accent: "text-emerald-400",
    },
    {
      id: "process-flow-deck",
      title: "Process & Engineering Flow",
      category: "product",
      slides: 10,
      tag: "Operations",
      description:
        "Step-by-step technical workflows, agile sprint summaries, and system pipelines with sequence markers.",
      color: "from-amber-500/20 to-orange-500/10",
      accent: "text-amber-500",
    },
    {
      id: "nexus-business-deck",
      title: "Nexus Enterprise Brief",
      category: "business",
      slides: 6,
      tag: "Enterprise",
      description:
        "Clean minimal data presentation with split layouts, performance KPIs, and multi-column comparison zones.",
      color: "from-teal-500/20 to-emerald-500/10",
      accent: "text-teal-500",
    },
  ]

  const filtered =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  return (
    <section
      id="templates"
      className="border-border bg-background relative border-t antialiased"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col items-start justify-between gap-8 pb-12 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-4">
            <div className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <Icon icon="solar:widget-2-linear" className="text-emerald-500" />
              Curated Slide Inspirations
            </div>
            <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              Professional templates for <br className="hidden sm:inline" />
              <span className="text-emerald-500">
                every story and scenario.
              </span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              Start from scratch with AI, or jumpstart with our library of
              battle-tested presentation templates tuned for pitch decks,
              roadmaps, and technical proposals.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="border-border bg-muted/60 flex flex-wrap gap-1 rounded-xl border p-1 text-xs font-medium">
            {[
              { id: "all", label: "All Templates" },
              { id: "startup", label: "Startup & Pitch" },
              { id: "business", label: "Business & Strategy" },
              { id: "product", label: "Product & Tech" },
              { id: "creative", label: "Creative" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3.5 py-1.5 transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="border-border bg-card/60 group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:border-emerald-500/40"
            >
              {/* Subtle gradient banner */}
              <div
                className={`h-28 w-full rounded-xl bg-gradient-to-br ${item.color} border-border/50 relative mb-5 flex items-center justify-between border p-4`}
              >
                <div className="border-border/80 bg-background/80 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  <Icon icon="solar:gallery-linear" className={item.accent} />
                  <span>{item.slides} Slides</span>
                </div>
                <span className="border-border/80 bg-background/80 text-muted-foreground rounded-md px-2 py-1 text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="text-foreground mb-2 text-lg font-medium tracking-tight transition-colors group-hover:text-emerald-500">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>

              <div className="border-border flex items-center justify-between border-t pt-4">
                <Link
                  href="/templates"
                  className="text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <span>Explore template</span>
                  <Icon
                    icon="solar:arrow-right-linear"
                    className="text-sm transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/home"
                  className="hover:bg-muted text-muted-foreground hover:text-foreground flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors"
                >
                  <Icon
                    icon="solar:magic-stick-linear"
                    className="text-emerald-500"
                  />
                  Use with AI
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
