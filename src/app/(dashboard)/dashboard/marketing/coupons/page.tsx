// src/app/(dashboard)/dashboard/coupons/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { CouponList } from "@/features/marketing/components/coupon-list"

export default function CouponsPage() {
  return (
    <div>
      <Breadcrumb />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes.
          </p>
        </div>

        <CouponList />
      </div>
    </div>
  )
}