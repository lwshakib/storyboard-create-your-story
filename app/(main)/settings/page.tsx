"use client"

import * as React from "react"
import { Sparkles, Zap, CreditCard, Clock, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <div className="flex-1 p-10 max-w-4xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm font-medium">Manage your workspace and track AI usage.</p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Credit Overview */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold tracking-wider text-muted-foreground/60">Credits & Power</h3>
            <Card className="border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold tracking-widest opacity-60">Available balance</CardDescription>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {loading ? "---" : (credits?.toLocaleString() || "0")}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground/50">credits</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3.5 text-primary" />
                  Resets to 50,000 at 12:00 AM UTC
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
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
            <h3 className="text-sm font-bold tracking-wider text-muted-foreground/60">Activity</h3>
            <Card className="border-border/50 shadow-sm rounded-2xl h-[264px] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-bold tracking-widest flex items-center justify-between opacity-60">
                   Usage trends
                   <Info className="size-3 text-muted-foreground/40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-end justify-between gap-2 pt-6">
                {USAGE_DATA.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary/10 rounded-sm relative group"
                      style={{ height: `${item.value}%` }}
                    >
                      <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground/40">{item.day}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 flex gap-3">
             <Info className="size-4 text-primary shrink-0 mt-0.5" />
             <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                Your daily credit allotment is shared across all projects. High-density generations may take longer during peak usage.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}

