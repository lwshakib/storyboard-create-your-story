"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function MessageContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("text-sm", className)}>{children}</div>
}

export function MessageResponse({ children }: { children: React.ReactNode }) {
  return <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>
}
