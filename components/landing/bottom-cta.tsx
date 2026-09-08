"use client"

import React from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"

export function BottomCTA() {
  return (
    <section className="border-border bg-background relative flex justify-center border-t px-6 py-20 lg:px-12 lg:py-24">
      <div className="relative w-full max-w-[1000px]">
        {/* Clean minimal callout box */}
        <div className="border-border bg-card/80 relative z-10 w-full overflow-hidden rounded-2xl border p-8 text-center sm:p-12 lg:p-16 shadow-sm">
          {/* Subtle soft gradient highlight */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>

          <div className="relative z-20 mx-auto flex max-w-xl flex-col items-center space-y-4">
            <div className="border-border bg-muted/60 flex h-10 w-10 items-center justify-center rounded-xl border">
              <Icon
                icon="solar:clapperboard-edit-linear"
                width="20"
                className="text-emerald-500"
              />
            </div>

            <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Ready to build your next presentation?
            </h2>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Join thousands of founders, directors, and creators using Storyboard to turn ideas into structured visual narratives.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link href="/home">
                <button className="bg-foreground text-background hover:bg-foreground/90 flex h-11 items-center gap-2 rounded-xl px-6 text-xs font-semibold shadow-sm transition-colors">
                  <span>Start with 20 free credits</span>
                  <Icon icon="solar:arrow-right-linear" width="16" />
                </button>
              </Link>
              <Link href="/templates">
                <button className="border-border bg-background hover:bg-muted text-foreground flex h-11 items-center gap-2 rounded-xl border px-5 text-xs font-medium transition-colors">
                  <span>Browse templates</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon icon="solar:check-circle-linear" className="text-emerald-500 text-xs" />
                No credit card required
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:check-circle-linear" className="text-emerald-500 text-xs" />
                Export to PowerPoint & PDF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
