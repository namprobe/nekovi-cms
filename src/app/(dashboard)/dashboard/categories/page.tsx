// src/app/(dashboard)/dashboard/categories/page.tsx
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { CategoryList } from "@/features/products/components/category-list"

export default function CategoriesPage() {
  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Organize your products with categories and subcategories.</p>
        </div>

        <CategoryList />
      </div>
    </div>
  )
}
