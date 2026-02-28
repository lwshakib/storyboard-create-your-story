"use client"

import { BellOff } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="bg-background relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8">
      {/* Visual Accents */}
      <div className="bg-primary/5 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="animate-in fade-in zoom-in relative z-10 flex max-w-md flex-col items-center text-center duration-700">
        <div className="from-primary/20 via-primary/10 border-primary/20 shadow-primary/10 mb-8 flex size-24 items-center justify-center rounded-[32px] border bg-gradient-to-br to-transparent shadow-2xl">
          <BellOff className="text-primary size-10" />
        </div>

        <h1 className="text-foreground mb-4 text-4xl font-extrabold tracking-tight">
          No notification service added now
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed font-medium opacity-60">
          We are currently building our notification engine to keep you updated
          on project milestones and team feedback.
        </p>

        <div className="via-border mt-12 h-[1px] w-48 bg-gradient-to-r from-transparent to-transparent" />
      </div>

      {/* Subtle Bottom Grid */}
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  )
}
