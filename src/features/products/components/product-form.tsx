"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import type { CreateProductDto } from "@/entities/products/types/product"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, Trash2 } from "lucide-react"
import { productService } from "@/entities/products/services/product"
import { AsyncSelect } from "@/shared/ui/selects/async-select"
import { useCategorySelectStore } from "@/entities/categories/services/category-select-service"
import { useAnimeSeriesSelectStore } from "@/entities/anime-series/services/anime-series-select-service"
import { AsyncMultiSelect } from "@/shared/ui/selects/async-multi-select"
import { useTagSelectStore } from "@/entities/tags/services/tag-select-service"

interface ProductFormProps {
  initialData?: Partial<CreateProductDto> & { id?: string }
  isEditing?: boolean
}

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

  // Initialize useTagSelectStore within the component
  const { fetchOptions: fetchTags } = useTagSelectStore()

  const memoizedFetchTags = useCallback(
    async (search: string) => {
      const res = await fetchTags(search)
      return res.map((item) => ({ id: item.id, label: item.name }))
    },
    [fetchTags]
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.categoryId) newErrors.categoryId = "Category is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.discountPrice && formData.discountPrice >= formData.price)
      newErrors.discountPrice = "Discount price must be less than regular price"
    if (formData.stockQuantity < 0) newErrors.stockQuantity = "Stock quantity cannot be negative"
    if (formData.isPreOrder && !formData.preOrderReleaseDate)
      newErrors.preOrderReleaseDate = "Pre-order release date is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const { fetchOptions: fetchCategories } = useCategorySelectStore()
  const { fetchOptions: fetchAnimeSeries } = useAnimeSeriesSelectStore()

  const memoizedFetchCategories = useCallback(
    async (search: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`Fetching categories with search: "${search}"`)
      }
      const res = await fetchCategories(search)
      return res.map((item) => ({ id: item.id, label: item.name }))
    },
    [fetchCategories]
  )

  const memoizedFetchAnimeSeries = useCallback(
    async (search: string) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`Fetching anime series with search: "${search}"`)
      }
      const res = await fetchAnimeSeries(search)
      return res.map((item) => ({ id: item.id, label: item.title }))
    },
    [fetchAnimeSeries]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const form = new FormData()
      form.append("name", formData.name)
      form.append("description", formData.description || "")
      form.append("price", String(formData.price))
      form.append("discountPrice", formData.discountPrice ? String(formData.discountPrice) : "")
      form.append("stockQuantity", String(formData.stockQuantity))
      form.append("categoryId", formData.categoryId)
      form.append("isPreOrder", formData.isPreOrder ? "true" : "false")
      if (formData.preOrderReleaseDate) {
        form.append("preOrderReleaseDate", new Date(formData.preOrderReleaseDate).toISOString())
      }
      formData.tagIds.forEach((tagId) => form.append("tagIds", tagId))
      imageFiles.forEach((file) => form.append("imageFiles", file))

      let res
      if (isEditing && initialData?.id) {
        res = await productService.updateProductForm(initialData.id, form)
      } else {
        res = await productService.createProductForm(form)
      }

      if (res.isSuccess) {
        router.push(ROUTES.PRODUCTS)
      } else {
        setErrors({ general: res.message || "Failed to save product" })
      }
    } catch (err: any) {
      setErrors({ general: err?.message || "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    field: keyof CreateProductDto,
    value: string | number | string[] | boolean | Date
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (imageFiles.length + files.length > 5) {
      setErrors({ images: "Cannot upload more than 5 images" })
      return
    }
    setImageFiles((prev) => [...prev, ...files])
    const newImageUrls = files.map((file) => URL.createObjectURL(file))
    handleInputChange("images", [...formData.images, ...newImageUrls])
  }

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index]
    if (imageToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove)
    }
    const newImages = formData.images.filter((_, i) => i !== index)
    const newFiles = imageFiles.filter((_, i) => i !== index)
    handleInputChange("images", newImages)
    setImageFiles(newFiles)
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      formData.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image)
        }
      })
    }
  }, [formData.images])

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
            {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}

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
                        handleInputChange("discountPrice", Number.parseFloat(e.target.value) || 0)
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
                  <AsyncSelect
                    value={formData.categoryId}
                    onChange={(val) => handleInputChange("categoryId", val)}
                    fetchOptions={memoizedFetchCategories}
                    placeholder="Select Category..."
                  />
                  {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animeSeriesId">Anime Series</Label>
                  <AsyncSelect
                    value={formData.animeSeriesId ?? ""}
                    onChange={(val) => handleInputChange("animeSeriesId", val)}
                    fetchOptions={memoizedFetchAnimeSeries}
                    placeholder="Select Anime Series..."
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="tagIds" className="text-[hsl(var(--foreground))]">
                    Tags
                  </Label>
                  <AsyncMultiSelect
                    value={formData.tagIds}
                    onChange={(val) => handleInputChange("tagIds", val)}
                    fetchOptions={memoizedFetchTags}
                    placeholder="Select Tags..."
                    className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
                    tagClassName="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-[hsl(var(--border))]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Product Images</Label>
                  <div className="flex items-center space-x-4">
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Images
                    </label>
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
                      Upload up to 5 images. The first image will be the primary image.
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}