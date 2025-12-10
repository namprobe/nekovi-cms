// src/features/payment-methods/components/payment-method-form.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { CreatePaymentMethodDto, UpdatePaymentMethodDto } from "@/entities/payment-methods/types/payment-method"
import { ROUTES } from "@/core/config/routes"
import { Loader2, Save, X, Upload, Trash2 } from "lucide-react"
import { paymentMethodService } from "@/entities/payment-methods/services/payment-method.service"

interface PaymentMethodFormProps {
  initialData?: Partial<CreatePaymentMethodDto | UpdatePaymentMethodDto> & { id?: string; iconPath?: string }
  isEditing?: boolean
}

export function PaymentMethodForm({ initialData, isEditing = false }: PaymentMethodFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreatePaymentMethodDto>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    iconImage: null,
    isOnlinePayment: initialData?.isOnlinePayment ?? true,
    processingFee: initialData?.processingFee || 0,
    processorName: initialData?.processorName || "",
    configuration: initialData?.configuration || "",
    status: initialData?.status || 1,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [iconPreview, setIconPreview] = useState<string | null>(initialData?.iconPath || null)

  useEffect(() => {
    const loadData = async () => {
      if (isEditing && initialData?.id) {
        try {
          const result = await paymentMethodService.getPaymentMethodById(initialData.id)
          if (result.isSuccess && result.data) {
            setFormData({
              name: result.data.name,
              description: result.data.description || "",
              iconImage: null,
              isOnlinePayment: result.data.isOnlinePayment,
              processingFee: result.data.processingFee,
              processorName: result.data.processorName || "",
              configuration: result.data.configuration || "",
              status: result.data.status,
            })
            setIconPreview(result.data.iconPath || null)
          }
        } catch (err) {
          setErrors({ general: "Failed to load payment method data" })
        }
      }
    }
    loadData()
  }, [initialData?.id, isEditing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (formData.processingFee < 0) newErrors.processingFee = "Processing fee cannot be negative"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const form = new FormData()
      form.append("name", formData.name)
      if (formData.description) form.append("description", formData.description)
      if (formData.iconImage) form.append("iconImage", formData.iconImage)
      form.append("isOnlinePayment", formData.isOnlinePayment.toString())
      form.append("processingFee", formData.processingFee.toString())
      if (formData.processorName) form.append("processorName", formData.processorName)
      if (formData.configuration) form.append("configuration", formData.configuration)
      form.append("status", formData.status.toString())

      let res
      if (isEditing && initialData?.id) {
        res = await paymentMethodService.updatePaymentMethod(initialData.id, form)
      } else {
        res = await paymentMethodService.createPaymentMethod(form)
      }

      if (res.isSuccess) {
        router.push(ROUTES.PAYMENT_METHODS)
      } else {
        // Handle validation errors from backend
        const errorMessage = res.message || "Failed to save payment method"
        
        // Check if it's a duplicate name error
        if (errorMessage.toLowerCase().includes("already exists") || 
            errorMessage.toLowerCase().includes("duplicate")) {
          setErrors({ 
            name: "This payment gateway already exists. Please choose a different one or edit the existing one.",
            general: errorMessage 
          })
        } else {
          setErrors({ general: errorMessage })
        }
      }
    } catch (err: any) {
      setErrors({ general: err?.message || "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreatePaymentMethodDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange("iconImage", file)
      const reader = new FileReader()
      reader.onloadend = () => setIconPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeIcon = () => {
    handleInputChange("iconImage", null)
    setIconPreview(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Payment Method" : "Create Payment Method"}</CardTitle>
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
                <Select
                  value={formData.name}
                  onValueChange={(value) => handleInputChange("name", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VnPay">VnPay</SelectItem>
                    <SelectItem value="Momo">Momo</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processingFee">Processing Fee</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.processingFee}
                    onChange={(e) => handleInputChange("processingFee", parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                  {errors.processingFee && <p className="text-sm text-red-600">{errors.processingFee}</p>}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="processorName">Processor Name</Label>
                <Input
                  id="processorName"
                  value={formData.processorName}
                  onChange={(e) => handleInputChange("processorName", e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g., VnPay, Momo, PayPal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="configuration">Configuration (JSON)</Label>
                <Textarea
                  id="configuration"
                  rows={3}
                  value={formData.configuration}
                  onChange={(e) => handleInputChange("configuration", e.target.value)}
                  disabled={isLoading}
                  placeholder='{"merchantId": "123", "secretKey": "abc"}'
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnlinePayment"
                  checked={formData.isOnlinePayment}
                  onCheckedChange={(checked) => handleInputChange("isOnlinePayment", checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="isOnlinePayment">This is an online payment method</Label>
              </div>

              <div className="space-y-3">
                <Label>Icon Image</Label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Icon
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconUpload}
                      disabled={isLoading}
                    />
                  </label>
                  {iconPreview && (
                    <div className="relative group">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img src={iconPreview} alt="Icon" className="object-cover w-full h-full" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                        onClick={removeIcon}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => router.push(ROUTES.PAYMENT_METHODS)} disabled={isLoading}>
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
