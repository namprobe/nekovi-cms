import { ShippingMethodForm } from "@/features/shipping-methods/components/shipping-method-form"

export default function CreateShippingMethodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Shipping Method</h1>
        <p className="text-muted-foreground">Add a new shipping method to your store</p>
      </div>
      <ShippingMethodForm />
    </div>
  )
}
