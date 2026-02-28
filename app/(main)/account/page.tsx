"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { LogOut, Shield, User, Key } from "lucide-react"

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [isUpdatingName, setIsUpdatingName] = React.useState(false)

  React.useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  if (isPending) return <div>Loading...</div>
  if (!session) {
    router.push("/login")
    return null
  }

  const handleUpdateName = async () => {
    setIsUpdatingName(true)
    try {
      await authClient.updateUser({
        name: name,
      })
      toast.success("Name updated successfully")
    } catch (error) {
      toast.error("Failed to update name")
    } finally {
      setIsUpdatingName(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
          <div className="space-y-0.5">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Account Settings
            </h2>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Separator />

          <div className="grid gap-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="text-primary size-5" />
                  <CardTitle>Profile</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" value={session.user.email} disabled />
                  <p className="text-muted-foreground text-xs">
                    Email cannot be changed.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={handleUpdateName}
                  disabled={isUpdatingName || name === session.user.name}
                >
                  {isUpdatingName ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="text-primary size-5" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Manage your password and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="old-password">Current Password</Label>
                    <Input
                      id="old-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const oldPassword = (
                      document.getElementById(
                        "old-password"
                      ) as HTMLInputElement
                    ).value
                    const newPassword = (
                      document.getElementById(
                        "new-password"
                      ) as HTMLInputElement
                    ).value
                    if (!oldPassword || !newPassword) {
                      toast.error("Please fill in both password fields")
                      return
                    }
                    try {
                      await authClient.changePassword({
                        newPassword,
                        currentPassword: oldPassword,
                        revokeOtherSessions: true,
                      })
                      toast.success("Password changed successfully")
                      // @ts-ignore
                      document.getElementById("old-password").value = ""
                      // @ts-ignore
                      document.getElementById("new-password").value = ""
                    } catch (error) {
                      toast.error("Failed to change password")
                    }
                  }}
                >
                  Update Password
                </Button>
              </CardFooter>
            </Card>

            {/* Sessions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LogOut className="text-primary size-5" />
                  <CardTitle>Active Sessions</CardTitle>
                </div>
                <CardDescription>
                  Manage your active sessions and devices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionsList />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function SessionsList() {
  const [sessions, setSessions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { data: currentSession } = authClient.useSession()

  const fetchSessions = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await authClient.listSessions()
      if (res.data) {
        setSessions(res.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  if (isLoading) return <div>Loading sessions...</div>

  const handleRevoke = async (token: string) => {
    try {
      await authClient.revokeSession({
        token: token,
      })
      toast.success("Session revoked")
      fetchSessions()
    } catch (error) {
      toast.error("Failed to revoke session")
    }
  }

  return (
    <div className="space-y-4">
      {sessions?.map((session: any) => (
        <div
          key={session.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {session.userAgent || "Unknown Device"}
              </span>
              {session.token === currentSession?.session?.token && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              IP: {session.ipAddress || "Unknown"} • Last active:{" "}
              {new Date(session.updatedAt).toLocaleDateString()}
            </p>
          </div>
          {session.token !== currentSession?.session?.token && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRevoke(session.token)}
            >
              Revoke
            </Button>
          )}
        </div>
      ))}
      {sessions?.length === 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No other active sessions.
        </p>
      )}
    </div>
  )
}
