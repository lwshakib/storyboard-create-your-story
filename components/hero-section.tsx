"use client"
import React from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowRight, Menu, Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const menuItems = [
  { name: "Features", href: "#" },
  { name: "Solution", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "About", href: "#" },
]

/**
 * HeroSection Component: The primary landing page interface.
 * Features:
 * - Fluid Navigation: Responsive header with a mobile menu toggle.
 * - Call-to-Action: Prominent "Start Building" button to drive conversion.
 * - Visual Proof: Partners/customers logo section to establish credibility.
 * - Social Proof: Link to latest updates/introduction.
 */
export default function HeroSection() {
  const [menuState, setMenuState] = React.useState(false)

  return (
    <>
      <header>
        {/* NAVIGATION BAR */}
        <nav
          data-state={menuState && "active"}
          className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
        >
          <div className="m-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <Logo />
                </Link>

                {/* MOBILE MENU TOGGLE */}
                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              {/* NAV LINKS & ACTIONS */}
              <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/login">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="overflow-hidden">
        {/* MAIN HERO CONTENT */}
        <section>
          <div className="relative pt-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="max-w-3xl text-center sm:mx-auto lg:mt-0 lg:mr-auto lg:w-4/5">
                {/* STATUS BADGE */}
                <Link
                  href="/"
                  className="mx-auto flex w-fit items-center gap-2 rounded-(--radius) border p-1 pr-3"
                >
                  <span className="bg-muted rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs">
                    New
                  </span>
                  <span className="text-sm">AI-Powered Rapid Prototyping</span>
                  <span className="block h-4 w-px bg-(--color-border)"></span>
                  <ArrowRight className="size-4" />
                </Link>

                <h1 className="mt-8 text-4xl font-semibold text-balance md:text-5xl xl:text-6xl xl:[line-height:1.125]">
                  Visual high-fidelity stories, generated in seconds.
                </h1>
                <p className="mx-auto mt-8 hidden max-w-2xl text-lg text-wrap sm:block">
                  Transform raw narratives into stunning, interactive storyboards. 
                  Leverage AI to craft high-conversion decks and prototypes without 
                  leaving your browser.
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-wrap sm:hidden">
                  High-fidelity storytelling for the modern web. From idea to 
                  interactive storyboard in seconds.
                </p>

                <div className="mt-8">
                  <Button size="lg" asChild>
                    <Link href="/login">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Start Building</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* PRODUCT SHOWCASE PREVIEW */}
            <div className="relative mx-auto mt-16 max-w-6xl overflow-hidden mask-b-from-55% px-4">
              <Image
                className="border-border/25 relative z-2 hidden rounded-2xl border dark:block shadow-2xl"
                src="/music.png"
                alt="app screen"
                width={2796}
                height={2008}
              />
              <Image
                className="border-border/25 relative z-2 rounded-2xl border dark:hidden shadow-2xl"
                src="/music-light.png"
                alt="app screen"
                width={2796}
                height={2008}
              />
            </div>
          </div>
        </section>

        {/* TRUST SECTION: Partner Logos */}
        <section className="bg-background relative z-10 pb-16">
          <div className="m-auto max-w-5xl px-6">
            <h2 className="text-center text-lg font-medium opacity-50">
              Trusted by innovative storytellers worldwide
            </h2>
            <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12 greyscale opacity-30 transition-opacity hover:opacity-100">
              <Image
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                alt="Nvidia Logo"
                height={20}
                width={80}
                unoptimized
              />
              <Image
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/column.svg"
                alt="Column Logo"
                height={16}
                width={80}
                unoptimized
              />
              <Image
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/github.svg"
                alt="GitHub Logo"
                height={16}
                width={80}
                unoptimized
              />
              <Image
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/nike.svg"
                alt="Nike Logo"
                height={20}
                width={80}
                unoptimized
              />
              <Image
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/laravel.svg"
                alt="Laravel Logo"
                height={16}
                width={80}
                unoptimized
              />
              <Image
                className="h-7 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lilly.svg"
                alt="Lilly Logo"
                height={28}
                width={80}
                unoptimized
              />
              <Image
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                alt="Lemon Squeezy Logo"
                height={20}
                width={80}
                unoptimized
              />
              <Image
                className="h-6 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/openai.svg"
                alt="OpenAI Logo"
                height={24}
                width={80}
                unoptimized
              />
              <Image
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/tailwindcss.svg"
                alt="Tailwind CSS Logo"
                height={16}
                width={80}
                unoptimized
              />
              <Image
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/vercel.svg"
                alt="Vercel Logo"
                height={20}
                width={80}
                unoptimized
              />
              <Image
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/blocks/customers/zapier.svg"
                alt="Zapier Logo"
                height={20}
                width={80}
                unoptimized
              />
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
