// src/features/shipping-methods/components/shipping-method-form.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Alert, AlertDescription } from "@/shared/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { CreateShippingMethodDto, UpdateShippingMethodDto } from "@/entities/shipping-methods/types/shipping-method"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X } from "lucide-react"
import { shippingMethodService } from "@/entities/shipping-methods/services/shipping-method.service"

interface ShippingMethodFormProps {
  initialData?: Partial<CreateShippingMethodDto | UpdateShippingMethodDto> & { id?: string }
  isEditing?: boolean
}

export function ShippingMethodForm({ initialData, isEditing = false }: ShippingMethodFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateShippingMethodDto>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    cost: initialData?.cost || 0,
    estimatedDays: initialData?.estimatedDays || undefined,
    status: initialData?.status || 1,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      if (isEditing && initialData?.id) {
        try {
          const result = await shippingMethodService.getShippingMethodById(initialData.id)
          if (result.isSuccess && result.data) {
            setFormData({
              name: result.data.name,
              description: result.data.description || "",
              cost: result.data.cost,
              estimatedDays: result.data.estimatedDays || undefined,
              status: result.data.status,
            })
          }
        } catch (err) {
          setErrors({ general: "Failed to load shipping method data" })
        }
      }
    }
    loadData()
  }, [initialData?.id, isEditing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (formData.cost < 0) newErrors.cost = "Cost cannot be negative"
    if (formData.estimatedDays !== undefined && formData.estimatedDays < 0) {
      newErrors.estimatedDays = "Estimated days cannot be negative"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const data: CreateShippingMethodDto | UpdateShippingMethodDto = {
        name: formData.name,
        description: formData.description,
        cost: formData.cost,
        estimatedDays: formData.estimatedDays,
        status: formData.status,
      }

      let res
      if (isEditing && initialData?.id) {
        res = await shippingMethodService.updateShippingMethod(initialData.id, data as UpdateShippingMethodDto)
      } else {
        res = await shippingMethodService.createShippingMethod(data)
      }

      if (res.isSuccess) {
        router.push(ROUTES.SHIPPING_METHODS)
      } else {
        setErrors({ general: res.message || "Failed to save shipping method" })
      }
    } catch (err: any) {
      setErrors({ general: err?.message || "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateShippingMethodDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Shipping Method" : "Create Shipping Method"}</CardTitle>
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., Express Delivery, Standard Shipping"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={isLoading}
                  placeholder="Describe the shipping method..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (VND) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                  {errors.cost && <p className="text-sm text-red-600">{errors.cost}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDays">Estimated Days</Label>
                  <Input
                    id="estimatedDays"
                    type="number"
                    min="0"
                    value={formData.estimatedDays || ""}
                    onChange={(e) => handleInputChange("estimatedDays", e.target.value ? parseInt(e.target.value) : undefined)}
                    disabled={isLoading}
                    placeholder="e.g., 2-3 days"
                  />
                  {errors.estimatedDays && <p className="text-sm text-red-600">{errors.estimatedDays}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => handleInputChange("status", parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.push(ROUTES.SHIPPING_METHODS)} disabled={isLoading}>
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
                      {isEditing ? "Update" : "Create"}
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
