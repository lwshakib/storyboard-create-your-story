"use client"

import React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Icon } from "@iconify/react"

export function LandingNavbar() {
  const navItems = [
    { label: "Features", target: "#features" },
    { label: "How It Works", target: "#how-it-works" },
    { label: "Pricing", target: "#pricing" },
    { label: "FAQ", target: "#faq" },
  ]

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    target: string
  ) => {
    e.preventDefault()
    const element = document.querySelector(target)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="border-border/70 bg-background/80 fixed top-0 left-0 z-50 w-full border-b backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo
            className="text-foreground transition-colors group-hover:text-emerald-500"
            width={26}
            height={26}
          />
          <span className="text-foreground text-base font-semibold tracking-tight">
            Storyboard
          </span>
          <span className="border-border/60 bg-muted/60 text-muted-foreground hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block">
            Beta
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.target}
              onClick={(e) => handleScroll(e, item.target)}
              className="text-muted-foreground hover:text-foreground text-xs font-medium tracking-wide transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-foreground hidden text-xs font-medium transition-colors sm:block"
          >
            Sign in
          </Link>
          <Link href="/home">
            <button className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors">
              <span>Start Free</span>
              <Icon icon="solar:arrow-right-linear" width="14" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}
