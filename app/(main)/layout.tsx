"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, X, Upload, Sparkles, Loader2, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GenerateDialog } from "@/components/home/generate-dialog"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSearchActive, setIsSearchActive] = React.useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [credits, setCredits] = React.useState<number | null>(null)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  const router = useRouter()

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
      }
    }
    fetchCredits()
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          if (res.ok) {
            const data = await res.json()
            setSearchResults(data)
          }
        } catch (err) {
          console.error("Search failed", err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  React.useEffect(() => {
    const handleOpenDialog = () => setIsGenerateOpen(true)
    window.addEventListener('open-generate-dialog', handleOpenDialog)
    return () => window.removeEventListener('open-generate-dialog', handleOpenDialog)
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {!isSearchActive ? (
              <motion.div 
                key="default-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between w-full gap-2"
              >
                <div className="flex items-center gap-2 flex-1 relative">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  
                  {/* Desktop Search */}
                  <div className="relative w-full max-w-md hidden md:block group">
                      <Search className={`absolute left-2.5 top-2.5 h-4 w-4 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                      <Input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search projects"
                          className="w-full bg-muted/50 pl-9 rounded-full border-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm hover:bg-muted transition-all"
                      />

                      {/* Search Results Dropdown */}
                      <AnimatePresence>
                        {searchQuery.length >= 2 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 w-full mt-2 bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
                          >
                            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                              {searchResults.length > 0 ? (
                                <div className="grid gap-1">
                                  {searchResults.map((project) => (
                                    <button
                                      key={project.id}
                                      onClick={() => {
                                        router.push(`/editor/${project.id}`)
                                        setSearchQuery("")
                                      }}
                                      className="flex flex-col items-start text-left p-3 rounded-xl hover:bg-primary/5 transition-colors group/item"
                                    >
                                      <span className="font-bold text-sm text-foreground group-hover/item:text-primary transition-colors">
                                        {project.title}
                                      </span>
                                      {project.description && (
                                        <span className="text-[10px] text-muted-foreground/60 line-clamp-1">
                                          {project.description}
                                        </span>
                                      )}
                                      <div className="mt-1 flex items-center gap-1.5 ">
                                        <Badge variant="outline" className="text-[8px] h-4 py-0 font-black border-primary/20 text-primary/60">
                                          Project
                                        </Badge>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : isSearching ? (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                  <Loader2 className="size-6 text-primary animate-spin" />
                                  <span className="text-xs font-bold text-muted-foreground/40">Searching projects...</span>
                                </div>
                              ) : (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                  <Search className="size-6 text-muted-foreground/20" />
                                  <span className="text-xs font-bold text-muted-foreground/40">No matching storyboards</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  <div className="hidden lg:block">
                    <span className="text-[10px] font-bold tabular-nums opacity-60">
                        {credits !== null ? (credits / 1000).toFixed(1) + "K" : "---"} credits remaining
                    </span>
                  </div>

                  <input
                    type="file"
                    id="main-import-json"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      const reader = new FileReader()
                      reader.onload = async (event) => {
                        try {
                          const content = event.target?.result as string
                          if (!content) return

                          toast.info("Checking compatibility...")
                          const data = JSON.parse(content)

                          if (!data || typeof data !== 'object' || !Array.isArray(data.slides)) {
                            toast.error("Incompatible storyboard format.")
                            return
                          }

                          setIsImporting(true)
                          toast.info("Creating project...")

                          const payload = {
                            title: data.projectTitle || data.title || "Imported Storyboard",
                            description: data.projectDescription || data.description || "",
                            slides: data.slides.map((s: any, idx: number) => ({
                              ...s,
                              id: s.id || (idx + 1)
                            }))
                          }

                          const res = await fetch("/api/projects", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          })

                          if (res.ok) {
                            const newProject = await res.json()
                            toast.success("Project created successfully")
                            router.push(`/editor/${newProject.id}`)
                          } else {
                            throw new Error("Failed to create project")
                          }
                        } catch (err) {
                          console.error("Import error:", err)
                          toast.error("Failed to import JSON")
                        } finally {
                          setIsImporting(false)
                          if (e.target) e.target.value = ""
                        }
                      }
                      reader.readAsText(file)
                    }}
                  />
                  <Button 
                    variant="outline"
                    disabled={isImporting}
                    className="rounded-full px-4 md:px-6 font-medium shadow-sm flex items-center gap-2 border-border/50 hover:bg-muted/50"
                    onClick={() => document.getElementById('main-import-json')?.click()}
                  >
                    {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4 opacity-70" />}
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
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects"
                    className="w-full bg-muted/50 pl-10 rounded-full border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                  />
                  
                  {/* Mobile Search Results */}
                  <AnimatePresence>
                    {searchQuery.length >= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                      >
                         <div className="p-2 max-h-[300px] overflow-y-auto">
                              {searchResults.length > 0 ? (
                                <div className="grid gap-1">
                                  {searchResults.map((project) => (
                                    <button
                                      key={project.id}
                                      onClick={() => {
                                        router.push(`/editor/${project.id}`)
                                        setSearchQuery("")
                                        setIsSearchActive(false)
                                      }}
                                      className="flex flex-col items-start text-left p-3 rounded-xl hover:bg-primary/5"
                                    >
                                      <span className="font-bold text-sm text-foreground">{project.title}</span>
                                      <span className="text-[10px] text-muted-foreground/60"> storyboard </span>
                                    </button>
                                  ))}
                                </div>
                              ) : isSearching ? (
                                <div className="p-6 text-center text-[10px] font-black text-muted-foreground/40">Searching projects...</div>
                              ) : (
                                <div className="p-6 text-center text-[10px] font-black text-muted-foreground/40">No results found</div>
                              )}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
