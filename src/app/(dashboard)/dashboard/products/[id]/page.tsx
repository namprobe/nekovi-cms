import { Breadcrumb } from "@/features/dashboard/components/breadcrumb"
import { ProductForm } from "@/features/products/components/product-form"

interface ProductDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  // TODO: Fetch product data based on params.id
  const mockProductData = {
    name: "Naruto Uzumaki Figure",
    description: "High-quality Naruto figure with detailed craftsmanship",
    price: 29.99,
    discountPrice: 24.99,
    stockQuantity: 15,
    categoryId: "1",
    animeSeriesId: "1",
    isPreOrder: false,
    images: ["/naruto-figure.jpg"],
    tagIds: ["1", "4"], // Popular, Best Seller
  }

  return (
    <div>
      <Breadcrumb />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground">Update product information and settings.</p>
        </div>

        <ProductForm initialData={mockProductData} isEditing={true} />
      </div>
    </div>
  )
}
