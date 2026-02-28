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
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }

  if (projects.length === 0) {
    return (
      <div className="border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed py-32 text-center">
        <p className="text-foreground/40 text-sm font-semibold tracking-tight">
          No storyboards yet
        </p>
        <Link
          href="/new"
          className="text-primary hover:text-primary/70 text-sm font-semibold tracking-tight transition-colors"
        >
          Create your first project →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
