// src/app/(dashboard)/products/[id]/page.tsx
"use client"

import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ViewProductDetail } from "@/features/products/components/view-product-detail"

interface ProductViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductViewPage({ params }: ProductViewPageProps) {
  const { id } = use(params)

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Product Detail</h1>
        <p className="text-muted-foreground">View product information and related details.</p>
        <ViewProductDetail productId={id} />
      </div>
    </div>
  )
}