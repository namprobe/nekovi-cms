"use client"

import { ShippingMethodForm } from "@/features/shipping-methods/components/shipping-method-form"
import { useParams } from "next/navigation"

export default function EditShippingMethodPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Shipping Method</h1>
        <p className="text-muted-foreground">Update shipping method details</p>
      </div>
      <ShippingMethodForm initialData={{ id }} isEditing />
    </div>
  )
}
