"use client"

import * as React from "react"
import { THEMES, ThemeKey } from "@/lib/themes"
import { Palette, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ThemeSettingsProps {
  activeThemeId: string | null
  appliedTheme: any
  onApplyTheme: (theme: any) => void
}

export function ThemeSettings({ activeThemeId, appliedTheme, onApplyTheme }: ThemeSettingsProps) {
  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Palette className="h-4 w-4" />
          System Themes
        </h3>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-3">
          <Info className="size-4 text-blue-500 mt-0.5" />
          <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">
            Applying a theme will visually sync all existing slides and influence the design of future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isActive = activeThemeId === key
            
            return (
              <button
                key={key}
                onClick={() => onApplyTheme({ ...theme, id: key, cssVars: { ...theme } })}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                  isActive 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xl" 
                    : "border-border hover:border-zinc-400 hover:bg-muted"
                )}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                   <div 
                     className="h-8 w-8 rounded-lg border border-black/10 flex items-center justify-center font-bold"
                     style={{ backgroundColor: theme.primary, color: theme.primaryForeground }}
                   >
                     {theme.name[0]}
                   </div>
                   <span className="font-bold text-sm tracking-tight">{theme.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                   <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: theme.background }} />
                   <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: theme.foreground }} />
                   <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: theme.primary }} />
                   <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: theme.secondary || theme.muted }} />
                   <div className="h-5 w-5 rounded-md border" style={{ backgroundColor: theme.accent }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
