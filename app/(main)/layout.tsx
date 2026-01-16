"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, X, Upload, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { GenerateDialog } from "@/components/home/generate-dialog"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSearchActive, setIsSearchActive] = React.useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false)

  React.useEffect(() => {
    const handleOpenDialog = () => setIsGenerateOpen(true)
    window.addEventListener('open-generate-dialog', handleOpenDialog)
    return () => window.removeEventListener('open-generate-dialog', handleOpenDialog)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSearchActive ? (
              <motion.div 
                key="default-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between w-full gap-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  
                  {/* Desktop Search */}
                  <div className="relative w-full max-w-md hidden md:block">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder="Search stories, templates..."
                          className="w-full bg-muted/50 pl-9 rounded-full border-none focus-visible:ring-1 focus-visible:ring-primary"
                      />
                  </div>

                  {/* Mobile Search Trigger */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden rounded-full"
                    onClick={() => setIsSearchActive(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <input
                    type="file"
                    id="main-import-json"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        try {
                          const data = JSON.parse(event.target?.result as string)
                          if (data.slides) {
                            localStorage.setItem('importedStoryboard', JSON.stringify(data))
                            window.location.href = '/editor'
                          } else {
                            alert("Invalid storyboard format")
                          }
                        } catch (err) {
                          alert("Failed to parse JSON")
                        }
                      }
                      reader.readAsText(file)
                    }}
                  />
                  <Button 
                    variant="outline"
                    className="rounded-full px-4 md:px-6 font-medium shadow-sm flex items-center gap-2 border-border/50 hover:bg-muted/50"
                    onClick={() => document.getElementById('main-import-json')?.click()}
                  >
                    <Upload className="size-4 opacity-70" />
                    <span className="hidden sm:inline">Import</span>
                  </Button>
                  <Button asChild className="rounded-full px-4 md:px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm flex items-center gap-2">
                      <Link href="/new">
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">New Project</span>
                        <span className="sm:hidden">New</span>
                      </Link>
                  </Button>
                  <ModeToggle />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="mobile-search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center w-full gap-2 md:hidden"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-muted/50 pl-10 rounded-full border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => setIsSearchActive(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
        <GenerateDialog 
          open={isGenerateOpen} 
          onOpenChange={setIsGenerateOpen} 
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
