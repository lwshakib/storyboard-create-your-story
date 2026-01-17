"use client"

import * as React from "react"
import { ProjectCard } from "./project-card"
import Link from "next/link"

interface ProjectsGridProps {
  initialProjects: any[]
}

export function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  // Use state to manage projects locally for optimistic updates
  const [projects, setProjects] = React.useState(initialProjects)

  // Update local state when initialProjects change (e.g. after router.refresh())
  React.useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleOptimisticDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border/40 gap-6 text-center rounded-3xl bg-muted/5">
        <p className="font-semibold text-sm tracking-tight text-foreground/40">No storyboards yet</p>
        <Link href="/new" className="text-sm font-semibold tracking-tight text-primary hover:text-primary/70 transition-colors">
            Create your first project →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-16">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onDelete={() => handleOptimisticDelete(project.id)}
        />
      ))}
    </div>
  )
}
