"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { EditorView } from "@/components/editor/editor-view"
import AdvancedEditorPage from "@/app/advanced-editor/page"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

export default function UnifiedEditorPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Failed to fetch project", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8F9FB] dark:bg-[#0A0A0B]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Opening your storyboard...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F8F9FB] dark:bg-[#0A0A0B]">
        <div className="p-4 rounded-none bg-destructive/5 text-destructive text-sm font-bold uppercase tracking-tight">
          Project not found or failed to load.
        </div>
        <Link href="/home" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">Go back home</Link>
      </div>
    )
  }

  if (project.isDeleted) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[#F8F9FB] dark:bg-[#0A0A0B] text-center">
          <div className="size-20 bg-muted/5 flex items-center justify-center border border-black/[0.03]">
             <Trash2 className="size-10 opacity-20" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold tracking-tight">This storyboard is in the trash</h1>
            <p className="text-sm text-muted-foreground font-medium opacity-60">Restore it to continue editing or viewing.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                className="rounded-none h-11 px-8 font-black uppercase tracking-widest text-[10px]"
                onClick={() => router.push('/trash')}
             >
                Go to Trash
             </Button>
             <Button 
                className="rounded-none h-11 px-8 font-black uppercase tracking-widest text-[10px]"
                onClick={async () => {
                    const res = await fetch(`/api/projects/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isDeleted: false })
                    })
                    if (res.ok) {
                        toast.success("Project restored")
                        window.location.reload()
                    }
                }}
             >
                Restore Project
             </Button>
          </div>
        </div>
      )
  }

  if (project.type === "ADVANCED") {
    return <AdvancedEditorPage initialData={project} />
  }

  return (
    <EditorView 
      initialData={{
        id: project.id,
        title: project.title,
        slides: project.slides as any[]
      }} 
    />
  )
}
