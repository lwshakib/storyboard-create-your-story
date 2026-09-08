"use client"

import React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Icon } from "@iconify/react"

export function LandingFooter() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "AI Storyboard Generator", href: "/home" },
        { label: "Narrative Outliner", href: "/new" },
        { label: "Interactive Canvas Editor", href: "/home" },
        { label: "Presentation Mode", href: "/templates" },
        { label: "Template Inspirations", href: "/templates" },
        { label: "PowerPoint (.pptx) Export", href: "/home" },
        { label: "Vector PDF Export", href: "/home" },
        { label: "Pricing & Plans", href: "/billing" },
      ],
    },
    {
      title: "Use Cases",
      links: [
        { label: "Startup Pitch Decks", href: "/templates" },
        { label: "Film & Video Storyboarding", href: "/templates" },
        { label: "Marketing Campaigns", href: "/templates" },
        { label: "Product Roadmaps", href: "/templates" },
        { label: "Process & Engineering Flows", href: "/templates" },
        { label: "Executive Briefings", href: "/templates" },
        { label: "Educational Slides", href: "/templates" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "https://github.com/ichshakib/storyboard-create-your-story" },
        { label: "Prompt Guide", href: "#how-it-works" },
        { label: "Storyset Vector Library", href: "/templates" },
        { label: "API Reference", href: "/api/generate/outline" },
        { label: "Community Showcase", href: "/home" },
        { label: "Platform Status", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Storyboard", href: "/" },
        { label: "GitHub Repository", href: "https://github.com/ichshakib/storyboard-create-your-story" },
        { label: "Contributing Guide", href: "https://github.com/ichshakib/storyboard-create-your-story/blob/main/CONTRIBUTING.md" },
        { label: "Code of Conduct", href: "https://github.com/ichshakib/storyboard-create-your-story/blob/main/CODE_OF_CONDUCT.md" },
        { label: "Security", href: "#" },
        { label: "Contact Support", href: "mailto:support@storyboard.local" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "MIT License", href: "https://github.com/ichshakib/storyboard-create-your-story/blob/main/LICENSE" },
      ],
    },
  ]

  return (
    <footer className="border-border bg-background relative border-t px-6 py-16 lg:px-12 lg:py-20 antialiased">
      <div className="mx-auto max-w-[1400px]">
        {/* Top Section: Brand + Links Grid */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Brand Info */}
          <div className="max-w-sm space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo className="text-foreground" width={26} height={26} />
              <span className="text-foreground text-lg font-semibold tracking-tight">
                Storyboard
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              AI-native presentation and storyboard workspace. Transform raw ideas and scripts into structured, visual slide decks with Google Gemini and lossless exports.
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-muted-foreground text-[11px] font-medium">
                All systems operational
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <a
                href="https://github.com/ichshakib/storyboard-create-your-story"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:bg-muted border border-border flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Icon icon="simple-icons:github" width="14" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:bg-muted border border-border flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label="X / Twitter"
              >
                <Icon icon="simple-icons:x" width="13" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:bg-muted border border-border flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                aria-label="Discord"
              >
                <Icon icon="simple-icons:discord" width="14" />
              </a>
            </div>
          </div>

          {/* Links Directory Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5 lg:gap-12">
            {footerSections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-foreground text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors leading-relaxed inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border/80 mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Storyboard. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Next.js 16</span>
            <span>·</span>
            <span>Google Gemini Flash</span>
            <span>·</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
