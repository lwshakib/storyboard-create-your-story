"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, X, Upload, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GenerateDialog } from "@/components/home/generate-dialog"

/**
 * MainLayout: The primary layout for authenticated users.
 * Features:
 * - Collapsible sidebar via SidebarProvider.
 * - Global search with real-time results dropdown.
 * - Credit balance tracking.
 * - Project import functionality (JSON).
 * - Global "New Project" entry points.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // --- UI STATES ---
  const [isSearchActive, setIsSearchActive] = React.useState(false) // For mobile search view toggle
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false) // New Project dialog state
  const [isImporting, setIsImporting] = React.useState(false)       // Loading state for file imports
  const [credits, setCredits] = React.useState<number | null>(null) // User credit balance

  // --- SEARCH LOGIC ---
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<
    { id: string; title: string; updatedAt: string; description?: string }[]
  >([])
  const [isSearching, setIsSearching] = React.useState(false)

  const router = useRouter()

  /**
   * Fetch current user credits on mount.
   */
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

  /**
   * Debounced search effect.
   * Waits 400ms after the last keystroke before querying the API.
   */
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery)}`
          )
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

  /**
   * Listen for global events to open the generation dialog.
   * This allow other components to trigger the shared dialog.
   */
  React.useEffect(() => {
    const handleOpenDialog = () => setIsGenerateOpen(true)
    window.addEventListener("open-generate-dialog", handleOpenDialog)
    return () =>
      window.removeEventListener("open-generate-dialog", handleOpenDialog)
  }, [])

  return (
    <SidebarProvider>
      {/* Primary Navigation Sidebar */}
      <AppSidebar />
      
      <SidebarInset>
        {/* SHARED HEADER */}
        <header className="bg-background/80 sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <AnimatePresence mode="wait">
            {!isSearchActive ? (
              /* DEFAULT HEADER VIEW */
              <motion.div
                key="default-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex w-full items-center justify-between gap-2"
              >
                <div className="relative flex flex-1 items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />

                  {/* Desktop Search Input with Dropdown Results */}
                  <div className="group relative hidden w-full max-w-md md:block">
                    <Search
                      className={`absolute top-2.5 left-2.5 h-4 w-4 transition-colors ${isSearching ? "text-primary animate-pulse" : "text-muted-foreground"}`}
                    />
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search projects"
                      className="bg-muted/50 focus-visible:ring-primary hover:bg-muted w-full rounded-full border-none pl-9 shadow-sm transition-all focus-visible:ring-1"
                    />

                    {/* Search Results Dropdown Overlay */}
                    <AnimatePresence>
                      {searchQuery.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="bg-background border-border/50 absolute top-full left-0 z-[100] mt-2 w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl"
                        >
                          <div className="custom-scrollbar max-h-[400px] overflow-y-auto p-2">
                            {searchResults.length > 0 ? (
                              <div className="grid gap-1">
                                {searchResults.map((project) => (
                                  <button
                                    key={project.id}
                                    onClick={() => {
                                      router.push(`/project/${project.id}`)
                                      setSearchQuery("")
                                    }}
                                    className="hover:bg-primary/5 group/item flex flex-col items-start rounded-xl p-3 text-left transition-colors"
                                  >
                                    <span className="text-foreground group-hover/item:text-primary text-sm font-bold transition-colors">
                                      {project.title}
                                    </span>
                                    {project.description && (
                                      <span className="text-muted-foreground/60 line-clamp-1 text-[10px]">
                                        {project.description}
                                      </span>
                                    )}
                                    <div className="mt-1 flex items-center gap-1.5">
                                      <Badge
                                        variant="outline"
                                        className="border-primary/20 text-primary/60 h-4 py-0 text-[8px] font-black"
                                      >
                                        Project
                                      </Badge>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : isSearching ? (
                              <div className="flex flex-col items-center gap-2 p-8 text-center">
                                <Loader2 className="text-primary size-6 animate-spin" />
                                <span className="text-muted-foreground/40 text-xs font-bold">
                                  Searching projects...
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 p-8 text-center">
                                <Search className="text-muted-foreground/20 size-6" />
                                <span className="text-muted-foreground/40 text-xs font-bold">
                                  No matching storyboards
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile Search Trigger Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full md:hidden"
                    onClick={() => setIsSearchActive(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                {/* HEADER ACTION TOOLS */}
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Credit Display */}
                  <div className="hidden lg:block">
                    <span className="text-[10px] font-bold tabular-nums opacity-60">
                      {credits !== null
                        ? credits
                        : "---"}{" "}
                      credits remaining
                    </span>
                  </div>

                  {/* HIDDEN FILE INPUT FOR IMPORT */}
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

                          // Basic validation of keys for stability
                          if (
                            !data ||
                            typeof data !== "object" ||
                            !Array.isArray(data.slides)
                          ) {
                            toast.error("Incompatible storyboard format.")
                            return
                          }

                          setIsImporting(true)
                          toast.info("Creating project...")

                          // Standardize payload format
                          const payload = {
                            title:
                              data.projectTitle ||
                              data.title ||
                              "Imported Storyboard",
                            description:
                              data.projectDescription || data.description || "",
                            slides: data.slides.map(
                              (
                                s: { id?: number; html?: string },
                                idx: number
                              ) => ({
                                ...s,
                                id: s.id || idx + 1,
                              })
                            ),
                          }

                          const res = await fetch("/api/projects", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          })

                          if (res.ok) {
                            const newProject = await res.json()
                            toast.success("Project created successfully")
                            router.push(`/project/${newProject.id}`)
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
                  
                  {/* Import Button */}
                  <Button
                    variant="outline"
                    disabled={isImporting}
                    className="border-border/50 hover:bg-muted/50 flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-medium shadow-sm"
                    onClick={() =>
                      document.getElementById("main-import-json")?.click()
                    }
                  >
                    {isImporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4 opacity-70" />
                    )}
                    <span className="hidden md:inline">Import</span>
                  </Button>

                  {/* New Project Button */}
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex size-9 items-center justify-center p-0 md:h-10 md:w-auto md:px-6 md:gap-2 rounded-full font-medium shadow-sm"
                  >
                    <Link href="/new">
                      <Plus className="size-4" />
                      <span className="hidden md:inline">New Project</span>
                    </Link>
                  </Button>
                  
                  <ModeToggle />
                </div>
              </motion.div>
            ) : (
              /* MOBILE FULL SEARCH OVERLAY */
              <motion.div
                key="mobile-search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex w-full items-center gap-2 md:hidden"
              >
                <div className="relative flex-1">
                  <Search
                    className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors ${isSearching ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <Input
                    autoFocus
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects"
                    className="bg-muted/50 focus-visible:ring-primary h-10 w-full rounded-full border-none pl-10 focus-visible:ring-1"
                  />

                  {/* Mobile Search Results Dropdown */}
                  <AnimatePresence>
                    {searchQuery.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-background border-border/50 absolute top-full left-0 z-[100] mt-2 w-full overflow-hidden rounded-2xl border shadow-2xl"
                      >
                        <div className="max-h-[300px] overflow-y-auto p-2">
                          {searchResults.length > 0 ? (
                            <div className="grid gap-1">
                              {searchResults.map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    router.push(`/project/${project.id}`)
                                    setSearchQuery("")
                                    setIsSearchActive(false)
                                  }}
                                  className="hover:bg-primary/5 flex flex-col items-start rounded-xl p-3 text-left"
                                >
                                  <span className="text-foreground text-sm font-bold">
                                    {project.title}
                                  </span>
                                  <span className="text-muted-foreground/60 text-[10px]">
                                    {" "}
                                    storyboard{" "}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : isSearching ? (
                            <div className="text-muted-foreground/40 p-6 text-center text-[10px] font-black">
                              Searching projects...
                            </div>
                          ) : (
                            <div className="text-muted-foreground/40 p-6 text-center text-[10px] font-black">
                              No results found
                            </div>
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

        {/* MAIN PAGE CONTENT AREA */}
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>

        {/* SHARED PROJECT GENERATION DIALOG */}
        <GenerateDialog
          open={isGenerateOpen}
          onOpenChange={setIsGenerateOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
