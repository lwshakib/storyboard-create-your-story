"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Conversation({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function ConversationContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
}
