// src/app/(dashboard)/dashboard/reports/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ReportDashboard } from "@/features/reports/components/report"

export default function ReportsPage() {
  return (
    <div>
      <Breadcrumb />
      <div className="mt-6">
        <ReportDashboard />
      </div>
    </div>
  )
}