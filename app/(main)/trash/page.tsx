"use client"

import * as React from "react"
import {
  Trash2,
  RefreshCcw,
  Clock,
  Layout,
  CheckCircle2,
  Circle,
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

interface TrashProject {
  id: string
  title: string
  slides: { html?: string }[]
  updatedAt: string
  deletedAt?: string
  type?: string
  projectType: string
}

export default function TrashPage() {
  const [projects, setProjects] = React.useState<TrashProject[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const fetchTrash = async () => {
    try {
      const res = await fetch("/api/projects?deleted=true")

      if (res.ok) {
        const data = await res.json()

        const combined = data
          .map((p: TrashProject) => ({
            ...p,
            projectType: p.type === "ADVANCED" ? "advanced" : "standard",
          }))
          .sort(
            (a: TrashProject, b: TrashProject) =>
              new Date(b.deletedAt || b.updatedAt).getTime() -
              new Date(a.deletedAt || a.updatedAt).getTime()
          )

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
        window.dispatchEvent(new Event("projects-updated"))
        setProjects(projects.filter((p) => p.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch (_error) {
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
        window.dispatchEvent(new Event("projects-updated"))
        setProjects(projects.filter((p) => p.id !== id))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch (_error) {
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
        window.dispatchEvent(new Event("projects-updated"))
        setProjects([])
        setSelectedIds(new Set())
      }
    } catch (_error) {
      toast.error("Failed to empty trash")
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    toast.promise(
      Promise.all(
        ids.map((id) => {
          return fetch(`/api/projects/${id}`, { method: "DELETE" })
        })
      ),
      {
        loading: "Deleting selected items...",
        success: () => {
          window.dispatchEvent(new Event("projects-updated"))
          setProjects(projects.filter((p) => !selectedIds.has(p.id)))
          setSelectedIds(new Set())
          return "Items permanently deleted"
        },
        error: "Some items failed to delete",
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
      setSelectedIds(new Set(projects.map((p) => p.id)))
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 opacity-40">
        <Clock className="text-primary mb-4 size-10 animate-spin" />
        <p className="text-sm font-bold tracking-tight">Loading trash...</p>
      </div>
    )
  }

  return (
    <div className="bg-background flex-1 space-y-12 p-10 pt-12 pb-20">
      {/* Header Section */}
      <section className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground/90 text-4xl font-extrabold tracking-tight">
            Trash
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed font-medium opacity-80">
            Items in the trash will be deleted permanently when you empty it.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="h-10 rounded-xl px-6 text-xs font-semibold shadow-sm"
                  >
                    Delete Permanent ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold tracking-tight">
                      Delete {selectedIds.size} storyboards?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-sm">
                      This action is irreversible. Selected items will be
                      removed from your account forever.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-10 rounded-xl px-6 text-xs font-semibold">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 rounded-xl px-6 text-xs font-semibold shadow-sm"
                    >
                      Delete Permanent
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border/50 hover:bg-muted/50 h-10 rounded-xl px-6 text-xs font-semibold shadow-sm transition-colors"
                  >
                    Empty Trash
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold tracking-tight">
                      Empty Trash?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-sm">
                      Every storyboard currently in the trash will be
                      permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="h-10 rounded-xl px-6 text-xs font-semibold">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleEmptyTrash}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 rounded-xl px-6 text-xs font-semibold shadow-sm"
                    >
                      Empty Trash
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </section>

      {/* Projects Grid */}
      <section className="space-y-8">
        <div className="border-border/50 flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectAll}
              className="hover:bg-muted/50 group flex h-8 items-center gap-2 rounded-lg px-2 transition-colors"
            >
              {selectedIds.size === projects.length && projects.length > 0 ? (
                <CheckCircle2 className="text-primary size-4" />
              ) : (
                <Circle className="size-4 opacity-20 group-hover:opacity-40" />
              )}
              <span className="text-muted-foreground/70 text-xs font-semibold">
                {selectedIds.size === projects.length
                  ? "Deselect All"
                  : "Select All"}
              </span>
            </Button>
          </div>
          <h2 className="text-muted-foreground/40 text-xs font-bold tabular-nums">
            {projects.length} {projects.length === 1 ? "item" : "items"} in
            trash
          </h2>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col gap-4"
              >
                {/* Select Overlay */}
                <button
                  onClick={() => toggleSelect(project.id)}
                  className={cn(
                    "bg-background/90 border-border/50 absolute top-3 left-3 z-30 flex size-7 items-center justify-center rounded-lg border shadow-md backdrop-blur-md transition-all",
                    selectedIds.has(project.id)
                      ? "scale-100 opacity-100"
                      : "scale-90 opacity-0 group-hover:opacity-100"
                  )}
                >
                  {selectedIds.has(project.id) ? (
                    <CheckCircle2 className="text-primary size-4" />
                  ) : (
                    <Circle className="size-4 opacity-40" />
                  )}
                </button>

                <div className="bg-muted/20 border-border/40 group-hover:border-primary/20 relative aspect-video overflow-hidden rounded-xl border transition-all">
                  <div className="bg-background/40 absolute inset-0 z-10 opacity-60 backdrop-grayscale-[0.5]" />
                  {project.projectType === "advanced" ? (
                    <SlidePreview
                      html={(project.slides as { html?: string }[])[0]?.html || ""}
                      autoScale
                    />
                  ) : project.slides && (project.slides as { html?: string }[]).length > 0 ? (
                    <SlidePreview
                      html={(project.slides as { html?: string }[])[0]?.html || ""}
                      autoScale
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Layout className="size-8 opacity-5" />
                    </div>
                  )}

                  {/* Badge Overlay */}
                  <div className="pointer-events-none absolute top-2 right-2 z-20">
                    <div
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase",
                        project.projectType === "advanced"
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                          : "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      {project.projectType === "advanced"
                        ? "Advanced"
                        : "Project"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 px-1">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-foreground/60 group-hover:text-foreground/80 truncate text-sm font-semibold tracking-tight transition-colors">
                      {project.title}
                    </h3>
                    <div className="text-muted-foreground/50 flex items-center gap-2 text-[11px] font-medium tracking-tight">
                      <Clock className="size-3 opacity-60" />
                      <span>
                        Deleted{" "}
                        {formatDistanceToNow(
                          new Date(project.deletedAt || project.updatedAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary size-8 rounded-lg transition-colors"
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
                          className="hover:bg-destructive/10 hover:text-destructive size-8 rounded-lg transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-border rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-bold tracking-tight">
                            Delete permanently?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground text-sm">
                            This storyboard will be removed from the server.
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="h-10 rounded-xl px-6 text-xs font-semibold">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePermanent(project.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 rounded-xl px-6 text-xs font-semibold shadow-sm"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-[40px] border border-dashed py-40 text-center">
            <div className="bg-muted/30 text-muted-foreground/20 flex size-20 items-center justify-center rounded-2xl">
              <Trash2 className="size-10" />
            </div>
            <div className="space-y-2">
              <p className="text-foreground/40 text-sm font-bold tracking-tight">
                Trash is empty
              </p>
              <p className="text-muted-foreground/40 mx-auto max-w-xs text-xs leading-relaxed font-medium tracking-tight">
                Deleted storyboards will appear here. You can restore them
                anytime or delete them forever.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
