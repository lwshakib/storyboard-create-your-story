"use client"

import { BellOff } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-in fade-in zoom-in duration-700">
        <div className="size-24 rounded-[32px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center mb-8 shadow-2xl shadow-primary/10">
          <BellOff className="size-10 text-primary" />
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
          No notification service added now
        </h1>
        
        <p className="text-muted-foreground text-lg font-medium leading-relaxed opacity-60">
          We are currently building our notification engine to keep you updated on project milestones and team feedback.
        </p>
        
        <div className="mt-12 w-48 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Subtle Bottom Grid */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div 
        className="absolute bottom-0 inset-x-0 h-32 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} 
      />
    </div>
  )
}
