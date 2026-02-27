"use client"

import * as React from "react"
import { Check, CreditCard, Sparkles, Zap, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal for beginners and small projects.",
    features: [
      "Up to 3 storyboards",
      "Standard exports (PDF)",
      "Basic AI generation",
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
      "Custom branding options",
    ],
    buttonText: "Upgrade",
    active: false,
    popular: true,
  },
  {
    name: "Pro",
    price: "$49",
    description: "Designed for agencies and teams.",
    features: [
      "Everything in Starter",
      "Team collaboration tools",
      "Bulk storyboard generation",
      "Dedicated account manager",
      "API access & webhooks",
    ],
    buttonText: "Upgrade",
    active: false,
  }
]

export default function BillingPage() {
  const handlePurchase = () => {
    toast.info("Integration in Progress", {
      description: "We're currently finalizing our payment system."
    })
  }

  return (
    <div className="flex-1 flex flex-col items-center p-12 bg-background">
      <div className="max-w-5xl w-full space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
            <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5 text-[10px] font-black tracking-widest uppercase">
                Subscription & Billing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Choose your creative power</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Simple, transparent pricing for creators of all scales. Upgrade to unlock advanced AI features and professional export options.
            </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
             <Card 
               key={plan.name} 
               className={`flex flex-col border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 ${plan.popular ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
             >
               <CardHeader className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">{plan.name}</span>
                    {plan.popular && <Badge className="bg-primary/10 text-primary border-none shadow-none text-[9px] font-black">POPULAR</Badge>}
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground/60">/month</span>
                 </div>
                 <CardDescription className="text-sm leading-relaxed">{plan.description}</CardDescription>
               </CardHeader>

               <CardContent className="flex-1">
                 <ul className="space-y-3">
                    {plan.features.map(feature => (
                       <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground/80">
                          <Check className="size-4 text-primary shrink-0 mt-0.5" />
                          {feature}
                       </li>
                    ))}
                 </ul>
               </CardContent>

               <CardFooter className="flex flex-col gap-3 pt-6">
                 <Button 
                    variant={plan.active ? "secondary" : "default"}
                    className={`w-full font-bold h-10 ${plan.active ? 'opacity-50' : ''}`}
                    onClick={plan.active ? undefined : handlePurchase}
                 >
                   {plan.buttonText}
                 </Button>
                 
                 {!plan.active && (
                   <div className="flex items-center justify-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                      <AlertCircle className="size-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Not available now</span>
                   </div>
                 )}
               </CardFooter>
             </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest">Enterprise</span>
                    <span className="text-sm text-muted-foreground">Custom solutions for big teams</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest">Support</span>
                    <span className="text-sm text-muted-foreground">help@storyboard.com</span>
                </div>
            </div>
            <p className="text-xs font-medium max-w-xs text-center md:text-right">
                All plans include access to our core storyboard engine and basic templates.
            </p>
        </div>
      </div>
    </div>
  )
}

