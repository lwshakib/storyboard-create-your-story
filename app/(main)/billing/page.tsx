"use client"

import * as React from "react"
import { Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  }
]

export default function BillingPage() {
  return (
    <div className="flex-1 flex flex-col items-center bg-background min-h-[90vh] py-20 px-6">
      <div className="max-w-5xl w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Plans & Subscriptions
            </h1>
            <p className="text-muted-foreground max-w-lg leading-relaxed font-medium">
              Transparent options for every storyteller. All plans include automated daily credit refreshes.
            </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col border-border/50 bg-card shadow-sm rounded-3xl overflow-hidden transition-all duration-300 ${plan.active ? 'ring-1 ring-primary' : ''}`}
            >
              <CardHeader className="space-y-4 p-8 pb-4">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60">{plan.name}</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                   <span className="text-sm font-medium text-muted-foreground/60">/mo</span>
                </div>
                <CardDescription className="text-sm leading-relaxed font-medium">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-8 pt-6">
                <ul className="space-y-3">
                   {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80 font-medium">
                         <Check className="size-3.5 text-primary mt-0.5 shrink-0" />
                         {feature}
                      </li>
                   ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 p-8 pt-4">
                <Button 
                   variant={plan.active ? "secondary" : "outline"}
                   disabled={!plan.active}
                   className="w-full h-11 rounded-xl text-xs font-bold tracking-widest"
                >
                  {plan.buttonText}
                </Button>
                
                {!plan.active && (
                  <div className="flex items-center justify-center gap-1.5 opacity-60">
                     <AlertCircle className="size-3" />
                     <span className="text-[9px] font-bold tracking-widest">Not available now</span>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Footer */}
        <div className="pt-8 border-t border-border/50 text-center">
           <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/40">
              Credits reset automatically at 12:00 AM UTC
           </p>
        </div>
      </div>
    </div>
  )
}

