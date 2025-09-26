"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Checkbox } from "@/shared/ui/checkbox"
import type { CreateEventDto } from "@/entities/event/types/event"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, Trash2, Calendar, MapPin, Users, DollarSign } from "lucide-react"

interface EventFormProps {
  initialData?: Partial<CreateEventDto>
  isEditing?: boolean
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateEventDto>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(),
    location: initialData?.location || "",
    maxAttendees: initialData?.maxAttendees || 100,
    ticketPrice: initialData?.ticketPrice || 0,
    isActive: initialData?.isActive || true,
    featuredImagePath: initialData?.featuredImagePath || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (formData.maxAttendees <= 0) {
      newErrors.maxAttendees = "Max attendees must be greater than 0"
    }

    if (formData.ticketPrice < 0) {
      newErrors.ticketPrice = "Ticket price cannot be negative"
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date"
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(ROUTES.EVENTS)
    } catch (err) {
      setErrors({ general: "Failed to save event. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateEventDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{isEditing ? "Edit Event" : "Create New Event"}</h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update your event details and settings" : "Create a new event for your community"}
        </p>
      </div>

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
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter event title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe your event..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={new Date(formData.startDate).toISOString().slice(0, 16)}
                        onChange={(e) => handleInputChange("startDate", new Date(e.target.value))}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={new Date(formData.endDate).toISOString().slice(0, 16)}
                        onChange={(e) => handleInputChange("endDate", new Date(e.target.value))}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                    {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="Event location or venue..."
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                  {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="maxAttendees"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={formData.maxAttendees}
                        onChange={(e) => handleInputChange("maxAttendees", Number.parseInt(e.target.value) || 0)}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                    {errors.maxAttendees && <p className="text-sm text-red-600">{errors.maxAttendees}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="ticketPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.ticketPrice}
                        onChange={(e) => handleInputChange("ticketPrice", Number.parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Set to 0 for free events</p>
                    {errors.ticketPrice && <p className="text-sm text-red-600">{errors.ticketPrice}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Featured Image</Label>
                  {formData.featuredImagePath ? (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
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
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
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
                      <p className="text-xs text-muted-foreground mt-2">Recommended: 1200x630px</p>
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
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.push(ROUTES.EVENTS)} disabled={isLoading}>
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
                    {isEditing ? "Update Event" : "Create Event"}
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
