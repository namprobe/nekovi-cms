import { PaymentMethodForm } from "@/features/payment-methods/components/payment-method-form"

export default function CreatePaymentMethodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Payment Method</h1>
        <p className="text-muted-foreground">Add a new payment method to your store</p>
      </div>
      <PaymentMethodForm />
    </div>
  )
}
