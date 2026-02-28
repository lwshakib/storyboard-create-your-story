"use client"

import * as React from "react"
import { Clock, Info } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"

// Mock usage data for a minimalist chart
const USAGE_DATA = [
  { day: "M", value: 40 },
  { day: "T", value: 75 },
  { day: "W", value: 30 },
  { day: "T", value: 90 },
  { day: "F", value: 55 },
  { day: "S", value: 20 },
  { day: "S", value: 10 },
]

export default function SettingsPage() {
  const [credits, setCredits] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/user/credits")
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch (err) {
        console.error("Failed to fetch credits", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCredits()
  }, [])

  return (
    <div className="mx-auto max-w-4xl flex-1 space-y-12 p-10 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm font-medium">
          Manage your workspace and track AI usage.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Credit Overview */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-muted-foreground/60 text-sm font-bold tracking-wider">
              Credits & Power
            </h3>
            <Card className="border-border/50 rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold tracking-widest opacity-60">
                  Available balance
                </CardDescription>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {loading ? "---" : credits?.toLocaleString() || "0"}
                  </span>
                  <span className="text-muted-foreground/50 text-xs font-bold">
                    credits
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <Clock className="text-primary size-3.5" />
                  Resets to 50,000 at 12:00 AM UTC
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-1000 ease-out"
                    style={{ width: `${(credits || 0) / 500}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Activity */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-muted-foreground/60 text-sm font-bold tracking-wider">
              Activity
            </h3>
            <Card className="border-border/50 flex h-[264px] flex-col rounded-2xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xs font-bold tracking-widest opacity-60">
                  Usage trends
                  <Info className="text-muted-foreground/40 size-3" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 items-end justify-between gap-2 pt-6">
                {USAGE_DATA.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="bg-primary/10 group relative w-full rounded-sm"
                      style={{ height: `${item.value}%` }}
                    >
                      <div className="bg-primary absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40" />
                    </div>
                    <span className="text-muted-foreground/40 text-[9px] font-bold">
                      {item.day}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 border-border/50 flex gap-3 rounded-2xl border p-4">
            <Info className="text-primary mt-0.5 size-4 shrink-0" />
            <p className="text-muted-foreground text-[10px] leading-relaxed font-medium">
              Your daily credit allotment is shared across all projects.
              High-density generations may take longer during peak usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
