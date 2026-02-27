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
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: string
    title: string
    slides: any
    updatedAt: Date
  }
  onDelete?: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  

  const href = `/editor/${project.id}`
  const apiPath = `/api/projects/${project.id}`

  const handleDelete = async () => {
    // 1. Optimistic Updates (Instant)
    if (onDelete) onDelete() // Removes from local grid state
    
    window.dispatchEvent(new CustomEvent('projects-updated', { 
        detail: { deletedId: project.id } 
    }))

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
        window.dispatchEvent(new Event('projects-updated'))
        toast.error("Failed to delete project")
      }
    } catch (error) {
       window.dispatchEvent(new Event('projects-updated'))
       toast.error("An error occurred")
    }
  }

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border/50 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
        <Link href={href} className="absolute inset-0 z-10" />
        {project.slides && (project.slides as any[]).length > 0 ? (
          <SlidePreview 
            html={(project.slides as any[])[0]?.html || ""} 
            autoScale 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layout className="size-8 opacity-10" />
          </div>
        )}
        

      </div>

      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex flex-col gap-1 min-w-0">
          <Link href={href} className="font-semibold text-sm tracking-tight text-foreground hover:text-primary transition-colors truncate">
            {project.title}
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground tracking-tight">
            <Clock className="size-3 opacity-70" />
            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
            <span className="opacity-30">•</span>
            <span>{(project.slides as any[]).length} slides</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0 z-20"
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold tracking-tight">Move to trash?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                You can restore this storyboard from the trash later if you change your mind.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl text-xs font-semibold h-10 px-6">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="rounded-xl text-xs font-semibold h-10 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
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
