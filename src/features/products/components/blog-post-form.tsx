"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { CreateBlogPostDto } from "@/shared/types/blog"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, Trash2, Eye } from "lucide-react"

interface BlogPostFormProps {
  initialData?: Partial<CreateBlogPostDto>
  isEditing?: boolean
}

const mockCategories = [
  { id: "1", name: "Reviews" },
  { id: "2", name: "Guides" },
  { id: "3", name: "News" },
  { id: "4", name: "Events" },
  { id: "5", name: "Tutorials" },
]

const mockTags = [
  { id: "1", name: "Anime" },
  { id: "2", name: "Figures" },
  { id: "3", name: "Collectibles" },
  { id: "4", name: "Reviews" },
  { id: "5", name: "News" },
  { id: "6", name: "Guides" },
]

export function BlogPostForm({ initialData, isEditing = false }: BlogPostFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateBlogPostDto>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    postCategoryId: initialData?.postCategoryId || "",
    publishDate: initialData?.publishDate || new Date(),
    isPublished: initialData?.isPublished || false,
    featuredImagePath: initialData?.featuredImagePath || "",
    tagIds: initialData?.tagIds || [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null) // Used for image upload
  const [previewMode, setPreviewMode] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    }

    if (formData.content.trim().length < 50) {
      newErrors.content = "Content must be at least 50 characters long"
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
      console.log('Image file for upload:', imageFile) // Temporary log to use imageFile
      // const formDataWithImage = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (value !== undefined) {
      //     if (key === 'tagIds') {
      //       formDataWithImage.append(key, JSON.stringify(value));
      //     } else {
      //       formDataWithImage.append(key, value.toString());
      //     }
      //   }
      // });
      // if (imageFile) {
      //   formDataWithImage.append('featuredImage', imageFile);
      // }

      // const response = isEditing
      //   ? await apiClient.put(`/blog/posts/${postId}`, formDataWithImage)
      //   : await apiClient.post('/blog/posts', formDataWithImage);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(ROUTES.BLOG_POSTS)
    } catch {
      setErrors({ general: "Failed to save blog post. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateBlogPostDto, value: string | Date | string[] | boolean) => {
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
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      handleInputChange("featuredImagePath", previewUrl)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    handleInputChange("featuredImagePath", "")
  }

  const formatContentForPreview = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</h1>
          <p className="text-gray-600">
            {isEditing ? "Update your blog post content and settings" : "Write and publish a new blog post"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" onClick={() => setPreviewMode(!previewMode)} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              {formData.featuredImagePath && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={formData.featuredImagePath || "/placeholder.svg"}
                    alt={formData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.title || "Untitled Post"}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>By Author Name</span>
                  <span>•</span>
                  <span>{new Date(formData.publishDate).toLocaleDateString()}</span>
                  {formData.postCategoryId && (
                    <>
                      <span>•</span>
                      <span>
                        {mockCategories.find((cat) => cat.id === formData.postCategoryId)?.name || "Category"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {formData.content ? formatContentForPreview(formData.content) : <p>No content yet...</p>}
            </div>
            {formData.tagIds.length > 0 && (
              <div className="mt-8 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tagIds.map((tagId) => {
                    const tag = mockTags.find((t) => t.id === tagId)
                    return (
                      <span key={tagId} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {tag?.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter your blog post title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      rows={15}
                      placeholder="Write your blog post content here..."
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">{formData.content.length} characters (minimum 50 required)</p>
                    {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Featured Image</Label>
                    {formData.featuredImagePath ? (
                      <div className="relative">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={formData.featuredImagePath || "/placeholder.svg"}
                            alt="Featured image"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image-upload")?.click()}
                          disabled={isLoading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">Recommended: 1200x630px</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postCategoryId">Category</Label>
                    <Select
                      value={formData.postCategoryId}
                      onValueChange={(value) => handleInputChange("postCategoryId", value)}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="datetime-local"
                      value={new Date(formData.publishDate).toISOString().slice(0, 16)}
                      onChange={(e) => handleInputChange("publishDate", new Date(e.target.value))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleInputChange("isPublished", checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="isPublished">Publish immediately</Label>
                  </div>

                  <div className="space-y-3">
                    <Label>Tags</Label>
                    <div className="grid grid-cols-1 gap-2">
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
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.BLOG_POSTS)}
                  disabled={isLoading}
                >
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
                      {isEditing ? "Update Post" : "Create Post"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
