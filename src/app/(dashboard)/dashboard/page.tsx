// src/app/(dashboard)/dashboard/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
// import { OrderStats } from "@/features/orders/components/order-stats" // Có thể bỏ nếu đã tích hợp trong DashboardContent hoặc giữ lại nếu muốn hiển thị riêng
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