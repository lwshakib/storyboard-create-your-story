import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { ProjectsGrid } from "@/components/home/projects-grid";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const projects = await prisma.project.findMany({
    where: {
      userId: session?.user?.id || "",
      isDeleted: false,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="flex-1 space-y-12 p-10 pt-12 pb-20 bg-background">
      {/* Welcome Section */}
      <section className="max-w-3xl">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground/90 leading-tight">
            Welcome, {session?.user?.name?.split(' ')[0] || "Storyteller"}
          </h1>
          <p className="text-muted-foreground text-xl font-medium leading-relaxed opacity-70">
            Your creative dashboard. Pick up where you left off or start a fresh storyboard.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
            <h2 className="text-sm font-bold tracking-tight text-foreground/60 uppercase tracking-[0.1em]">
                Recent Projects
            </h2>
        </div>

        <ProjectsGrid initialProjects={projects} />
      </section>
    </div>
  );
}
