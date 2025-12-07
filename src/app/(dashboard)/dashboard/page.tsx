// src/app/(dashboard)/dashboard/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { Dashboard } from "@/features/dashboard/components/dashboard"

export default function DashboardPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="mt-6">
        <Dashboard />
      </div>
    </div>
  )
}