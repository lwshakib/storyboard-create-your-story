import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { ProjectsGrid } from "@/components/home/projects-grid"
import Link from "next/link"

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const projects = await prisma.project.findMany({
    where: {
      userId: session?.user?.id || "",
      isDeleted: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  const allProjects = projects.map((p) => ({
    ...p,
    projectType: "advanced",
  }))

  return (
    <div className="bg-background flex-1 space-y-12 p-10 pt-12 pb-20">
      {/* Welcome Section */}
      <section className="max-w-3xl">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground/90 text-4xl leading-tight font-bold tracking-tight">
            Welcome, {session?.user?.name?.split(" ")[0] || "Storyteller"}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed font-medium opacity-70">
            Your creative dashboard. Pick up where you left off or start a fresh
            storyboard.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="space-y-8">
        <div className="border-border/50 flex items-center justify-between border-b pb-6">
          <h2 className="text-foreground/60 text-sm font-bold tracking-tight">
            Recent projects
          </h2>
        </div>

        <ProjectsGrid initialProjects={allProjects} />
      </section>
    </div>
  )
}
