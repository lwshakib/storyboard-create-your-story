"use client"

import * as React from "react"
import { Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"


const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal for beginners and small projects.",
    features: [
      "Up to 3 storyboards",
      "Standard exports (PDF)",
      "Daily AI credit allotment",
      "Community support",
    ],
    buttonText: "Current Plan",
    active: true,
  },
  {
    name: "Starter",
    price: "$19",
    description: "For individual creators and power users.",
    features: [
      "Unlimited storyboards",
      "HD image & PDF exports",
      "Advanced AI Architect",
      "Priority email support",
    ],
    buttonText: "Upgrade",
    active: false,
    available: false,
  },
  {
    name: "Pro",
    price: "$49",
    description: "Designed for agencies and teams.",
    features: [
      "Everything in Starter",
      "Team collaboration tools",
      "Bulk storyboard generation",
      "Priority API access",
    ],
    buttonText: "Upgrade",
    active: false,
    available: false,
  },
]

export default function BillingPage() {
  return (
    <div className="bg-background flex min-h-[90vh] flex-1 flex-col items-center px-6 py-20">
      <div className="w-full max-w-5xl space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Plans & Subscriptions
          </h1>
          <p className="text-muted-foreground max-w-lg leading-relaxed font-medium">
            Transparent options for every storyteller. All plans include
            automated daily credit refreshes.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`border-border/50 bg-card flex flex-col overflow-hidden rounded-3xl shadow-sm transition-all duration-300 ${plan.active ? "ring-primary ring-1" : ""}`}
            >
              <CardHeader className="space-y-4 p-8 pb-4">
                <span className="text-muted-foreground/60 text-[10px] font-bold tracking-widest">
                  {plan.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground/60 text-sm font-medium">
                    /mo
                  </span>
                </div>
                <CardDescription className="text-sm leading-relaxed font-medium">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-8 pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-foreground/80 flex items-start gap-3 text-sm font-medium"
                    >
                      <Check className="text-primary mt-0.5 size-3.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 p-8 pt-4">
                <Button
                  variant={plan.active ? "secondary" : "outline"}
                  disabled={!plan.active}
                  className="h-11 w-full rounded-xl text-xs font-bold tracking-widest"
                >
                  {plan.buttonText}
                </Button>

                {!plan.active && (
                  <div className="flex items-center justify-center gap-1.5 opacity-60">
                    <AlertCircle className="size-3" />
                    <span className="text-[9px] font-bold tracking-widest">
                      Not available now
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Footer */}
        <div className="border-border/50 border-t pt-8 text-center">
          <p className="text-muted-foreground/40 text-[10px] font-bold tracking-[0.2em]">
            Credits reset automatically at 12:00 AM UTC
          </p>
        </div>
      </div>
    </div>
  )
}
