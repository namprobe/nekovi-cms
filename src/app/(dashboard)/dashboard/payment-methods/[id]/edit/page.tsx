"use client"

import { PaymentMethodForm } from "@/features/payment-methods/components/payment-method-form"
import { useParams } from "next/navigation"

export default function EditPaymentMethodPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Payment Method</h1>
        <p className="text-muted-foreground">Update payment method details</p>
      </div>
      <PaymentMethodForm initialData={{ id }} isEditing />
    </div>
  )
}
