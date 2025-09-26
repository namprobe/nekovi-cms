import type React from "react"

import { AuthGuard } from "@/features/auth/components/auth-guard"
import { Sidebar } from "@/features/dashboard/components/sidebar"
import { Topbar } from "@/features/dashboard/components/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex bg-background">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
