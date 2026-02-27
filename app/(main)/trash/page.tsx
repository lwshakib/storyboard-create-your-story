"use client"

import * as React from "react"
import { 
  Trash2, 
  RefreshCcw, 
  Clock, 
  Layout, 
  MoreVertical,
  CheckCircle2,
  Circle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlidePreview } from "@/components/editor/slide-preview"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export default function TrashPage() {
  const [projects, setProjects] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const router = useRouter()

  const fetchTrash = async () => {
    try {
      const res = await fetch("/api/projects?deleted=true")

      if (res.ok) {
        const data = await res.json()

        const combined = data.map((p: any) => ({ 
            ...p, 
            projectType: p.type === "ADVANCED" ? 'advanced' : 'standard' 
        })).sort((a: any, b: any) => new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime())

        setProjects(combined)
      }
    } catch (error) {
      console.error("Failed to fetch trash", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTrash()
  }, [])

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      })

      if (res.ok) {
        toast.success("Project restored")
        window.dispatchEvent(new Event('projects-updated'))
        setProjects(projects.filter(p => p.id !== id))
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
      }
    } catch (error) {
      toast.error("Failed to restore project")
    }
  }

  const handleDeletePermanent = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Project permanently deleted")
        window.dispatchEvent(new Event('projects-updated'))
        setProjects(projects.filter(p => p.id !== id))
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
      }
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const handleEmptyTrash = async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Trash emptied")
        window.dispatchEvent(new Event('projects-updated'))
        setProjects([])
        setSelectedIds(new Set())
      }
    } catch (error) {
      toast.error("Failed to empty trash")
    }
  }

  const handleBulkDelete = async () => {
      const ids = Array.from(selectedIds)
      if (ids.length === 0) return

      toast.promise(
          Promise.all(ids.map(id => {
              return fetch(`/api/projects/${id}`, { method: "DELETE" })
          })),
          {
              loading: 'Deleting selected items...',
              success: () => {
                  window.dispatchEvent(new Event('projects-updated'))
                  setProjects(projects.filter(p => !selectedIds.has(p.id)))
                  setSelectedIds(new Set())
                  return 'Items permanently deleted'
              },
              error: 'Some items failed to delete'
          }
      )
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(projects.map(p => p.id)))
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
        <Clock className="size-10 animate-spin mb-4 text-primary" />
        <p className="font-bold text-sm tracking-tight">Loading trash...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-12 p-10 pt-12 pb-20 bg-background">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90">Trash</h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed opacity-80 max-w-2xl">
            Items in the trash will be deleted permanently when you empty it.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 ? (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-xl h-10 px-6 font-semibold text-xs shadow-sm">
                            Delete Permanent ({selectedIds.size})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-bold tracking-tight">Delete {selectedIds.size} storyboards?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-muted-foreground">
                                This action is irreversible. Selected items will be removed from your account forever.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl text-xs font-semibold h-10 px-6">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDelete} className="rounded-xl text-xs font-semibold h-10 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">Delete Permanent</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="rounded-xl h-10 px-6 font-semibold text-xs border-border/50 hover:bg-muted/50 transition-colors shadow-sm">
                            Empty Trash
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-bold tracking-tight">Empty Trash?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-muted-foreground">
                                Every storyboard currently in the trash will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl text-xs font-semibold h-10 px-6">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEmptyTrash} className="rounded-xl text-xs font-semibold h-10 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">Empty Trash</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        )}
      </section>

      {/* Projects Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleSelectAll} 
                    className="h-8 rounded-lg hover:bg-muted/50 px-2 flex items-center gap-2 group transition-colors"
                >
                    {selectedIds.size === projects.length && projects.length > 0 ? (
                        <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                        <Circle className="size-4 opacity-20 group-hover:opacity-40" />
                    )}
                    <span className="text-xs font-semibold text-muted-foreground/70">
                        {selectedIds.size === projects.length ? "Deselect All" : "Select All"}
                    </span>
                </Button>
            </div>
            <h2 className="text-xs font-bold text-muted-foreground/40 tabular-nums">
                {projects.length} {projects.length === 1 ? 'item' : 'items'} in trash
            </h2>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-12">
            {projects.map((project) => (
              <div key={project.id} className="group relative flex flex-col gap-4">
                {/* Select Overlay */}
                <button 
                    onClick={() => toggleSelect(project.id)}
                    className={cn(
                        "absolute top-3 left-3 z-30 size-7 bg-background/90 backdrop-blur-md rounded-lg border border-border/50 flex items-center justify-center transition-all shadow-md",
                        selectedIds.has(project.id) ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90"
                    )}
                >
                    {selectedIds.has(project.id) ? (
                        <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                        <Circle className="size-4 opacity-40" />
                    )}
                </button>

                <div className="relative aspect-video bg-muted/20 rounded-xl overflow-hidden border border-border/40 transition-all group-hover:border-primary/20">
                    <div className="absolute inset-0 z-10 bg-background/40 backdrop-grayscale-[0.5] opacity-60" />
                    {project.projectType === 'advanced' ? (
                        <SlidePreview 
                          html={(project.slides as any[])[0]?.html || ""} 
                          autoScale 
                        />
                    ) : project.slides && (project.slides as any[]).length > 0 ? (
                      <SlidePreview html={(project.slides as any[])[0]?.html || ""} autoScale />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Layout className="size-8 opacity-5" />
                        </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-2 right-2 z-20 pointer-events-none">
                       <div className={cn(
                         "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                         project.projectType === 'advanced' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                       )}>
                         {project.projectType === 'advanced' ? "Advanced" : "Project"}
                       </div>
                    </div>
                </div>

                <div className="flex items-start justify-between gap-3 px-1">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-semibold text-sm tracking-tight text-foreground/60 truncate transition-colors group-hover:text-foreground/80">
                            {project.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/50 tracking-tight">
                            <Clock className="size-3 opacity-60" />
                            <span>Deleted {formatDistanceToNow(new Date(project.deletedAt || project.updatedAt), { addSuffix: true })}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => handleRestore(project.id)}
                            title="Restore"
                        >
                            <RefreshCcw className="size-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    title="Delete Permanently"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-bold tracking-tight">Delete permanently?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm text-muted-foreground">
                                        This storyboard will be removed from the server. This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl text-xs font-semibold h-10 px-6">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePermanent(project.id)} className="rounded-xl text-xs font-semibold h-10 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">Delete Forever</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-border/40 gap-6 text-center rounded-[40px] bg-muted/5">
            <div className="size-20 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground/20">
                <Trash2 className="size-10" />
            </div>
            <div className="space-y-2">
                <p className="font-bold text-sm tracking-tight text-foreground/40">Trash is empty</p>
                <p className="text-xs font-medium tracking-tight text-muted-foreground/40 max-w-xs mx-auto leading-relaxed">
                  Deleted storyboards will appear here. You can restore them anytime or delete them forever.
                </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
