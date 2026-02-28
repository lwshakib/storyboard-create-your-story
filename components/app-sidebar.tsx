"use client"

import * as React from "react"
import { Home, LayoutTemplate, Trash2, Settings } from "lucide-react"

import { LogoIcon } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const navMain = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: Trash2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

// Helper to construct project URL - check if we're in editor or project view
const getProjectUrl = (id: string) => `/editor/${id}`

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [recentProjects, setRecentProjects] = React.useState<
    { name: string; url: string }[]
  >([])

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          // Take first 5 projects
          const recent = data
            .slice(0, 5)
            .map((p: { title: string; id: string }) => ({
              name: p.title,
              url: getProjectUrl(p.id),
            }))
          setRecentProjects(recent)
        }
      } catch (error) {
        console.error("Failed to fetch recent projects:", error)
      }
    }

    fetchProjects()

    // Listen for project updates to refresh the list
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ deletedId?: string }>
      // Optimistic delete: if an ID is provided, remove it from state instantly
      if (customEvent.detail?.deletedId) {
        setRecentProjects((prev) =>
          prev.filter((p) => !p.url.includes(customEvent.detail.deletedId!))
        )
      } else {
        fetchProjects()
      }
    }

    window.addEventListener("projects-updated", handleUpdate)
    return () => window.removeEventListener("projects-updated", handleUpdate)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-default hover:bg-transparent active:bg-transparent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <LogoIcon className="text-primary size-6" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-foreground truncate text-lg font-bold tracking-tight">
                  Storyboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={recentProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
