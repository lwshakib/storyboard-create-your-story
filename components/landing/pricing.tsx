"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"

export function Pricing() {
  const [isAnnually, setIsAnnually] = useState(true)

  const tiers = [
    {
      name: "Starter",
      priceMonthly: 0,
      priceAnnually: 0,
      description: "Perfect for students and individuals creating their first presentations.",
      badge: "Free Forever",
      features: [
        "20 free generation credits included",
        "Up to 3 active storyboard projects",
        "Intelligent narrative outline engine",
        "Export to PowerPoint (.pptx) & PDF",
        "Standard template library access",
      ],
      actionText: "Get Started Free",
      actionHref: "/home",
      recommended: false,
    },
    {
      name: "Pro Storyteller",
      priceMonthly: 19,
      priceAnnually: 15,
      description: "For founders, creators, and professionals needing rapid, high-quality decks.",
      badge: "Most Popular",
      features: [
        "250 generation credits / month",
        "Unlimited storyboard projects",
        "Unlimited slide exports (PPTX & PDF)",
        "Real-time AI conversational co-pilot",
        "Interactive charts & data table widgets",
        "Cloud media storage with AWS S3",
      ],
      actionText: "Upgrade to Pro",
      actionHref: "/billing",
      recommended: true,
    },
    {
      name: "Studio & Team",
      priceMonthly: 49,
      priceAnnually: 39,
      description: "Advanced capabilities and higher capacity for agencies and startup teams.",
      badge: "Scale",
      features: [
        "800 generation credits / month",
        "Unlimited projects & team collaboration",
        "Custom brand color schemes & fonts",
        "Custom template creation & sharing",
        "Priority generation & dedicated throughput",
        "Priority developer support",
      ],
      actionText: "Start Studio Plan",
      actionHref: "/billing",
      recommended: false,
    },
  ]

  return (
    <section
      id="pricing"
      className="border-border bg-background relative border-t antialiased"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
        {/* Title area */}
        <div className="mb-14 flex flex-col items-center space-y-4 text-center">
          <div className="border-border bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <Icon icon="solar:tag-price-linear" className="text-emerald-500" />
            Simple & Transparent Pricing
          </div>
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Start free, scale as you create.
          </h2>
          <p className="text-muted-foreground max-w-lg text-sm leading-relaxed sm:text-base">
            Every account gets 20 free credits immediately. Upgrade anytime to unlock higher monthly allowances and unlimited decks.
          </p>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-2.5 pt-4">
            <div className="border-border bg-muted/60 relative inline-flex items-center rounded-xl border p-1">
              <button
                onClick={() => setIsAnnually(false)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                  !isAnnually
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setIsAnnually(true)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                  isAnnually
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual billing
              </button>
            </div>
            <p className="text-[11px] font-medium text-emerald-500">
              Save 20% with annual plans
            </p>
          </div>
        </div>

        {/* 3-Column Tiers Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`border-border bg-card/60 relative flex flex-col justify-between rounded-2xl border p-8 transition-all duration-300 ${
                tier.recommended
                  ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5 bg-card/90"
                  : "hover:border-border/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-foreground text-lg font-medium tracking-tight">
                    {tier.name}
                  </h3>
                  {tier.recommended ? (
                    <span className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold">
                      {tier.badge}
                    </span>
                  ) : (
                    <span className="border-border/70 bg-muted/60 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-6 text-xs leading-relaxed">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                    ${isAnnually ? tier.priceAnnually : tier.priceMonthly}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    / month
                  </span>
                </div>

                {/* Features List */}
                <ul className="border-border/60 space-y-3 border-t pt-6 text-xs">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Icon
                        icon="solar:check-circle-linear"
                        className={`mt-0.5 shrink-0 text-sm ${
                          tier.recommended
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-muted-foreground leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link href={tier.actionHref} className="w-full">
                  <button
                    className={`w-full rounded-xl py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      tier.recommended
                        ? "bg-emerald-500 text-black shadow-sm hover:bg-emerald-400"
                        : "border-border bg-foreground text-background hover:opacity-90 border"
                    }`}
                  >
                    {tier.actionText}
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
