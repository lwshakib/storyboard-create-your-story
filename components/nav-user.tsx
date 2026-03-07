"use client"

import * as React from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

/**
 * NavUser: Displays the current session's user profile in the sidebar.
 * Features:
 * - Dynamic Profile: Pulls user name, email, and avatar from authClient.
 * - Quick Actions: Menu for account settings, billing, and notifications.
 * - Logout Flow: Securely terminates the session and redirects to sign-in.
 */
export function NavUser() {
  const { isMobile } = useSidebar()
  const session = authClient.useSession()
  const router = useRouter()

  const user = session.data?.user

  // Ensure nothing is rendered if no user session is present
  if (!user) return null

  /**
   * Secure Sign-out: Terminate session and cleanup local state.
   */
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in")
        },
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-black/5">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="bg-primary/5 text-primary rounded-lg font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight">{user.name}</span>
                <span className="truncate text-xs opacity-50">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) bg-background/95 min-w-56 rounded-xl border-none p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="bg-primary/5 text-primary rounded-lg font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">{user.name}</span>
                  <span className="truncate text-xs opacity-50">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="opacity-50" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => router.push("/billing")}
                className="hover:bg-primary/5 hover:text-primary cursor-pointer rounded-lg font-bold transition-all"
              >
                <Sparkles className="text-primary mr-2 h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="opacity-50" />
            
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer rounded-lg font-medium">
                <BadgeCheck className="mr-2 h-4 w-4 opacity-40" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/billing")} className="cursor-pointer rounded-lg font-medium">
                <CreditCard className="mr-2 h-4 w-4 opacity-40" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notifications")} className="cursor-pointer rounded-lg font-medium">
                <Bell className="mr-2 h-4 w-4 opacity-40" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="opacity-50" />
            
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
