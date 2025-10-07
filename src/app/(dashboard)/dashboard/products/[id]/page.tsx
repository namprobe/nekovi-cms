// src/app/(dashboard)/products/[id]/page.tsx
"use client"
import { use } from "react"
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ProductForm } from "@/features/products/components/product-form"
import { useProductDetail } from "@/features/products/hooks/use-products"
import type { CreateProductDto } from "@/entities/products/types/product"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params)
  const { item: product, loading, error } = useProductDetail(id)

  if (loading) return <div>Loading...</div>
  if (error || !product) return <div>Error: {error || "Product not found"}</div>

  // Map Product to match CreateProductDto
  const initialData: Partial<CreateProductDto> & { id?: string, productTags?: { tagId: string, tag: { id: string, name: string } | null }[] } = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    stockQuantity: product.stockQuantity,
    categoryId: product.categoryId,
    animeSeriesId: product.animeSeriesId,
    isPreOrder: product.isPreOrder,
    preOrderReleaseDate: product.preOrderReleaseDate,
    images: product.images?.map((img) => img.imagePath) || [],
    tagIds: product.productTags?.map((tag) => tag.tagId) || [],
    productTags: product.productTags?.map((tag) => ({
      tagId: tag.tagId,
      tag: tag.tag ? { id: tag.tagId, name: tag.tag.name } : null
    })) || [], // Thêm productTags
  }

  return (
    <div>
      <Breadcrumb />
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
        <p className="text-muted-foreground">Update product information and settings.</p>
        <ProductForm initialData={initialData} isEditing={true} />
      </div>
    </div>
  )
}