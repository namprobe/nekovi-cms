import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ProductForm } from "@/features/products/components/product-form"

export default function CreateProductPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Product</h1>
          <p className="text-muted-foreground">Add a new product to your catalog.</p>
        </div>

        <ProductForm />
      </div>
    </div>
  )
}
