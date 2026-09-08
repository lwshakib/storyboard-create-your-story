"use client"

import React, { useState } from "react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the AI storyboard generator work?",
      answer:
        "Storyboard uses Google Gemini Flash models combined with structured prompt pipelines. When you enter a prompt, script, or pitch concept, our engine first synthesizes a cohesive narrative arc (the Outline Beats). Once you approve or customize the beats, it generates structured slide layouts with balanced typography, data points, and visual assets without requiring manual layout wrangling.",
    },
    {
      question: "Can I manually customize slides after the AI generates them?",
      answer:
        "Yes, absolutely. Every slide opens in our tactile canvas editor where you can drag and drop elements, modify copy, replace or upload images, reorder sections, change color palettes, and add charts or tables. You can also chat directly with our AI co-pilot to refine specific slides on demand.",
    },
    {
      question: "What export formats are supported?",
      answer:
        "You can export your completed presentation decks directly to standard PowerPoint (.pptx) files using pptxgenjs, high-resolution vector PDF documents using jsPDF, or raw JSON data for offline backups and programmatic integrations.",
    },
    {
      question: "How do generation credits work?",
      answer:
        "Every registered account receives 20 complimentary generation credits upon sign-up to explore and build decks. Generating an outline, expanding a slide, or running AI refinement consumes credits based on task complexity. You can monitor your balance and upgrade seamlessly through your billing settings.",
    },
    {
      question: "Are my presentations and uploaded assets kept private?",
      answer:
        "Yes. Your projects, slides, and media files are stored securely with user-level isolation in our PostgreSQL database and encrypted S3-compatible cloud storage. Your data is never shared with third parties or used to train public models.",
    },
    {
      question: "Can I collaborate or present directly from Storyboard?",
      answer:
        "Yes. Storyboard includes a distraction-free fullscreen Presentation Mode with keyboard navigation (arrow keys, spacebar, escape) and slide counter, allowing you to present directly to clients or team members without leaving your browser.",
    },
  ]

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="border-border bg-background/50 relative border-t antialiased">
      <div className="relative z-10 mx-auto max-w-[1000px] px-6 py-20 lg:px-12 lg:py-28">
        {/* Header */}
        <div className="mb-14 text-center space-y-4">
          <div className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <Icon icon="solar:question-circle-linear" className="text-emerald-500" />
            Frequently Asked Questions
          </div>
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to know.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed sm:text-base">
            Have questions about how Storyboard handles generation, editing, or export? Here are answers to our most common inquiries.
          </p>
        </div>

        {/* Accordion List */}
        <div className="border-border/60 divide-border/60 divide-y rounded-2xl border bg-card/40 backdrop-blur-sm">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => toggle(index)}
                  className="hover:bg-muted/30 flex w-full items-center justify-between p-6 text-left transition-colors sm:p-7"
                >
                  <span className="text-foreground text-sm font-medium tracking-tight sm:text-base pr-4">
                    {faq.question}
                  </span>
                  <div className={`border-border bg-muted text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-500" : ""}`}>
                    <Icon icon="solar:alt-arrow-down-linear" width="14" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground px-6 pb-6 pt-1 text-xs leading-relaxed sm:px-7 sm:pb-7 sm:text-sm">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
