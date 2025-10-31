// src/app/(dashboard)/dashboard/users/[id]/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ViewUserDetail } from "@/features/user/components/view-user-detail"

interface UserViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserViewPage({ params }: UserViewPageProps) {
  const { id } = use(params)

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">User Detail</h1>
        <p className="text-muted-foreground">View user information and related details.</p>
        <ViewUserDetail userId={id} />
      </div>
    </div>
  )
}