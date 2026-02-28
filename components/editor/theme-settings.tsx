"use client"

import * as React from "react"
import { THEMES, type Theme } from "@/lib/themes"
import { Palette, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ThemeSettingsProps {
  activeThemeId: string | null
  appliedTheme: any
  onApplyTheme: (theme: any) => void
}

export function ThemeSettings({
  activeThemeId,
  appliedTheme,
  onApplyTheme,
}: ThemeSettingsProps) {
  return (
    <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <Palette className="h-4 w-4" />
          System Themes
        </h3>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4">
          <Info className="mt-0.5 size-4 text-blue-500" />
          <p className="text-[12px] leading-relaxed font-medium text-zinc-500">
            Applying a theme will visually sync all existing slides and
            influence the design of future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Object.entries(THEMES).map(([key, theme]) => {
            const isActive = activeThemeId === key
            const t = theme as Theme

            return (
              <button
                key={key}
                onClick={() =>
                  onApplyTheme({ ...t, id: key, cssVars: { ...t } })
                }
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5 ring-primary/20 shadow-xl ring-1"
                    : "border-border hover:bg-muted hover:border-zinc-400"
                )}
              >
                {isActive && (
                  <div className="bg-primary absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground h-3 w-3" />
                  </div>
                )}

                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 font-bold"
                    style={{
                      backgroundColor: t.primary,
                      color: t.primaryForeground,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-bold tracking-tight">
                    {t.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-md border"
                    style={{ backgroundColor: t.background }}
                  />
                  <div
                    className="h-5 w-5 rounded-md border"
                    style={{ backgroundColor: t.foreground }}
                  />
                  <div
                    className="h-5 w-5 rounded-md border"
                    style={{ backgroundColor: t.primary }}
                  />
                  <div
                    className="h-5 w-5 rounded-md border"
                    style={{ backgroundColor: t.secondary || (t as any).muted }}
                  />
                  <div
                    className="h-5 w-5 rounded-md border"
                    style={{ backgroundColor: t.accent }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
