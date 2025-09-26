"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { CreateProductDto } from "@/entities/products/types/product"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, Trash2 } from "lucide-react"

interface ProductFormProps {
  initialData?: Partial<CreateProductDto>
  isEditing?: boolean
}

const mockCategories = [
  { id: "1", name: "Figures" },
  { id: "2", name: "Nendoroids" },
  { id: "3", name: "Statues" },
  { id: "4", name: "Posters" },
  { id: "5", name: "Keychains" },
]

const mockAnimeSeries = [
  { id: "1", title: "Naruto" },
  { id: "2", title: "One Piece" },
  { id: "3", title: "Attack on Titan" },
  { id: "4", title: "Dragon Ball Z" },
  { id: "5", title: "My Hero Academia" },
]

const mockTags = [
  { id: "1", name: "Popular" },
  { id: "2", name: "Limited Edition" },
  { id: "3", name: "New Release" },
  { id: "4", name: "Best Seller" },
  { id: "5", name: "Collectible" },
]

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateProductDto>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    discountPrice: initialData?.discountPrice || undefined,
    stockQuantity: initialData?.stockQuantity || 0,
    categoryId: initialData?.categoryId || "",
    animeSeriesId: initialData?.animeSeriesId || "",
    isPreOrder: initialData?.isPreOrder || false,
    preOrderReleaseDate: initialData?.preOrderReleaseDate || undefined,
    images: initialData?.images || [],
    tagIds: initialData?.tagIds || [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    if (formData.discountPrice && formData.discountPrice >= formData.price) {
      newErrors.discountPrice = "Discount price must be less than regular price"
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative"
    }

    if (formData.isPreOrder && !formData.preOrderReleaseDate) {
      newErrors.preOrderReleaseDate = "Pre-order release date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement API call with image upload
      // const formDataWithImages = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (value !== undefined) {
      //     formDataWithImages.append(key, value.toString());
      //   }
      // });
      // imageFiles.forEach((file, index) => {
      //   formDataWithImages.append(`images[${index}]`, file);
      // });

      // const response = isEditing
      //   ? await apiClient.put(`/products/${productId}`, formDataWithImages)
      //   : await apiClient.post('/products', formDataWithImages);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(ROUTES.PRODUCTS)
    } catch (err) {
      setErrors({ general: "Failed to save product. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateProductDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
  }

  const handleTagChange = (tagId: string, checked: boolean) => {
    const newTagIds = checked ? [...formData.tagIds, tagId] : formData.tagIds.filter((id) => id !== tagId)

    handleInputChange("tagIds", newTagIds)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImageFiles((prev) => [...prev, ...files])

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file))
    handleInputChange("images", [...formData.images, ...newImageUrls])
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    const newFiles = imageFiles.filter((_, i) => i !== index)

    handleInputChange("images", newImages)
    setImageFiles(newFiles)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Product" : "Create New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                      disabled={isLoading}
                    />
                    {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountPrice || ""}
                      onChange={(e) =>
                        handleInputChange("discountPrice", Number.parseFloat(e.target.value) || undefined)
                      }
                      disabled={isLoading}
                    />
                    {errors.discountPrice && <p className="text-sm text-red-600">{errors.discountPrice}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange("stockQuantity", Number.parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                  {errors.stockQuantity && <p className="text-sm text-red-600">{errors.stockQuantity}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleInputChange("categoryId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animeSeriesId">Anime Series</Label>
                  <Select
                    value={formData.animeSeriesId}
                    onValueChange={(value) => handleInputChange("animeSeriesId", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an anime series" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAnimeSeries.map((series) => (
                        <SelectItem key={series.id} value={series.id}>
                          {series.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPreOrder"
                      checked={formData.isPreOrder}
                      onCheckedChange={(checked) => handleInputChange("isPreOrder", checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="isPreOrder">This is a pre-order item</Label>
                  </div>

                  {formData.isPreOrder && (
                    <div className="space-y-2">
                      <Label htmlFor="preOrderReleaseDate">Release Date *</Label>
                      <Input
                        id="preOrderReleaseDate"
                        type="date"
                        value={
                          formData.preOrderReleaseDate
                            ? new Date(formData.preOrderReleaseDate).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => handleInputChange("preOrderReleaseDate", new Date(e.target.value))}
                        disabled={isLoading}
                      />
                      {errors.preOrderReleaseDate && (
                        <p className="text-sm text-red-600">{errors.preOrderReleaseDate}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mockTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={formData.tagIds.includes(tag.id)}
                        onCheckedChange={(checked) => handleTagChange(tag.id, checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={tag.id} className="text-sm font-normal">
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Product Images</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Images
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload up to 5 images. First image will be the primary image.
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Primary</span>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push(ROUTES.PRODUCTS)} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
