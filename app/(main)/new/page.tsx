"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function NewProjectPage() {
  const handleGenerateClick = () => {
    window.dispatchEvent(new CustomEvent('open-generate-dialog'))
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          How would you like to get started?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg"
        >
          Choose your preferred method to begin
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Template Card */}
        <SelectionCard 
          title="Use a Template"
          description="Browse our curated collection of professional storyboard templates."
          buttonText="Continue"
          delay={0.3}
          href="/templates"
        />

        {/* AI Card (The Featured One) */}
        <SelectionCard 
          title="Generate with"
          highlightedText="Creative AI"
          description="Describe your vision and let our AI generate a complete storyboard for you."
          buttonText="Generate"
          featured
          delay={0.4}
          onClick={handleGenerateClick}
        />

        {/* Scratch Card */}
        <SelectionCard 
          title="Start from" 
          highlightedText="Scratch"
          description="Start with a clean canvas and build your story piece by piece."
          buttonText="Continue"
          delay={0.5}
          href="/editor"
        />
      </div>
    </div>
  )
}

interface SelectionCardProps {
  title: string
  highlightedText?: string
  description: string
  buttonText: string
  featured?: boolean
  delay?: number
  href?: string
  onClick?: () => void
}

function SelectionCard({ title, highlightedText, description, buttonText, featured, delay = 0, href, onClick }: SelectionCardProps) {
  const CardWrapper = href ? Link : "div"
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <CardWrapper 
        href={href as string} 
        className="block h-full cursor-pointer"
        onClick={onClick}
      >
        <div
          className={cn(
            "relative rounded-2xl border transition-all duration-300 overflow-hidden h-full flex flex-col",
            featured 
              ? "border-transparent bg-neutral-900 shadow-2xl scale-105" 
              : "bg-muted/30 border-border hover:bg-muted/50"
          )}
        >
          {/* Gradient Border for Featured Card */}
          {featured && (
            <div className="absolute inset-0 p-[2px] -z-10 rounded-2xl bg-gradient-to-br from-purple-500 via-orange-500 to-pink-500 opacity-60" />
          )}

          <div className={cn("p-8 flex flex-col h-full", featured ? "bg-neutral-900" : "bg-transparent")}>
            <div className="space-y-4 flex-1">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {featured ? "Featured" : "Method"}
              </h2>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold leading-tight">
                  {title}
                </h3>
                {highlightedText && (
                  <h3 className={cn(
                    "text-3xl font-bold leading-tight",
                    featured ? "bg-gradient-to-r from-purple-400 via-orange-400 to-pink-400 bg-clip-text text-transparent" : ""
                  )}>
                    {highlightedText}
                  </h3>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <span 
                className={cn(
                  "rounded-full px-8 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer pointer-events-none inline-block",
                  featured 
                    ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                    : "bg-neutral-800 text-white hover:bg-neutral-700"
                )}
              >
                {buttonText}
              </span>
            </div>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  )
}
