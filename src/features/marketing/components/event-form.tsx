// src/features/marketing/components/event-form.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import { Loader2, Save, X, Upload, Trash2 } from "lucide-react"
import type { CreateEventDto, UpdateEventDto } from "@/entities/event/types/event"
import { ROUTES } from "@/core/config/routes"
import { eventService } from "@/entities/event/services/event"

interface EventFormProps {
  initialData?: Partial<CreateEventDto | UpdateEventDto> & { id?: string }
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<CreateEventDto | UpdateEventDto>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(),
    location: initialData?.location || "",
    isActive: initialData?.isActive ?? true,
    imagePath: initialData?.imagePath || "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [removeImage, setRemoveImage] = useState(false)


  // Hiển thị cảnh báo nếu startDate trong quá khứ khi vào trang chỉnh sửa
  useEffect(() => {
    if (isEditing && initialData?.startDate) {
      const startDate = new Date(initialData.startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (startDate < today) {
        setErrors((prev) => ({
          ...prev,
          startDate: "Warning: Start date is in the past. Please update to a future date.",
        }))
      }
    }
    if (isEditing && initialData?.id) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData, isEditing])

  const handleInputChange = (field: keyof CreateEventDto, value: string | Date | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      handleInputChange("imagePath", previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    handleInputChange("imagePath", "")
    setRemoveImage(true) // ✅ Báo hiệu rằng người dùng muốn xóa ảnh
  }


  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name?.trim()) newErrors.name = "Name is required"
    if (!formData.location?.trim()) newErrors.location = "Location is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date"
    }
    if (formData.startDate) {
      const startDate = new Date(formData.startDate)
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = "Invalid start date format"
      } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (startDate < today) {
          newErrors.startDate = "Start date must not be earlier than today"
        }
      }
    }
    if (formData.endDate) {
      const endDate = new Date(formData.endDate)
      if (isNaN(endDate.getTime())) {
        newErrors.endDate = "Invalid end date format"
      }
    }
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      newErrors.imageFile = "Image file size must not exceed 10MB"
    }
    if (imageFile && !["image/jpeg", "image/png", "image/jpg"].includes(imageFile.type)) {
      newErrors.imageFile = "Invalid image file format. Supported formats: .jpg, .png, .jpeg"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const form = new FormData()
      form.append("name", formData.name || "")
      form.append("description", formData.description || "")
      form.append("location", formData.location || "")
      form.append("status", formData.isActive ? "1" : "0")
      form.append("startDate", new Date(formData.startDate).toUTCString())
      form.append("endDate", new Date(formData.endDate).toUTCString())
      form.append("removeImage", removeImage.toString())


      if (imageFile) {
        // Nếu người dùng chọn ảnh mới, gửi file
        form.append("imageFile", imageFile)
      } else if (formData.imagePath && !formData.imagePath.startsWith("blob:")) {
        // Nếu có ảnh cũ (đường dẫn không phải blob local preview)
        form.append("existingImagePath", formData.imagePath)
      }


      if (isEditing && initialData?.id) {
        await eventService.updateEventForm(initialData.id, form)
      } else {
        await eventService.createEventForm(form)
      }

      router.push(ROUTES.EVENTS)
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response?.status === 401) {
        setErrors({ general: "Unauthorized: Please log in as Admin or Staff" })
      } else if (err.response?.status === 403) {
        setErrors({ general: "Forbidden: You do not have permission to perform this action" })
      } else if (err.response?.status === 409) {
        setErrors({ general: "Event with this name already exists" })
      } else {
        setErrors({ general: err.response?.data?.message || "Failed to save event" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  rows={4}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={isLoading}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleInputChange("startDate", new Date(e.target.value))}
                    disabled={isLoading}
                  />
                  {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => handleInputChange("endDate", new Date(e.target.value))}
                    disabled={isLoading}
                  />
                  {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={isLoading}
                />
                {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
              </div>

              <div className="space-y-4">
                <Label>Featured Image</Label>
                {formData.imagePath ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={formData.imagePath || "/placeholder.svg"}
                      className="object-cover w-full h-full"
                      alt="Event image"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                    {errors.imageFile && <p className="text-sm text-red-600">{errors.imageFile}</p>}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">Event is active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push(ROUTES.EVENTS)} disabled={isLoading}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> {isEditing ? "Update Event" : "Create Event"}
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