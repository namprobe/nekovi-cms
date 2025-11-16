// src/features/products/components/blog-post-form.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import { Loader2, Save, X, Upload, Trash2, Eye } from "lucide-react"

import { AsyncSelect } from "@/shared/ui/selects/async-select"
import { AsyncMultiSelect } from "@/shared/ui/selects/async-multi-select"
import { usePostCategoryOptions } from "@/entities/post-category/hooks/usePostCategoryOptions"
import { useTagSelectStore } from "@/entities/tags/services/tag-select-service"
import { blogPostService } from "@/entities/blog-post/blog-post.service"
import { ROUTES } from "@/core/config/routes"
import { toast } from "sonner"

interface BlogPostFormData {
  id?: string
  title: string
  content: string
  postCategoryId: string | undefined
  publishDate: Date
  isPublished: boolean
  tagIds: string[]
  featuredImageFile?: File
}

interface BlogPostFormProps {
  initialData?: Partial<BlogPostFormData> & { featuredImage?: string }
  isEditing?: boolean
}

export function BlogPostForm({ initialData, isEditing = false }: BlogPostFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<BlogPostFormData>({
    id: initialData?.id,
    title: initialData?.title || "",
    content: initialData?.content || "",
    postCategoryId: initialData?.postCategoryId ?? "",
    publishDate: initialData?.publishDate ? new Date(initialData.publishDate) : new Date(),
    isPublished: initialData?.isPublished ?? false,
    tagIds: initialData?.tagIds ?? [],
  })

  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.featuredImage || ""
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState(false)

  const fetchPostCategories = usePostCategoryOptions()
  const { fetchOptions: fetchTags, options: tagOptions } = useTagSelectStore()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.content.trim()) newErrors.content = "Content is required"
    if (formData.content.trim().length < 50) newErrors.content = "Content must be at least 50 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    const formDataToSend = new FormData()

    formDataToSend.append("title", formData.title)
    formDataToSend.append("content", formData.content)
    formDataToSend.append("isPublished", formData.isPublished.toString())
    if (formData.postCategoryId) formDataToSend.append("postCategoryId", formData.postCategoryId)
    formDataToSend.append("publishDate", new Date(formData.publishDate).toISOString())
    formData.tagIds.forEach(id => formDataToSend.append("tagIds", id))
    if (imageFile) {
      // Có ảnh mới → upload
      formDataToSend.append("featuredImageFile", imageFile);
    }
    else if (!previewUrl && initialData?.featuredImage) {
      // Không có ảnh mới + trước đó có ảnh → yêu cầu xóa
      formDataToSend.append("removeFeaturedImage", "true");
    }

    try {
      const result = isEditing && formData.id
        ? await blogPostService.updateBlogPost(formData.id, formDataToSend)
        : await blogPostService.createBlogPost(formDataToSend)

      if (result.isSuccess) {
        toast.success(isEditing ? "Cập nhật thành công!" : "Tạo bài viết thành công!")
        router.push(ROUTES.BLOG_POSTS)
      } else {
        const msg = result.errors?.join(", ") || result.message || "Lỗi không xác định"
        setErrors({ general: msg })
        toast.error(msg)
      }
    } catch (err: any) {
      toast.error("Lỗi hệ thống")
      setErrors({ general: "Đã có lỗi xảy ra." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof BlogPostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "", general: "" }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ general: "Ảnh không được vượt quá 10MB" })
      return
    }
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["jpg", "jpeg", "png"].includes(ext || "")) {
      setErrors({ general: "Chỉ chấp nhận .jpg, .jpeg, .png" })
      return
    }

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setErrors({})
  }

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  const formatContentForPreview = (content: string) =>
    content.split("\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</h1>
          <p className="text-gray-600">
            {isEditing ? "Update your blog post content and settings" : "Write and publish a new blog post"}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => setPreviewMode(!previewMode)} disabled={isLoading}>
          <Eye className="mr-2 h-4 w-4" />
          {previewMode ? "Edit" : "Preview"}
        </Button>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-6">
            {previewUrl && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted mb-6">
                <img src={previewUrl} alt={formData.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl font-bold mb-2">{formData.title || "Untitled Post"}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
              <span>By Author</span>
              <span>•</span>
              <span>{new Date(formData.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="prose max-w-none">
              {formData.content ? formatContentForPreview(formData.content) : <p>No content yet...</p>}
            </div>
            {formData.tagIds.length > 0 && (
              <div className="mt-8 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tagIds.map(tagId => (
                    <span key={tagId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tagOptions.find(t => t.id === tagId)?.name || tagId}
                    </span>
                  ))}
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
                      value={formData.title}
                      onChange={e => handleInputChange("title", e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      rows={15}
                      value={formData.content}
                      onChange={e => handleInputChange("content", e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">{formData.content.length} characters</p>
                    {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Featured Image</Label>
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
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
                          accept=".jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">Max 10MB</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <AsyncSelect
                      value={formData.postCategoryId ?? ""}
                      onChange={(val) => handleInputChange("postCategoryId", val || "")}
                      fetchOptions={fetchPostCategories}  // ← Không thêm "All"
                      placeholder="Chọn danh mục..."
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="datetime-local"
                      value={new Date(formData.publishDate).toISOString().slice(0, 16)}
                      onChange={(e) => {
                        const selected = new Date(e.target.value)
                        const now = new Date()

                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                        const selectedDate = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate())

                        if (selectedDate < today) {
                          toast.error("Không thể chọn ngày trong quá khứ")
                          return
                        }

                        handleInputChange("publishDate", selected)
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={checked => handleInputChange("isPublished", !!checked)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="isPublished">Publish immediately</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <AsyncMultiSelect
                      value={formData.tagIds}
                      onChange={vals => handleInputChange("tagIds", vals || [])}
                      fetchOptions={async (search) => {
                        const tags = await fetchTags(search)
                        return tags.map(t => ({ id: t.id, label: t.name }))
                      }}
                      initialOptions={tagOptions.map(t => ({ id: t.id, label: t.name }))}
                      placeholder="Chọn tags..."
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.push(ROUTES.BLOG_POSTS)} disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving... </>
                  ) : (
                    <> <Save className="mr-2 h-4 w-4" /> {isEditing ? "Update" : "Create"} </>
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