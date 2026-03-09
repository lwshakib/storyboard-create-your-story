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

/**
 * STATIC NAVIGATION DEFINITION: Core application routes.
 */
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

const getProjectUrl = (id: string) => `/project/${id}`

/**
 * AppSidebar: The primary shell navigation component.
 * Features:
 * - Dynamic Data: Fetches and displays the user's recent projects.
 * - Reactive: Listens for 'projects-updated' events to refresh the project list without a full page reload.
 * - Responsive: Collapses to icons on smaller viewports or when toggled.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [recentProjects, setRecentProjects] = React.useState<
    { name: string; url: string }[]
  >([])

  // FETCH LOGIC: Retrieves recent projects from the API
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
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

    // EVENT BUS HANDLER: Refreshes projects when other parts of the app modify them.
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ deletedId?: string }>

      // Optimistic delete: if an ID is provided, remove it from state instantly to improve UX.
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
      {/* HEADER: Branding & App Logo */}
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

      {/* CONTENT: Main & Project Navigation */}
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={recentProjects} />
      </SidebarContent>

      {/* FOOTER: User Account Management */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
