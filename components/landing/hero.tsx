"use client"

import React from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center px-6 pt-16 pb-20 text-center lg:px-12 lg:pt-24 lg:pb-28">
      {/* Subtle Ambient Radial Glow */}
      <div className="pointer-events-none absolute top-[-60px] left-1/2 z-0 h-[260px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]"></div>

      {/* Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-6 flex items-center gap-2"
      >
        <div className="border-border/80 bg-muted/60 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Powered by Gemini 3.1 Flash</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">20 Free Credits</span>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 max-w-4xl space-y-4"
      >
        <h1 className="text-foreground text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]">
          Transform rough ideas into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400">
            presentation-ready storyboards.
          </span>
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-muted-foreground relative z-10 mt-6 max-w-2xl text-sm leading-relaxed sm:text-base"
      >
        Generate structured narrative beats, compose balanced slide layouts, and collaboratively refine with an AI co-pilot. Export directly to PowerPoint (.pptx) or vector PDF in seconds.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3.5"
      >
        <Link href="/home">
          <button className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold shadow-sm transition-all">
            <span>Create your first deck</span>
            <Icon icon="solar:arrow-right-linear" width="16" />
          </button>
        </Link>
        <a href="#templates">
          <button className="border-border bg-card/60 text-foreground hover:bg-muted/70 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors">
            <Icon icon="solar:widget-linear" width="16" />
            <span>Explore templates</span>
          </button>
        </a>
      </motion.div>

      {/* Trust Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:check-circle-linear" className="text-emerald-500 text-sm" />
          <span>20 free credits included</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:check-circle-linear" className="text-emerald-500 text-sm" />
          <span>Lossless PowerPoint & PDF exports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="solar:check-circle-linear" className="text-emerald-500 text-sm" />
          <span>No credit card required</span>
        </div>
      </motion.div>
    </section>
  )
}
