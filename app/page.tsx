"use client"

import * as React from "react"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FeaturesMinimal } from "@/components/landing/features-minimal"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { BottomCTA } from "@/components/landing/bottom-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

/**
 * LandingPage: Modern, minimalist, and content-rich presentation builder marketing page.
 */
export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Subtle native grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 0.75px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Structural subtle guideline lines */}
      <div className="pointer-events-none fixed inset-0 z-0 mx-auto flex max-w-[1400px] justify-between px-6 opacity-[0.03] lg:px-12">
        <div className="bg-foreground h-full w-px"></div>
        <div className="bg-foreground h-full w-px"></div>
        <div className="bg-foreground hidden h-full w-px md:block"></div>
        <div className="bg-foreground hidden h-full w-px lg:block"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Minimal Navbar */}
        <LandingNavbar />

        <main className="flex-grow pt-16">
          {/* Hero Section */}
          <Hero />

          {/* 3-Step Workflow */}
          <HowItWorks />

          {/* Core Feature Capabilities */}
          <FeaturesMinimal />

          {/* Transparent Pricing Plans */}
          <Pricing />

          {/* Frequently Asked Questions */}
          <FAQ />

          {/* High-Conversion Bottom CTA */}
          <BottomCTA />
        </main>

        {/* Detailed Directory Footer */}
        <LandingFooter />
      </div>
    </div>
  )
}
