// src/app/(dashboard)/dashboard/users/[id]/edit/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { UserForm } from "@/features/user/components/user-form"

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params)

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
        <p className="text-muted-foreground">Update user information and permissions.</p>
        <UserForm mode="edit" userId={id} />
      </div>
    </div>
  )
}