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

import { UserAvatar } from "@/components/user-avatar"
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
              <UserAvatar
                user={user}
                className="h-8 w-8 rounded-lg border border-border/50"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium tracking-tight">
                  {user.name}
                </span>
                <span className="truncate text-xs opacity-50">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-popover text-popover-foreground border-border w-64 rounded-xl border p-2 shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar user={user} className="h-8 w-8 rounded-lg border border-border/50" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium tracking-tight">
                    {user.name}
                  </span>
                  <span className="truncate text-xs opacity-50">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/billing")}
                className="cursor-pointer rounded-lg font-medium"
              >
                <Sparkles className="mr-2 h-4 w-4 opacity-40" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/account")}
                className="cursor-pointer rounded-lg font-medium"
              >
                <BadgeCheck className="mr-2 h-4 w-4 opacity-40" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/billing")}
                className="cursor-pointer rounded-lg font-medium"
              >
                <CreditCard className="mr-2 h-4 w-4 opacity-40" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/notifications")}
                className="cursor-pointer rounded-lg font-medium"
              >
                <Bell className="mr-2 h-4 w-4 opacity-40" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-lg font-medium"
            >
              <LogOut className="mr-2 h-4 w-4 opacity-40" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
