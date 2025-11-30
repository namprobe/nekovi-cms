//src/app/(dashboard)/dashboard/products/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import ProductList from "@/features/products/components/product-list"

export default function ProductsPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your anime merchandise and collectibles.</p>
        </div>

        <ProductList />
      </div>
    </div>
  )
}
