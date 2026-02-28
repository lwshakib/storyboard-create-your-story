"use client"

import * as React from "react"
import Link from "next/link"
import { Trash2, Clock, Layout } from "lucide-react"
import { SlidePreview } from "@/components/editor/slide-preview"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
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


interface ProjectCardProps {
  project: {
    id: string
    title: string
    slides: { html?: string }[]
    updatedAt: Date
  }
  onDelete?: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting] = React.useState(false)

  const href = `/editor/${project.id}`
  const apiPath = `/api/projects/${project.id}`

  const handleDelete = async () => {
    // 1. Optimistic Updates (Instant)
    if (onDelete) onDelete() // Removes from local grid state

    window.dispatchEvent(
      new CustomEvent("projects-updated", {
        detail: { deletedId: project.id },
      })
    )

    try {
      // 2. Background API call
      const res = await fetch(apiPath, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Project moved to trash")
        router.refresh()
      } else {
        // Rollback if needed (re-fetch)
        window.dispatchEvent(new Event("projects-updated"))
        toast.error("Failed to delete project")
      }
    } catch (_error) {
      window.dispatchEvent(new Event("projects-updated"))
      toast.error("An error occurred")
    }
  }

  return (
    <div className="group flex flex-col gap-3">
      <div className="bg-muted/30 border-border/50 hover:border-primary/20 hover:shadow-primary/5 relative aspect-video overflow-hidden rounded-lg border transition-all hover:shadow-lg">
        <Link href={href} className="absolute inset-0 z-10" />
        {project.slides && (project.slides as { html?: string }[]).length > 0 ? (
          <SlidePreview
            html={(project.slides as { html?: string }[])[0]?.html || ""}
            autoScale
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Layout className="size-8 opacity-10" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={href}
            className="text-foreground hover:text-primary truncate text-sm font-semibold tracking-tight transition-colors"
          >
            {project.title}
          </Link>
          <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-tight">
            <Clock className="size-3 opacity-70" />
            <span>
              {formatDistanceToNow(new Date(project.updatedAt), {
                addSuffix: true,
              })}
            </span>
            <span className="opacity-30">•</span>
            <span>{(project.slides as { html?: string }[]).length} slides</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive z-20 size-8 shrink-0 rounded-lg opacity-0 transition-all group-hover:opacity-100"
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-border rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold tracking-tight">
                Move to trash?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                You can restore this storyboard from the trash later if you
                change your mind.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-10 rounded-xl px-6 text-xs font-semibold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 rounded-xl px-6 text-xs font-semibold shadow-sm"
              >
                Move to Trash
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
